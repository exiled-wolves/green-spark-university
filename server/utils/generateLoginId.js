const db = require('../config/db');

/**
 * Generates a unique student Login ID.
 * Format: GSU/<DEPT_ACRONYM>/<YY>/<RANDOM_4_DIGIT_NUMBER>
 * Example: GSU/CSC/25/4821
 *
 * Checks the DB to guarantee uniqueness before returning.
 */
const generateStudentLoginId = async (deptAcronym, appliedYear) => {
  const yy = String(appliedYear).slice(-2);

  let loginId;
  let isUnique = false;

  while (!isUnique) {
    const rand = Math.floor(1000 + Math.random() * 9000); // 4-digit number
    loginId = `GSU/${deptAcronym}/${yy}/${rand}`;

    const [rows] = await db.query(
      'SELECT id FROM students WHERE login_id = ?',
      [loginId]
    );
    if (rows.length === 0) isUnique = true;
  }

  return loginId;
};

/**
 * Generates a unique lecturer Login ID.
 * Format: GSU-LEC-<4_DIGIT_NUMBER>
 * Example: GSU-LEC-0042
 */
const generateLecturerLoginId = async () => {
  let loginId;
  let isUnique = false;

  while (!isUnique) {
    const rand = String(Math.floor(1000 + Math.random() * 9000));
    loginId = `GSU-LEC-${rand}`;

    const [rows] = await db.query(
      'SELECT id FROM lecturers WHERE login_id = ?',
      [loginId]
    );
    if (rows.length === 0) isUnique = true;
  }

  return loginId;
};

module.exports = { generateStudentLoginId, generateLecturerLoginId };
