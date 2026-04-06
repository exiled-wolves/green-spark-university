const pool   = require('../config/db');

// ─────────────────────────────────────────────────────────────
// POST /api/apply
// Public — no JWT required (Rule 1)
// Body: multipart/form-data (passport photo upload included)
//
// Nigerian university admission form fields per Rule 1:
//   full_name, date_of_birth, gender, state_of_origin, lga,
//   nationality, phone, email, department_id, jamb_reg_number,
//   jamb_score, olevel_results (JSON string), next_of_kin_name,
//   next_of_kin_phone, next_of_kin_relation, residential_address
// ─────────────────────────────────────────────────────────────
const submitApplication = async (req, res, next) => {
  try {
    const {
      full_name,
      date_of_birth,
      gender,
      state_of_origin,
      lga,
      nationality,
      phone,
      email,
      department_id,
      jamb_reg_number,
      jamb_score,
      olevel_results,      // JSON string: [{subject, grade}, ...]
      next_of_kin_name,
      next_of_kin_phone,
      next_of_kin_relation,
      residential_address,
    } = req.body;

    // ── Basic required field check ────────────────────────────
    const required = {
      full_name, date_of_birth, gender, state_of_origin, lga,
      phone, email, department_id, jamb_reg_number, jamb_score,
      olevel_results, next_of_kin_name, next_of_kin_phone,
      next_of_kin_relation, residential_address,
    };

    const missing = Object.entries(required)
      .filter(([, v]) => !v || String(v).trim() === '')
      .map(([k]) => k);

    if (missing.length > 0) {
      return res.status(400).json({
        message: 'The following fields are required.',
        missing,
      });
    }

    // ── Validate gender ───────────────────────────────────────
    if (!['male', 'female', 'other'].includes(gender)) {
      return res.status(400).json({ message: 'Invalid gender value.' });
    }

    // ── Validate JAMB score (0 – 400) ─────────────────────────
    const score = parseInt(jamb_score);
    if (isNaN(score) || score < 0 || score > 400) {
      return res.status(400).json({ message: 'JAMB score must be between 0 and 400.' });
    }

    // ── Validate and parse O'level results ───────────────────
    let parsedOlevel;
    try {
      parsedOlevel = typeof olevel_results === 'string'
        ? JSON.parse(olevel_results)
        : olevel_results;

      if (!Array.isArray(parsedOlevel) || parsedOlevel.length === 0) {
        throw new Error();
      }
    } catch {
      return res.status(400).json({
        message: "O'level results must be a valid JSON array of {subject, grade} objects.",
      });
    }

    // ── Check department exists ───────────────────────────────
    const { rows: deptRows } = await pool.query(
      'SELECT id FROM departments WHERE id = $1',
      [department_id]
    );
    if (deptRows.length === 0) {
      return res.status(400).json({ message: 'Selected department does not exist.' });
    }

    // ── Check for duplicate email or JAMB reg number ──────────
    const { rows: dupEmail } = await pool.query(
      'SELECT id FROM applicants WHERE email = $1',
      [email]
    );
    if (dupEmail.length > 0) {
      return res.status(409).json({
        message: 'An application with this email already exists.',
      });
    }

    const { rows: dupJamb } = await pool.query(
      'SELECT id FROM applicants WHERE jamb_reg_number = $1',
      [jamb_reg_number]
    );
    if (dupJamb.length > 0) {
      return res.status(409).json({
        message: 'An application with this JAMB registration number already exists.',
      });
    }

    // ── Passport photo path (if uploaded) ────────────────────
    const passport_photo = req.file ? `/uploads/${req.file.filename}` : null;

    // ── Applied year — current year ───────────────────────────
    const applied_year = new Date().getFullYear();

    // ── Insert application ────────────────────────────────────
    const { rows: result } = await pool.query(
      `INSERT INTO applicants
        (full_name, date_of_birth, gender, state_of_origin, lga,
         nationality, phone, email, passport_photo, department_id,
         jamb_reg_number, jamb_score, olevel_results,
         next_of_kin_name, next_of_kin_phone, next_of_kin_relation,
         residential_address, applied_year, status)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, 'pending')
       RETURNING id`,
      [
        full_name.trim(),
        date_of_birth,
        gender,
        state_of_origin.trim(),
        lga.trim(),
        nationality ? nationality.trim() : 'Nigerian',
        phone.trim(),
        email.trim().toLowerCase(),
        passport_photo,
        department_id,
        jamb_reg_number.trim().toUpperCase(),
        score,
        JSON.stringify(parsedOlevel),
        next_of_kin_name.trim(),
        next_of_kin_phone.trim(),
        next_of_kin_relation.trim(),
        residential_address.trim(),
        applied_year,
      ]
    );

    return res.status(201).json({
      message: 'Application submitted successfully. You will be notified via email of the outcome.',
      application_id: result[0].id,
    });

  } catch (err) {
    next(err);
  }
};

// ─────────────────────────────────────────────────────────────
// GET /api/apply/departments
// Public — fetch all departments for the application form dropdown
// ─────────────────────────────────────────────────────────────
const getDepartments = async (req, res, next) => {
  try {
    const { rows: departments } = await pool.query(
      'SELECT id, name, acronym FROM departments ORDER BY name ASC'
    );
    return res.status(200).json({ departments });
  } catch (err) {
    next(err);
  }
};

module.exports = { submitApplication, getDepartments };
