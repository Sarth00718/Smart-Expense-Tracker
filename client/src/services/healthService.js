import api from './api';

export const healthService = {
  // Get system health status
  getHealth: () => {
    return api.get('/health');
  }
};
