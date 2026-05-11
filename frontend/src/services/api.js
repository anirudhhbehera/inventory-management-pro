import axios from 'axios';

const API_BASE_URL = 'http://localhost:5000/api';

const api = axios.create({
  baseURL: API_BASE_URL,
});

// Add token to requests
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Handle response errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401 && window.location.pathname !== '/login') {
      // Only redirect to login if not already on login page
      localStorage.removeItem('token');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export const authAPI = {
  login: (email, password) => api.post('/auth/login', { email, password }),
  register: (userData) => api.post('/auth/register', userData),
  getMe: () => api.get('/auth/me'),
  logout: () => api.post('/auth/logout')
};

export const productAPI = {
  getAll: () => api.get('/products'),
  create: (data) => api.post('/products', data),
  update: (id, data) => api.put(`/products/${id}`, data),
  delete: (id) => api.delete(`/products/${id}`),
  getLowStock: () => api.get('/products/low-stock')
};

export const orderAPI = {
  getAll: () => api.get('/orders'),
  create: (data) => api.post('/orders', data),
  updateStatus: (id, status) => api.put(`/orders/${id}/status`, { status })
};

export const supplierAPI = {
  getAll: () => api.get('/suppliers'),
  create: (data) => api.post('/suppliers', data)
};

export const analyticsAPI = {
  getDashboard: () => api.get('/analytics/dashboard')
};

export const aiAPI = {
  getRecommendations: () => api.get('/ai/recommendations'),
  getForecast: (productId) => api.get(`/ai/forecast/${productId}`),
  getAnalytics: () => api.get('/ai/analytics'),
  getGeminiInsights: () => api.get('/ai/gemini-insights'),
  generateDescription: (name, category) => api.post('/ai/generate-description', { name, category }),
  getCustomerBehavior: () => api.get('/ai/customer-behavior'),
  getSupplierRecommendations: () => api.get('/ai/supplier-recommendations')
};

export const chatbotAPI = {
  sendMessage: (message) => api.post('/chatbot/chat', { message }),
  getHistory: (limit) => api.get(`/chatbot/history?limit=${limit || 50}`),
  clearHistory: () => api.delete('/chatbot/history')
};

export const customerAPI = {
  getProducts: (params) => api.get('/customer/products', { params }),
  getProduct: (id) => api.get(`/customer/products/${id}`),
  addToCart: (productId, quantity) => api.post('/customer/cart/add', { productId, quantity }),
  getCart: () => api.get('/customer/cart'),
  updateCartItem: (productId, quantity) => api.put(`/customer/cart/item/${productId}`, { quantity }),
  placeOrder: () => api.post('/customer/orders'),
  getOrders: () => api.get('/customer/orders'),
  getSearchSuggestions: (query) => api.get('/customer/search-suggestions', { params: { q: query } })
};