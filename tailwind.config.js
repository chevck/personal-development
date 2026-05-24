/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./src/**/*.{js,jsx,ts,tsx}', './public/index.html'],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Delius', 'cursive'],
        speakly: ['Delius', 'cursive'],
      },
      colors: {
        taskly: {
          yellow: '#F5D76E',
          'yellow-hover': '#EDCB5A',
          ink: '#1C1C1C',
          muted: '#8A8A8A',
          surface: '#F7F7F7',
          border: '#EEEEEE',
          peach: '#FFF0E6',
          'peach-text': '#E07A3A',
        },
      },
      boxShadow: {
        card: '0 4px 24px rgba(0, 0, 0, 0.06)',
        soft: '0 2px 12px rgba(0, 0, 0, 0.04)',
      },
    },
  },
  plugins: [],
};
