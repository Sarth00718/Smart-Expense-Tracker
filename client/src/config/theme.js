// Centralized Theme Configuration
// This file defines the design system used across the entire application

export const colors = {
  // Primary color palette (Blue-Purple gradient)
  primary: {
    50: '#eff3ff',
    100: '#dbe4ff',
    200: '#bac8ff',
    300: '#91a7ff',
    400: '#748ffc',
    500: '#4361ee',
    600: '#3a0ca3',
    700: '#3c096c',
    800: '#240046',
    900: '#10002b',
  },
  
  // Secondary colors
  secondary: {
    purple: '#7209b7',
    pink: '#f72585',
    cyan: '#4cc9f0',
    orange: '#f8961e',
  },
  
  // Status colors
  success: '#10b981',
  warning: '#f59e0b',
  danger: '#ef4444',
  info: '#3b82f6',
  
  // Neutral colors
  gray: {
    50: '#f8fafc',
    100: '#f1f5f9',
    200: '#e2e8f0',
    300: '#cbd5e1',
    400: '#94a3b8',
    500: '#64748b',
    600: '#475569',
    700: '#334155',
    800: '#1e293b',
    900: '#0f172a',
  },
}

// Category colors for expenses
export const categoryColors = {
  Food: {
    bg: 'bg-orange-100',
    text: 'text-orange-700',
    border: 'border-orange-200',
    gradient: 'from-orange-500 to-orange-600',
  },
  Travel: {
    bg: 'bg-blue-100',
    text: 'text-blue-700',
    border: 'border-blue-200',
    gradient: 'from-blue-500 to-blue-600',
  },
  Transport: {
    bg: 'bg-cyan-100',
    text: 'text-cyan-700',
    border: 'border-cyan-200',
    gradient: 'from-cyan-500 to-cyan-600',
  },
  Shopping: {
    bg: 'bg-pink-100',
    text: 'text-pink-700',
    border: 'border-pink-200',
    gradient: 'from-pink-500 to-pink-600',
  },
  Bills: {
    bg: 'bg-purple-100',
    text: 'text-purple-700',
    border: 'border-purple-200',
    gradient: 'from-purple-500 to-purple-600',
  },
  Entertainment: {
    bg: 'bg-indigo-100',
    text: 'text-indigo-700',
    border: 'border-indigo-200',
    gradient: 'from-indigo-500 to-indigo-600',
  },
  Healthcare: {
    bg: 'bg-red-100',
    text: 'text-red-700',
    border: 'border-red-200',
    gradient: 'from-red-500 to-red-600',
  },
  Education: {
    bg: 'bg-green-100',
    text: 'text-green-700',
    border: 'border-green-200',
    gradient: 'from-green-500 to-green-600',
  },
  Other: {
    bg: 'bg-gray-100',
    text: 'text-gray-700',
    border: 'border-gray-200',
    gradient: 'from-gray-500 to-gray-600',
  },
}

// Button variants
export const buttonVariants = {
  primary: 'bg-gradient-to-r from-primary-500 to-primary-600 text-white hover:from-primary-600 hover:to-primary-700 shadow-md hover:shadow-lg',
  secondary: 'bg-white text-primary-600 border-2 border-primary-500 hover:bg-primary-500 hover:text-white',
  success: 'bg-gradient-to-r from-green-500 to-emerald-600 text-white hover:from-green-600 hover:to-emerald-700 shadow-md hover:shadow-lg',
  danger: 'bg-gradient-to-r from-red-500 to-red-600 text-white hover:from-red-600 hover:to-red-700 shadow-md hover:shadow-lg',
  warning: 'bg-gradient-to-r from-orange-500 to-orange-600 text-white hover:from-orange-600 hover:to-orange-700 shadow-md hover:shadow-lg',
  ghost: 'bg-transparent text-gray-700 hover:bg-gray-100',
  outline: 'bg-transparent border-2 border-gray-300 text-gray-700 hover:border-gray-400 hover:bg-gray-50',
}

// Card styles
export const cardStyles = {
  default: 'bg-white rounded-xl shadow-card',
  hover: 'bg-white rounded-xl shadow-card hover:shadow-card-lg transition-shadow',
  gradient: 'bg-gradient-to-br from-white to-gray-50 rounded-xl shadow-card',
}

// Spacing scale
export const spacing = {
  xs: '0.25rem',   // 4px
  sm: '0.5rem',    // 8px
  md: '1rem',      // 16px
  lg: '1.5rem',    // 24px
  xl: '2rem',      // 32px
  '2xl': '3rem',   // 48px
  '3xl': '4rem',   // 64px
}

// Border radius
export const borderRadius = {
  sm: '0.375rem',  // 6px
  md: '0.5rem',    // 8px
  lg: '0.75rem',   // 12px
  xl: '1rem',      // 16px
  '2xl': '1.5rem', // 24px
  full: '9999px',
}

// Typography
export const typography = {
  fontFamily: {
    sans: '-apple-system, BlinkMacSystemFont, "Segoe UI", "Roboto", "Oxygen", "Ubuntu", "Cantarell", "Fira Sans", "Droid Sans", "Helvetica Neue", sans-serif',
  },
  fontSize: {
    xs: '0.75rem',     // 12px
    sm: '0.875rem',    // 14px
    base: '1rem',      // 16px
    lg: '1.125rem',    // 18px
    xl: '1.25rem',     // 20px
    '2xl': '1.5rem',   // 24px
    '3xl': '1.875rem', // 30px
    '4xl': '2.25rem',  // 36px
  },
  fontWeight: {
    normal: '400',
    medium: '500',
    semibold: '600',
    bold: '700',
  },
}

// Shadows
export const shadows = {
  sm: '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
  md: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
  lg: '0 10px 15px -3px rgba(0, 0, 0, 0.1)',
  xl: '0 20px 25px -5px rgba(0, 0, 0, 0.1)',
  card: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
  'card-lg': '0 10px 15px -3px rgba(0, 0, 0, 0.1)',
}

// Animation durations
export const animations = {
  fast: '150ms',
  normal: '300ms',
  slow: '500ms',
}

// Breakpoints
export const breakpoints = {
  xs: '475px',
  sm: '640px',
  md: '768px',
  lg: '1024px',
  xl: '1280px',
  '2xl': '1536px',
}

// Z-index scale
export const zIndex = {
  dropdown: 1000,
  sticky: 1020,
  fixed: 1030,
  modalBackdrop: 1040,
  modal: 1050,
  popover: 1060,
  tooltip: 1070,
}

export default {
  colors,
  categoryColors,
  buttonVariants,
  cardStyles,
  spacing,
  borderRadius,
  typography,
  shadows,
  animations,
  breakpoints,
  zIndex,
}
