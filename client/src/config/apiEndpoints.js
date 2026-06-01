/**
 * Centralized API endpoint constants.
 * All services MUST import from here — no hardcoded URLs elsewhere.
 * Base URL is configured once in api.js via VITE_API_URL env var.
 */

// ── Auth ──────────────────────────────────────────────────────────────────────
export const AUTH = {
  REGISTER:       '/auth/register',
  LOGIN:          '/auth/login',
  ME:             '/auth/me',
  FIREBASE_SYNC:  '/auth/firebase-sync',
  LINK_FIREBASE:  '/auth/link-firebase',
}

// ── Expenses ──────────────────────────────────────────────────────────────────
export const EXPENSES = {
  BASE:           '/expenses',
  FILTER:         '/expenses/filter',
  CATEGORIES:     '/expenses/categories',
  SUMMARY:        '/expenses/summary',
  SEARCH:         '/expenses/search',
  RECENT:         (limit) => `/expenses/recent/${limit}`,
  BY_ID:          (id)    => `/expenses/${id}`,
}

// ── Income ────────────────────────────────────────────────────────────────────
export const INCOME = {
  BASE:           '/income',
  SOURCES:        '/income/sources',
  SUMMARY:        '/income/summary',
  BY_ID:          (id) => `/income/${id}`,
}

// ── Budgets ───────────────────────────────────────────────────────────────────
export const BUDGETS = {
  BASE:           '/budgets',
  BY_CATEGORY:    (category) => `/budgets/${category}`,
}

// ── Goals ─────────────────────────────────────────────────────────────────────
export const GOALS = {
  BASE:           '/goals',
  STATS:          '/goals/stats',
  BY_ID:          (id) => `/goals/${id}`,
}

// ── Analytics ─────────────────────────────────────────────────────────────────
export const ANALYTICS = {
  DASHBOARD:      '/analytics/dashboard',
  HEATMAP:        '/analytics/heatmap',
  PATTERNS:       '/analytics/patterns',
  PREDICTIONS:    '/analytics/predictions',
  SCORE:          '/analytics/score',
}

// ── AI ────────────────────────────────────────────────────────────────────────
export const AI = {
  CHAT:                 '/ai/chat',
  SUGGESTIONS:          '/ai/suggestions',
  CONVERSATIONS:        '/ai/conversations',
  CONVERSATION_NEW:     '/ai/conversations/new',
  CONVERSATION_BY_ID:   (id) => `/ai/conversations/${id}`,
}

// ── Achievements ──────────────────────────────────────────────────────────────
export const ACHIEVEMENTS = {
  BASE: '/achievements',
}

// ── Receipts ──────────────────────────────────────────────────────────────────
export const RECEIPTS = {
  SCAN:        '/receipts/scan',
  SCAN_BASE64: '/receipts/scan-base64',
}

// ── Budget Recommendations ────────────────────────────────────────────────────
export const BUDGET_RECOMMENDATIONS = {
  BASE: '/budget-recommendations',
}

// ── Reports ───────────────────────────────────────────────────────────────────
export const REPORTS = {
  PDF: '/reports/pdf',
}

// ── Voice ─────────────────────────────────────────────────────────────────────
export const VOICE = {
  PARSE:   '/voice/parse',
  EXPENSE: '/voice/expense',
}

// ── Filters ───────────────────────────────────────────────────────────────────
export const FILTERS = {
  BASE:         '/filters',
  SEARCH:       '/filters/search',
  QUICK:        (preset) => `/filters/quick/${preset}`,
  BY_ID:        (id)     => `/filters/${id}`,
}

// ── Users ─────────────────────────────────────────────────────────────────────
export const USERS = {
  PROFILE:         '/users/profile',
  PROFILE_STATS:   '/users/profile/stats',
  PREFERENCES:     '/users/preferences',
  CHANGE_PASSWORD: '/users/change-password',
  SESSIONS:        '/users/sessions',
  SESSION_BY_ID:   (id) => `/users/sessions/${id}`,
}

// ── Export ────────────────────────────────────────────────────────────────────
export const EXPORT = {
  EXPENSES:           '/export/expenses',
  INCOME:             '/export/income',
  ALL:                '/export/all',
  ALL_CSV:            '/export/all-csv',
  COMPREHENSIVE_PDF:  '/export/comprehensive-pdf',
}

// ── Biometric ─────────────────────────────────────────────────────────────────
export const BIOMETRIC = {
  REGISTER:       '/biometric/register',
  AUTHENTICATE:   '/biometric/authenticate',
  CREDENTIALS:    '/biometric/credentials',
  CREDENTIAL_BY_ID: (id) => `/biometric/credentials/${id}`,
}

// ── Health ────────────────────────────────────────────────────────────────────
export const HEALTH = {
  BASE: '/health',
  PING: '/health/ping',
}
