/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx,ts,tsx}'],
  theme: {
    extend: {
      colors: {
        brand: {
          50: '#eef4ff',
          100: '#dbe6ff',
          200: '#bcd2ff',
          300: '#8eb3ff',
          400: '#5b8aff',
          500: '#3a66f6',
          600: '#2849dc',
          700: '#2139b0',
          800: '#1f328c',
          900: '#1d2e6f',
        },
        ink: {
          50: '#f7f8fa',
          100: '#eceef3',
          200: '#d6dbe5',
          300: '#aab1c2',
          400: '#7f8aa0',
          500: '#5a6478',
          600: '#3f4759',
          700: '#2c3242',
          800: '#1c202c',
          900: '#10131b',
        },
      },
      fontFamily: {
        sans: ['Inter', 'ui-sans-serif', 'system-ui', '-apple-system', 'Segoe UI', 'Roboto', 'sans-serif'],
      },
      boxShadow: {
        card: '0 1px 2px rgba(15,23,42,.04), 0 1px 3px rgba(15,23,42,.06)',
        cardLg: '0 10px 30px -12px rgba(15,23,42,.15)',
      },
    },
  },
  plugins: [],
};
