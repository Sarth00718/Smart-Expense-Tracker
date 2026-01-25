// Natural Language Processing utilities

function parseNaturalLanguageQuery(query) {
  const lowerQuery = query.toLowerCase();
  
  const filters = {
    category: null,
    minAmount: null,
    maxAmount: null,
    timePeriod: null,
    descriptionKeywords: []
  };

  try {
    // Extract category
    const categoryKeywords = {
      'Food': ['food', 'restaurant', 'grocery', 'eat', 'dining', 'lunch', 'dinner', 'breakfast'],
      'Travel': ['travel', 'flight', 'taxi', 'uber', 'hotel', 'trip', 'transport'],
      'Shopping': ['shop', 'shopping', 'mall', 'store', 'clothes', 'fashion'],
      'Bills': ['bill', 'electricity', 'water', 'internet', 'utility', 'rent'],
      'Entertainment': ['movie', 'cinema', 'game', 'entertainment', 'concert', 'show'],
      'Healthcare': ['health', 'medical', 'doctor', 'hospital', 'medicine', 'pharmacy'],
      'Education': ['education', 'school', 'course', 'book', 'tuition', 'class']
    };

    for (const [category, keywords] of Object.entries(categoryKeywords)) {
      if (keywords.some(keyword => lowerQuery.includes(keyword))) {
        filters.category = category;
        break;
      }
    }

    // Extract amount range
    const amountPatterns = [
      { pattern: /over\s*[₹$]?\s*(\d+)/i, type: 'min' },
      { pattern: /more than\s*[₹$]?\s*(\d+)/i, type: 'min' },
      { pattern: /above\s*[₹$]?\s*(\d+)/i, type: 'min' },
      { pattern: /under\s*[₹$]?\s*(\d+)/i, type: 'max' },
      { pattern: /less than\s*[₹$]?\s*(\d+)/i, type: 'max' },
      { pattern: /below\s*[₹$]?\s*(\d+)/i, type: 'max' },
      { pattern: /between\s*[₹$]?\s*(\d+)\s*and\s*[₹$]?\s*(\d+)/i, type: 'range' }
    ];

    for (const { pattern, type } of amountPatterns) {
      const match = lowerQuery.match(pattern);
      if (match) {
        if (type === 'min') {
          filters.minAmount = parseFloat(match[1]);
        } else if (type === 'max') {
          filters.maxAmount = parseFloat(match[1]);
        } else if (type === 'range') {
          filters.minAmount = parseFloat(match[1]);
          filters.maxAmount = parseFloat(match[2]);
        }
        break;
      }
    }

    // Extract time period
    const timeKeywords = {
      'today': ['today'],
      'yesterday': ['yesterday'],
      'week': ['week', 'last week', 'this week', '7 days'],
      'month': ['month', 'last month', 'this month', '30 days'],
      'year': ['year', 'last year', 'this year']
    };

    for (const [period, keywords] of Object.entries(timeKeywords)) {
      if (keywords.some(keyword => lowerQuery.includes(keyword))) {
        filters.timePeriod = period;
        break;
      }
    }

    // Extract description keywords
    const commonWords = new Set([
      'show', 'find', 'list', 'expense', 'expenses', 'spending', 'spent',
      'the', 'a', 'an', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for',
      'of', 'with', 'by', 'from', 'up', 'about', 'into', 'through', 'during'
    ]);

    const words = lowerQuery.split(/\s+/);
    for (const word of words) {
      const cleanWord = word.replace(/[^\w]/g, '');
      if (cleanWord.length > 3 && !commonWords.has(cleanWord)) {
        filters.descriptionKeywords.push(cleanWord);
      }
    }

  } catch (error) {
    console.error('Error parsing query:', error);
  }

  return filters;
}

module.exports = {
  parseNaturalLanguageQuery
};
