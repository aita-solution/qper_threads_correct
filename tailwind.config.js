/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {
      spacing: {
        '275px': '275px',
      },
      colors: {
        primary: {
          DEFAULT: '#fe6f00',
          hover: '#ff8534',
        },
        'primary-transparent': 'rgba(254, 111, 0, 0.25)',
      },
      animation: {
        'bounce-delayed': 'bounce 1s infinite 200ms',
        'bounce-delayed-2': 'bounce 1s infinite 400ms',
      },
      typography: (theme) => ({
        DEFAULT: {
          css: {
            color: theme('colors.gray.800'),
            maxWidth: 'none', // Wichtig für Chat-Layout
            p: {
              marginTop: '0.75em',
              marginBottom: '0.75em',
            },
            'ul > li': {
              marginTop: '0.25em',
              marginBottom: '0.25em',
              paddingLeft: '0.375em',
            },
            'ol > li': {
              marginTop: '0.25em',
              marginBottom: '0.25em',
              paddingLeft: '0.375em',
            },
            strong: {
              color: 'inherit',
            },
            a: {
              color: theme('colors.primary.DEFAULT'),
              '&:hover': {
                color: theme('colors.primary.hover'),
              },
            },
            code: {
              color: theme('colors.gray.800'),
              backgroundColor: theme('colors.gray.100'),
              paddingLeft: '0.25em',
              paddingRight: '0.25em',
              paddingTop: '0.125em',
              paddingBottom: '0.125em',
              borderRadius: '0.25em',
            },
          },
        },
        invert: {
          css: {
            color: theme('colors.gray.100'),
            strong: {
              color: 'inherit',
            },
            a: {
              color: theme('colors.white'),
              '&:hover': {
                color: theme('colors.gray.200'),
              },
            },
            code: {
              color: theme('colors.white'),
              backgroundColor: 'rgba(255, 255, 255, 0.1)',
            },
          },
        },
      }),
    },
  },
  plugins: [
    require('@tailwindcss/forms'),
    require('@tailwindcss/typography'),
  ],
};