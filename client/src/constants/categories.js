// Shared category and source constants
export const EXPENSE_CATEGORIES = [
  { value: 'Food', label: '🍔 Food', emoji: '🍔' },
  { value: 'Travel', label: '✈️ Travel', emoji: '✈️' },
  { value: 'Transport', label: '🚗 Transport', emoji: '🚗' },
  { value: 'Shopping', label: '🛍️ Shopping', emoji: '🛍️' },
  { value: 'Bills', label: '📄 Bills', emoji: '📄' },
  { value: 'Entertainment', label: '🎬 Entertainment', emoji: '🎬' },
  { value: 'Healthcare', label: '🏥 Healthcare', emoji: '🏥' },
  { value: 'Education', label: '📚 Education', emoji: '📚' },
  { value: 'Other', label: '📦 Other', emoji: '📦' }
]

export const INCOME_SOURCES = [
  { value: 'Salary', label: '💼 Salary', emoji: '💼' },
  { value: 'Freelance', label: '💻 Freelance', emoji: '💻' },
  { value: 'Investment', label: '📈 Investment', emoji: '📈' },
  { value: 'Business', label: '🏢 Business', emoji: '🏢' },
  { value: 'Gift', label: '🎁 Gift', emoji: '🎁' },
  { value: 'Bonus', label: '🎉 Bonus', emoji: '🎉' },
  { value: 'Rental', label: '🏠 Rental', emoji: '🏠' },
  { value: 'Other', label: '📦 Other', emoji: '📦' }
]

export const CHART_COLORS = [
  '#4361ee', '#7209b7', '#f72585', '#4cc9f0', 
  '#f8961e', '#38b000', '#ff006e', '#8338ec'
]

export const CATEGORY_BADGE_CLASSES = {
  Food: 'badge-food',
  Travel: 'badge-travel',
  Transport: 'badge-travel',
  Shopping: 'badge-shopping',
  Bills: 'badge-bills',
  Entertainment: 'badge-entertainment',
  Healthcare: 'badge-healthcare',
  Education: 'badge-education',
  Other: 'badge-other'
}

export const CATEGORY_COLORS = {
  Food: { bg: 'bg-orange-100 dark:bg-orange-900/30', text: 'text-orange-600 dark:text-orange-400' },
  Travel: { bg: 'bg-blue-100 dark:bg-blue-900/30', text: 'text-blue-600 dark:text-blue-400' },
  Transport: { bg: 'bg-cyan-100 dark:bg-cyan-900/30', text: 'text-cyan-600 dark:text-cyan-400' },
  Shopping: { bg: 'bg-pink-100 dark:bg-pink-900/30', text: 'text-pink-600 dark:text-pink-400' },
  Bills: { bg: 'bg-purple-100 dark:bg-purple-900/30', text: 'text-purple-600 dark:text-purple-400' },
  Entertainment: { bg: 'bg-indigo-100 dark:bg-indigo-900/30', text: 'text-indigo-600 dark:text-indigo-400' },
  Healthcare: { bg: 'bg-red-100 dark:bg-red-900/30', text: 'text-red-600 dark:text-red-400' },
  Education: { bg: 'bg-green-100 dark:bg-green-900/30', text: 'text-green-600 dark:text-green-400' },
  Other: { bg: 'bg-gray-100 dark:bg-slate-700', text: 'text-gray-600 dark:text-slate-400' }
}
