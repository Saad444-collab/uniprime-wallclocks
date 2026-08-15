/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        gold: {
          DEFAULT: '#D4A843',
          light: '#FFEDB3',
          dark: '#B8922E',
          50: '#FFF9E6',
          100: '#FFEDB3',
          200: '#FFE180',
          300: '#FFD54D',
          400: '#FFC91A',
          500: '#D4A843',
          600: '#B8922E',
          700: '#8B6F1A',
          800: '#5E4B0E',
          900: '#312705',
        },
        dark: {
          50: '#C4C4C4',
          100: '#A8A8A8',
          200: '#7A7A7A',
          300: '#4A4A4A',
          400: '#2A2A2A',
          500: '#1A1A1A',
          600: '#141414',
          700: '#0E0E0E',
          800: '#080808',
          900: '#000000',
        },
      },
      fontFamily: {
        serif: ['Playfair Display', 'Georgia', 'serif'],
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
      animation: {
        'spin-slow': 'spin 60s linear infinite',
        'spin-medium': 'spin 30s linear infinite',
        'spin-fast': 'spin 1s linear infinite',
        'pulse-gold': 'pulseGold 2s ease-in-out infinite',
      },
      keyframes: {
        pulseGold: {
          '0%, 100%': { boxShadow: '0 0 20px rgba(212, 168, 67, 0.4)' },
          '50%': { boxShadow: '0 0 40px rgba(212, 168, 67, 0.8)' },
        },
      },
    },
  },
  plugins: [],
};
