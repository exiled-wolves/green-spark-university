const express   = require('express');
const router    = express.Router();
const upload    = require('../middleware/upload');
const { verifyToken, requireRole } = require('../middleware/auth');

const {
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
} = require('../controllers/adminController');

// All admin routes — JWT required + admin role only (Rule 3, Rule 7)
router.use(verifyToken, requireRole('admin'));

// ── Dashboard ─────────────────────────────────────────────────
router.get('/dashboard', getDashboardStats);

// ── Applications (Rule 2) ─────────────────────────────────────
router.get('/applications',              getApplications);
router.get('/applications/:id',          getApplicationById);
router.patch('/applications/:id/accept', acceptApplication);
router.patch('/applications/:id/reject', rejectApplication);

// ── Students (Rule 3) ─────────────────────────────────────────
router.get('/students',              getAllStudents);
router.get('/students/:id',          getStudentById);
router.patch('/students/:id/status', updateStudentStatus);

// ── Lecturers (Rule 3) ────────────────────────────────────────
router.post('/lecturers',              upload.single('passport_photo'), addLecturer);
router.get('/lecturers',               getAllLecturers);
router.get('/lecturers/:id',           getLecturerById);
router.patch('/lecturers/:id/status',  updateLecturerStatus);

// ── Courses (Rule 3) ──────────────────────────────────────────
router.post('/courses',     addCourse);
router.get('/courses',      getAllCourses);
router.patch('/courses/:id', updateCourse);

// ── Course Assignments (Rule 3) ───────────────────────────────
router.post('/assignments', assignCourse);
router.get('/assignments',  getAllAssignments);

// ── Complaints (Rule 3) ───────────────────────────────────────
router.get('/complaints',              getComplaints);
router.patch('/complaints/:id/reply',  replyComplaint);

// ── Student Reports (Rule 3 & 5) ─────────────────────────────
router.get('/reports',               getStudentReports);
router.patch('/reports/:id/review',  reviewStudentReport);

// ── Leave Applications (Rule 3 & 5) ──────────────────────────
router.get('/leaves',      getLeaveApplications);
router.patch('/leaves/:id', updateLeaveStatus);

// ── Notifications (Rule 4) ────────────────────────────────────
router.post('/notifications', sendNotification);

module.exports = router;