import api from './api';

export const budgetRecommendationService = {
  // Get AI-driven budget recommendations
  getRecommendations: () => {
    return api.get('/budget-recommendations');
  }
};
