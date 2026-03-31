import { Routes, Route, Navigate } from 'react-router-dom';
import { useState } from 'react';
import { useAuth } from './context/AuthContext';
import ProtectedRoute    from './components/ProtectedRoute';
import FirstLoginGuard   from './components/FirstLoginGuard';
import Sidebar           from './components/Sidebar';
import Navbar            from './components/Navbar';

// Public
import Landing        from './pages/Landing';
import Login          from './pages/Login';
import Apply          from './pages/Apply';
import ChangePassword from './pages/ChangePassword';

// Admin
import AdminDashboard    from './pages/admin/Dashboard';
import AdminApplications from './pages/admin/Applications';
import AdminStudents     from './pages/admin/Students';
import AdminLecturers    from './pages/admin/Lecturers';
import AdminCourses      from './pages/admin/Courses';
import AdminAssignments  from './pages/admin/Assignments';
import AdminComplaints   from './pages/admin/Complaints';
import AdminReports      from './pages/admin/Reports';
import AdminLeaves       from './pages/admin/Leaves';

// Student
import StudentDashboard     from './pages/student/Dashboard';
import StudentProfile       from './pages/student/Profile';
import StudentCourseReg     from './pages/student/CourseReg';
import StudentResults       from './pages/student/Results';
import StudentNotifications from './pages/student/Notifications';
import StudentComplaints    from './pages/student/Complaints';

// Lecturer
import LecturerDashboard  from './pages/lecturer/Dashboard';
import LecturerProfile    from './pages/lecturer/Profile';
import LecturerCourses    from './pages/lecturer/Courses';
import LecturerGrades     from './pages/lecturer/GradeUpload';
import LecturerReports    from './pages/lecturer/Reports';
import LecturerLeaves     from './pages/lecturer/Leaves';
import LecturerComplaints from './pages/lecturer/Complaints';

const DashboardLayout = ({ children }) => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  return (
    <div className="dashboard-layout">
      <Sidebar onClose={() => setSidebarOpen(false)} />
      <div className="dashboard-main">
        <Navbar onMenuClick={() => setSidebarOpen(true)} />
        <div className="dashboard-content">
          {children}
        </div>
      </div>
    </div>
  );
};

const App = () => {
  const { loading } = useAuth();

  if (loading) return (
    <div className="spinner-wrapper" style={{ minHeight: '100vh' }}>
      <div className="spinner"></div>
    </div>
  );

  return (
    <Routes>
      {/* Public */}
      <Route path="/"      element={<Landing />} />
      <Route path="/login" element={<Login />} />
      <Route path="/apply" element={<Apply />} />

      {/* First login password change — Rule 2 */}
      <Route path="/change-password" element={
        <ProtectedRoute allowedRoles={['student', 'lecturer']}>
          <ChangePassword />
        </ProtectedRoute>
      } />

      {/* Admin — Rule 3, 7 */}
      <Route path="/admin/*" element={
        <ProtectedRoute allowedRoles={['admin']}>
          <DashboardLayout>
            <Routes>
              <Route path="dashboard"    element={<AdminDashboard />} />
              <Route path="applications" element={<AdminApplications />} />
              <Route path="students"     element={<AdminStudents />} />
              <Route path="lecturers"    element={<AdminLecturers />} />
              <Route path="courses"      element={<AdminCourses />} />
              <Route path="assignments"  element={<AdminAssignments />} />
              <Route path="complaints"   element={<AdminComplaints />} />
              <Route path="reports"      element={<AdminReports />} />
              <Route path="leaves"       element={<AdminLeaves />} />
              <Route index element={<Navigate to="dashboard" replace />} />
            </Routes>
          </DashboardLayout>
        </ProtectedRoute>
      } />

      {/* Student — Rule 4 */}
      <Route path="/student/*" element={
        <ProtectedRoute allowedRoles={['student']}>
          <FirstLoginGuard>
            <DashboardLayout>
              <Routes>
                <Route path="dashboard"     element={<StudentDashboard />} />
                <Route path="profile"       element={<StudentProfile />} />
                <Route path="courses"       element={<StudentCourseReg />} />
                <Route path="results"       element={<StudentResults />} />
                <Route path="notifications" element={<StudentNotifications />} />
                <Route path="complaints"    element={<StudentComplaints />} />
                <Route index element={<Navigate to="dashboard" replace />} />
              </Routes>
            </DashboardLayout>
          </FirstLoginGuard>
        </ProtectedRoute>
      } />

      {/* Lecturer — Rule 5 */}
      <Route path="/lecturer/*" element={
        <ProtectedRoute allowedRoles={['lecturer']}>
          <FirstLoginGuard>
            <DashboardLayout>
              <Routes>
                <Route path="dashboard"  element={<LecturerDashboard />} />
                <Route path="profile"    element={<LecturerProfile />} />
                <Route path="courses"    element={<LecturerCourses />} />
                <Route path="grades"     element={<LecturerGrades />} />
                <Route path="reports"    element={<LecturerReports />} />
                <Route path="leaves"     element={<LecturerLeaves />} />
                <Route path="complaints" element={<LecturerComplaints />} />
                <Route index element={<Navigate to="dashboard" replace />} />
              </Routes>
            </DashboardLayout>
          </FirstLoginGuard>
        </ProtectedRoute>
      } />

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
};

export default App;