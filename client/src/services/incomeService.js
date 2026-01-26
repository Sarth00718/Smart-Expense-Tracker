import api from './api';

export const incomeService = {
  // Get all income with pagination
  getAll: (params = {}) => {
    const { page = 1, limit = 50, startDate, endDate, source } = params;
    return api.get('/income', { params: { page, limit, startDate, endDate, source } });
  },

  // Add new income
  add: (income) => {
    return api.post('/income', income);
  },

  // Update income
  update: (id, income) => {
    return api.put(`/income/${id}`, income);
  },

  // Delete income
  delete: (id) => {
    return api.delete(`/income/${id}`);
  },

  // Get income summary
  getSummary: () => {
    return api.get('/income/summary');
  }
};
