const defaultTheme = require('tailwindcss/defaultTheme')

module.exports = {
  content: ['./src/**/*.{html,astro,js,ts,md,mdx}'],
  theme: {
    fontFamily: {
      'display': ['Fredoka', ...defaultTheme.fontFamily.sans],
      'sans': ['Inter', ...defaultTheme.fontFamily.sans],
      'mono': ['Source Code Pro', ...defaultTheme.fontFamily.mono]
    },
    extend: {
      animation: {
        extendwidth: 'extendwidth 1s ease-in-out',
      },
      keyframes: {
        "extendwidth": {
          '0%': { width: "0%" },
          '100%': { width: "100%" },
        }
      }
    }
  }
}