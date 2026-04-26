/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class',
content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
    "./App.tsx",
  ],
  theme: {
    extend: {
      fontFamily: {
        lexend: ['Lexend', 'sans-serif'],
      },
    },
  },
  plugins: [],
}