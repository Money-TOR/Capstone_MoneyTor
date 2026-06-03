/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,jsx,ts,tsx}"
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          50: '#effcf0',
          100: '#d6f7dc',
          200: '#abebbb',
          300: '#79d391',
          400: '#4ab66a',
          500: '#2f9451',
          600: '#23723f',
          700: '#1d5d34',
          800: '#184a2c',
          900: '#143b24'
        }
      }
    }
  },
  plugins: [],
}

