/** @type {import('tailwindcss').Config} */
export default {
  content: [
    './index.html',
    './src/**/*.{js,ts,jsx,tsx}',
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        nutriscan: {
          primary: '#4CAF50',
          'primary-hover': '#43A047',
          'primary-pressed': '#388E3C',
          secondary: '#2196F3',
          'secondary-hover': '#1E88E5',
          accent: '#FF9800',
          'accent-hover': '#F57C00',
          destructive: '#E53935',
          'destructive-hover': '#C62828',
          'text-primary': '#424242',
          'text-secondary': '#757575',
          'text-disabled': '#9E9E9E',
          'surface-base': '#FFFFFF',
          'surface-muted': '#F5F5F5',
          'surface-strong': '#E0E0E0',
          'surface-dark': '#424242',
          'border-default': '#E0E0E0',
          'border-focus': '#4CAF50',
          'border-error': '#E53935',
        },
        fitpro: {
          base: '#000000',
          dark: '#0a0a0c',
          card: '#121216',
          muted: '#1e1e24',
          border: '#272730',
          textPrimary: '#191919',
          textSecondary: '#ffffff',
          textTertiary: '#0057ff',
          textMuted: '#94a3b8',
          accentBlue: '#2196F3',
          accentGreen: '#4CAF50',
          accentAmber: '#FF9800',
          accentRed: '#E53935',
        }
      },
      fontFamily: {
        heading: ['Montserrat', 'Helvetica Neue', 'Helvetica', 'Arial', 'sans-serif'],
        body: ['Open Sans', 'Helvetica Neue', 'Helvetica', 'Arial', 'sans-serif'],
        sans: ['Open Sans', 'Montserrat', 'sans-serif'],
        display: ['Montserrat', 'sans-serif'],
      },
      fontSize: {
        'xs': ['11px', '15.4px'],
        'sm': ['12px', '16.8px'],
        'md': ['14px', '22.4px'],
        'lg': ['16px', '24px'],
        'xl': ['18px', '27px'],
        '2xl': ['22px', '30.8px'],
        '3xl': ['28px', '36.4px'],
        '4xl': ['36px', '43.2px'],
      },
      boxShadow: {
        '1': '0px 1px 3px rgba(0, 0, 0, 0.08)',
        '2': '0px 2px 8px rgba(0, 0, 0, 0.12)',
        '3': '0px 4px 16px rgba(0, 0, 0, 0.16)',
        'nutriscan': '0px 2px 8px rgba(76, 175, 80, 0.15)',
        'glow-green': '0 0 20px rgba(76, 175, 80, 0.35)',
        'glow-blue': '0 0 20px rgba(33, 150, 243, 0.35)',
      },
      borderRadius: {
        'xs': '4px',
        'sm': '8px',
        'md': '12px',
        'lg': '50px',
        'xl': '100px',
      },
      animation: {
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'scan': 'scanLine 2.5s ease-in-out infinite',
      },
      keyframes: {
        scanLine: {
          '0%, 100%': { top: '0%' },
          '50%': { top: '95%' },
        }
      }
    },
  },
  plugins: [],
};
