import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || '/api';

const API = axios.create({ baseURL: API_URL, withCredentials: true });

const isAuthEndpoint = (url) => /\/auth\/(login|register|forgot-password|reset-password|verify-email)/.test(url || '');

API.interceptors.response.use(
  (response) => response,
  (error) => {
    const url = error.config?.url || '';
    if (error.response?.status === 401 && !isAuthEndpoint(url)) {
      window.dispatchEvent(new Event('auth-logout'));
    }
    return Promise.reject(error);
  }
);

export default API;