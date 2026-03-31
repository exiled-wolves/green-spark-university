import api from './api';

export const getDepartments    = ()     => api.get('/apply/departments');
export const submitApplication = (data) => api.post('/apply', data, {
  headers: { 'Content-Type': 'multipart/form-data' },
});