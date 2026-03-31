import api from './api';

export const getProfile          = ()                => api.get('/lecturer/profile');
export const updateProfile       = (data)            => api.patch('/lecturer/profile', data, {
  headers: { 'Content-Type': 'multipart/form-data' },
});
export const getAssignedCourses  = (params)          => api.get('/lecturer/courses', { params });
export const getEnrolledStudents = (courseId, params) => api.get(`/lecturer/courses/${courseId}/students`, { params });
export const uploadResult        = (data)            => api.post('/lecturer/results', data);
export const uploadBulkResults   = (data)            => api.post('/lecturer/results/bulk', data);
export const reportStudent       = (data)            => api.post('/lecturer/reports', data);
export const getMyReports        = ()                => api.get('/lecturer/reports');
export const applyForLeave       = (data)            => api.post('/lecturer/leaves', data);
export const getMyLeaves         = ()                => api.get('/lecturer/leaves');
export const submitComplaint     = (data)            => api.post('/lecturer/complaints', data);
export const getMyComplaints     = ()                => api.get('/lecturer/complaints');