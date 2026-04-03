const db = require('../config/db');
const { calculateGrade } = require('../utils/gradeCalculator');

// ═══════════════════════════════════════════════════════════════
//  PROFILE — Rule 5
// ═══════════════════════════════════════════════════════════════

// GET /api/lecturer/profile
const getProfile = async (req, res, next) => {
  try {
    const [rows] = await db.query(
      `SELECT l.id, l.login_id, l.full_name, l.email, l.phone,
              l.qualification, l.passport_photo, l.status,
              l.is_first_login, l.created_at,
              d.name AS department_name, d.acronym AS department_acronym
       FROM lecturers l
       JOIN departments d ON l.department_id = d.id
       WHERE l.id = ?`,
      [req.user.id]
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

// PATCH /api/lecturer/profile
// Rule 5 — lecturer updates own profile (phone, qualification only)
const updateProfile = async (req, res, next) => {
  try {
    const { phone, qualification } = req.body;
    const passport_photo = req.file ? `/uploads/${req.file.filename}` : undefined;

    const fields  = [];
    const params  = [];

    if (phone)         { fields.push('phone = ?');         params.push(phone.trim()); }
    if (qualification) { fields.push('qualification = ?'); params.push(qualification.trim()); }
    if (passport_photo){ fields.push('passport_photo = ?');params.push(passport_photo); }

    if (fields.length === 0) {
      return res.status(400).json({ message: 'No fields provided to update.' });
    }

    params.push(req.user.id);
    await db.query(
      `UPDATE lecturers SET ${fields.join(', ')} WHERE id = ?`,
      params
    );

    return res.status(200).json({ message: 'Profile updated successfully.' });
  } catch (err) {
    next(err);
  }
};

// ═══════════════════════════════════════════════════════════════
//  ASSIGNED COURSES — Rule 5
// ═══════════════════════════════════════════════════════════════

// GET /api/lecturer/courses
// Rule 5 — view all courses assigned to this lecturer
const getAssignedCourses = async (req, res, next) => {
  try {
    const { session, semester } = req.query;

    // Default to current session if not specified
    let targetSession = session;
    if (!targetSession) {
      const [sessionRows] = await db.query(
        'SELECT session FROM academic_sessions WHERE is_current = 1 LIMIT 1'
      );
      targetSession = sessionRows[0]?.session || null;
    }

    let query = `
      SELECT ca.id AS assignment_id, ca.session, ca.semester,
             c.id AS course_id, c.course_code, c.title, c.credit_units,
             c.level, c.description,
             d.name AS department_name,
             COUNT(cr.id) AS enrolled_students
      FROM course_assignments ca
      JOIN courses c ON ca.course_id = c.id
      JOIN departments d ON c.department_id = d.id
      LEFT JOIN course_registrations cr ON cr.course_id = c.id
        AND cr.session = ca.session AND cr.semester = ca.semester
      WHERE ca.lecturer_id = ?
    `;
    const params = [req.user.id];

    if (targetSession) { query += ' AND ca.session = ?';  params.push(targetSession); }
    if (semester)      { query += ' AND ca.semester = ?'; params.push(semester); }

    query += ' GROUP BY ca.id ORDER BY ca.session DESC, c.course_code ASC';

    const [courses] = await db.query(query, params);
    return res.status(200).json({ courses, session: targetSession });
  } catch (err) {
    next(err);
  }
};

// GET /api/lecturer/courses/:course_id/students
// Rule 5 — view all students enrolled in a specific assigned course
const getEnrolledStudents = async (req, res, next) => {
  try {
    const { course_id } = req.params;
    const { session, semester } = req.query;

    // Confirm this course is actually assigned to this lecturer
    let assignmentQuery = `
      SELECT ca.id FROM course_assignments ca
      WHERE ca.course_id = ? AND ca.lecturer_id = ?
    `;
    const assignParams = [course_id, req.user.id];

    if (session)  { assignmentQuery += ' AND ca.session = ?';  assignParams.push(session); }
    if (semester) { assignmentQuery += ' AND ca.semester = ?'; assignParams.push(semester); }

    const [assignment] = await db.query(assignmentQuery, assignParams);
    if (assignment.length === 0) {
      return res.status(403).json({
        message: 'This course is not assigned to you or does not exist.',
      });
    }

    // Get current session fallback
    let targetSession = session;
    if (!targetSession) {
      const [sessionRows] = await db.query(
        'SELECT session FROM academic_sessions WHERE is_current = 1 LIMIT 1'
      );
      targetSession = sessionRows[0]?.session || null;
    }

    const [students] = await db.query(
      `SELECT s.id, s.login_id, s.full_name, s.email, s.phone, s.level,
              cr.semester, cr.registered_at,
              r.ca_score, r.exam_score, r.total_score, r.grade, r.remark
       FROM course_registrations cr
       JOIN students s ON cr.student_id = s.id
       LEFT JOIN results r ON r.student_id = s.id
         AND r.course_id = ? AND r.session = cr.session AND r.semester = cr.semester
       WHERE cr.course_id = ? AND cr.session = ?
       ORDER BY s.full_name ASC`,
      [course_id, course_id, targetSession]
    );

    return res.status(200).json({ students, session: targetSession });
  } catch (err) {
    next(err);
  }
};

// ═══════════════════════════════════════════════════════════════
//  RESULTS / GRADING — Rule 5
// ═══════════════════════════════════════════════════════════════

// POST /api/lecturer/results
// Rule 5 — upload or update a student's CA and exam scores
// Automatically calculates total, grade and remark
// Triggers a notification to the student (Rule 4)
const uploadResult = async (req, res, next) => {
  try {
    const { student_id, course_id, session, semester, ca_score, exam_score } = req.body;

    if (!student_id || !course_id || !session || !semester) {
      return res.status(400).json({
        message: 'student_id, course_id, session and semester are required.',
      });
    }

    // Validate scores
    const ca   = ca_score   !== undefined ? parseFloat(ca_score)   : null;
    const exam = exam_score !== undefined ? parseFloat(exam_score) : null;

    if (ca !== null && (ca < 0 || ca > 30)) {
      return res.status(400).json({ message: 'CA score must be between 0 and 30.' });
    }
    if (exam !== null && (exam < 0 || exam > 70)) {
      return res.status(400).json({ message: 'Exam score must be between 0 and 70.' });
    }

    // Confirm course is assigned to this lecturer
    const [assignment] = await db.query(
      `SELECT id FROM course_assignments
       WHERE course_id = ? AND lecturer_id = ? AND session = ? AND semester = ?`,
      [course_id, req.user.id, session, semester]
    );
    if (assignment.length === 0) {
      return res.status(403).json({
        message: 'You are not assigned to this course for the given session/semester.',
      });
    }

    // Confirm student is enrolled in this course
    const [enrollment] = await db.query(
      `SELECT id FROM course_registrations
       WHERE student_id = ? AND course_id = ? AND session = ? AND semester = ?`,
      [student_id, course_id, session, semester]
    );
    if (enrollment.length === 0) {
      return res.status(404).json({
        message: 'This student is not enrolled in this course for the given session/semester.',
      });
    }

    // Calculate grade
    const total = (ca || 0) + (exam || 0);
    const { grade, remark } = calculateGrade(total);

    // Upsert result — insert or update if already exists
    await db.query(
      `INSERT INTO results
         (student_id, course_id, lecturer_id, session, semester, ca_score, exam_score, total_score, grade, remark)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
       ON CONFLICT (student_id, course_id, session, semester) DO UPDATE SET
         ca_score    = EXCLUDED.ca_score,
         exam_score  = EXCLUDED.exam_score,
         total_score = EXCLUDED.total_score,
         grade       = EXCLUDED.grade,
         remark      = EXCLUDED.remark,
         lecturer_id = EXCLUDED.lecturer_id,
         updated_at  = CURRENT_TIMESTAMP`,
      [student_id, course_id, req.user.id, session, semester, ca, exam, total, grade, remark]
    );

    // Fetch course title for notification
    const [courseRows] = await db.query(
      'SELECT title, course_code FROM courses WHERE id = ?',
      [course_id]
    );
    const courseTitle = courseRows[0]
      ? `${courseRows[0].course_code} — ${courseRows[0].title}`
      : 'a course';

    // Trigger notification to student (Rule 4)
    await db.query(
      `INSERT INTO notifications (recipient_type, recipient_id, title, message)
       VALUES ('student', ?, ?, ?)`,
      [
        student_id,
        'Result uploaded',
        `Your result for ${courseTitle} (${session} ${semester} semester) has been uploaded. Total: ${total}/100, Grade: ${grade}.`,
      ]
    );

    return res.status(200).json({
      message: 'Result uploaded successfully.',
      result: { ca_score: ca, exam_score: exam, total_score: total, grade, remark },
    });
  } catch (err) {
    next(err);
  }
};

// POST /api/lecturer/results/bulk
// Rule 5 — upload results for multiple students at once
const uploadBulkResults = async (req, res, next) => {
  try {
    const { course_id, session, semester, results } = req.body;

    if (!course_id || !session || !semester || !Array.isArray(results) || results.length === 0) {
      return res.status(400).json({
        message: 'course_id, session, semester and a results array are required.',
      });
    }

    // Confirm course is assigned to this lecturer
    const [assignment] = await db.query(
      `SELECT id FROM course_assignments
       WHERE course_id = ? AND lecturer_id = ? AND session = ? AND semester = ?`,
      [course_id, req.user.id, session, semester]
    );
    if (assignment.length === 0) {
      return res.status(403).json({
        message: 'You are not assigned to this course for the given session/semester.',
      });
    }

    const [courseRows] = await db.query(
      'SELECT title, course_code FROM courses WHERE id = ?', [course_id]
    );
    const courseTitle = courseRows[0]
      ? `${courseRows[0].course_code} — ${courseRows[0].title}`
      : 'a course';

    const uploadedCount  = [];
    const skippedCount   = [];

    for (const entry of results) {
      const { student_id, ca_score, exam_score } = entry;
      if (!student_id) { skippedCount.push(entry); continue; }

      const ca   = ca_score   !== undefined ? parseFloat(ca_score)   : null;
      const exam = exam_score !== undefined ? parseFloat(exam_score) : null;

      if ((ca !== null && (ca < 0 || ca > 30)) || (exam !== null && (exam < 0 || exam > 70))) {
        skippedCount.push({ student_id, reason: 'Invalid score range' });
        continue;
      }

      // Check enrollment
      const [enrolled] = await db.query(
        `SELECT id FROM course_registrations
         WHERE student_id = ? AND course_id = ? AND session = ? AND semester = ?`,
        [student_id, course_id, session, semester]
      );
      if (enrolled.length === 0) {
        skippedCount.push({ student_id, reason: 'Not enrolled' });
        continue;
      }

      const total = (ca || 0) + (exam || 0);
      const { grade, remark } = calculateGrade(total);

      await db.query(
        `INSERT INTO results
           (student_id, course_id, lecturer_id, session, semester, ca_score, exam_score, total_score, grade, remark)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
         ON CONFLICT (student_id, course_id, session, semester) DO UPDATE SET
           ca_score = EXCLUDED.ca_score, exam_score = EXCLUDED.exam_score,
           total_score = EXCLUDED.total_score, grade = EXCLUDED.grade, remark = EXCLUDED.remark,
           lecturer_id = EXCLUDED.lecturer_id, updated_at = CURRENT_TIMESTAMP`,
        [student_id, course_id, req.user.id, session, semester, ca, exam, total, grade, remark]
      );

      // Notify student
      await db.query(
        `INSERT INTO notifications (recipient_type, recipient_id, title, message)
         VALUES ('student', ?, ?, ?)`,
        [
          student_id,
          'Result uploaded',
          `Your result for ${courseTitle} (${session} ${semester} semester) has been uploaded. Total: ${total}/100, Grade: ${grade}.`,
        ]
      );

      uploadedCount.push(student_id);
    }

    return res.status(200).json({
      message: `Bulk upload complete. ${uploadedCount.length} uploaded, ${skippedCount.length} skipped.`,
      uploaded: uploadedCount.length,
      skipped:  skippedCount,
    });
  } catch (err) {
    next(err);
  }
};

// ═══════════════════════════════════════════════════════════════
//  STUDENT REPORTS — Rule 5
// ═══════════════════════════════════════════════════════════════

// POST /api/lecturer/reports
// Rule 5 — report a student with a reason linked to a course
const reportStudent = async (req, res, next) => {
  try {
    const { student_id, course_id, reason } = req.body;

    if (!student_id || !course_id || !reason) {
      return res.status(400).json({
        message: 'student_id, course_id and reason are required.',
      });
    }

    // Confirm the course is assigned to this lecturer
    const [assignment] = await db.query(
      'SELECT id FROM course_assignments WHERE course_id = ? AND lecturer_id = ?',
      [course_id, req.user.id]
    );
    if (assignment.length === 0) {
      return res.status(403).json({
        message: 'You can only report students in courses assigned to you.',
      });
    }

    // Confirm student exists
    const [studentRows] = await db.query(
      'SELECT id, full_name FROM students WHERE id = ?',
      [student_id]
    );
    if (studentRows.length === 0) {
      return res.status(404).json({ message: 'Student not found.' });
    }

    await db.query(
      `INSERT INTO student_reports (lecturer_id, student_id, course_id, reason)
       VALUES (?, ?, ?, ?)`,
      [req.user.id, student_id, course_id, reason.trim()]
    );

    return res.status(201).json({
      message: `Report filed against ${studentRows[0].full_name} successfully.`,
    });
  } catch (err) {
    next(err);
  }
};

// GET /api/lecturer/reports
// Rule 5 — view own filed reports
const getMyReports = async (req, res, next) => {
  try {
    const [reports] = await db.query(
      `SELECT sr.id, sr.reason, sr.status, sr.created_at,
              s.full_name AS student_name, s.login_id AS student_login_id,
              c.course_code, c.title AS course_title
       FROM student_reports sr
       JOIN students s ON sr.student_id = s.id
       JOIN courses  c ON sr.course_id  = c.id
       WHERE sr.lecturer_id = ?
       ORDER BY sr.created_at DESC`,
      [req.user.id]
    );
    return res.status(200).json({ reports });
  } catch (err) {
    next(err);
  }
};

// ═══════════════════════════════════════════════════════════════
//  LEAVE APPLICATIONS — Rule 5
// ═══════════════════════════════════════════════════════════════

// POST /api/lecturer/leaves
// Rule 5 — lecturer applies for leave
const applyForLeave = async (req, res, next) => {
  try {
    const { leave_type, start_date, end_date, reason } = req.body;

    if (!leave_type || !start_date || !end_date || !reason) {
      return res.status(400).json({
        message: 'leave_type, start_date, end_date and reason are required.',
      });
    }

    const validTypes = ['annual', 'sick', 'maternity', 'study', 'other'];
    if (!validTypes.includes(leave_type)) {
      return res.status(400).json({
        message: `leave_type must be one of: ${validTypes.join(', ')}.`,
      });
    }

    if (new Date(start_date) >= new Date(end_date)) {
      return res.status(400).json({ message: 'end_date must be after start_date.' });
    }

    // Check if lecturer already has a pending leave
    const [pending] = await db.query(
      `SELECT id FROM leave_applications
       WHERE lecturer_id = ? AND status = 'pending'`,
      [req.user.id]
    );
    if (pending.length > 0) {
      return res.status(409).json({
        message: 'You already have a pending leave application. Wait for admin review.',
      });
    }

    await db.query(
      `INSERT INTO leave_applications
         (lecturer_id, leave_type, start_date, end_date, reason)
       VALUES (?, ?, ?, ?, ?)`,
      [req.user.id, leave_type, start_date, end_date, reason.trim()]
    );

    return res.status(201).json({
      message: 'Leave application submitted. The admin will review it shortly.',
    });
  } catch (err) {
    next(err);
  }
};

// GET /api/lecturer/leaves
// Rule 5 — view own leave application history
const getMyLeaves = async (req, res, next) => {
  try {
    const [leaves] = await db.query(
      `SELECT id, leave_type, start_date, end_date, reason,
              status, admin_comment, created_at, updated_at
       FROM leave_applications
       WHERE lecturer_id = ?
       ORDER BY created_at DESC`,
      [req.user.id]
    );
    return res.status(200).json({ leaves });
  } catch (err) {
    next(err);
  }
};

// ═══════════════════════════════════════════════════════════════
//  COMPLAINTS — Rule 5
// ═══════════════════════════════════════════════════════════════

// POST /api/lecturer/complaints
// Rule 5 — lecturer submits a complaint to admin
const submitComplaint = async (req, res, next) => {
  try {
    const { subject, message } = req.body;

    if (!subject || !message) {
      return res.status(400).json({ message: 'Subject and message are required.' });
    }

    await db.query(
      `INSERT INTO complaints (sender_type, sender_id, subject, message)
       VALUES ('lecturer', ?, ?, ?)`,
      [req.user.id, subject.trim(), message.trim()]
    );

    return res.status(201).json({ message: 'Complaint submitted successfully.' });
  } catch (err) {
    next(err);
  }
};

// GET /api/lecturer/complaints
// Rule 5 — view own complaint history + admin replies
const getMyComplaints = async (req, res, next) => {
  try {
    const [complaints] = await db.query(
      `SELECT id, subject, message, status, admin_reply, created_at, updated_at
       FROM complaints
       WHERE sender_type = 'lecturer' AND sender_id = ?
       ORDER BY created_at DESC`,
      [req.user.id]
    );
    return res.status(200).json({ complaints });
  } catch (err) {
    next(err);
  }
};

module.exports = {
  getProfile,
  updateProfile,
  getAssignedCourses,
  getEnrolledStudents,
  uploadResult,
  uploadBulkResults,
  reportStudent,
  getMyReports,
  applyForLeave,
  getMyLeaves,
  submitComplaint,
  getMyComplaints,
};
