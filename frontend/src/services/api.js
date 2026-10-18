import axios from 'axios';

const API_BASE = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api';

const api = axios.create({
    baseURL: API_BASE,
    headers: { 'Content-Type': 'application/json' },
});

// Attach token to every request
api.interceptors.request.use((config) => {
    const token = localStorage.getItem('finance_token');
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});

// Handle 401 responses
api.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response?.status === 401) {
            localStorage.removeItem('finance_token');
            localStorage.removeItem('finance_user');
            window.location.href = '/login';
        }
        return Promise.reject(error);
    }
);

// Auth
export const authAPI = {
    register: (data) => api.post('/auth/register', data),
    login: (data) => api.post('/auth/login', data),
    getProfile: () => api.get('/auth/profile'),
    updateDailyAmount: (daily_amount) => api.put('/auth/daily-amount', { daily_amount }),
};

// Categories
export const categoryAPI = {
    getAll: () => api.get('/categories'),
    getById: (id) => api.get(`/categories/${id}`),
    create: (data) => api.post('/categories', data),
    update: (id, data) => api.put(`/categories/${id}`, data),
    delete: (id) => api.delete(`/categories/${id}`),
};

// Transactions
export const transactionAPI = {
    getAll: (params) => api.get('/transactions', { params }),
    getById: (id) => api.get(`/transactions/${id}`),
    create: (data) => api.post('/transactions', data),
    update: (id, data) => api.put(`/transactions/${id}`, data),
    delete: (id) => api.delete(`/transactions/${id}`),
};

// Budgets
export const budgetAPI = {
    getAll: (params) => api.get('/budgets', { params }),
    createOrUpdate: (data) => api.post('/budgets', data),
    delete: (id) => api.delete(`/budgets/${id}`),
};

// Summary
export const summaryAPI = {
    getOverview: () => api.get('/summary/overview'),
    getDaily: (date) => api.get('/summary/daily', { params: { date } }),
    getMonthly: (month) => api.get('/summary/monthly', { params: { month } }),
};

export default api;
