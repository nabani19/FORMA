/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        brand: {
          green: '#4CAF50',
          'green-dark': '#388E3C',
          'green-light': '#81C784',
          blue: '#2196F3',
          'blue-dark': '#1976D2',
          orange: '#FF9800',
          'orange-dark': '#F57C00',
          dark: '#424242',
          medium: '#757575',
          light: '#F5F7FA',
        }
      },
      fontFamily: {
        heading: ['Montserrat', 'sans-serif'],
        body: ['Open Sans', 'sans-serif'],
      },
      animation: {
        'scan-laser': 'scanLaser 2s linear infinite',
        'pulse-subtle': 'pulseSubtle 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'shimmer': 'shimmer 2s infinite',
      },
      keyframes: {
        scanLaser: {
          '0%, 100%': { top: '0%' },
          '50%': { top: '95%' },
        },
        pulseSubtle: {
          '0%, 100%': { opacity: '1' },
          '50%': { opacity: '0.85' },
        },
        shimmer: {
          '100%': { transform: 'translateX(100%)' },
        }
      }
    },
  },
  plugins: [],
}
