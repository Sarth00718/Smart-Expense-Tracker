/**
 * ╔══════════════════════════════════════════════════════════════════╗
 * ║        ADVANCED NLP ENGINE — Smart Expense Tracker              ║
 * ║  Handles: description search, fuzzy match, intent detection,    ║
 * ║  synonym expansion, time parsing, financial query routing       ║
 * ╚══════════════════════════════════════════════════════════════════╝
 */

// ─── Month + Day Name Tables ──────────────────────────────────────────────────
const MONTH_NAMES = {
  january: 0, jan: 0,
  february: 1, feb: 1,
  march: 2, mar: 2,
  april: 3, apr: 3,
  may: 4,
  june: 5, jun: 5,
  july: 6, jul: 6,
  august: 7, aug: 7,
  september: 8, sep: 8, sept: 8,
  october: 9, oct: 9,
  november: 10, nov: 10,
  december: 11, dec: 11,
};

const MONTH_LABELS = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December'
];

// ─── Synonym / Vocabulary Maps ────────────────────────────────────────────────
const FOOD_SYNONYMS = {
  burger: ['burger', 'burgers', 'cheeseburger', 'whopper', 'mcburger', 'veggie burger', 'beef burger'],
  pizza: ['pizza', 'pizzas', 'margherita', 'pepperoni', 'dominos', 'pizza hut'],
  coffee: ['coffee', 'café', 'cafe', 'cappuccino', 'latte', 'espresso', 'mocha', 'frappe', 'starbucks', 'chai', 'tea', 'cold coffee'],
  lunch: ['lunch', 'lunchbox', 'midday meal'],
  dinner: ['dinner', 'supper', 'evening meal'],
  breakfast: ['breakfast', 'brunch', 'morning meal'],
  snack: ['snack', 'snacks', 'chips', 'biscuit', 'biscuits', 'cookie', 'cookies', 'nachos', 'popcorn'],
  grocery: ['grocery', 'groceries', 'supermarket', 'vegetables', 'veggies', 'fruits', 'milk', 'bread', 'eggs', 'kirana'],
  restaurant: ['restaurant', 'eatery', 'diner', 'bistro', 'dhaba', 'canteen', 'cafeteria', 'eatout', 'eat out'],
  sweets: ['sweets', 'dessert', 'icecream', 'ice cream', 'cake', 'pastry', 'mithai', 'halwa', 'gulab jamun', 'ladoo'],
  noodles: ['noodles', 'pasta', 'spaghetti', 'maggi', 'ramen', 'chowmein', 'hakka'],
  rice: ['rice', 'biryani', 'pulao', 'fried rice', 'khichdi'],
  juice: ['juice', 'nimbu pani', 'lemonade', 'lassi', 'smoothie', 'shake', 'milkshake'],
  fastfood: ['fastfood', 'fast food', 'junk food', 'kfc', 'mcdonalds', 'subway', 'dominos', 'zomato', 'swiggy'],
  samosa: ['samosa', 'samosas', 'pakora', 'pakoras', 'bhajiya', 'vada pav'],
  idli: ['idli', 'dosa', 'vada', 'sambhar', 'upma', 'poha', 'aloo paratha', 'paratha'],
};

const CATEGORY_KEYWORDS = {
  Food: [
    'food', 'restaurant', 'grocery', 'groceries', 'eat', 'eating', 'dining', 'lunch', 'dinner', 'breakfast',
    'meal', 'snack', 'burger', 'pizza', 'coffee', 'cafe', 'chai', 'tea', 'sweets', 'dessert', 'ice cream',
    'noodles', 'pasta', 'biryani', 'zomato', 'swiggy', 'dominos', 'mcdonalds', 'kfc', 'subway', 'drinks',
    'juice', 'water bottle', 'tiffin', 'canteen', 'dhaba', 'grocery store', 'supermarket', 'vegetables',
    'milk', 'bread', 'eggs', 'fruits', 'samosa', 'idli', 'dosa', 'paratha', 'sandwich', 'maggi', 'ramen',
  ],
  Travel: [
    'travel', 'flight', 'flights', 'hotel', 'hotels', 'trip', 'vacation', 'holiday', 'airbnb', 'booking',
    'makemytrip', 'goibibo', 'yatra', 'tourism', 'tour', 'oyo', 'hostel', 'resort', 'beach', 'hills',
    'railway', 'train ticket', 'bus ticket', 'irctc',
  ],
  Transport: [
    'transport', 'transportation', 'taxi', 'uber', 'ola', 'bus', 'train', 'metro', 'petrol', 'fuel', 'gas',
    'auto', 'rickshaw', 'cab', 'rapido', 'bike', 'toll', 'parking', 'vehicle', 'commute', 'rapido',
    'government bus', 'ferry', 'airport shuttle',
  ],
  Shopping: [
    'shop', 'shopping', 'mall', 'store', 'clothes', 'clothing', 'fashion', 'purchase', 'amazon', 'flipkart',
    'myntra', 'meesho', 'snapdeal', 'shirt', 'dress', 'shoes', 'accessories', 'cosmetics', 'jewellery',
    'handbag', 'watch', 'gift shop', 'book store', 'stationery',
  ],
  Bills: [
    'bill', 'bills', 'electricity', 'water', 'internet', 'utility', 'utilities', 'rent', 'phone', 'mobile',
    'broadband', 'wifi', 'gas bill', 'recharge', 'subscription', 'netflix', 'spotify', 'prime', 'isp',
    'maintenance', 'society charges', 'dth', 'cable', 'broadband bill',
  ],
  Entertainment: [
    'movie', 'movies', 'cinema', 'game', 'games', 'entertainment', 'concert', 'show', 'netflix', 'spotify',
    'prime', 'hotstar', 'ott', 'theatre', 'amusement', 'gaming', 'bowling', 'arcade', 'pub', 'bar', 'club',
    'event', 'ticket', 'pvr', 'inox',
  ],
  Healthcare: [
    'health', 'healthcare', 'medical', 'doctor', 'hospital', 'medicine', 'pharmacy', 'clinic', 'dentist',
    'gym', 'fitness', 'yoga', 'tablet', 'drugs', 'prescription', 'checkup', 'vaccine', 'blood test', 'scan',
    'physiotherapy', 'optician', 'glasses', 'contact lens',
  ],
  Education: [
    'education', 'school', 'college', 'university', 'course', 'courses', 'book', 'books', 'tuition',
    'class', 'classes', 'exam', 'coaching', 'udemy', 'coursera', 'fees', 'workshop', 'seminar', 'training',
    'study material', 'library', 'notes', 'pen drive', 'stationery', 'laptop for study',
  ],
  Other: [
    'miscellaneous', 'misc', 'other', 'donation', 'charity', 'temple', 'mosque', 'church', 'festival',
    'pooja', 'celebration', 'tips', 'repair', 'maintenance', 'hardware', 'furniture', 'paint',
  ],
};

// ─── Levenshtein Distance (for Fuzzy Matching) ───────────────────────────────
function levenshtein(a, b) {
  if (!a.length) return b.length;
  if (!b.length) return a.length;
  const matrix = Array.from({ length: b.length + 1 }, (_, i) =>
    Array.from({ length: a.length + 1 }, (_, j) => (i === 0 ? j : j === 0 ? i : 0))
  );
  for (let i = 1; i <= b.length; i++) {
    for (let j = 1; j <= a.length; j++) {
      matrix[i][j] = b[i - 1] === a[j - 1]
        ? matrix[i - 1][j - 1]
        : 1 + Math.min(matrix[i - 1][j - 1], matrix[i][j - 1], matrix[i - 1][j]);
    }
  }
  return matrix[b.length][a.length];
}

function fuzzyMatch(needle, haystack) {
  const n = needle.toLowerCase();
  const h = haystack.toLowerCase();
  if (h.includes(n) || n.includes(h)) return true;
  // Allow edits proportional to length: 1 for short, 2 for medium, 3 for long
  const maxEdits = n.length <= 4 ? 1 : n.length <= 7 ? 2 : 3;
  return levenshtein(n, h) <= maxEdits;
}

// ─── Synonym Expansion ────────────────────────────────────────────────────────
function expandWithSynonyms(keyword) {
  const kw = keyword.toLowerCase();
  for (const variants of Object.values(FOOD_SYNONYMS)) {
    if (variants.some(v => v === kw || v.includes(kw) || kw.includes(v))) {
      return [...new Set(variants)];
    }
  }
  return [kw];
}

// ─── Single Expense Matcher ───────────────────────────────────────────────────
function expenseMatchesKeyword(expense, keyword) {
  const kw = keyword.toLowerCase();
  const desc = (expense.description || '').toLowerCase();
  const cat = (expense.category || '').toLowerCase();
  const tags = (expense.tags || []).join(' ').toLowerCase();
  const searchable = `${desc} ${cat} ${tags}`;

  if (searchable.includes(kw)) return true;

  const variants = expandWithSynonyms(kw);
  if (variants.some(v => searchable.includes(v))) return true;

  // Fuzzy word-level match on description tokens
  if (kw.length >= 4) {
    const words = desc.split(/\s+/);
    if (words.some(w => w.length >= 3 && fuzzyMatch(kw, w))) return true;
  }

  return false;
}

// ─── Stop Words ──────────────────────────────────────────────────────────────
const STOP_WORDS = new Set([
  'show', 'find', 'list', 'get', 'fetch', 'display', 'search', 'tell', 'give', 'what', 'which',
  'expense', 'expenses', 'spending', 'spent', 'total', 'amount', 'count', 'number', 'times',
  'all', 'my', 'the', 'a', 'an', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for', 'of', 'with',
  'by', 'from', 'up', 'about', 'into', 'through', 'during', 'how', 'many', 'much', 'did', 'was',
  'were', 'is', 'are', 'have', 'had', 'has', 'do', 'does', 'last', 'this', 'year', 'month', 'week',
  'day', 'today', 'yesterday', 'matching', 'related', 'regarding', 'named', 'called', 'labeled',
  'description', 'food', 'travel', 'transport', 'shopping', 'bills', 'entertainment', 'healthcare',
  'education', 'restaurant', 'grocery', 'flight', 'hotel', 'taxi', 'uber', 'mall', 'movie', 'cinema',
  'doctor', 'hospital', 'paid', 'buy', 'bought', 'purchase', 'i', 'me', 'we', 'us', 'like', 'named',
  'each', 'per', 'between', 'versus', 'vs', 'compared', 'compare', 'against', 'than', 'then',
  'since', 'after', 'before', 'during', 'within', 'outside', 'above', 'below', 'under', 'over',
]);

// ─── Keyword Extractor ────────────────────────────────────────────────────────
function extractDescriptionKeywords(query) {
  const lq = query.toLowerCase().trim();
  let cleaned = lq
    .replace(/\b(last|this|next|current)\s+(month|week|year|quarter)\b/g, '')
    .replace(/\bjanuaryf|february|march|april|may|june|july|august|september|october|november|december|jan|feb|mar|apr|jun|jul|aug|sep|sept|oct|nov|dec\b/g, '')
    .replace(/\b20\d{2}\b/g, '')
    .replace(/\b(today|yesterday|now)\b/g, '')
    .replace(/[₹$,]/g, '')
    .replace(/[^\w\s]/g, ' ');

  return [...new Set(
    cleaned.split(/\s+/)
      .map(w => w.trim())
      .filter(w => w.length >= 3 && !STOP_WORDS.has(w) && !/^\d+$/.test(w))
  )];
}

// ─── Intent Detector ─────────────────────────────────────────────────────────
function detectQueryIntent(query) {
  const lq = query.toLowerCase();
  if (/\bhow\s+many\b|\bcount\b|\bnumber\s+of\b|\btimes\b|\bfrequency\b/.test(lq)) return 'count';
  if (/\bhow\s+much\b|\btotal\b|\bsum\b|\bspent\b|\bamount\b|\bvalue\b/.test(lq)) return 'total';
  if (/\baverage\b|\bavg\b|\bmean\b|\bper\s+trip\b|\bper\s+visit\b/.test(lq)) return 'average';
  if (/\blist\b|\bshow\b|\bfind\b|\bdisplay\b|\bwhat\b|\bbreak.?down\b/.test(lq)) return 'list';
  if (/\bcategor\b/.test(lq)) return 'category';
  if (/\bcompare\b|\bversus\b|\bvs\b|\bdifference\b/.test(lq)) return 'compare';
  if (/\btrend\b|\bover\s+time\b|\bmonth\s+by\s+month\b/.test(lq)) return 'trend';
  if (/\bhighest\b|\bmost\s+expensive\b|\bbiggest\b|\blargest\b/.test(lq)) return 'max';
  if (/\blowest\b|\bcheapest\b|\bsmallest\b|\bminimum\b/.test(lq)) return 'min';
  if (/\blast\b/.test(lq) && /\bexpense\|\bspend\b|\bpurchase\b/.test(lq)) return 'last';
  return 'general';
}

// ─── Time Filter Applier ──────────────────────────────────────────────────────
function applyTimeFilter(expenses, query) {
  const lq = query.toLowerCase();
  const now = new Date();
  const cy = now.getFullYear();
  const cm = now.getMonth();

  // Specific year
  const yearMatch = lq.match(/\b(20\d{2})\b/);
  if (yearMatch) {
    const year = parseInt(yearMatch[1]);
    let label = `year ${year}`;
    let filtered;

    const foundMonth = Object.entries(MONTH_NAMES).find(([name]) => lq.includes(name));
    if (foundMonth) {
      const [mName, mIdx] = foundMonth;
      const start = new Date(year, mIdx, 1);
      const end = new Date(year, mIdx + 1, 0, 23, 59, 59);
      filtered = expenses.filter(e => { const d = new Date(e.date); return d >= start && d <= end; });
      label = `${MONTH_LABELS[mIdx]} ${year}`;
    } else {
      filtered = expenses.filter(e => new Date(e.date).getFullYear() === year);
    }
    return { filtered, label };
  }

  if (lq.includes('last year')) {
    const y = cy - 1;
    return {
      filtered: expenses.filter(e => new Date(e.date).getFullYear() === y),
      label: `year ${y}`,
    };
  }
  if (lq.includes('this year')) {
    const start = new Date(cy, 0, 1);
    return { filtered: expenses.filter(e => new Date(e.date) >= start), label: 'this year' };
  }
  if (lq.includes('last month')) {
    const lm = cm === 0 ? 11 : cm - 1;
    const ly = cm === 0 ? cy - 1 : cy;
    const start = new Date(ly, lm, 1);
    const end = new Date(ly, lm + 1, 0, 23, 59, 59);
    return {
      filtered: expenses.filter(e => { const d = new Date(e.date); return d >= start && d <= end; }),
      label: `last month (${MONTH_LABELS[lm]} ${ly})`,
    };
  }
  if (lq.includes('this month') || lq.includes('current month')) {
    const start = new Date(cy, cm, 1);
    return {
      filtered: expenses.filter(e => new Date(e.date) >= start),
      label: `this month (${MONTH_LABELS[cm]} ${cy})`,
    };
  }
  if (lq.includes('last week') || lq.includes('past week')) {
    const start = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    return { filtered: expenses.filter(e => new Date(e.date) >= start), label: 'last 7 days' };
  }
  if (lq.includes('this week')) {
    const start = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    return { filtered: expenses.filter(e => new Date(e.date) >= start), label: 'this week' };
  }
  if (lq.includes('today')) {
    const start = new Date(cy, cm, now.getDate());
    return { filtered: expenses.filter(e => new Date(e.date) >= start), label: 'today' };
  }
  if (lq.includes('yesterday')) {
    const y0 = new Date(now.getTime() - 86400000);
    const start = new Date(y0.getFullYear(), y0.getMonth(), y0.getDate());
    const end = new Date(start.getTime() + 86400000 - 1);
    return {
      filtered: expenses.filter(e => { const d = new Date(e.date); return d >= start && d <= end; }),
      label: 'yesterday',
    };
  }
  // Named month only (no year → use current year)
  for (const [name, idx] of Object.entries(MONTH_NAMES)) {
    // Don't match month names that are also stop words we'd filter
    if (lq.includes(name) && !STOP_WORDS.has(name)) {
      const start = new Date(cy, idx, 1);
      const end = new Date(cy, idx + 1, 0, 23, 59, 59);
      return {
        filtered: expenses.filter(e => { const d = new Date(e.date); return d >= start && d <= end; }),
        label: `${MONTH_LABELS[idx]} ${cy}`,
      };
    }
  }

  return { filtered: expenses, label: 'all time' };
}

// ─── Build Rich Response ─────────────────────────────────────────────────────
function buildDescriptionResponse(keyword, matched, totalFiltered, intent, timePeriodLabel) {
  const count = matched.length;
  const total = matched.reduce((s, e) => s + e.amount, 0);
  const avg = count > 0 ? total / count : 0;

  // Category breakdown
  const catMap = {};
  matched.forEach(e => { catMap[e.category] = (catMap[e.category] || 0) + e.amount; });
  const catEntries = Object.entries(catMap).sort((a, b) => b[1] - a[1]);

  // Most expensive & cheapest
  const sortedByAmt = [...matched].sort((a, b) => b.amount - a.amount);
  const maxExp = sortedByAmt[0];
  const minExp = sortedByAmt[sortedByAmt.length - 1];

  const period = timePeriodLabel.charAt(0).toUpperCase() + timePeriodLabel.slice(1);
  let r = '';

  if (intent === 'count') {
    r = `🔢 **"${keyword}" Count — ${period}**\n\n`;
    r += `You have **${count} transaction${count !== 1 ? 's' : ''}** matching "${keyword}" in ${timePeriodLabel}.\n`;
    r += `• Total Spent: ₹${total.toFixed(2)}\n`;
    r += `• Average per visit: ₹${avg.toFixed(2)}\n`;
  } else if (intent === 'average') {
    r = `📐 **"${keyword}" Average — ${period}**\n\n`;
    r += `Average spend on "${keyword}": **₹${avg.toFixed(2)}**\n`;
    r += `• Total: ₹${total.toFixed(2)}\n`;
    r += `• Transactions: ${count}\n`;
  } else if (intent === 'max') {
    r = `📈 **Highest "${keyword}" Expense — ${period}**\n\n`;
    if (maxExp) {
      r += `Most expensive: **₹${maxExp.amount.toFixed(2)}**\n`;
      r += `Date: ${new Date(maxExp.date).toLocaleDateString('en-IN')}\n`;
      if (maxExp.description) r += `Description: ${maxExp.description}\n`;
    }
    r += `\nOut of ${count} transactions totaling ₹${total.toFixed(2)}\n`;
  } else if (intent === 'min') {
    r = `📉 **Lowest "${keyword}" Expense — ${period}**\n\n`;
    if (minExp) {
      r += `Cheapest: **₹${minExp.amount.toFixed(2)}**\n`;
      r += `Date: ${new Date(minExp.date).toLocaleDateString('en-IN')}\n`;
      if (minExp.description) r += `Description: ${minExp.description}\n`;
    }
    r += `\nOut of ${count} transactions totaling ₹${total.toFixed(2)}\n`;
  } else {
    r = `📊 **"${keyword}" Expense Summary — ${period}**\n\n`;
    r += `• Total Spent: **₹${total.toFixed(2)}**\n`;
    r += `• Count: ${count} transaction${count !== 1 ? 's' : ''}\n`;
    r += `• Average: ₹${avg.toFixed(2)} per transaction\n`;
    if (maxExp && count > 1) r += `• Highest: ₹${maxExp.amount.toFixed(2)} (${new Date(maxExp.date).toLocaleDateString('en-IN')})\n`;
  }

  // Category breakdown if multiple
  if (catEntries.length > 1) {
    r += `\n📂 **By Category:**\n`;
    catEntries.forEach(([cat, amt]) => {
      const pct = ((amt / total) * 100).toFixed(0);
      r += `• ${cat}: ₹${amt.toFixed(2)} (${pct}%)\n`;
    });
  }

  // Matching transactions (max 8)
  const showMax = 8;
  const sorted = [...matched].sort((a, b) => new Date(b.date) - new Date(a.date));
  r += `\n📝 **Transactions${matched.length > showMax ? ` (latest ${showMax} of ${count})` : ''}:**\n`;
  sorted.slice(0, showMax).forEach(exp => {
    const d = new Date(exp.date);
    const dateStr = `${MONTH_LABELS[d.getMonth()].slice(0, 3)} ${d.getDate()}, ${d.getFullYear()}`;
    r += `• ${dateStr} · ${exp.category} · ₹${exp.amount.toFixed(2)}`;
    if (exp.description) r += ` — ${exp.description}`;
    r += '\n';
  });

  return r;
}

// ─── Core Description Search ──────────────────────────────────────────────────
function searchExpensesByDescription(query, expenses) {
  const keywords = extractDescriptionKeywords(query);
  const intent = detectQueryIntent(query);

  if (keywords.length === 0) return null;

  const { filtered: timeFiltered, label: timePeriodLabel } = applyTimeFilter(expenses, query);

  const matched = timeFiltered.filter(exp =>
    keywords.some(kw => expenseMatchesKeyword(exp, kw))
  );

  if (matched.length === 0) {
    return {
      found: false,
      keywords,
      timePeriodLabel,
      intent,
      message: `🔍 No expenses found matching **"${keywords.join('", "')}"** in ${timePeriodLabel}.\n\nTry checking:\n• Different spelling or synonym\n• Wider time range (e.g., "all time")\n• Category name (e.g., "Food", "Shopping")`,
    };
  }

  const primaryKeyword = keywords[0];
  const response = buildDescriptionResponse(primaryKeyword, matched, timeFiltered.length, intent, timePeriodLabel);

  return { found: true, keywords, timePeriodLabel, intent, count: matched.length, total: matched.reduce((s, e) => s + e.amount, 0), avg: matched.reduce((s, e) => s + e.amount, 0) / matched.length, matched, response };
}

// ─── Advanced parseNaturalLanguageQuery ──────────────────────────────────────
function parseNaturalLanguageQuery(query) {
  if (!query || typeof query !== 'string') throw new Error('Invalid query: must be a non-empty string');
  if (query.length > 500) throw new Error('Query too long: maximum 500 characters');

  const lowerQuery = query.toLowerCase().trim();
  const filters = {
    category: null, minAmount: null, maxAmount: null,
    timePeriod: null, startDate: null, endDate: null,
    descriptionKeywords: [], year: null, month: null,
  };

  try {
    const yearMatch = lowerQuery.match(/\b(20\d{2})\b/);
    if (yearMatch) {
      const year = parseInt(yearMatch[1]);
      filters.year = year;
      let monthFound = false;
      for (const [monthName, monthIndex] of Object.entries(MONTH_NAMES)) {
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
      const cy = now.getFullYear(), cm = now.getMonth();

      if (lowerQuery.includes('last year')) {
        const y = cy - 1;
        Object.assign(filters, { year: y, startDate: new Date(y, 0, 1), endDate: new Date(y, 11, 31, 23, 59, 59), timePeriod: 'last year' });
      } else if (lowerQuery.includes('this year')) {
        Object.assign(filters, { year: cy, startDate: new Date(cy, 0, 1), endDate: new Date(), timePeriod: 'this year' });
      } else if (lowerQuery.includes('last month')) {
        const lm = cm === 0 ? 11 : cm - 1, ly = cm === 0 ? cy - 1 : cy;
        Object.assign(filters, { startDate: new Date(ly, lm, 1), endDate: new Date(ly, lm + 1, 0, 23, 59, 59), timePeriod: 'last month' });
      } else if (lowerQuery.includes('this month') || lowerQuery.includes('current month')) {
        Object.assign(filters, { startDate: new Date(cy, cm, 1), endDate: new Date(), timePeriod: 'this month' });
      } else if (lowerQuery.includes('last week') || lowerQuery.includes('this week') || lowerQuery.includes('week')) {
        Object.assign(filters, { startDate: new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000), endDate: new Date(), timePeriod: 'this week' });
      } else if (lowerQuery.includes('today')) {
        const t = new Date(cy, cm, now.getDate());
        Object.assign(filters, { startDate: t, endDate: new Date(), timePeriod: 'today' });
      } else if (lowerQuery.includes('yesterday')) {
        const y0 = new Date(now.getTime() - 86400000);
        const s = new Date(y0.getFullYear(), y0.getMonth(), y0.getDate());
        Object.assign(filters, { startDate: s, endDate: new Date(s.getTime() + 86400000 - 1), timePeriod: 'yesterday' });
      }
    }

    // Category detection
    for (const [category, keywords] of Object.entries(CATEGORY_KEYWORDS)) {
      if (keywords.some(kw => lowerQuery.includes(kw))) { filters.category = category; break; }
    }

    // Amount patterns
    const amountPatterns = [
      { pattern: /over\s*[₹$]?\s*([\d,]+)/i, type: 'min' },
      { pattern: /more\s+than\s*[₹$]?\s*([\d,]+)/i, type: 'min' },
      { pattern: /above\s*[₹$]?\s*([\d,]+)/i, type: 'min' },
      { pattern: /greater\s+than\s*[₹$]?\s*([\d,]+)/i, type: 'min' },
      { pattern: /under\s*[₹$]?\s*([\d,]+)/i, type: 'max' },
      { pattern: /less\s+than\s*[₹$]?\s*([\d,]+)/i, type: 'max' },
      { pattern: /below\s*[₹$]?\s*([\d,]+)/i, type: 'max' },
      { pattern: /between\s*[₹$]?\s*([\d,]+)\s*and\s*[₹$]?\s*([\d,]+)/i, type: 'range' },
    ];
    for (const { pattern, type } of amountPatterns) {
      const m = lowerQuery.match(pattern);
      if (m) {
        if (type === 'min') filters.minAmount = parseFloat(m[1].replace(/,/g, ''));
        else if (type === 'max') filters.maxAmount = parseFloat(m[1].replace(/,/g, ''));
        else { filters.minAmount = parseFloat(m[1].replace(/,/g, '')); filters.maxAmount = parseFloat(m[2].replace(/,/g, '')); }
        break;
      }
    }

    filters.descriptionKeywords = extractDescriptionKeywords(query);
  } catch (_) { /* swallow */ }

  return filters;
}

// ─── Savings Rate Analyzer ───────────────────────────────────────────────────
function analyzeSavingsRate(expenses, incomes, query) {
  const lq = query.toLowerCase();
  const { filtered: filtExpenses, label } = applyTimeFilter(expenses, query);

  // Income filter by same period
  const { filtered: filtIncome } = applyTimeFilter(incomes, query);

  const totalExp = filtExpenses.reduce((s, e) => s + e.amount, 0);
  const totalInc = filtIncome.reduce((s, i) => s + i.amount, 0);
  const savings = totalInc - totalExp;
  const rate = totalInc > 0 ? (savings / totalInc) * 100 : 0;

  let r = `💰 **Savings Analysis — ${label.charAt(0).toUpperCase() + label.slice(1)}**\n\n`;
  r += `• Total Income: ₹${totalInc.toFixed(2)}\n`;
  r += `• Total Expenses: ₹${totalExp.toFixed(2)}\n`;
  r += `• Net Savings: ₹${savings.toFixed(2)}\n`;

  if (totalInc > 0) {
    r += `• Savings Rate: **${rate.toFixed(1)}%**\n\n`;
    if (rate >= 20) r += `✅ Excellent! You're saving ${rate.toFixed(1)}% of income (target: 20%+)`;
    else if (rate >= 10) r += `🟡 Good savings rate. Try to push to 20% for long-term wealth.`;
    else if (rate > 0) r += `⚠️ Low savings rate. Review expenses to find areas to cut back.`;
    else r += `❌ You're spending more than you earn. Immediate action needed!`;
  } else {
    r += `\n📝 No income recorded for ${label}. Add your income to track savings rate.`;
  }
  return r;
}

// ─── Month Comparison Analyzer ───────────────────────────────────────────────
function analyzeMonthComparison(expenses, incomes, query) {
  const now = new Date();
  const cy = now.getFullYear();
  const cm = now.getMonth();

  // This month
  const tmStart = new Date(cy, cm, 1);
  const tmExp = expenses.filter(e => new Date(e.date) >= tmStart).reduce((s, e) => s + e.amount, 0);
  const tmInc = incomes.filter(i => new Date(i.date) >= tmStart).reduce((s, i) => s + i.amount, 0);

  // Last month
  const lm = cm === 0 ? 11 : cm - 1, ly = cm === 0 ? cy - 1 : cy;
  const lmStart = new Date(ly, lm, 1), lmEnd = new Date(ly, lm + 1, 0, 23, 59, 59);
  const lmExp = expenses.filter(e => { const d = new Date(e.date); return d >= lmStart && d <= lmEnd; }).reduce((s, e) => s + e.amount, 0);
  const lmInc = incomes.filter(i => { const d = new Date(i.date); return d >= lmStart && d <= lmEnd; }).reduce((s, i) => s + i.amount, 0);

  const expDiff = tmExp - lmExp;
  const expPct = lmExp > 0 ? (expDiff / lmExp) * 100 : 0;

  let r = `📊 **Month-over-Month Comparison**\n\n`;
  r += `**${MONTH_LABELS[lm]} ${ly} (Last Month):**\n`;
  r += `• Income: ₹${lmInc.toFixed(2)}\n`;
  r += `• Expenses: ₹${lmExp.toFixed(2)}\n`;
  r += `• Savings: ₹${(lmInc - lmExp).toFixed(2)}\n\n`;
  r += `**${MONTH_LABELS[cm]} ${cy} (This Month):**\n`;
  r += `• Income: ₹${tmInc.toFixed(2)}\n`;
  r += `• Expenses: ₹${tmExp.toFixed(2)}\n`;
  r += `• Savings: ₹${(tmInc - tmExp).toFixed(2)}\n\n`;
  r += `**Change:**\n`;
  r += `• Expenses ${expDiff >= 0 ? '▲' : '▼'} ₹${Math.abs(expDiff).toFixed(2)} (${Math.abs(expPct).toFixed(1)}%)\n`;
  if (expDiff > 0) r += `\n⚠️ Spending increased this month. Review your expenses.`;
  else if (expDiff < 0) r += `\n✅ Great! You're spending less than last month.`;
  else r += `\n➡️ Spending is consistent with last month.`;

  return r;
}

// ─── Advanced parseFinanceQuery ───────────────────────────────────────────────
function parseFinanceQuery(query, expenses, incomes, budgets) {
  const lq = query.toLowerCase().trim();
  const result = { canAnswerDirectly: false, directAnswer: null, fallbackAnswer: null, relevantData: null };

  const arrExpenses = Array.isArray(expenses) ? expenses : [];
  const arrIncomes = Array.isArray(incomes) ? incomes : [];
  const arrBudgets = Array.isArray(budgets) ? budgets : [];

  if (arrExpenses.length === 0 && arrIncomes.length === 0) {
    result.canAnswerDirectly = true;
    result.directAnswer = "📊 You haven't added any financial data yet. Start tracking your income and expenses to get personalized insights!";
    return result;
  }

  const now = new Date();
  const cy = now.getFullYear(), cm = now.getMonth();
  const startOfMonth = new Date(cy, cm, 1);
  const lm = cm === 0 ? 11 : cm - 1, ly = cm === 0 ? cy - 1 : cy;
  const startOfLastMonth = new Date(ly, lm, 1);
  const endOfLastMonth = new Date(ly, lm + 1, 0, 23, 59, 59);
  const startOfWeek = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
  const startOfToday = new Date(cy, cm, now.getDate());

  // ── Q1: Description-based specific item search ─────────────────────────────
  const descSearch = searchExpensesByDescription(query, arrExpenses);
  if (descSearch && descSearch.found) {
    // Only use if the keyword is a specific item, not a generic category word
    const genericCatWords = new Set(['food', 'travel', 'transport', 'shopping', 'bills', 'entertainment', 'healthcare', 'education', 'restaurant', 'grocery', 'income', 'expense']);
    const hasSpecificItem = descSearch.keywords.some(kw => kw.length >= 3 && !genericCatWords.has(kw.toLowerCase()));
    if (hasSpecificItem) {
      result.canAnswerDirectly = true;
      result.directAnswer = descSearch.response;
      return result;
    }
  }

  // ── Q2: Net balance ────────────────────────────────────────────────────────
  if (/\bnet\s*balance\b|\bnet\s*worth\b|\bbalance\b|\bnet\b/.test(lq)) {
    const tInc = arrIncomes.reduce((s, i) => s + i.amount, 0);
    const tExp = arrExpenses.reduce((s, e) => s + e.amount, 0);
    const net = tInc - tExp;
    result.canAnswerDirectly = true;
    result.directAnswer = `💰 **Your Overall Net Balance**\n\n• Total Income: ₹${tInc.toFixed(2)}\n• Total Expenses: ₹${tExp.toFixed(2)}\n• **Net Balance: ₹${net.toFixed(2)}**\n\n${net >= 0 ? '✅ You are in the positive!' : '⚠️ You are spending more than you earn.'}`;
    return result;
  }

  // ── Q3: Savings rate ───────────────────────────────────────────────────────
  if (/\bsavings?\s*rate\b|\bhow\s+much.*save\b|\bsaving\b/.test(lq)) {
    result.canAnswerDirectly = true;
    result.directAnswer = analyzeSavingsRate(arrExpenses, arrIncomes, query);
    return result;
  }

  // ── Q4: Month comparison ───────────────────────────────────────────────────
  if (/\bcompare\b|\bversus\b|\bvs\b|\bmonth.over.month\b|\blast\s+month\s+vs\b|\bthis\s+month\s+vs\b/.test(lq)) {
    result.canAnswerDirectly = true;
    result.directAnswer = analyzeMonthComparison(arrExpenses, arrIncomes, query);
    return result;
  }

  // ── Q5: Category spending ──────────────────────────────────────────────────
  const catMatch = lq.match(/how\s+much.*?(?:spend|spent|spending).*?(?:on|in)\s+(\w+)/i) ||
    lq.match(/(\w+)\s+(?:spending|expenses?)\s*(?:this|last|in)?/i) ||
    lq.match(/(?:spending|expenses?)\s+(?:on|in|for)\s+(\w+)/i) ||
    lq.match(/(?:how\s+much|total)\s+(?:for|on)\s+(\w+)/i);

  if (catMatch) {
    const cq = catMatch[1].toLowerCase();
    const catMap = {
      food: 'Food', travel: 'Travel', shopping: 'Shopping', bills: 'Bills',
      entertainment: 'Entertainment', healthcare: 'Healthcare', education: 'Education',
      transport: 'Transport', transportation: 'Transport', health: 'Healthcare',
      grocery: 'Food', groceries: 'Food', restaurant: 'Food', dining: 'Food',
      fuel: 'Transport', petrol: 'Transport', medical: 'Healthcare',
    };
    const cat = catMap[cq];
    if (cat) {
      let filtered = arrExpenses.filter(e => e.category === cat);
      let td = 'all time';

      if (lq.includes('today')) { filtered = filtered.filter(e => new Date(e.date) >= startOfToday); td = 'today'; }
      else if (lq.includes('last month')) { filtered = filtered.filter(e => { const d = new Date(e.date); return d >= startOfLastMonth && d <= endOfLastMonth; }); td = `last month (${MONTH_LABELS[lm]} ${ly})`; }
      else if (/this month|current month/.test(lq)) { filtered = filtered.filter(e => new Date(e.date) >= startOfMonth); td = `this month (${MONTH_LABELS[cm]} ${cy})`; }
      else if (/this week|last week/.test(lq)) { filtered = filtered.filter(e => new Date(e.date) >= startOfWeek); td = 'this week'; }

      const total = filtered.reduce((s, e) => s + e.amount, 0);
      const count = filtered.length;

      result.canAnswerDirectly = true;
      if (count === 0) {
        result.directAnswer = `📊 No **${cat}** expenses found for ${td}.`;
      } else {
        const avg = total / count;
        result.directAnswer = `💰 **${cat} Spending — ${td.charAt(0).toUpperCase() + td.slice(1)}**\n\n`;
        result.directAnswer += `• Total: ₹${total.toFixed(2)}\n• Transactions: ${count}\n• Average: ₹${avg.toFixed(2)}\n`;

        const budget = arrBudgets.find(b => b.category === cat);
        if (budget && /this month|current month/.test(lq)) {
          const remaining = budget.monthlyBudget - total;
          const pct = ((total / budget.monthlyBudget) * 100).toFixed(1);
          result.directAnswer += `\n📋 Budget Status:\n• Budget: ₹${budget.monthlyBudget}\n• Used: ${pct}%\n• Remaining: ₹${remaining.toFixed(2)}\n`;
          if (total > budget.monthlyBudget) result.directAnswer += `\n⚠️ OVER BUDGET by ₹${(total - budget.monthlyBudget).toFixed(2)}!`;
          else if (total > budget.monthlyBudget * 0.8) result.directAnswer += `\n⚠️ ${pct}% of budget used — approaching limit.`;
        }

        if (count <= 5) {
          result.directAnswer += `\n📝 Transactions:\n`;
          filtered.slice(0, 5).forEach(e => {
            result.directAnswer += `• ${new Date(e.date).toLocaleDateString('en-IN')}: ₹${e.amount.toFixed(2)} — ${e.description || 'No description'}\n`;
          });
        }
      }
      return result;
    }
  }

  // ── Q6: Most spent category ────────────────────────────────────────────────
  if (/\bmost\b|\blargest\b|\btop\b|\bhighest\b/.test(lq) && /\bcategor\b|\bspend\b|\bspent\b/.test(lq)) {
    const { filtered, label } = applyTimeFilter(arrExpenses, query);
    const catTotals = {};
    filtered.forEach(e => { catTotals[e.category] = (catTotals[e.category] || 0) + e.amount; });
    const sorted = Object.entries(catTotals).sort((a, b) => b[1] - a[1]).slice(0, 5);
    result.canAnswerDirectly = true;
    result.directAnswer = `📊 **Top Spending Categories — ${label}**\n\n` +
      (sorted.length ? sorted.map(([c, a], i) => `${i + 1}. **${c}**: ₹${a.toFixed(2)}`).join('\n') : 'No data available');
    return result;
  }

  // ── Q7: Recent expenses ────────────────────────────────────────────────────
  if (/\brecent\b|\blatest\b|\blast\s+\d+\b/.test(lq)) {
    const nMatch = lq.match(/last\s+(\d+)/);
    const n = nMatch ? parseInt(nMatch[1]) : 5;
    const recent = arrExpenses.slice(0, Math.min(n, 20));
    result.canAnswerDirectly = true;
    result.directAnswer = `📝 **Your ${recent.length} Most Recent Expenses:**\n\n` +
      recent.map(e => `• ${new Date(e.date).toLocaleDateString('en-IN')}: ${e.category} — ₹${e.amount.toFixed(2)}\n  ${e.description || 'No description'}`).join('\n\n');
    return result;
  }

  // ── Q8: Monthly summary / total ────────────────────────────────────────────
  if (/\bthis\s*month\b|\bcurrent\s*month\b/.test(lq) && /\btotal\b|\bsummary\b|\boverview\b|\bspent\b/.test(lq)) {
    const mExp = arrExpenses.filter(e => new Date(e.date) >= startOfMonth);
    const mInc = arrIncomes.filter(i => new Date(i.date) >= startOfMonth);
    const te = mExp.reduce((s, e) => s + e.amount, 0);
    const ti = mInc.reduce((s, i) => s + i.amount, 0);
    result.canAnswerDirectly = true;
    result.directAnswer = `💰 **${MONTH_LABELS[cm]} ${cy} Summary**\n\n• Income: ₹${ti.toFixed(2)}\n• Expenses: ₹${te.toFixed(2)}\n• Net Balance: ₹${(ti - te).toFixed(2)}\n• Transactions: ${mExp.length} expenses, ${mInc.length} income`;
    return result;
  }

  // ── Q9: Average expense ────────────────────────────────────────────────────
  if (/\baverage\b|\bavg\b|\bper\s+(?:day|week|month)\b/.test(lq)) {
    const { filtered, label } = applyTimeFilter(arrExpenses, query);
    const total = filtered.reduce((s, e) => s + e.amount, 0);
    const count = filtered.length;
    if (count > 0) {
      result.canAnswerDirectly = true;
      result.directAnswer = `📐 **Average Expense — ${label}**\n\n• Transactions: ${count}\n• Total: ₹${total.toFixed(2)}\n• **Average per transaction: ₹${(total / count).toFixed(2)}**\n`;
      const days = label.includes('month') ? 30 : label.includes('week') ? 7 : (filtered.length || 1);
      result.directAnswer += `• Average per day: ₹${(total / 30).toFixed(2)} (approx.)`;
    } else {
      result.canAnswerDirectly = true;
      result.directAnswer = `📊 No expenses found for ${label}.`;
    }
    return result;
  }

  // ── Q10: Highest single expense ───────────────────────────────────────────
  if (/\bhighest\b|\bmost\s+expensive\b|\bbiggest\s+expense\b|\blargest\s+expense\b/.test(lq)) {
    const { filtered, label } = applyTimeFilter(arrExpenses, query);
    if (filtered.length > 0) {
      const top = [...filtered].sort((a, b) => b.amount - a.amount)[0];
      result.canAnswerDirectly = true;
      result.directAnswer = `📈 **Highest Expense — ${label}**\n\n• Amount: **₹${top.amount.toFixed(2)}**\n• Category: ${top.category}\n• Date: ${new Date(top.date).toLocaleDateString('en-IN')}\n• Description: ${top.description || 'No description'}`;
    } else {
      result.canAnswerDirectly = true;
      result.directAnswer = `📊 No expenses found for ${label}.`;
    }
    return result;
  }

  // ── Q11: Description "not found" message ──────────────────────────────────
  if (descSearch && !descSearch.found && descSearch.keywords.length > 0) {
    result.canAnswerDirectly = true;
    result.directAnswer = descSearch.message;
    return result;
  }

  result.relevantData = `Query Type: General financial question\nUser has ${arrExpenses.length} expenses and ${arrIncomes.length} income records.`;
  return result;
}

// ─── Affordability Analyzer ───────────────────────────────────────────────────
function analyzeAffordability(amount, expenses, incomes, budgets) {
  const now = new Date();
  const cy = now.getFullYear(), cm = now.getMonth();
  const startOfMonth = new Date(cy, cm, 1);
  const daysInMonth = new Date(cy, cm + 1, 0).getDate();
  const daysRemaining = daysInMonth - now.getDate();

  const arrExp = Array.isArray(expenses) ? expenses : [];
  const arrInc = Array.isArray(incomes) ? incomes : [];
  const arrBud = Array.isArray(budgets) ? budgets : [];

  const mExp = arrExp.filter(e => new Date(e.date) >= startOfMonth).reduce((s, e) => s + e.amount, 0);
  const mInc = arrInc.filter(i => new Date(i.date) >= startOfMonth).reduce((s, i) => s + i.amount, 0);
  const balance = mInc - mExp;
  const daysPassed = Math.max(1, now.getDate());
  const avgDaily = mExp / daysPassed;
  const totalBudget = arrBud.reduce((s, b) => s + b.monthlyBudget, 0);
  const afterPurchase = balance - amount;
  const dailyLeft = daysRemaining > 0 ? afterPurchase / daysRemaining : 0;

  let r = `🔍 **Affordability Analysis for ₹${amount.toFixed(2)}**\n\n`;
  r += `📊 **${MONTH_LABELS[cm]} ${cy} Status:**\n`;
  r += `• Income: ₹${mInc.toFixed(2)}\n• Expenses: ₹${mExp.toFixed(2)}\n• Balance: ₹${balance.toFixed(2)}\n• Days Remaining: ${daysRemaining}\n\n`;

  if (afterPurchase > 0) {
    r += `✅ **YES, you can afford it!**\n\n`;
    r += `💡 After Purchase:\n• Remaining Balance: ₹${afterPurchase.toFixed(2)}\n`;
    if (daysRemaining > 0) r += `• Daily Budget: ₹${dailyLeft.toFixed(2)} for ${daysRemaining} days\n`;
    if (dailyLeft < avgDaily) r += `\n⚠️ You'll need to reduce daily spending from ₹${avgDaily.toFixed(2)} → ₹${dailyLeft.toFixed(2)}`;
    if (afterPurchase < 1000) r += `\n⚠️ Very low remaining balance after purchase. Ensure you have emergency funds.`;
  } else {
    r += `❌ **NOT RECOMMENDED**\n\n`;
    r += `⚠️ This exceeds your balance by ₹${Math.abs(afterPurchase).toFixed(2)}.\n\n`;
    if (mInc > 0) { const pct = (amount / mInc) * 100; r += `📊 This is ${pct.toFixed(1)}% of your monthly income.\n\n`; }
    r += `💡 Options:\n• Wait for next month\n• Reduce other expenses first\n• Save up over 2-3 months\n`;
    if (mInc === 0) r += `\n📝 No income recorded this month. Add income for accurate analysis.`;
  }

  if (totalBudget > 0) r += `\n\n📋 Budget Remaining: ₹${(totalBudget - mExp).toFixed(2)} of ₹${totalBudget.toFixed(2)}`;
  return r;
}

export {
  parseNaturalLanguageQuery,
  parseFinanceQuery,
  analyzeAffordability,
  searchExpensesByDescription,
  extractDescriptionKeywords,
  detectQueryIntent,
  expenseMatchesKeyword,
  analyzeSavingsRate,
  analyzeMonthComparison,
  applyTimeFilter,
};
