import api from './api';

export const getProfile               = ()          => api.get('/student/profile');
export const getAvailableCourses      = (params)    => api.get('/student/courses/available', { params });
export const getRegisteredCourses     = ()          => api.get('/student/courses/registered');
export const registerCourse           = (course_id) => api.post('/student/courses/register', { course_id });
export const dropCourse               = (course_id) => api.delete(`/student/courses/register/${course_id}`);
export const getResults               = (params)    => api.get('/student/results', { params });
export const getNotifications         = ()          => api.get('/student/notifications');
export const markNotificationRead     = (id)        => api.patch(`/student/notifications/${id}/read`);
export const markAllNotificationsRead = ()          => api.patch('/student/notifications/read-all');
export const submitComplaint          = (data)      => api.post('/student/complaints', data);
export const getMyComplaints          = ()          => api.get('/student/complaints');