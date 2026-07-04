/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class',
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'Helvetica Neue', 'Arial', 'sans-serif'],
      },
      fontSize: {
        'xs': ['0.75rem', { lineHeight: '1.5', letterSpacing: '-0.006em' }],
        'sm': ['0.875rem', { lineHeight: '1.5', letterSpacing: '-0.008em' }],
        'base': ['1rem', { lineHeight: '1.6', letterSpacing: '-0.011em' }],
        'lg': ['1.125rem', { lineHeight: '1.6', letterSpacing: '-0.014em' }],
        'xl': ['1.25rem', { lineHeight: '1.5', letterSpacing: '-0.017em' }],
        '2xl': ['1.5rem', { lineHeight: '1.4', letterSpacing: '-0.019em' }],
        '3xl': ['1.875rem', { lineHeight: '1.3', letterSpacing: '-0.021em' }],
        '4xl': ['2.25rem', { lineHeight: '1.2', letterSpacing: '-0.022em' }],
        '5xl': ['3rem', { lineHeight: '1.1', letterSpacing: '-0.024em' }],
        '6xl': ['3.75rem', { lineHeight: '1', letterSpacing: '-0.025em' }],
      },
      screens: { 'xs': '475px', '2xl': '1536px' },
      colors: {
        border: 'hsl(var(--border))',
        input: 'hsl(var(--input))',
        ring: 'hsl(var(--ring))',
        background: 'hsl(var(--background))',
        foreground: 'hsl(var(--foreground))',
        primary: {
          DEFAULT: 'hsl(var(--primary))',
          foreground: 'hsl(var(--primary-foreground))',
          50: '#eff3ff', 100: '#dbe4ff', 200: '#bac8ff',
          300: '#91a7ff', 400: '#748ffc', 500: '#4361ee',
          600: '#3a0ca3', 700: '#3c096c', 800: '#240046', 900: '#10002b',
        },
        secondary: {
          DEFAULT: 'hsl(var(--secondary))',
          foreground: 'hsl(var(--secondary-foreground))',
        },
        destructive: {
          DEFAULT: 'hsl(var(--destructive))',
          foreground: 'hsl(var(--destructive-foreground))',
        },
        muted: {
          DEFAULT: 'hsl(var(--muted))',
          foreground: 'hsl(var(--muted-foreground))',
        },
        accent: {
          DEFAULT: 'hsl(var(--accent))',
          foreground: 'hsl(var(--accent-foreground))',
          pink: '#f72585', cyan: '#4cc9f0', orange: '#f8961e',
        },
        card: {
          DEFAULT: 'hsl(var(--card))',
          foreground: 'hsl(var(--card-foreground))',
        },
        popover: {
          DEFAULT: 'hsl(var(--popover))',
          foreground: 'hsl(var(--popover-foreground))',
        },
        success: '#10b981',
        danger: '#ef4444',
        warning: '#f59e0b',
        dark: '#0f172a',
        light: '#f8fafc',
      },
      borderRadius: {
        lg: 'var(--radius)',
        md: 'calc(var(--radius) - 2px)',
        sm: 'calc(var(--radius) - 4px)',
      },
      boxShadow: {
        'card': '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
        'card-lg': '0 10px 15px -3px rgba(0, 0, 0, 0.1)',
      },
      animation: {
        'spin-slow': 'spin 3s linear infinite',
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'bounce-slow': 'bounce 2s infinite',
        'wiggle': 'wiggle 1s ease-in-out infinite',
        'slide-up': 'slideUp 0.3s ease-out',
        'slide-down': 'slideDown 0.3s ease-out',
        'fade-in': 'fadeIn 0.3s ease-out',
        'scale-in': 'scaleIn 0.3s ease-out',
        'shimmer': 'shimmer 2s linear infinite',
        'glow': 'glow 2s ease-in-out infinite',
      },
      keyframes: {
        wiggle: { '0%, 100%': { transform: 'rotate(-3deg)' }, '50%': { transform: 'rotate(3deg)' } },
        slideUp: { '0%': { transform: 'translateY(10px)', opacity: '0' }, '100%': { transform: 'translateY(0)', opacity: '1' } },
        slideDown: { '0%': { transform: 'translateY(-10px)', opacity: '0' }, '100%': { transform: 'translateY(0)', opacity: '1' } },
        fadeIn: { '0%': { opacity: '0' }, '100%': { opacity: '1' } },
        scaleIn: { '0%': { transform: 'scale(0.9)', opacity: '0' }, '100%': { transform: 'scale(1)', opacity: '1' } },
        shimmer: { '0%': { backgroundPosition: '-1000px 0' }, '100%': { backgroundPosition: '1000px 0' } },
        glow: { '0%, 100%': { boxShadow: '0 0 5px rgba(99,102,241,0.5)' }, '50%': { boxShadow: '0 0 20px rgba(99,102,241,0.8)' } },
      },
    },
  },
  plugins: [],
}
