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
          primary: '#059669',
          secondary: '#0d9488',
        },
      },
      fontFamily: {
        lexend: ['Lexend', 'sans-serif'],
      },
    },
  },
  plugins: [],
}