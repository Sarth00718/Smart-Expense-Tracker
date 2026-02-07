// OCR and receipt parsing utilities

function parseReceiptText(text, categoryHint = null) {
  // Input validation
  if (!text || typeof text !== 'string') {
    return { amount: null, date: null, category: categoryHint || 'Other', vendor: null };
  }

  // Limit text length to prevent ReDoS
  if (text.length > 10000) {
    text = text.substring(0, 10000);
  }

  const extracted = {
    amount: 0.0,
    date: new Date().toISOString().split('T')[0],
    vendor: '',
    items: [],
    category: 'Other'
  };

  try {
    // Extract amount
    const amountPatterns = [
      /TOTAL[\s:]*[₹$€]?\s*(\d+\.?\d*)/i,
      /Amount[\s:]*[₹$€]?\s*(\d+\.?\d*)/i,
      /[₹$€]\s*(\d+\.?\d*)/,
      /(\d+\.?\d*)\s*[₹$€]/
    ];

    for (const pattern of amountPatterns) {
      const matches = text.match(pattern);
      if (matches) {
        const amounts = [];
        let match;
        const globalPattern = new RegExp(pattern.source, pattern.flags + 'g');
        
        while ((match = globalPattern.exec(text)) !== null) {
          try {
            const amount = parseFloat(match[1].replace(/,/g, ''));
            if (!isNaN(amount)) {
              amounts.push(amount);
            }
          } catch (e) {
            // Skip invalid amounts
          }
        }

        if (amounts.length > 0) {
          extracted.amount = Math.max(...amounts);
          break;
        }
      }
    }

    // Extract date
    const datePatterns = [
      /\d{1,2}[/-]\d{1,2}[/-]\d{2,4}/,
      /\d{4}[-/]\d{1,2}[-/]\d{1,2}/
    ];

    for (const pattern of datePatterns) {
      const match = text.match(pattern);
      if (match) {
        try {
          const dateStr = match[0];
          const date = new Date(dateStr);
          if (!isNaN(date.getTime())) {
            extracted.date = date.toISOString().split('T')[0];
            break;
          }
        } catch (e) {
          // Skip invalid dates
        }
      }
    }

    // Try to detect vendor/store
    const lines = text.split('\n');
    for (let i = 0; i < Math.min(5, lines.length); i++) {
      const line = lines[i].trim();
      if (line.length > 3 && line.length < 50) {
        const upperLine = line.toUpperCase();
        if (/STORE|MARKET|RESTAURANT|CAFE|HOTEL|SHOP|MALL/.test(upperLine)) {
          extracted.vendor = line;
          break;
        }
      }
    }

    // If no vendor found, use first non-empty line
    if (!extracted.vendor) {
      for (const line of lines) {
        const trimmed = line.trim();
        if (trimmed.length > 3 && trimmed.length < 50) {
          extracted.vendor = trimmed;
          break;
        }
      }
    }

    // Detect category from text
    const categoryKeywords = {
      'Food': ['FOOD', 'RESTAURANT', 'CAFE', 'GROCERY', 'EAT', 'DINING', 'KITCHEN'],
      'Shopping': ['SHOP', 'MALL', 'STORE', 'CLOTH', 'FASHION', 'RETAIL'],
      'Travel': ['TRAVEL', 'FLIGHT', 'HOTEL', 'TAXI', 'UBER', 'TRANSPORT'],
      'Bills': ['BILL', 'ELECTRIC', 'WATER', 'INTERNET', 'PHONE', 'UTILITY'],
      'Entertainment': ['MOVIE', 'CINEMA', 'CONCERT', 'GAME', 'THEATER'],
      'Healthcare': ['PHARMACY', 'MEDICAL', 'HOSPITAL', 'CLINIC', 'DOCTOR'],
      'Education': ['BOOK', 'SCHOOL', 'COLLEGE', 'COURSE', 'EDUCATION']
    };

    if (categoryHint) {
      extracted.category = categoryHint;
    } else {
      const upperText = text.toUpperCase();
      for (const [category, keywords] of Object.entries(categoryKeywords)) {
        if (keywords.some(keyword => upperText.includes(keyword))) {
          extracted.category = category;
          break;
        }
      }
    }

  } catch (error) {
    console.error('Error parsing receipt:', error);
  }

  return extracted;
}

module.exports = {
  parseReceiptText
};
