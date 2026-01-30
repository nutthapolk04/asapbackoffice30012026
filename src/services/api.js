import axios from 'axios';

const api = axios.create({
    baseURL: import.meta.env.VITE_STRAPI_API_URL ? `${import.meta.env.VITE_STRAPI_API_URL}/api` : '/api',
    timeout: 30000,
    headers: {
        'Content-Type': 'application/json',
        ...(import.meta.env.VITE_STRAPI_TOKEN ? { 'Authorization': `Bearer ${import.meta.env.VITE_STRAPI_TOKEN}` } : {})
    }
});

// Response interceptor for error handling
api.interceptors.response.use(
    response => response,
    error => {
        console.error('API Error:', error);
        return Promise.reject(error);
    }
);

export default api;
