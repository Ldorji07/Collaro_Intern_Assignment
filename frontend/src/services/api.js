import axios from 'axios';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5001';

const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
});

export const customerApi = {
  getCustomers: async (params = {}) => {
    const response = await api.get('/api/customers', { params });
    return response.data;
  },

  getCustomerOrders: async (customerId) => {
    const response = await api.get(`/api/customers/${customerId}/orders`);
    return response.data;
  },
};

export default api;