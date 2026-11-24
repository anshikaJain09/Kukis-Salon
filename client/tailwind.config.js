/** @type {import('tailwindcss').Config} */
export default {
  content: [
    './index.html',
    './src/**/*.{js,ts,jsx,tsx}',
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['"Plus Jakarta Sans"', 'system-ui', '-apple-system', 'sans-serif'],
        serif: ['"Instrument Serif"', 'Georgia', 'serif'],
        gujarati: ['"Noto Sans Gujarati"', '"Plus Jakarta Sans"', 'sans-serif'],
      },
      colors: {
        pastel: {
          softPink: '#FDF2F8',
          pink: '#F472B6',
          lavender: '#FAF5FF',
          purple: '#C084FC',
          amethyst: '#241442',
          porcelain: '#FAF8FC',
          mint: '#D1FAE5',
          peach: '#FFEDD5',
        },
        amethyst: {
          50: '#F7F5FA',
          100: '#EFEBF5',
          200: '#DED6EA',
          300: '#C5B7D9',
          400: '#9E88BD',
          500: '#755BA0',
          600: '#5A4282',
          700: '#463266',
          800: '#34234E',
          900: '#241442',
          950: '#150A27',
        },
        brand: {
          pink: '#F472B6',
          purple: '#C084FC',
          amethyst: '#241442',
          mint: '#D1FAE5',
          peach: '#FFEDD5',
          softPink: '#FDF2F8',
          lavender: '#FAF5FF',
          porcelain: '#FAF8FC',
        },
        status: {
          waiting: '#F59E0B',
          called: '#C084FC',
          service: '#10B981',
          completed: '#64748B',
          alert: '#F43F5E',
        },
      },
      boxShadow: {
        'pastel-sm': '0 2px 8px -2px rgba(36, 20, 66, 0.05), 0 1px 4px -1px rgba(192, 132, 252, 0.08)',
        'pastel-md': '0 8px 24px -4px rgba(36, 20, 66, 0.06), 0 4px 12px -2px rgba(192, 132, 252, 0.1)',
        'pastel-lg': '0 16px 40px -8px rgba(36, 20, 66, 0.08), 0 6px 20px -4px rgba(244, 114, 182, 0.14)',
        'pastel-glow': '0 0 25px -3px rgba(244, 114, 182, 0.28)',
        'purple-glow': '0 0 25px -3px rgba(192, 132, 252, 0.28)',
        'mint-glow': '0 0 20px -2px rgba(16, 185, 129, 0.25)',
      },
      keyframes: {
        shimmer: {
          '0%': { backgroundPosition: '-200% 0' },
          '100%': { backgroundPosition: '200% 0' },
        },
        pulseSubtle: {
          '0%, 100%': { opacity: 1 },
          '50%': { opacity: 0.65 },
        },
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-6px)' },
        },
      },
      animation: {
        shimmer: 'shimmer 2.5s infinite linear',
        'pulse-subtle': 'pulseSubtle 2.5s ease-in-out infinite',
        float: 'float 4s ease-in-out infinite',
      },
    },
  },
  plugins: [],
};
