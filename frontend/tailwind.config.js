/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          50: '#f5f7ff',
          100: '#ebf0fe',
          200: '#ced9fd',
          300: '#b1c2fb',
          400: '#7795f9',
          500: '#3d68f7',
          600: '#375ede',
          700: '#2e4eb9',
          800: '#253e94',
          900: '#1e3379',
        }
      }
    },
  },
  plugins: [],
}
