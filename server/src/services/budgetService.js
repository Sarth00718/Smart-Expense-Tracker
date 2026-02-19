import budgetRepository from '../repositories/budgetRepository.js';
import expenseRepository from '../repositories/expenseRepository.js';
import { ValidationError, NotFoundError } from '../utils/errors.js';
import { startOfMonth, endOfMonth } from 'date-fns';

class BudgetService {
  async getBudgets(userId) {
    const budgets = await budgetRepository.findByUserId(userId);
    
    const now = new Date();
    const monthStart = startOfMonth(now);
    const monthEnd = endOfMonth(now);

    const budgetsWithSpending = await Promise.all(
      budgets.map(async (budget) => {
        const spent = await expenseRepository.getMonthlyTotal(
          userId,
          monthStart,
          monthEnd,
          budget.category  // Pass category to filter spending
        );

        const percentage = budget.monthlyBudget > 0
          ? Math.round((spent / budget.monthlyBudget) * 100)
          : 0;

        return {
          ...budget.toObject(),
          spent: Math.round(spent * 100) / 100,
          remaining: Math.round((budget.monthlyBudget - spent) * 100) / 100,
          percentage
        };
      })
    );

    return budgetsWithSpending;
  }

  async setBudget(userId, category, monthlyBudget) {
    if (!category || monthlyBudget === undefined) {
      throw new ValidationError('Category and monthly budget are required');
    }

    const amount = parseFloat(monthlyBudget);
    if (isNaN(amount) || amount < 0) {
      throw new ValidationError('Monthly budget must be a positive number');
    }

    const budget = await budgetRepository.upsertBudget(
      userId,
      category,
      Math.round(amount * 100) / 100
    );

    return budget;
  }

  async deleteBudget(userId, category) {
    const budget = await budgetRepository.deleteByUserIdAndCategory(userId, category);
    if (!budget) {
      throw new NotFoundError('Budget');
    }
    return { message: 'Budget deleted successfully' };
  }
}

export default new BudgetService();
