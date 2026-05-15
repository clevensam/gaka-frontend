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
        ig: {
          pink: '#F56040',
          orange: '#FFDC80',
          purple: '#C13584',
          blue: '#4F5BD5',
        },
      },
      fontFamily: {
        lexend: ['Lexend', 'sans-serif'],
      },
      animation: {
        'story-pulse': 'storyPulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'like-bounce': 'likeBounce 0.3s ease-in-out',
      },
      keyframes: {
        storyPulse: {
          '0%, 100%': { opacity: '1' },
          '50%': { opacity: '0.7' },
        },
        likeBounce: {
          '0%': { transform: 'scale(1)' },
          '50%': { transform: 'scale(1.3)' },
          '100%': { transform: 'scale(1)' },
        },
      },
      maxWidth: {
        'ig-feed': '470px',
        'ig-container': '935px',
      },
    },
  },
  plugins: [],
}