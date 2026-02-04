/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      screens: {
        'xs': '475px',
        // sm: 640px (default)
        // md: 768px (default)
        // lg: 1024px (default)
        // xl: 1280px (default)
        '2xl': '1536px',
      },
      colors: {
        primary: {
          DEFAULT: '#4361ee',
          dark: '#3a0ca3',
          light: '#4cc9f0',
        },
        'primary-dark': '#3a0ca3',
        success: '#10b981',
        danger: '#ef4444',
        warning: '#f59e0b',
        dark: '#1e293b',
        light: '#f8fafc',
      },
      boxShadow: {
        'card': '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
        'card-lg': '0 10px 15px -3px rgba(0, 0, 0, 0.1)',
      },
      animation: {
        'spin-slow': 'spin 3s linear infinite',
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
      },
      spacing: {
        'safe-top': 'env(safe-area-inset-top)',
        'safe-bottom': 'env(safe-area-inset-bottom)',
        'safe-left': 'env(safe-area-inset-left)',
        'safe-right': 'env(safe-area-inset-right)',
      }
    },
  },
  plugins: [],
}
