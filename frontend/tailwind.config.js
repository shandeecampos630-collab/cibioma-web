/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        beni: {
          green: '#1a4d2e',
          brown: '#5c3d2e',
          gold: '#d4a843',
        }
      }
    },
  },
  plugins: [],
}