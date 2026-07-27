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
          coral: 'rgb(var(--speakly-coral) / <alpha-value>)',
          'coral-hover': 'rgb(var(--speakly-coral-hover) / <alpha-value>)',
          'coral-dark': 'rgb(var(--speakly-coral-dark) / <alpha-value>)',
          'coral-light': 'rgb(var(--speakly-coral-light) / <alpha-value>)',
          'coral-muted': 'rgb(var(--speakly-coral-muted) / <alpha-value>)',
          'coral-ring': 'rgb(var(--speakly-coral-ring) / <alpha-value>)',
          ink: '#1C1C1C',
        },
        /*
         * Provn palette: Ink #16171B, Proof Green #0EAE6E, Paper #F4F3F1.
         * Token names predate the rebrand (purple/lavender/yellow); their
         * values now map onto the green/ink/paper system so existing
         * persona-* classes restyle without a mass rename.
         */
        persona: {
          purple: '#0EAE6E',
          'purple-hover': '#0C9A61',
          'purple-dark': '#0A7E50',
          lavender: '#E2F2EA',
          'lavender-deep': '#C2E2D3',
          yellow: '#0EAE6E',
          'yellow-hover': '#0C9A61',
          cream: '#F4F3F1',
          ink: '#16171B',
          muted: '#5D6067',
          border: '#E7E5E0',
          surface: '#F8F8F6',
          violet: '#34C289',
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
