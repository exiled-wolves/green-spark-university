const express   = require('express');
const router    = express.Router();
const { verifyToken, requireRole } = require('../middleware/auth');

const {
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
} = require('../controllers/studentController');

// All student routes — JWT required + student role only (Rule 4)
router.use(verifyToken, requireRole('student'));

// ── Profile (Rule 4) ──────────────────────────────────────────
router.get('/profile', getProfile);

// ── Course Registration (Rule 4) ──────────────────────────────
router.get('/courses/available',            getAvailableCourses);
router.get('/courses/registered',           getRegisteredCourses);
router.post('/courses/register',            registerCourse);
router.delete('/courses/register/:course_id', dropCourse);

// ── Results & Grades (Rule 4) ─────────────────────────────────
router.get('/results', getResults);

// ── Notifications (Rule 4) ────────────────────────────────────
router.get('/notifications',                  getNotifications);
router.patch('/notifications/read-all',       markAllNotificationsRead);
router.patch('/notifications/:id/read',       markNotificationRead);

// ── Complaints (Rule 4) ───────────────────────────────────────
router.post('/complaints', submitComplaint);
router.get('/complaints',  getMyComplaints);

module.exports = router;