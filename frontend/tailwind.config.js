/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: ['class', '[data-theme="dark"]'],
  theme: {
    extend: {
      colors: {
        canvas: '#0C0D22',
        app: '#15132A',
        sidebar: '#0C0D22',
        card: {
          DEFAULT: '#191731',
          raised: '#211F3D',
          hover: '#292546',
          active: '#35245D',
        },
        border: {
          DEFAULT: '#373351',
          strong: '#4B4269',
        },
        primary: {
          DEFAULT: '#6C3AED',
          hover: '#814EFF',
          soft: '#35245D',
        },
        secondary: '#2FAAF7',
        cyan: '#36D9E9',
        gold: {
          DEFAULT: '#FFC36C',
          dark: '#92590D',
        },
        orange: '#F6A14D',
        pink: '#F16AA3',
        success: '#38D7A7',
        warning: '#FFC36C',
        danger: '#F47791',
        info: '#43B4FF',
        lavender: {
          50: '#F5F4FF',
          100: '#E8E6FC',
          200: '#D2CEF8',
          300: '#B8B7D0',
          400: '#918CA9',
        },
        demuna: {
          50: '#f0f7ff',
          100: '#e0effe',
          500: '#0284c7',
          600: '#0369a1',
          700: '#075985',
          800: '#0c4a6e',
          900: '#082f49'
        }
      },
      fontFamily: {
        sans: ['Inter', 'Manrope', 'system-ui', '-apple-system', 'sans-serif'],
      },
      boxShadow: {
        'card-glow': '0 0 50px -10px rgba(108, 58, 237, 0.35), 0 20px 40px -15px rgba(2, 3, 14, 0.7)',
        'btn-glow': '0 10px 25px -5px rgba(108, 58, 237, 0.5)',
        'shield-glow': '0 0 25px rgba(108, 58, 237, 0.6), 0 0 10px rgba(47, 170, 247, 0.4)',
      }
    },
  },
  plugins: [],
}
