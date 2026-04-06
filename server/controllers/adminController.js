const bcrypt   = require('bcryptjs');
const pool     = require('../config/db');
const { sendAdmissionEmail, sendRejectionEmail } = require('../config/mailer');
const { generateStudentLoginId, generateLecturerLoginId } = require('../utils/generateLoginId');

// ═══════════════════════════════════════════════════════════════
//  APPLICATIONS — Rule 2
// ═══════════════════════════════════════════════════════════════

// GET /api/admin/applications
// All applicants — filterable by status (pending/accepted/rejected)
const getApplications = async (req, res, next) => {
  try {
    const { status } = req.query;
    const allowed = ['pending', 'accepted', 'rejected'];

    let query = `
      SELECT a.*, d.name AS department_name, d.acronym AS department_acronym
      FROM applicants a
      JOIN departments d ON a.department_id = d.id
    `;
    const params = [];
    let paramIndex = 1;

    if (status && allowed.includes(status)) {
      query += ` WHERE a.status = $${paramIndex++}`;
      params.push(status);
    }

    query += ' ORDER BY a.created_at DESC';

    const { rows: applicants } = await pool.query(query, params);
    return res.status(200).json({ applicants });
  } catch (err) {
    next(err);
  }
};

// GET /api/admin/applications/:id
// Single applicant full detail
const getApplicationById = async (req, res, next) => {
  try {
    const { rows } = await pool.query(
      `SELECT a.*, d.name AS department_name, d.acronym AS department_acronym
       FROM applicants a
       JOIN departments d ON a.department_id = d.id
       WHERE a.id = $1`,
      [req.params.id]
    );
    if (rows.length === 0) {
      return res.status(404).json({ message: 'Application not found.' });
    }
    return res.status(200).json({ applicant: rows[0] });
  } catch (err) {
    next(err);
  }
};

// PATCH /api/admin/applications/:id/accept
// Rule 2 — Accept applicant:
//   1. Generate Login ID  → GSU/DEPT/YY/RAND
//   2. Hash default password '1234'
//   3. Create student record
//   4. Update applicant status to 'accepted'
//   5. Send admission email with Login ID + password
const acceptApplication = async (req, res, next) => {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    const { rows } = await client.query(
      `SELECT a.*, d.name AS department_name, d.acronym AS department_acronym
       FROM applicants a
       JOIN departments d ON a.department_id = d.id
       WHERE a.id = $1`,
      [req.params.id]
    );

    if (rows.length === 0) {
      await client.query('ROLLBACK');
      client.release();
      return res.status(404).json({ message: 'Application not found.' });
    }

    const applicant = rows[0];

    if (applicant.status !== 'pending') {
      await client.query('ROLLBACK');
      client.release();
      return res.status(409).json({
        message: `Application has already been ${applicant.status}.`,
      });
    }

    // Generate unique Login ID: GSU/DEPT/YY/RAND (Rule 2)
    const loginId = await generateStudentLoginId(
      applicant.department_acronym,
      applicant.applied_year
    );

    const defaultPassword = '1234';
    const hashedPassword  = await bcrypt.hash(defaultPassword, 10);

    // Create student account
    await client.query(
      `INSERT INTO students
        (login_id, applicant_id, full_name, email, password,
         department_id, phone, date_of_birth, gender,
         state_of_origin, lga, nationality, passport_photo,
         address, level, is_first_login, status)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, 100, true, 'active')`,
      [
        loginId,
        applicant.id,
        applicant.full_name,
        applicant.email,
        hashedPassword,
        applicant.department_id,
        applicant.phone,
        applicant.date_of_birth,
        applicant.gender,
        applicant.state_of_origin,
        applicant.lga,
        applicant.nationality,
        applicant.passport_photo,
        applicant.residential_address,
      ]
    );

    // Update applicant status
    await client.query(
      "UPDATE applicants SET status = 'accepted' WHERE id = $1",
      [applicant.id]
    );

    await client.query('COMMIT');
    client.release();

    // Send admission email (Rule 2) — outside transaction, non-fatal
    try {
      await sendAdmissionEmail({
        to:         applicant.email,
        fullName:   applicant.full_name,
        loginId,
        password:   defaultPassword,
        department: applicant.department_name,
      });
    } catch (mailErr) {
      console.error('Admission email failed (account still created):', mailErr.message);
    }

    return res.status(200).json({
      message: `${applicant.full_name} has been admitted. Login ID: ${loginId}`,
      login_id: loginId,
    });

  } catch (err) {
    await client.query('ROLLBACK');
    client.release();
    next(err);
  }
};

// PATCH /api/admin/applications/:id/reject
// Rule 2 — Reject applicant and send rejection email
const rejectApplication = async (req, res, next) => {
  try {
    const { rows } = await pool.query(
      `SELECT a.*, d.name AS department_name
       FROM applicants a
       JOIN departments d ON a.department_id = d.id
       WHERE a.id = $1`,
      [req.params.id]
    );

    if (rows.length === 0) {
      return res.status(404).json({ message: 'Application not found.' });
    }

    const applicant = rows[0];

    if (applicant.status !== 'pending') {
      return res.status(409).json({
        message: `Application has already been ${applicant.status}.`,
      });
    }

    await pool.query(
      "UPDATE applicants SET status = 'rejected' WHERE id = $1",
      [applicant.id]
    );

    // Send rejection email (Rule 2)
    try {
      await sendRejectionEmail({
        to:         applicant.email,
        fullName:   applicant.full_name,
        department: applicant.department_name,
      });
    } catch (mailErr) {
      console.error('Rejection email failed:', mailErr.message);
    }

    return res.status(200).json({
      message: `Application for ${applicant.full_name} has been rejected.`,
    });
  } catch (err) {
    next(err);
  }
};

// ═══════════════════════════════════════════════════════════════
//  STUDENTS — Rule 3
// ═══════════════════════════════════════════════════════════════

// GET /api/admin/students
const getAllStudents = async (req, res, next) => {
  try {
    const { department_id, status, level } = req.query;
    let query = `
      SELECT s.id, s.login_id, s.full_name, s.email, s.phone,
             s.level, s.status, s.created_at,
             d.name AS department_name, d.acronym
      FROM students s
      JOIN departments d ON s.department_id = d.id
      WHERE 1=1
    `;
    const params = [];
    let paramIndex = 1;

    if (department_id) { query += ` AND s.department_id = $${paramIndex++}`; params.push(department_id); }
    if (status)        { query += ` AND s.status = $${paramIndex++}`;        params.push(status); }
    if (level)         { query += ` AND s.level = $${paramIndex++}`;         params.push(level); }

    query += ' ORDER BY s.full_name ASC';

    const { rows: students } = await pool.query(query, params);
    return res.status(200).json({ students });
  } catch (err) {
    next(err);
  }
};

// GET /api/admin/students/:id
const getStudentById = async (req, res, next) => {
  try {
    const { rows } = await pool.query(
      `SELECT s.*, d.name AS department_name, d.acronym
       FROM students s
       JOIN departments d ON s.department_id = d.id
       WHERE s.id = $1`,
      [req.params.id]
    );
    if (rows.length === 0) {
      return res.status(404).json({ message: 'Student not found.' });
    }
    const { password: _pw, ...student } = rows[0];
    return res.status(200).json({ student });
  } catch (err) {
    next(err);
  }
};

// PATCH /api/admin/students/:id/status
// Toggle student active/suspended (Rule 3)
const updateStudentStatus = async (req, res, next) => {
  try {
    const { status } = req.body;
    if (!['active', 'suspended'].includes(status)) {
      return res.status(400).json({ message: 'Status must be active or suspended.' });
    }
    await pool.query('UPDATE students SET status = $1 WHERE id = $2', [status, req.params.id]);
    return res.status(200).json({ message: `Student status updated to ${status}.` });
  } catch (err) {
    next(err);
  }
};

// ═══════════════════════════════════════════════════════════════
//  LECTURERS — Rule 3
// ═══════════════════════════════════════════════════════════════

// POST /api/admin/lecturers
// Add a new lecturer — admin creates the account (Rule 3)
const addLecturer = async (req, res, next) => {
  try {
    const { full_name, email, phone, department_id, qualification } = req.body;

    if (!full_name || !email || !phone || !department_id) {
      return res.status(400).json({
        message: 'full_name, email, phone and department_id are required.',
      });
    }

    const { rows: deptRows } = await pool.query(
      'SELECT id FROM departments WHERE id = $1', [department_id]
    );
    if (deptRows.length === 0) {
      return res.status(400).json({ message: 'Department not found.' });
    }

    const { rows: dupEmail } = await pool.query(
      'SELECT id FROM lecturers WHERE email = $1', [email]
    );
    if (dupEmail.length > 0) {
      return res.status(409).json({ message: 'A lecturer with this email already exists.' });
    }

    const loginId        = await generateLecturerLoginId();
    const defaultPassword = '1234';
    const hashedPassword  = await bcrypt.hash(defaultPassword, 10);

    const passport_photo = req.file ? `/uploads/${req.file.filename}` : null;

    await pool.query(
      `INSERT INTO lecturers
        (login_id, full_name, email, password, department_id,
         phone, qualification, passport_photo, is_first_login, status)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, true, 'active')`,
      [
        loginId,
        full_name.trim(),
        email.trim().toLowerCase(),
        hashedPassword,
        department_id,
        phone.trim(),
        qualification ? qualification.trim() : null,
        passport_photo,
      ]
    );

    return res.status(201).json({
      message: `Lecturer account created. Login ID: ${loginId}`,
      login_id:  loginId,
      password:  defaultPassword,
    });
  } catch (err) {
    next(err);
  }
};

// GET /api/admin/lecturers
const getAllLecturers = async (req, res, next) => {
  try {
    const { department_id } = req.query;
    let query = `
      SELECT l.id, l.login_id, l.full_name, l.email, l.phone,
             l.qualification, l.status, l.created_at,
             d.name AS department_name
      FROM lecturers l
      JOIN departments d ON l.department_id = d.id
      WHERE 1=1
    `;
    const params = [];
    let paramIndex = 1;
    if (department_id) { query += ` AND l.department_id = $${paramIndex++}`; params.push(department_id); }
    query += ' ORDER BY l.full_name ASC';

    const { rows: lecturers } = await pool.query(query, params);
    return res.status(200).json({ lecturers });
  } catch (err) {
    next(err);
  }
};

// GET /api/admin/lecturers/:id
const getLecturerById = async (req, res, next) => {
  try {
    const { rows } = await pool.query(
      `SELECT l.*, d.name AS department_name
       FROM lecturers l
       JOIN departments d ON l.department_id = d.id
       WHERE l.id = $1`,
      [req.params.id]
    );
    if (rows.length === 0) {
      return res.status(404).json({ message: 'Lecturer not found.' });
    }
    const { password: _pw, ...lecturer } = rows[0];
    return res.status(200).json({ lecturer });
  } catch (err) {
    next(err);
  }
};

// PATCH /api/admin/lecturers/:id/status
const updateLecturerStatus = async (req, res, next) => {
  try {
    const { status } = req.body;
    if (!['active', 'on_leave', 'suspended'].includes(status)) {
      return res.status(400).json({ message: 'Invalid status value.' });
    }
    await pool.query('UPDATE lecturers SET status = $1 WHERE id = $2', [status, req.params.id]);
    return res.status(200).json({ message: `Lecturer status updated to ${status}.` });
  } catch (err) {
    next(err);
  }
};

// ═══════════════════════════════════════════════════════════════
//  COURSES — Rule 3
// ═══════════════════════════════════════════════════════════════

// POST /api/admin/courses
const addCourse = async (req, res, next) => {
  try {
    const { course_code, title, description, credit_units, department_id, level, semester } = req.body;

    if (!course_code || !title || !department_id || !level || !semester) {
      return res.status(400).json({
        message: 'course_code, title, department_id, level and semester are required.',
      });
    }

    if (!['first', 'second'].includes(semester)) {
      return res.status(400).json({ message: 'Semester must be first or second.' });
    }

    const validLevels = [100, 200, 300, 400, 500];
    if (!validLevels.includes(parseInt(level))) {
      return res.status(400).json({ message: 'Level must be 100, 200, 300, 400 or 500.' });
    }

    const { rows: dup } = await pool.query(
      'SELECT id FROM courses WHERE course_code = $1', [course_code]
    );
    if (dup.length > 0) {
      return res.status(409).json({ message: 'A course with this code already exists.' });
    }

    const { rows: result } = await pool.query(
      `INSERT INTO courses
        (course_code, title, description, credit_units, department_id, level, semester)
       VALUES ($1, $2, $3, $4, $5, $6, $7)
       RETURNING id`,
      [
        course_code.trim().toUpperCase(),
        title.trim(),
        description ? description.trim() : null,
        credit_units || 2,
        department_id,
        parseInt(level),
        semester,
      ]
    );

    return res.status(201).json({
      message: 'Course added successfully.',
      course_id: result[0].id,
    });
  } catch (err) {
    next(err);
  }
};

// GET /api/admin/courses
// Rule 3 — view total registered courses with optional filters
const getAllCourses = async (req, res, next) => {
  try {
    const { department_id, level, semester } = req.query;
    let query = `
      SELECT c.*, d.name AS department_name,
             COUNT(cr.id) AS total_registered_students
      FROM courses c
      JOIN departments d ON c.department_id = d.id
      LEFT JOIN course_registrations cr ON cr.course_id = c.id
      WHERE 1=1
    `;
    const params = [];
    let paramIndex = 1;
    if (department_id) { query += ` AND c.department_id = $${paramIndex++}`; params.push(department_id); }
    if (level)         { query += ` AND c.level = $${paramIndex++}`;         params.push(level); }
    if (semester)      { query += ` AND c.semester = $${paramIndex++}`;      params.push(semester); }

    query += ' GROUP BY c.id, d.name ORDER BY c.course_code ASC';

    const { rows: courses } = await pool.query(query, params);
    return res.status(200).json({ courses, total: courses.length });
  } catch (err) {
    next(err);
  }
};

// PATCH /api/admin/courses/:id
const updateCourse = async (req, res, next) => {
  try {
    const { title, description, credit_units, is_active } = req.body;
    await pool.query(
      `UPDATE courses SET
         title        = COALESCE($1, title),
         description  = COALESCE($2, description),
         credit_units = COALESCE($3, credit_units),
         is_active    = COALESCE($4, is_active)
       WHERE id = $5`,
      [title, description, credit_units, is_active, req.params.id]
    );
    return res.status(200).json({ message: 'Course updated.' });
  } catch (err) {
    next(err);
  }
};

// ═══════════════════════════════════════════════════════════════
//  COURSE ASSIGNMENTS — Rule 3
// ═══════════════════════════════════════════════════════════════

// POST /api/admin/assignments
// Assign a course to a lecturer for a given session/semester
const assignCourse = async (req, res, next) => {
  try {
    const { course_id, lecturer_id, session, semester } = req.body;

    if (!course_id || !lecturer_id || !session || !semester) {
      return res.status(400).json({
        message: 'course_id, lecturer_id, session and semester are required.',
      });
    }

    const { rows: courseRows } = await pool.query(
      'SELECT id FROM courses WHERE id = $1 AND is_active = true', [course_id]
    );
    if (courseRows.length === 0) {
      return res.status(404).json({ message: 'Course not found or inactive.' });
    }

    const { rows: lecRows } = await pool.query(
      "SELECT id FROM lecturers WHERE id = $1 AND status = 'active'", [lecturer_id]
    );
    if (lecRows.length === 0) {
      return res.status(404).json({ message: 'Lecturer not found or inactive.' });
    }

    await pool.query(
      `INSERT INTO course_assignments (course_id, lecturer_id, session, semester)
       VALUES ($1, $2, $3, $4)`,
      [course_id, lecturer_id, session, semester]
    );

    return res.status(201).json({ message: 'Course assigned to lecturer successfully.' });
  } catch (err) {
    next(err);
  }
};

// GET /api/admin/assignments
const getAllAssignments = async (req, res, next) => {
  try {
    const { session, semester } = req.query;
    let query = `
      SELECT ca.id, ca.session, ca.semester,
             c.course_code, c.title AS course_title, c.level,
             l.full_name AS lecturer_name, l.login_id AS lecturer_login_id,
             d.name AS department_name
      FROM course_assignments ca
      JOIN courses   c ON ca.course_id   = c.id
      JOIN lecturers l ON ca.lecturer_id = l.id
      JOIN departments d ON c.department_id = d.id
      WHERE 1=1
    `;
    const params = [];
    let paramIndex = 1;
    if (session)  { query += ` AND ca.session = $${paramIndex++}`;  params.push(session); }
    if (semester) { query += ` AND ca.semester = $${paramIndex++}`; params.push(semester); }
    query += ' ORDER BY ca.session DESC, c.course_code ASC';

    const { rows: assignments } = await pool.query(query, params);
    return res.status(200).json({ assignments });
  } catch (err) {
    next(err);
  }
};

// ═══════════════════════════════════════════════════════════════
//  COMPLAINTS — Rule 3
// ═══════════════════════════════════════════════════════════════

// GET /api/admin/complaints
const getComplaints = async (req, res, next) => {
  try {
    const { status } = req.query;
    let query = 'SELECT * FROM complaints WHERE 1=1';
    const params = [];
    let paramIndex = 1;
    if (status) { query += ` AND status = $${paramIndex++}`; params.push(status); }
    query += ' ORDER BY created_at DESC';

    const { rows: complaints } = await pool.query(query, params);
    return res.status(200).json({ complaints });
  } catch (err) {
    next(err);
  }
};

// PATCH /api/admin/complaints/:id/reply
// Admin replies to and resolves a complaint (Rule 3)
const replyComplaint = async (req, res, next) => {
  try {
    const { admin_reply, status } = req.body;
    if (!admin_reply) {
      return res.status(400).json({ message: 'admin_reply is required.' });
    }
    const resolvedStatus = status || 'resolved';
    await pool.query(
      'UPDATE complaints SET admin_reply = $1, status = $2 WHERE id = $3',
      [admin_reply, resolvedStatus, req.params.id]
    );
    return res.status(200).json({ message: 'Complaint reply saved.' });
  } catch (err) {
    next(err);
  }
};

// ═══════════════════════════════════════════════════════════════
//  STUDENT REPORTS — Rule 3 & 5
// ═══════════════════════════════════════════════════════════════

// GET /api/admin/reports
const getStudentReports = async (req, res, next) => {
  try {
    const { rows: reports } = await pool.query(
      `SELECT sr.*,
              l.full_name  AS lecturer_name,
              s.full_name  AS student_name, s.login_id AS student_login_id,
              c.course_code, c.title AS course_title
       FROM student_reports sr
       JOIN lecturers l ON sr.lecturer_id = l.id
       JOIN students  s ON sr.student_id  = s.id
       JOIN courses   c ON sr.course_id   = c.id
       ORDER BY sr.created_at DESC`
    );
    return res.status(200).json({ reports });
  } catch (err) {
    next(err);
  }
};

// PATCH /api/admin/reports/:id/review
const reviewStudentReport = async (req, res, next) => {
  try {
    await pool.query(
      "UPDATE student_reports SET status = 'reviewed' WHERE id = $1",
      [req.params.id]
    );
    return res.status(200).json({ message: 'Report marked as reviewed.' });
  } catch (err) {
    next(err);
  }
};

// ═══════════════════════════════════════════════════════════════
//  LEAVE APPLICATIONS — Rule 3 & 5
// ═══════════════════════════════════════════════════════════════

// GET /api/admin/leaves
const getLeaveApplications = async (req, res, next) => {
  try {
    const { status } = req.query;
    let query = `
      SELECT la.*, l.full_name AS lecturer_name, l.login_id,
             d.name AS department_name
      FROM leave_applications la
      JOIN lecturers  l ON la.lecturer_id  = l.id
      JOIN departments d ON l.department_id = d.id
      WHERE 1=1
    `;
    const params = [];
    let paramIndex = 1;
    if (status) { query += ` AND la.status = $${paramIndex++}`; params.push(status); }
    query += ' ORDER BY la.created_at DESC';

    const { rows: leaves } = await pool.query(query, params);
    return res.status(200).json({ leaves });
  } catch (err) {
    next(err);
  }
};

// PATCH /api/admin/leaves/:id
// Approve or reject a leave application (Rule 3)
const updateLeaveStatus = async (req, res, next) => {
  try {
    const { status, admin_comment } = req.body;
    if (!['approved', 'rejected'].includes(status)) {
      return res.status(400).json({ message: 'Status must be approved or rejected.' });
    }

    await pool.query(
      'UPDATE leave_applications SET status = $1, admin_comment = $2 WHERE id = $3',
      [status, admin_comment || null, req.params.id]
    );

    // If approved, update lecturer status to on_leave
    if (status === 'approved') {
      const { rows: leaveRows } = await pool.query(
        'SELECT lecturer_id FROM leave_applications WHERE id = $1', [req.params.id]
      );
      if (leaveRows.length > 0) {
        await pool.query(
          "UPDATE lecturers SET status = 'on_leave' WHERE id = $1",
          [leaveRows[0].lecturer_id]
        );
      }
    }

    return res.status(200).json({ message: `Leave application ${status}.` });
  } catch (err) {
    next(err);
  }
};

// ═══════════════════════════════════════════════════════════════
//  NOTIFICATIONS — Rule 4
// ═══════════════════════════════════════════════════════════════

// POST /api/admin/notifications
// Admin broadcasts a notification to all students or a specific user
const sendNotification = async (req, res, next) => {
  try {
    const { recipient_type, recipient_id, title, message } = req.body;

    if (!recipient_type || !title || !message) {
      return res.status(400).json({ message: 'recipient_type, title and message are required.' });
    }

    if (!['student', 'lecturer', 'all_students'].includes(recipient_type)) {
      return res.status(400).json({ message: 'Invalid recipient_type.' });
    }

    if (recipient_type !== 'all_students' && !recipient_id) {
      return res.status(400).json({ message: 'recipient_id is required for targeted notifications.' });
    }

    await pool.query(
      `INSERT INTO notifications (recipient_type, recipient_id, title, message)
       VALUES ($1, $2, $3, $4)`,
      [recipient_type, recipient_id || null, title, message]
    );

    return res.status(201).json({ message: 'Notification sent.' });
  } catch (err) {
    next(err);
  }
};

// ═══════════════════════════════════════════════════════════════
//  DASHBOARD STATS — Rule 3
// ═══════════════════════════════════════════════════════════════

// GET /api/admin/dashboard
const getDashboardStats = async (req, res, next) => {
  try {
    const { rows: [{ total_students }] }    = await pool.query("SELECT COUNT(*) AS total_students FROM students WHERE status = 'active'");
    const { rows: [{ total_lecturers }] }   = await pool.query("SELECT COUNT(*) AS total_lecturers FROM lecturers WHERE status != 'suspended'");
    const { rows: [{ total_courses }] }     = await pool.query('SELECT COUNT(*) AS total_courses FROM courses WHERE is_active = true');
    const { rows: [{ pending_applications }] } = await pool.query("SELECT COUNT(*) AS pending_applications FROM applicants WHERE status = 'pending'");
    const { rows: [{ open_complaints }] }   = await pool.query("SELECT COUNT(*) AS open_complaints FROM complaints WHERE status = 'open'");
    const { rows: [{ pending_leaves }] }    = await pool.query("SELECT COUNT(*) AS pending_leaves FROM leave_applications WHERE status = 'pending'");

    return res.status(200).json({
      stats: {
        total_students: parseInt(total_students),
        total_lecturers: parseInt(total_lecturers),
        total_courses: parseInt(total_courses),
        pending_applications: parseInt(pending_applications),
        open_complaints: parseInt(open_complaints),
        pending_leaves: parseInt(pending_leaves),
      },
    });
  } catch (err) {
    next(err);
  }
};

module.exports = {
  getApplications, getApplicationById, acceptApplication, rejectApplication,
  getAllStudents, getStudentById, updateStudentStatus,
  addLecturer, getAllLecturers, getLecturerById, updateLecturerStatus,
  addCourse, getAllCourses, updateCourse,
  assignCourse, getAllAssignments,
  getComplaints, replyComplaint,
  getStudentReports, reviewStudentReport,
  getLeaveApplications, updateLeaveStatus,
  sendNotification,
  getDashboardStats,
};
