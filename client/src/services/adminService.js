import api from './api';

export const getDashboardStats    = ()           => api.get('/admin/dashboard');
export const getApplications      = (status)     => api.get('/admin/applications', { params: { status } });
export const getApplicationById   = (id)         => api.get(`/admin/applications/${id}`);
export const acceptApplication    = (id)         => api.patch(`/admin/applications/${id}/accept`);
export const rejectApplication    = (id)         => api.patch(`/admin/applications/${id}/reject`);
export const getAllStudents        = (params)     => api.get('/admin/students', { params });
export const getStudentById       = (id)         => api.get(`/admin/students/${id}`);
export const updateStudentStatus  = (id, status) => api.patch(`/admin/students/${id}/status`, { status });
export const getAllLecturers       = (params)     => api.get('/admin/lecturers', { params });
export const getLecturerById      = (id)         => api.get(`/admin/lecturers/${id}`);
export const addLecturer          = (data)       => api.post('/admin/lecturers', data, {
  headers: { 'Content-Type': 'multipart/form-data' },
});
export const updateLecturerStatus = (id, status) => api.patch(`/admin/lecturers/${id}/status`, { status });
export const getAllCourses         = (params)     => api.get('/admin/courses', { params });
export const addCourse            = (data)       => api.post('/admin/courses', data);
export const updateCourse         = (id, data)   => api.patch(`/admin/courses/${id}`, data);
export const getAllAssignments     = (params)     => api.get('/admin/assignments', { params });
export const assignCourse         = (data)       => api.post('/admin/assignments', data);
export const getComplaints        = (status)     => api.get('/admin/complaints', { params: { status } });
export const replyComplaint       = (id, data)   => api.patch(`/admin/complaints/${id}/reply`, data);
export const getStudentReports    = ()           => api.get('/admin/reports');
export const reviewReport         = (id)         => api.patch(`/admin/reports/${id}/review`);
export const getLeaveApplications = (status)     => api.get('/admin/leaves', { params: { status } });
export const updateLeaveStatus    = (id, data)   => api.patch(`/admin/leaves/${id}`, data);
export const sendNotification     = (data)       => api.post('/admin/notifications', data);