const express   = require('express');
const router    = express.Router();
const upload    = require('../middleware/upload');
const { verifyToken, requireRole } = require('../middleware/auth');

const {
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
} = require('../controllers/lecturerController');

// All lecturer routes — JWT required + lecturer role only 
router.use(verifyToken, requireRole('lecturer'));

// ── Profile 
router.get('/profile',  getProfile);
router.patch('/profile', upload.single('passport_photo'), updateProfile);

// ── Assigned Courses
router.get('/courses',                        getAssignedCourses);
router.get('/courses/:course_id/students',    getEnrolledStudents);

// ── Results & Grading (Rule 5) ────────────────────────────────
router.post('/results',      uploadResult);
router.post('/results/bulk', uploadBulkResults);

// ── Student Reports (Rule 5) ──────────────────────────────────
router.post('/reports', reportStudent);
router.get('/reports',  getMyReports);

// ── Leave Applications (Rule 5) ───────────────────────────────
router.post('/leaves', applyForLeave);
router.get('/leaves',  getMyLeaves);

// ── Complaints (Rule 5) ───────────────────────────────────────
router.post('/complaints', submitComplaint);
router.get('/complaints',  getMyComplaints);

module.exports = router;