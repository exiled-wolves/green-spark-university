const pool              = require('../config/db');
const { calculateGrade } = require('../utils/gradeCalculator');

// ═══════════════════════════════════════════════════════════════
//  PROFILE — Rule 4
// ═══════════════════════════════════════════════════════════════

// GET /api/student/profile
const getProfile = async (req, res, next) => {
  try {
    const { rows } = await pool.query(
      `SELECT s.id, s.login_id, s.full_name, s.email, s.phone,
              s.date_of_birth, s.gender, s.state_of_origin, s.lga,
              s.nationality, s.passport_photo, s.address,
              s.level, s.status, s.is_first_login, s.created_at,
              d.name AS department_name, d.acronym AS department_acronym
       FROM students s
       JOIN departments d ON s.department_id = d.id
       WHERE s.id = $1`,
      [req.user.id]
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

// ═══════════════════════════════════════════════════════════════
//  COURSE REGISTRATION — Rule 4
// ═══════════════════════════════════════════════════════════════

// GET /api/student/courses/available
// Returns courses the student can register for —
// filtered by their level and department, current session
const getAvailableCourses = async (req, res, next) => {
  try {
    const { semester } = req.query;

    // Get student's level and department
    const { rows: studentRows } = await pool.query(
      'SELECT level, department_id FROM students WHERE id = $1',
      [req.user.id]
    );
    if (studentRows.length === 0) {
      return res.status(404).json({ message: 'Student not found.' });
    }
    const { level, department_id } = studentRows[0];

    // Get current session
    const { rows: sessionRows } = await pool.query(
      'SELECT session FROM academic_sessions WHERE is_current = true LIMIT 1'
    );
    if (sessionRows.length === 0) {
      return res.status(400).json({ message: 'No active academic session found.' });
    }
    const { session } = sessionRows[0];

    let query = `
      SELECT c.id, c.course_code, c.title, c.credit_units, c.level, c.semester,
             d.name AS department_name,
             l.full_name AS lecturer_name,
             CASE WHEN cr.id IS NOT NULL THEN 1 ELSE 0 END AS already_registered
      FROM courses c
      JOIN departments d ON c.department_id = d.id
      LEFT JOIN course_assignments ca ON ca.course_id = c.id
        AND ca.session = $1 AND ca.semester = c.semester
      LEFT JOIN lecturers l ON ca.lecturer_id = l.id
      LEFT JOIN course_registrations cr ON cr.course_id = c.id
        AND cr.student_id = $2 AND cr.session = $3
      WHERE c.is_active = true
        AND c.level = $4
        AND c.department_id = $5
    `;
    const params = [session, req.user.id, session, level, department_id];
    let paramIndex = 6;

    if (semester) {
      query += ` AND c.semester = $${paramIndex++}`;
      params.push(semester);
    }

    query += ' ORDER BY c.course_code ASC';

    const { rows: courses } = await pool.query(query, params);
    return res.status(200).json({ courses, session });
  } catch (err) {
    next(err);
  }
};

// POST /api/student/courses/register
// Rule 4 — student registers a course for the current session
const registerCourse = async (req, res, next) => {
  try {
    const { course_id } = req.body;

    if (!course_id) {
      return res.status(400).json({ message: 'course_id is required.' });
    }

    // Get current session
    const { rows: sessionRows } = await pool.query(
      'SELECT session FROM academic_sessions WHERE is_current = true LIMIT 1'
    );
    if (sessionRows.length === 0) {
      return res.status(400).json({ message: 'No active academic session found.' });
    }
    const { session } = sessionRows[0];

    // Verify course exists and is active
    const { rows: courseRows } = await pool.query(
      'SELECT id, title, course_code, level, semester, department_id FROM courses WHERE id = $1 AND is_active = true',
      [course_id]
    );
    if (courseRows.length === 0) {
      return res.status(404).json({ message: 'Course not found or inactive.' });
    }
    const course = courseRows[0];

    // Verify student's level matches course level
    const { rows: studentRows } = await pool.query(
      'SELECT level, department_id FROM students WHERE id = $1',
      [req.user.id]
    );
    const student = studentRows[0];

    if (student.level !== course.level) {
      return res.status(400).json({
        message: `This course is for level ${course.level} students. You are level ${student.level}.`,
      });
    }

    if (student.department_id !== course.department_id) {
      return res.status(400).json({
        message: 'You can only register courses in your department.',
      });
    }

    // Check already registered
    const { rows: dupRows } = await pool.query(
      `SELECT id FROM course_registrations
       WHERE student_id = $1 AND course_id = $2 AND session = $3`,
      [req.user.id, course_id, session]
    );
    if (dupRows.length > 0) {
      return res.status(409).json({
        message: `You have already registered ${course.course_code} for this session.`,
      });
    }

    // Register the course
    await pool.query(
      `INSERT INTO course_registrations (student_id, course_id, session, semester)
       VALUES ($1, $2, $3, $4)`,
      [req.user.id, course_id, session, course.semester]
    );

    return res.status(201).json({
      message: `${course.course_code} — ${course.title} registered successfully.`,
    });
  } catch (err) {
    next(err);
  }
};

// DELETE /api/student/courses/register/:course_id
// Student drops a registered course (only within current session)
const dropCourse = async (req, res, next) => {
  try {
    const { rows: sessionRows } = await pool.query(
      'SELECT session FROM academic_sessions WHERE is_current = true LIMIT 1'
    );
    if (sessionRows.length === 0) {
      return res.status(400).json({ message: 'No active academic session found.' });
    }
    const { session } = sessionRows[0];

    const result = await pool.query(
      `DELETE FROM course_registrations
       WHERE student_id = $1 AND course_id = $2 AND session = $3`,
      [req.user.id, req.params.course_id, session]
    );

    if (result.rowCount === 0) {
      return res.status(404).json({ message: 'Registration not found for this session.' });
    }

    return res.status(200).json({ message: 'Course dropped successfully.' });
  } catch (err) {
    next(err);
  }
};

// GET /api/student/courses/registered
// Rule 4 — view all registered courses for current session
const getRegisteredCourses = async (req, res, next) => {
  try {
    const { rows: sessionRows } = await pool.query(
      'SELECT session FROM academic_sessions WHERE is_current = true LIMIT 1'
    );
    const session = sessionRows[0]?.session || null;

    const { rows: courses } = await pool.query(
      `SELECT cr.id AS registration_id, cr.session, cr.semester, cr.registered_at,
              c.course_code, c.title, c.credit_units, c.level,
              l.full_name AS lecturer_name
       FROM course_registrations cr
       JOIN courses c ON cr.course_id = c.id
       LEFT JOIN course_assignments ca ON ca.course_id = c.id
         AND ca.session = cr.session AND ca.semester = cr.semester
       LEFT JOIN lecturers l ON ca.lecturer_id = l.id
       WHERE cr.student_id = $1 AND cr.session = $2
       ORDER BY c.course_code ASC`,
      [req.user.id, session]
    );

    const totalCreditUnits = courses.reduce((sum, c) => sum + c.credit_units, 0);

    return res.status(200).json({ courses, session, total_credit_units: totalCreditUnits });
  } catch (err) {
    next(err);
  }
};

// ═══════════════════════════════════════════════════════════════
//  RESULTS & GRADES — Rule 4
// ═══════════════════════════════════════════════════════════════

// GET /api/student/results
// Rule 4 — view results across all sessions or filter by session/semester
const getResults = async (req, res, next) => {
  try {
    const { session, semester } = req.query;

    let query = `
      SELECT r.id, r.session, r.semester, r.ca_score, r.exam_score,
             r.total_score, r.grade, r.remark, r.uploaded_at,
             c.course_code, c.title AS course_title, c.credit_units,
             l.full_name AS lecturer_name
      FROM results r
      JOIN courses   c ON r.course_id   = c.id
      JOIN lecturers l ON r.lecturer_id = l.id
      WHERE r.student_id = $1
    `;
    const params = [req.user.id];
    let paramIndex = 2;

    if (session)  { query += ` AND r.session = $${paramIndex++}`;  params.push(session); }
    if (semester) { query += ` AND r.semester = $${paramIndex++}`; params.push(semester); }

    query += ' ORDER BY r.session DESC, c.course_code ASC';

    const { rows: results } = await pool.query(query, params);

    // Calculate GPA for the filtered results
    let totalPoints = 0;
    let totalUnits  = 0;
    const gradePoints = { A: 5, B: 4, C: 3, D: 2, E: 1, F: 0 };

    results.forEach(r => {
      if (r.grade && gradePoints[r.grade] !== undefined) {
        totalPoints += gradePoints[r.grade] * r.credit_units;
        totalUnits  += r.credit_units;
      }
    });

    const gpa = totalUnits > 0
      ? parseFloat((totalPoints / totalUnits).toFixed(2))
      : null;

    return res.status(200).json({ results, gpa, total_credit_units: totalUnits });
  } catch (err) {
    next(err);
  }
};

// ═══════════════════════════════════════════════════════════════
//  NOTIFICATIONS — Rule 4
// ═══════════════════════════════════════════════════════════════

// GET /api/student/notifications
// Rule 4 — fetch all notifications for this student
const getNotifications = async (req, res, next) => {
  try {
    const { rows: notifications } = await pool.query(
      `SELECT * FROM notifications
       WHERE (recipient_type = 'student' AND recipient_id = $1)
          OR recipient_type = 'all_students'
       ORDER BY created_at DESC`,
      [req.user.id]
    );

    const unreadCount = notifications.filter(n => n.is_read === false).length;

    return res.status(200).json({ notifications, unread_count: unreadCount });
  } catch (err) {
    next(err);
  }
};

// PATCH /api/student/notifications/:id/read
// Rule 4 — mark a notification as read
const markNotificationRead = async (req, res, next) => {
  try {
    await pool.query(
      `UPDATE notifications SET is_read = true
       WHERE id = $1
         AND (recipient_id = $2 OR recipient_type = 'all_students')`,
      [req.params.id, req.user.id]
    );
    return res.status(200).json({ message: 'Notification marked as read.' });
  } catch (err) {
    next(err);
  }
};

// PATCH /api/student/notifications/read-all
// Mark all notifications as read
const markAllNotificationsRead = async (req, res, next) => {
  try {
    await pool.query(
      `UPDATE notifications SET is_read = true
       WHERE (recipient_type = 'student' AND recipient_id = $1)
          OR recipient_type = 'all_students'`,
      [req.user.id]
    );
    return res.status(200).json({ message: 'All notifications marked as read.' });
  } catch (err) {
    next(err);
  }
};

// ═══════════════════════════════════════════════════════════════
//  COMPLAINTS — Rule 4
// ═══════════════════════════════════════════════════════════════

// POST /api/student/complaints
// Rule 4 — student submits a complaint to admin
const submitComplaint = async (req, res, next) => {
  try {
    const { subject, message } = req.body;

    if (!subject || !message) {
      return res.status(400).json({ message: 'Subject and message are required.' });
    }

    await pool.query(
      `INSERT INTO complaints (sender_type, sender_id, subject, message)
       VALUES ('student', $1, $2, $3)`,
      [req.user.id, subject.trim(), message.trim()]
    );

    return res.status(201).json({ message: 'Complaint submitted successfully.' });
  } catch (err) {
    next(err);
  }
};

// GET /api/student/complaints
// Student views their own complaint history + admin replies
const getMyComplaints = async (req, res, next) => {
  try {
    const { rows: complaints } = await pool.query(
      `SELECT id, subject, message, status, admin_reply, created_at, updated_at
       FROM complaints
       WHERE sender_type = 'student' AND sender_id = $1
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
  getAvailableCourses,
  registerCourse,
  dropCourse,
  getRegisteredCourses,
  getResults,
  getNotifications,
  markNotificationRead,
  markAllNotificationsRead,
  submitComplaint,
  getMyComplaints,
};
