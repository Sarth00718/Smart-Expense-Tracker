/**
 * Voice Command Parser for Expense Entry
 * Extracts amount, category, and description from voice transcripts
 */

const nlp = require('compromise');

// Category keywords mapping
const CATEGORY_KEYWORDS = {
  Food: ['food', 'lunch', 'dinner', 'breakfast', 'meal', 'restaurant', 'cafe', 'snack', 'grocery', 'groceries'],
  Travel: ['travel', 'trip', 'flight', 'hotel', 'vacation', 'tour', 'booking'],
  Transport: ['transport', 'taxi', 'uber', 'ola', 'bus', 'train', 'metro', 'fuel', 'petrol', 'diesel', 'gas'],
  Shopping: ['shopping', 'clothes', 'shoes', 'amazon', 'flipkart', 'purchase', 'bought'],
  Bills: ['bill', 'electricity', 'water', 'internet', 'phone', 'mobile', 'recharge', 'rent'],
  Entertainment: ['movie', 'cinema', 'netflix', 'spotify', 'game', 'concert', 'show', 'entertainment'],
  Healthcare: ['doctor', 'medicine', 'hospital', 'pharmacy', 'medical', 'health', 'clinic'],
  Education: ['education', 'course', 'book', 'tuition', 'school', 'college', 'training'],
  Other: []
};

// Currency symbols and keywords
const CURRENCY_PATTERNS = {
  INR: ['₹', 'rupees', 'rupee', 'rs', 'inr'],
  USD: ['$', 'dollars', 'dollar', 'usd'],
  EUR: ['€', 'euros', 'euro', 'eur'],
  GBP: ['£', 'pounds', 'pound', 'gbp']
};

/**
 * Parse voice transcript to extract expense details
 * @param {string} transcript - Voice command transcript
 * @returns {Object} Parsed expense data
 */
function parseVoiceCommand(transcript) {
  // Input validation
  if (!transcript || typeof transcript !== 'string') {
    throw new Error('Invalid transcript: must be a non-empty string');
  }

  // Limit transcript length to prevent DoS
  if (transcript.length > 1000) {
    throw new Error('Transcript too long: maximum 1000 characters');
  }

  const lowerTranscript = transcript.toLowerCase().trim();
  const doc = nlp(lowerTranscript);

  // Extract amount
  const amount = extractAmount(lowerTranscript, doc);
  
  // Extract category
  const category = extractCategory(lowerTranscript);
  
  // Extract description
  const description = extractDescription(lowerTranscript, amount, category);

  // Validation
  const result = {
    amount: amount || null,
    category: category || 'Other',
    description: description || transcript,
    confidence: calculateConfidence(amount, category, description),
    needsReview: !amount || !category
  };

  return result;
}

/**
 * Extract amount from transcript
 */
function extractAmount(transcript, doc) {
  // Pattern 1: Direct numbers (50, 100, 1000)
  const numberMatch = transcript.match(/\b(\d+(?:\.\d{1,2})?)\b/);
  if (numberMatch) {
    return parseFloat(numberMatch[1]);
  }

  // Pattern 2: Written numbers (fifty, hundred)
  const values = doc.values().json();
  if (values.length > 0) {
    return parseFloat(values[0].number);
  }

  // Pattern 3: Currency symbols
  const currencyMatch = transcript.match(/[₹$€£]\s*(\d+(?:\.\d{1,2})?)/);
  if (currencyMatch) {
    return parseFloat(currencyMatch[1]);
  }

  return null;
}

/**
 * Extract category from transcript
 */
function extractCategory(transcript) {
  let bestMatch = null;
  let maxMatches = 0;

  for (const [category, keywords] of Object.entries(CATEGORY_KEYWORDS)) {
    if (category === 'Other') continue;

    const matches = keywords.filter(keyword => 
      transcript.includes(keyword)
    ).length;

    if (matches > maxMatches) {
      maxMatches = matches;
      bestMatch = category;
    }
  }

  return bestMatch;
}

/**
 * Extract description from transcript
 */
function extractDescription(transcript, amount, category) {
  let description = transcript;

  // Remove amount mentions
  if (amount) {
    description = description
      .replace(/\b\d+(?:\.\d{1,2})?\b/g, '')
      .replace(/[₹$€£]/g, '')
      .replace(/rupees?|dollars?|euros?|pounds?/gi, '');
  }

  // Remove command words
  description = description
    .replace(/^(add|spent|paid|expense|for)\s+/i, '')
    .replace(/\s+(expense|spent|paid)$/i, '');

  // Clean up
  description = description
    .replace(/\s+/g, ' ')
    .trim();

  // Capitalize first letter
  if (description) {
    description = description.charAt(0).toUpperCase() + description.slice(1);
  }

  return description || `${category} expense`;
}

/**
 * Calculate confidence score (0-1)
 */
function calculateConfidence(amount, category, description) {
  let score = 0;
  
  if (amount && amount > 0) score += 0.5;
  if (category && category !== 'Other') score += 0.3;
  if (description && description.length > 3) score += 0.2;

  return Math.min(score, 1);
}

/**
 * Validate parsed expense data
 */
function validateExpenseData(data) {
  const errors = [];

  if (!data.amount || data.amount <= 0) {
    errors.push('Amount is required and must be greater than 0');
  }

  if (data.amount && data.amount > 10000000) {
    errors.push('Amount seems unusually high');
  }

  if (!data.category) {
    errors.push('Category is required');
  }

  return {
    isValid: errors.length === 0,
    errors
  };
}

module.exports = {
  parseVoiceCommand,
  validateExpenseData,
  CATEGORY_KEYWORDS
};
