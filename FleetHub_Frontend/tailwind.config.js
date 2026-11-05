/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        dark: {
          900: '#0b0f17',
          800: '#12151a',
          700: '#161d27',
          600: '#1e242d',
          500: '#283344',
        }
      }
    },
  },
  plugins: [],
}