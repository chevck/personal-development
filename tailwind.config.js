/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./src/**/*.{js,jsx,ts,tsx}', './public/index.html'],
  theme: {
    extend: {
      fontFamily: {
        sans: ['"Plus Jakarta Sans"', 'system-ui', 'sans-serif'],
        speakly: ['"Plus Jakarta Sans"', 'system-ui', 'sans-serif'],
        display: ['Fraunces', 'Georgia', 'serif'],
        accent: ['Caveat', 'cursive'],
      },
      colors: {
        brand: {
          DEFAULT: 'rgb(var(--brand) / <alpha-value>)',
          hover: 'rgb(var(--brand-hover) / <alpha-value>)',
          ink: 'rgb(var(--brand-ink) / <alpha-value>)',
        },
        speakly: {
          coral: '#D95D39',
          'coral-hover': '#C24E2F',
          'coral-dark': '#9E3D24',
          'coral-light': '#FFF4F0',
          'coral-muted': '#F5D5CB',
          'coral-ring': '#F0C4B8',
          ink: '#1C1C1C',
        },
        persona: {
          taupe: '#30261E',
          'taupe-hover': '#453529',
          sand: '#F5F0EB',
          clay: '#E8DFD6',
          ring: '#D4C4B5',
          gold: '#C8A97E',
          purple: '#5E3AAD',
          'purple-hover': '#4C2E96',
          'purple-dark': '#3D2578',
          lavender: '#E8E0F5',
          'lavender-deep': '#D4C8ED',
          yellow: '#F5C842',
          'yellow-hover': '#E8B82E',
          cream: '#FAF9FC',
          ink: '#1A1625',
          muted: '#6B6578',
        },
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
