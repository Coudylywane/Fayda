/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./src/**/*.{html,ts}'],
  theme: {
    extend: {
      colors: {
        primary: '#d4b675',
        secondary: '#3B82F6',
        accent: '#FBBF24',
        neutral: '#374151',
        'base-100': '#FFFFFF',
        info: '#3ABFF8',
        success: '#36D399',
        warning: '#FBBD23',
        error: '#F87272',
      },
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
      },
      animation: {
        'in': 'fadeIn 0.2s ease-out',
        'slide-in-from-top-2': 'slideInFromTop 0.2s ease-out',
      },
      keyframes: {
        fadeIn: {
          'from': { opacity: '0' },
          'to': { opacity: '1' },
        },
        slideInFromTop: {
          'from': {
            opacity: '0',
            transform: 'translateY(-8px)'
          },
          'to': {
            opacity: '1',
            transform: 'translateY(0)'
          },
        }
      }
    },
  },
  plugins: [require('@tailwindcss/aspect-ratio'),
  require('@tailwindcss/forms'),
  require('@tailwindcss/line-clamp'),
  require('@tailwindcss/typography'),
  require("tailwindcss-safe-area"),
  ]
};