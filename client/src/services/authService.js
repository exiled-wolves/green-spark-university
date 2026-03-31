import api from './api';

export const login          = (data) => api.post('/auth/login', data);
export const changePassword = (data) => api.post('/auth/change-password', data);
export const getMe          = ()     => api.get('/auth/me');