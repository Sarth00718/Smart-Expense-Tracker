// Natural Language Processing utilities for expense tracking

function parseNaturalLanguageQuery(query) {
  if (!query || typeof query !== 'string') {
    throw new Error('Invalid query: must be a non-empty string');
  }

  if (query.length > 500) {
    throw new Error('Query too long: maximum 500 characters');
  }

  const lowerQuery = query.toLowerCase().trim();
  
  const filters = {
    category: null,
    minAmount: null,
    maxAmount: null,
    timePeriod: null,
    startDate: null,
    endDate: null,
    descriptionKeywords: [],
    year: null,
    month: null
  };

  try {
    const yearMatch = lowerQuery.match(/\b(20\d{2})\b/);
    if (yearMatch) {
      const year = parseInt(yearMatch[1]);
      filters.year = year;
      
      const monthNames = {
        'january': 0, 'jan': 0,
        'february': 1, 'feb': 1,
        'march': 2, 'mar': 2,
        'april': 3, 'apr': 3,
        'may': 4,
        'june': 5, 'jun': 5,
        'july': 6, 'jul': 6,
        'august': 7, 'aug': 7,
        'september': 8, 'sep': 8, 'sept': 8,
        'october': 9, 'oct': 9,
        'november': 10, 'nov': 10,
        'december': 11, 'dec': 11
      };

      let monthFound = false;
      for (const [monthName, monthIndex] of Object.entries(monthNames)) {
        if (lowerQuery.includes(monthName)) {
          filters.month = monthIndex;
          filters.startDate = new Date(year, monthIndex, 1);
          filters.endDate = new Date(year, monthIndex + 1, 0, 23, 59, 59);
          filters.timePeriod = `${monthName} ${year}`;
          monthFound = true;
          break;
        }
      }

      if (!monthFound) {
        filters.startDate = new Date(year, 0, 1);
        filters.endDate = new Date(year, 11, 31, 23, 59, 59);
        filters.timePeriod = `year ${year}`;
      }
    }

    if (!filters.startDate && !filters.endDate) {
      const now = new Date();
      const currentYear = now.getFullYear();
      const currentMonth = now.getMonth();

      if (lowerQuery.includes('last year')) {
        const lastYear = currentYear - 1;
        filters.year = lastYear;
        filters.startDate = new Date(lastYear, 0, 1);
        filters.endDate = new Date(lastYear, 11, 31, 23, 59, 59);
        filters.timePeriod = 'last year';
      }
      else if (lowerQuery.includes('this year')) {
        filters.year = currentYear;
        filters.startDate = new Date(currentYear, 0, 1);
        filters.endDate = new Date();
        filters.timePeriod = 'this year';
      }
      else if (lowerQuery.includes('last month')) {
        const lastMonth = currentMonth - 1;
        const lastMonthYear = lastMonth < 0 ? currentYear - 1 : currentYear;
        const lastMonthIndex = lastMonth < 0 ? 11 : lastMonth;
        
        filters.startDate = new Date(lastMonthYear, lastMonthIndex, 1);
        filters.endDate = new Date(lastMonthYear, lastMonthIndex + 1, 0, 23, 59, 59);
        filters.timePeriod = 'last month';
      }
      else if (lowerQuery.includes('this month')) {
        filters.startDate = new Date(currentYear, currentMonth, 1);
        filters.endDate = new Date();
        filters.timePeriod = 'this month';
      }
      else if (lowerQuery.includes('last week')) {
        filters.startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        filters.endDate = new Date();
        filters.timePeriod = 'last week';
      }
      else if (lowerQuery.includes('this week') || lowerQuery.includes('week')) {
        filters.startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        filters.endDate = new Date();
        filters.timePeriod = 'this week';
      }
      else if (lowerQuery.includes('today')) {
        filters.startDate = new Date(now.setHours(0, 0, 0, 0));
        filters.endDate = new Date();
        filters.timePeriod = 'today';
      }
      else if (lowerQuery.includes('yesterday')) {
        const yesterday = new Date(now.getTime() - 24 * 60 * 60 * 1000);
        filters.startDate = new Date(yesterday.setHours(0, 0, 0, 0));
        filters.endDate = new Date(yesterday.setHours(23, 59, 59, 999));
        filters.timePeriod = 'yesterday';
      }
    }

    const categoryKeywords = {
      'Food': ['food', 'restaurant', 'grocery', 'groceries', 'eat', 'eating', 'dining', 'lunch', 'dinner', 'breakfast', 'meal', 'snack'],
      'Travel': ['travel', 'flight', 'flights', 'hotel', 'hotels', 'trip', 'vacation', 'holiday'],
      'Transport': ['transport', 'transportation', 'taxi', 'uber', 'ola', 'bus', 'train', 'metro', 'petrol', 'fuel', 'gas'],
      'Shopping': ['shop', 'shopping', 'mall', 'store', 'clothes', 'clothing', 'fashion', 'purchase'],
      'Bills': ['bill', 'bills', 'electricity', 'water', 'internet', 'utility', 'utilities', 'rent'],
      'Entertainment': ['movie', 'movies', 'cinema', 'game', 'games', 'entertainment', 'concert', 'show', 'netflix', 'spotify'],
      'Healthcare': ['health', 'healthcare', 'medical', 'doctor', 'hospital', 'medicine', 'pharmacy', 'clinic'],
      'Education': ['education', 'school', 'college', 'university', 'course', 'courses', 'book', 'books', 'tuition', 'class', 'classes']
    };

    for (const [category, keywords] of Object.entries(categoryKeywords)) {
      if (keywords.some(keyword => lowerQuery.includes(keyword))) {
        filters.category = category;
        break;
      }
    }

    const amountPatterns = [
      { pattern: /over\s*[₹$]?\s*([\d,]+)/i, type: 'min' },
      { pattern: /more\s+than\s*[₹$]?\s*([\d,]+)/i, type: 'min' },
      { pattern: /above\s*[₹$]?\s*([\d,]+)/i, type: 'min' },
      { pattern: /greater\s+than\s*[₹$]?\s*([\d,]+)/i, type: 'min' },
      { pattern: /under\s*[₹$]?\s*([\d,]+)/i, type: 'max' },
      { pattern: /less\s+than\s*[₹$]?\s*([\d,]+)/i, type: 'max' },
      { pattern: /below\s*[₹$]?\s*([\d,]+)/i, type: 'max' },
      { pattern: /between\s*[₹$]?\s*([\d,]+)\s*and\s*[₹$]?\s*([\d,]+)/i, type: 'range' }
    ];

    for (const { pattern, type } of amountPatterns) {
      const match = lowerQuery.match(pattern);
      if (match) {
        if (type === 'min') {
          filters.minAmount = parseFloat(match[1].replace(/,/g, ''));
        } else if (type === 'max') {
          filters.maxAmount = parseFloat(match[1].replace(/,/g, ''));
        } else if (type === 'range') {
          filters.minAmount = parseFloat(match[1].replace(/,/g, ''));
          filters.maxAmount = parseFloat(match[2].replace(/,/g, ''));
        }
        break;
      }
    }

    const commonWords = new Set([
      'show', 'find', 'list', 'get', 'fetch', 'display', 'search',
      'expense', 'expenses', 'spending', 'spent', 'total', 'all',
      'the', 'a', 'an', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for',
      'of', 'with', 'by', 'from', 'up', 'about', 'into', 'through', 'during',
      'last', 'this', 'year', 'month', 'week', 'day', 'my', 'me', 'i',
      'what', 'when', 'where', 'how', 'much', 'many', 'did', 'was', 'were',
      'matching', 'related', 'regarding',
      'food', 'travel', 'transport', 'shopping', 'bills', 'entertainment', 
      'healthcare', 'education', 'restaurant', 'grocery', 'flight', 'hotel',
      'taxi', 'uber', 'mall', 'store', 'movie', 'cinema', 'doctor', 'hospital'
    ]);

    const words = lowerQuery.split(/\s+/);
    for (const word of words) {
      const cleanWord = word.replace(/[^\w]/g, '');
      if (cleanWord.length > 3 && 
          !commonWords.has(cleanWord) && 
          !/^\d+$/.test(cleanWord) &&
          !/^20\d{2}$/.test(cleanWord)) {
        filters.descriptionKeywords.push(cleanWord);
      }
    }

  } catch (error) {
  }

  return filters;
}

function parseFinanceQuery(query, expenses, incomes, budgets) {
  const lowerQuery = query.toLowerCase();
  const result = {
    canAnswerDirectly: false,
    directAnswer: null,
    fallbackAnswer: null,
    relevantData: null
  };

  if (expenses.length === 0 && incomes.length === 0) {
    result.canAnswerDirectly = true;
    result.directAnswer = "📊 You haven't added any financial data yet. Start tracking your income and expenses to get personalized insights!";
    return result;
  }

  const now = new Date();
  const currentYear = now.getFullYear();
  const currentMonth = now.getMonth();
  const monthNames = ['January', 'February', 'March', 'April', 'May', 'June', 
                      'July', 'August', 'September', 'October', 'November', 'December'];
  const currentMonthName = monthNames[currentMonth];
  
  const startOfMonth = new Date(currentYear, currentMonth, 1);
  const startOfWeek = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
  const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const lastMonthIndex = currentMonth - 1;
  const lastMonthYear = lastMonthIndex < 0 ? currentYear - 1 : currentYear;
  const lastMonthMonth = lastMonthIndex < 0 ? 11 : lastMonthIndex;
  const startOfLastMonth = new Date(lastMonthYear, lastMonthMonth, 1);
  const endOfLastMonth = new Date(lastMonthYear, lastMonthMonth + 1, 0, 23, 59, 59);

  if (lowerQuery.includes('net balance') || lowerQuery.includes('balance') || lowerQuery.includes('net worth')) {
    const totalIncome = incomes.reduce((sum, inc) => sum + inc.amount, 0);
    const totalExpenses = expenses.reduce((sum, exp) => sum + exp.amount, 0);
    const netBalance = totalIncome - totalExpenses;

    result.canAnswerDirectly = true;
    result.directAnswer = `💰 Your Net Balance: ₹${netBalance.toFixed(2)}\n\n📊 Breakdown:\n• Total Income: ₹${totalIncome.toFixed(2)}\n• Total Expenses: ₹${totalExpenses.toFixed(2)}\n\n${netBalance >= 0 ? '✅ You\'re in the positive!' : '⚠️ You\'re spending more than earning.'}`;
    return result;
  }

  const spendingMatch = lowerQuery.match(/how much.*spend.*on\s+(\w+)/i) || 
                        lowerQuery.match(/(\w+)\s+spending/i) ||
                        lowerQuery.match(/(\w+)\s+expense/i) ||
                        lowerQuery.match(/spent.*on\s+(\w+)/i) ||
                        lowerQuery.match(/current\s+(\w+)\s+expense/i);
  
  if (spendingMatch) {
    const categoryQuery = spendingMatch[1].toLowerCase();
    const categoryMap = {
      'food': 'Food',
      'travel': 'Travel',
      'shopping': 'Shopping',
      'bills': 'Bills',
      'entertainment': 'Entertainment',
      'healthcare': 'Healthcare',
      'education': 'Education',
      'transport': 'Transport',
      'transportation': 'Transport'
    };
    
    const category = categoryMap[categoryQuery];
    
    if (category) {
      let filteredExpenses = expenses.filter(exp => exp.category === category);
      let timePeriod = 'total';
      let timeDescription = 'all time';
      
      // Check for time period in query
      if (lowerQuery.includes('today')) {
        filteredExpenses = filteredExpenses.filter(exp => {
          const expDate = new Date(exp.date);
          return expDate >= startOfToday;
        });
        timePeriod = 'today';
        timeDescription = 'today';
      } else if (lowerQuery.includes('last month')) {
        filteredExpenses = filteredExpenses.filter(exp => {
          const expDate = new Date(exp.date);
          return expDate >= startOfLastMonth && expDate <= endOfLastMonth;
        });
        timePeriod = 'last month';
        timeDescription = `last month (${monthNames[lastMonthMonth]} ${lastMonthYear})`;
      } else if (lowerQuery.includes('this month') || lowerQuery.includes('current month') || lowerQuery.includes('these month')) {
        filteredExpenses = filteredExpenses.filter(exp => {
          const expDate = new Date(exp.date);
          return expDate >= startOfMonth;
        });
        timePeriod = 'this month';
        timeDescription = `this month (${currentMonthName} ${currentYear})`;
      } else if (lowerQuery.includes('this week') || lowerQuery.includes('last week')) {
        filteredExpenses = filteredExpenses.filter(exp => {
          const expDate = new Date(exp.date);
          return expDate >= startOfWeek;
        });
        timePeriod = 'this week';
        timeDescription = 'this week';
      }
      
      const total = filteredExpenses.reduce((sum, exp) => sum + exp.amount, 0);
      const count = filteredExpenses.length;
      
      result.canAnswerDirectly = true;
      
      if (count === 0) {
        result.directAnswer = `📊 You haven't spent anything on ${category} ${timeDescription}.`;
      } else {
        result.directAnswer = `💰 **${category} Spending - ${timeDescription.charAt(0).toUpperCase() + timeDescription.slice(1)}**\n\n`;
        result.directAnswer += `Total: ₹${total.toFixed(2)}\n`;
        result.directAnswer += `Transactions: ${count}\n`;
        
        if (count > 0) {
          const avg = total / count;
          result.directAnswer += `Average: ₹${avg.toFixed(2)} per transaction\n\n`;
        }
        
        // Add budget comparison if available and it's current month
        if (timePeriod === 'this month' && budgets.length > 0) {
          const budget = budgets.find(b => b.category === category);
          if (budget) {
            const remaining = budget.monthlyBudget - total;
            const percentUsed = ((total / budget.monthlyBudget) * 100).toFixed(1);
            result.directAnswer += `📊 Budget Status:\n`;
            result.directAnswer += `• Budget: ₹${budget.monthlyBudget}\n`;
            result.directAnswer += `• Used: ${percentUsed}%\n`;
            result.directAnswer += `• Remaining: ₹${remaining.toFixed(2)}\n`;
            
            if (total > budget.monthlyBudget) {
              result.directAnswer += `\n⚠️ You're over budget by ₹${(total - budget.monthlyBudget).toFixed(2)}!`;
            } else if (total > budget.monthlyBudget * 0.8) {
              result.directAnswer += `\n⚠️ Warning: You've used ${percentUsed}% of your budget!`;
            }
          }
        }
        
        // Show recent transactions
        if (filteredExpenses.length > 0 && filteredExpenses.length <= 5) {
          result.directAnswer += `\n📝 Transactions:\n`;
          filteredExpenses.forEach(exp => {
            const expDate = new Date(exp.date);
            result.directAnswer += `• ${expDate.toLocaleDateString()}: ₹${exp.amount.toFixed(2)} - ${exp.description || 'No description'}\n`;
          });
        }
      }
      
      return result;
    }
  }

  const affordMatch = lowerQuery.match(/can i afford.*?[₹$]?\s*([\d,]+)/i) ||
                      lowerQuery.match(/afford.*?[₹$]?\s*([\d,]+)/i);
  
  if (affordMatch) {
    const amount = parseFloat(affordMatch[1].replace(/,/g, ''));
    const affordability = analyzeAffordability(amount, expenses, incomes, budgets);
    
    result.canAnswerDirectly = true;
    result.directAnswer = affordability;
    return result;
  }

  if (lowerQuery.includes('top') && (lowerQuery.includes('categor') || lowerQuery.includes('spending'))) {
    const categoryTotals = {};
    expenses.forEach(exp => {
      categoryTotals[exp.category] = (categoryTotals[exp.category] || 0) + exp.amount;
    });
    
    const sorted = Object.entries(categoryTotals)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5);
    
    result.canAnswerDirectly = true;
    result.directAnswer = '📊 Your Top Spending Categories:\n\n' + 
      sorted.map(([cat, amt], idx) => 
        `${idx + 1}. ${cat}: ₹${amt.toFixed(2)}`
      ).join('\n');
    
    return result;
  }

  if (lowerQuery.includes('recent') || lowerQuery.includes('latest')) {
    const recent = expenses.slice(0, 5);
    
    result.canAnswerDirectly = true;
    result.directAnswer = '📝 Your Recent Expenses:\n\n' +
      recent.map(exp => 
        `• ${new Date(exp.date).toLocaleDateString()}: ${exp.category} - ₹${exp.amount.toFixed(2)}\n  ${exp.description || 'No description'}`
      ).join('\n\n');
    
    return result;
  }

  if (lowerQuery.includes('total') && lowerQuery.includes('month')) {
    const monthExpenses = expenses.filter(exp => new Date(exp.date) >= startOfMonth);
    const monthIncome = incomes.filter(inc => new Date(inc.date) >= startOfMonth);
    const totalExp = monthExpenses.reduce((sum, exp) => sum + exp.amount, 0);
    const totalInc = monthIncome.reduce((sum, inc) => sum + inc.amount, 0);
    
    result.canAnswerDirectly = true;
    result.directAnswer = `💰 This Month's Summary:\n\n• Income: ₹${totalInc.toFixed(2)}\n• Expenses: ₹${totalExp.toFixed(2)}\n• Net: ₹${(totalInc - totalExp).toFixed(2)}\n\n📊 Transactions: ${monthExpenses.length} expenses, ${monthIncome.length} income`;
    return result;
  }

  result.relevantData = `Query Type: General financial question\nUser has ${expenses.length} expenses and ${incomes.length} income records.`;
  
  return result;
}

function analyzeAffordability(amount, expenses, incomes, budgets) {
  const now = new Date();
  const currentYear = now.getFullYear();
  const currentMonth = now.getMonth();
  const startOfMonth = new Date(currentYear, currentMonth, 1);
  const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();
  const daysRemaining = daysInMonth - now.getDate();
  const monthExpenses = expenses.filter(exp => new Date(exp.date) >= startOfMonth);
  const monthIncome = incomes.filter(inc => new Date(inc.date) >= startOfMonth);
  
  const monthExpenseTotal = monthExpenses.reduce((sum, exp) => sum + exp.amount, 0);
  const monthIncomeTotal = monthIncome.reduce((sum, inc) => sum + inc.amount, 0);
  
  const currentBalance = monthIncomeTotal - monthExpenseTotal;
  
  const daysPassed = now.getDate();
  const avgDailySpending = monthExpenseTotal / daysPassed;
  
  const totalBudget = budgets.reduce((sum, b) => sum + b.monthlyBudget, 0);
  
  let response = `💰 Affordability Analysis for ₹${amount.toFixed(2)}:\n\n`;
  
  // Income-based analysis
  response += `📊 Current Month Status:\n`;
  response += `• Income: ₹${monthIncomeTotal.toFixed(2)}\n`;
  response += `• Expenses: ₹${monthExpenseTotal.toFixed(2)}\n`;
  response += `• Current Balance: ₹${currentBalance.toFixed(2)}\n`;
  response += `• Days Remaining: ${daysRemaining}\n\n`;
  
  const afterPurchase = currentBalance - amount;
  const dailyBudgetAfter = daysRemaining > 0 ? afterPurchase / daysRemaining : 0;
  
  if (afterPurchase > 0) {
    response += `✅ YES, you can afford it!\n\n`;
    response += `💡 After Purchase:\n`;
    response += `• Remaining Balance: ₹${afterPurchase.toFixed(2)}\n`;
    response += `• Daily Budget: ₹${dailyBudgetAfter.toFixed(2)} for ${daysRemaining} days\n`;
    
    if (dailyBudgetAfter < avgDailySpending) {
      response += `\n⚠️ Note: You'll need to reduce daily spending to ₹${dailyBudgetAfter.toFixed(2)} (currently ₹${avgDailySpending.toFixed(2)})`;
    }
  } else {
    response += `❌ NOT RECOMMENDED\n\n`;
    response += `⚠️ This purchase would exceed your current balance by ₹${Math.abs(afterPurchase).toFixed(2)}\n\n`;
    
    if (monthIncomeTotal > 0) {
      const percentOfIncome = (amount / monthIncomeTotal) * 100;
      response += `📊 This represents ${percentOfIncome.toFixed(1)}% of your monthly income.\n\n`;
    }
    
    response += `💡 Suggestion: Wait until next month or consider a smaller amount.`;
  }
  
  if (totalBudget > 0) {
    response += `\n\n📋 Budget Status: ₹${(totalBudget - monthExpenseTotal).toFixed(2)} remaining of ₹${totalBudget.toFixed(2)} total budget`;
  }
  
  return response;
}

export { 
  parseNaturalLanguageQuery,
  parseFinanceQuery,
  analyzeAffordability
 };
