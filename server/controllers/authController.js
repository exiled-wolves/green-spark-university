const bcrypt  = require('bcryptjs');
const jwt     = require('jsonwebtoken');
const db = require('../config/db');
require('dotenv').config();

// ─────────────────────────────────────────────────────────────
// HELPER — sign a JWT for any role
// ─────────────────────────────────────────────────────────────
const signToken = (id, role) => {
  return jwt.sign(
    { id, role },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
  );
};

// ─────────────────────────────────────────────────────────────
// POST /api/auth/login
// Body: { login_id, password }
//
// Tries each table in order: admins → students → lecturers
// Returns: token + user object + role + is_first_login flag
// ─────────────────────────────────────────────────────────────
const login = async (req, res, next) => {
  try {
    const { login_id, password } = req.body;

    if (!login_id || !password) {
      return res.status(400).json({ message: 'Login ID and password are required.' });
    }

    let user = null;
    let role = null;

    // 1️⃣  Check admins table (login by email)
    const [admins] = await db.query(
      'SELECT * FROM admins WHERE email = ?',
      [login_id]
    );
    if (admins.length > 0) {
      user = admins[0];
      role = 'admin';
    }

    // 2️⃣  Check students table (login by login_id e.g. GSU/CSC/25/4821)
    if (!user) {
      const [students] = await db.query(
        `SELECT s.*, d.name AS department_name, d.acronym AS department_acronym
         FROM students s
         JOIN departments d ON s.department_id = d.id
         WHERE s.login_id = ?`,
        [login_id]
      );
      if (students.length > 0) {
        user = students[0];
        role = 'student';
      }
    }

    // 3️⃣  Check lecturers table (login by login_id e.g. GSU-LEC-0042)
    if (!user) {
      const [lecturers] = await db.query(
        `SELECT l.*, d.name AS department_name
         FROM lecturers l
         JOIN departments d ON l.department_id = d.id
         WHERE l.login_id = ?`,
        [login_id]
      );
      if (lecturers.length > 0) {
        user = lecturers[0];
        role = 'lecturer';
      }
    }

    // No match found
    if (!user) {
      return res.status(401).json({ message: 'Invalid login ID or password.' });
    }

    // Check account status (students and lecturers can be suspended)
    if (user.status === 'suspended') {
      return res.status(403).json({
        message: 'Your account has been suspended. Please contact the admin.',
      });
    }

    // Verify password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ message: 'Invalid login ID or password.' });
    }

    // Sign JWT
    const token = signToken(user.id, role);

    // Remove password from response
    const { password: _pw, ...safeUser } = user;

    return res.status(200).json({
      message: 'Login successful.',
      token,
      role,
      // is_first_login tells React to redirect to change-password page
      is_first_login: user.is_first_login === 1 ? true : false,
      user: safeUser,
    });

  } catch (err) {
    next(err);
  }
};

// ─────────────────────────────────────────────────────────────
// POST /api/auth/change-password
// Protected — requires valid JWT
// Body: { current_password, new_password, confirm_password }
//
// Applies to students and lecturers (Rule 2, Rule 4, Rule 5).
// Clears is_first_login flag after successful change.
// ─────────────────────────────────────────────────────────────
const changePassword = async (req, res, next) => {
  try {
    const { id, role } = req.user;
    const { current_password, new_password, confirm_password } = req.body;

    // Admins do not use this endpoint
    if (role === 'admin') {
      return res.status(403).json({ message: 'Admins cannot use this endpoint.' });
    }

    if (!current_password || !new_password || !confirm_password) {
      return res.status(400).json({ message: 'All password fields are required.' });
    }

    if (new_password !== confirm_password) {
      return res.status(400).json({ message: 'New passwords do not match.' });
    }

    if (new_password.length < 6) {
      return res.status(400).json({ message: 'New password must be at least 6 characters.' });
    }

    if (new_password === '1234') {
      return res.status(400).json({ message: 'You cannot keep the default password.' });
    }

    // Fetch user from correct table
    const table = role === 'student' ? 'students' : 'lecturers';
    const [rows] = await db.query(
      `SELECT id, password, is_first_login FROM ${table} WHERE id = ?`,
      [id]
    );

    if (rows.length === 0) {
      return res.status(404).json({ message: 'User not found.' });
    }

    const user = rows[0];

    // Verify current password
    const isMatch = await bcrypt.compare(current_password, user.password);
    if (!isMatch) {
      return res.status(401).json({ message: 'Current password is incorrect.' });
    }

    // Hash new password
    const hashed = await bcrypt.hash(new_password, 10);

    // Update DB — also clears is_first_login flag
    await db.query(
      `UPDATE ${table} SET password = ?, is_first_login = 0 WHERE id = ?`,
      [hashed, id]
    );

    return res.status(200).json({ message: 'Password changed successfully.' });

  } catch (err) {
    next(err);
  }
};

// ─────────────────────────────────────────────────────────────
// GET /api/auth/me
// Protected — returns the currently logged-in user's profile
// ─────────────────────────────────────────────────────────────
const getMe = async (req, res, next) => {
  try {
    const { id, role } = req.user;

    let query = '';
    if (role === 'admin') {
      query = 'SELECT id, full_name, email, created_at FROM admins WHERE id = ?';
    } else if (role === 'student') {
      query = `SELECT s.id, s.login_id, s.full_name, s.email, s.phone,
                      s.level, s.status, s.is_first_login, s.passport_photo,
                      s.date_of_birth, s.gender, s.state_of_origin, s.lga,
                      s.nationality, s.address, s.created_at,
                      d.name AS department_name, d.acronym AS department_acronym
               FROM students s
               JOIN departments d ON s.department_id = d.id
               WHERE s.id = ?`;
    } else if (role === 'lecturer') {
      query = `SELECT l.id, l.login_id, l.full_name, l.email, l.phone,
                      l.qualification, l.status, l.is_first_login, l.passport_photo,
                      l.created_at,
                      d.name AS department_name
               FROM lecturers l
               JOIN departments d ON l.department_id = d.id
               WHERE l.id = ?`;
    }

    const [rows] = await db.query(query, [id]);

    if (rows.length === 0) {
      return res.status(404).json({ message: 'User not found.' });
    }

    return res.status(200).json({ user: rows[0], role });

  } catch (err) {
    next(err);
  }
};

module.exports = { login, changePassword, getMe };
