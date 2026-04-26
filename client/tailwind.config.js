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
        // Dark-first ink palette: 900 = page bg, 800 = card bg, 100 = text.
        ink: {
          50: '#f7f8fa',
          100: '#e6e9f2',
          200: '#cfd4e3',
          300: '#9aa3bd',
          400: '#6c7593',
          500: '#4a5573',
          600: '#2d3654',
          700: '#1d2640',
          800: '#131a2c',
          900: '#0b1020',
        },
      },
      fontFamily: {
        sans: ['Inter', 'ui-sans-serif', 'system-ui', '-apple-system', 'Segoe UI', 'Roboto', 'sans-serif'],
      },
      boxShadow: {
        card: '0 1px 2px rgba(0,0,0,.35), 0 1px 3px rgba(0,0,0,.25)',
        cardLg: '0 18px 40px -12px rgba(0,0,0,.55)',
      },
    },
  },
  plugins: [],
};
