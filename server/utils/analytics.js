function calculateSpendingScore(expenses) {
  if (!expenses || expenses.length === 0) {
    return 80;
  }

  try {
    const validExpenses = expenses.filter(exp => exp && typeof exp.amount === 'number' && !isNaN(exp.amount));
    
    if (validExpenses.length === 0) {
      return 80;
    }

    const count = validExpenses.length;

    const categoryTotals = {};
    validExpenses.forEach(exp => {
      if (exp.category) {
        categoryTotals[exp.category] = (categoryTotals[exp.category] || 0) + exp.amount;
      }
    });

    let score = 70;

    if (count > 1) {
      const amounts = validExpenses.map(exp => exp.amount);
      const mean = amounts.reduce((a, b) => a + b, 0) / amounts.length;
      const variance = amounts.reduce((sum, val) => sum + Math.pow(val - mean, 2), 0) / amounts.length;
      const stdDev = Math.sqrt(variance);

      if (stdDev < 1000) {
        score += 5;
      } else if (stdDev > 5000) {
        score -= 10;
      }
    }

    const numCategories = Object.keys(categoryTotals).length;
    if (numCategories >= 3) {
      score += 5;
    } else if (numCategories === 1) {
      score -= 5;
    }

    const now = new Date();
    const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    const recentExpenses = validExpenses.filter(exp => exp.date && new Date(exp.date) >= sevenDaysAgo);

    if (recentExpenses.length > 10) {
      score -= 8;
    }

    const highValue = validExpenses.filter(exp => exp.amount > 5000).length;
    if (highValue > 3) {
      score -= 7;
    }

    return Math.max(0, Math.min(100, Math.round(score)));
  } catch (error) {
    return 70;
  }
}

function detectBehavioralPatterns(expenses) {
  const patterns = [];

  if (!expenses || expenses.length === 0) {
    return patterns;
  }

  try {
    // Weekend vs weekday spending
    let weekendTotal = 0;
    let weekdayTotal = 0;

    expenses.slice(0, 30).forEach(exp => {
      const date = new Date(exp.date);
      const dayOfWeek = date.getDay();

      if (dayOfWeek === 0 || dayOfWeek === 6) {
        weekendTotal += exp.amount;
      } else {
        weekdayTotal += exp.amount;
      }
    });

    if (weekendTotal > weekdayTotal * 1.5 && weekdayTotal > 0) {
      patterns.push({
        type: 'weekend_splurging',
        description: 'You spend significantly more on weekends',
        impact: 'Medium',
        suggestion: 'Plan weekend activities with budget in mind'
      });
    }

    // Impulse buying detection
    const smallPurchases = expenses.filter(exp => exp.amount < 500);
    if (smallPurchases.length > 8) {
      patterns.push({
        type: 'impulse_buying',
        description: `Many small purchases (${smallPurchases.length} under ₹500)`,
        impact: 'Medium',
        suggestion: 'Use 24-hour rule for non-essential purchases under ₹500'
      });
    }

    // Category spikes
    const now = new Date();
    const currentMonth = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
    
    const categoryMonthly = {};
    expenses.forEach(exp => {
      const expMonth = exp.date.toISOString().substring(0, 7);
      if (expMonth === currentMonth) {
        categoryMonthly[exp.category] = (categoryMonthly[exp.category] || 0) + exp.amount;
      }
    });

    if (Object.keys(categoryMonthly).length > 0) {
      const avgMonthly = Object.values(categoryMonthly).reduce((a, b) => a + b, 0) / Object.keys(categoryMonthly).length;
      
      Object.entries(categoryMonthly).forEach(([category, amount]) => {
        if (amount > avgMonthly * 2) {
          patterns.push({
            type: 'category_spike',
            description: `High spending on ${category} this month`,
            impact: 'Medium',
            suggestion: `Review ${category} expenses for optimization`
          });
        }
      });
    }

  } catch (error) {
    return patterns;
  }

  return patterns;
}

function predictFutureExpenses(expenses, months = 3) {
  const predictions = [];

  if (!expenses || expenses.length < 10) {
    return predictions;
  }

  try {
    // Group by month
    const monthlyTotals = {};
    expenses.forEach(exp => {
      const month = exp.date.toISOString().substring(0, 7);
      monthlyTotals[month] = (monthlyTotals[month] || 0) + exp.amount;
    });

    // Get last 6 months
    const sortedMonths = Object.keys(monthlyTotals).sort().slice(-6);
    if (sortedMonths.length < 3) {
      return predictions;
    }

    const amounts = sortedMonths.map(m => monthlyTotals[m]);

    // Simple moving average prediction
    for (let i = 1; i <= months; i++) {
      // Weighted average (more weight to recent months)
      const weights = [0.1, 0.2, 0.3, 0.4].slice(-amounts.length);
      const normalizedWeights = weights.map(w => w / weights.reduce((a, b) => a + b, 0));
      
      let predicted = 0;
      for (let j = 0; j < Math.min(amounts.length, weights.length); j++) {
        predicted += amounts[amounts.length - 1 - j] * normalizedWeights[normalizedWeights.length - 1 - j];
      }

      // Add 5% inflation per month
      predicted *= Math.pow(1.05, i);

      const now = new Date();
      const futureDate = new Date(now.getFullYear(), now.getMonth() + i, 1);
      const futureMonth = `${futureDate.getFullYear()}-${String(futureDate.getMonth() + 1).padStart(2, '0')}`;

      predictions.push({
        month: futureMonth,
        predictedAmount: Math.round(predicted * 100) / 100,
        confidence: amounts.length >= 4 ? 'medium' : 'low'
      });
    }

  } catch (error) {
    return predictions;
  }

  return predictions;
}

function getHeatmapData(expenses, year, month) {
  try {
    // Get expenses for the month
    const monthStr = `${year}-${String(month).padStart(2, '0')}`;
    const dailyData = {};

    expenses.forEach(exp => {
      const dateStr = exp.date.toISOString().substring(0, 10);
      if (dateStr.startsWith(monthStr)) {
        const day = parseInt(dateStr.split('-')[2]);
        dailyData[day] = (dailyData[day] || 0) + exp.amount;
      }
    });

    // Generate calendar data
    const firstDay = new Date(year, month - 1, 1);
    const lastDay = new Date(year, month, 0);
    const daysInMonth = lastDay.getDate();
    const startDayOfWeek = firstDay.getDay();

    const heatmapData = [];
    let week = [];

    // Add empty cells for days before month starts
    for (let i = 0; i < startDayOfWeek; i++) {
      week.push({ day: null, amount: 0, hasData: false });
    }

    // Add days of the month
    for (let day = 1; day <= daysInMonth; day++) {
      const amount = dailyData[day] || 0;
      week.push({
        day,
        amount,
        hasData: amount > 0
      });

      if (week.length === 7) {
        heatmapData.push(week);
        week = [];
      }
    }

    // Add remaining empty cells
    if (week.length > 0) {
      while (week.length < 7) {
        week.push({ day: null, amount: 0, hasData: false });
      }
      heatmapData.push(week);
    }

    const maxAmount = Math.max(...Object.values(dailyData), 0);
    const monthNames = ['', 'January', 'February', 'March', 'April', 'May', 'June', 
                        'July', 'August', 'September', 'October', 'November', 'December'];

    return {
      year,
      month,
      monthName: monthNames[month],
      heatmap: heatmapData,
      maxAmount
    };

  } catch (error) {
    return {
      year,
      month,
      monthName: '',
      heatmap: [],
      maxAmount: 0
    };
  }
}

module.exports = {
  calculateSpendingScore,
  detectBehavioralPatterns,
  predictFutureExpenses,
  getHeatmapData
};
