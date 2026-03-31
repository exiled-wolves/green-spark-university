import axios from 'axios';

const api = axios.create({
  baseURL: '/api',
  headers: { 'Content-Type': 'application/json' },
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('gsu_token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('gsu_token');
      localStorage.removeItem('gsu_user');
      localStorage.removeItem('gsu_role');
      localStorage.removeItem('gsu_first_login');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export default api;