export function calculateSpendingScore(expenses) {
  if (!expenses || expenses.length === 0) return null;

  try {
    const valid = expenses.filter((e) => e && typeof e.amount === 'number' && !isNaN(e.amount));
    if (valid.length === 0) return null;

    let score = 70;

    if (valid.length > 1) {
      const amounts = valid.map((e) => e.amount);
      const mean = amounts.reduce((a, b) => a + b, 0) / amounts.length;
      const stdDev = Math.sqrt(amounts.reduce((s, v) => s + Math.pow(v - mean, 2), 0) / amounts.length);
      if (stdDev < 1000) score += 5;
      else if (stdDev > 5000) score -= 10;
    }

    const numCategories = new Set(valid.map((e) => e.category).filter(Boolean)).size;
    if (numCategories >= 3) score += 5;
    else if (numCategories === 1) score -= 5;

    const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
    const recent = valid.filter((e) => e.date && new Date(e.date) >= sevenDaysAgo);
    if (recent.length > 10) score -= 8;

    const highValue = valid.filter((e) => e.amount > 5000).length;
    if (highValue > 3) score -= 7;

    return Math.max(0, Math.min(100, Math.round(score)));
  } catch {
    return 70;
  }
}

export function detectBehavioralPatterns(expenses) {
  const patterns = [];
  if (!expenses || expenses.length === 0) return patterns;

  try {
    let weekendTotal = 0;
    let weekdayTotal = 0;
    expenses.slice(0, 30).forEach((exp) => {
      const day = new Date(exp.date).getDay();
      if (day === 0 || day === 6) weekendTotal += exp.amount;
      else weekdayTotal += exp.amount;
    });

    if (weekendTotal > weekdayTotal * 1.5 && weekdayTotal > 0) {
      patterns.push({
        type: 'weekend_splurging',
        description: 'You spend significantly more on weekends',
        impact: 'Medium',
        suggestion: 'Plan weekend activities with a budget in mind',
      });
    }

    const smallPurchases = expenses.filter((e) => e.amount < 500);
    if (smallPurchases.length > 8) {
      patterns.push({
        type: 'impulse_buying',
        description: `Many small purchases (${smallPurchases.length} under ₹500)`,
        impact: 'Medium',
        suggestion: 'Use 24-hour rule for non-essential purchases under ₹500',
      });
    }

    const now = new Date();
    const currentMonth = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
    const categoryMonthly = {};
    expenses.forEach((exp) => {
      if (exp.date.toISOString().substring(0, 7) === currentMonth) {
        categoryMonthly[exp.category] = (categoryMonthly[exp.category] || 0) + exp.amount;
      }
    });

    if (Object.keys(categoryMonthly).length > 0) {
      const avg = Object.values(categoryMonthly).reduce((a, b) => a + b, 0) / Object.keys(categoryMonthly).length;
      Object.entries(categoryMonthly).forEach(([cat, amt]) => {
        if (amt > avg * 2) {
          patterns.push({
            type: 'category_spike',
            description: `High spending on ${cat} this month`,
            impact: 'Medium',
            suggestion: `Review ${cat} expenses for optimization`,
          });
        }
      });
    }
  } catch {
    // ignore
  }

  return patterns;
}

export function predictFutureExpenses(expenses, months = 3) {
  const predictions = [];
  if (!expenses || expenses.length < 10) return predictions;

  try {
    const monthlyTotals = {};
    expenses.forEach((exp) => {
      const month = exp.date.toISOString().substring(0, 7);
      monthlyTotals[month] = (monthlyTotals[month] || 0) + exp.amount;
    });

    const sortedMonths = Object.keys(monthlyTotals).sort().slice(-6);
    if (sortedMonths.length < 3) return predictions;

    const amounts = sortedMonths.map((m) => monthlyTotals[m]);
    const weights = [0.1, 0.2, 0.3, 0.4].slice(-amounts.length);
    const totalW = weights.reduce((a, b) => a + b, 0);
    const normed = weights.map((w) => w / totalW);

    for (let i = 1; i <= months; i++) {
      let predicted = 0;
      for (let j = 0; j < Math.min(amounts.length, normed.length); j++) {
        predicted += amounts[amounts.length - 1 - j] * normed[normed.length - 1 - j];
      }
      predicted *= Math.pow(1.05, i);

      const futureDate = new Date(new Date().getFullYear(), new Date().getMonth() + i, 1);
      const futureMonth = `${futureDate.getFullYear()}-${String(futureDate.getMonth() + 1).padStart(2, '0')}`;
      predictions.push({
        month: futureMonth,
        predictedAmount: Math.round(predicted * 100) / 100,
        confidence: amounts.length >= 4 ? 'medium' : 'low',
      });
    }
  } catch {
    // ignore
  }

  return predictions;
}

export function getHeatmapData(expenses, year, month) {
  try {
    const monthStr = `${year}-${String(month).padStart(2, '0')}`;
    const dailyData = {};

    expenses.forEach((exp) => {
      const dateStr = exp.date.toISOString().substring(0, 10);
      if (dateStr.startsWith(monthStr)) {
        const day = parseInt(dateStr.split('-')[2]);
        dailyData[day] = (dailyData[day] || 0) + exp.amount;
      }
    });

    const firstDay = new Date(year, month - 1, 1);
    const daysInMonth = new Date(year, month, 0).getDate();
    const startDayOfWeek = firstDay.getDay();
    const heatmapData = [];
    let week = [];

    for (let i = 0; i < startDayOfWeek; i++) {
      week.push({ day: null, amount: 0, hasData: false });
    }

    for (let day = 1; day <= daysInMonth; day++) {
      const amount = dailyData[day] || 0;
      week.push({ day, amount, hasData: amount > 0 });
      if (week.length === 7) { heatmapData.push(week); week = []; }
    }

    if (week.length > 0) {
      while (week.length < 7) week.push({ day: null, amount: 0, hasData: false });
      heatmapData.push(week);
    }

    const monthNames = ['', 'January', 'February', 'March', 'April', 'May', 'June',
      'July', 'August', 'September', 'October', 'November', 'December'];

    return {
      year, month,
      monthName: monthNames[month],
      heatmap: heatmapData,
      maxAmount: Math.max(...Object.values(dailyData), 0),
    };
  } catch {
    return { year, month, monthName: '', heatmap: [], maxAmount: 0 };
  }
}
