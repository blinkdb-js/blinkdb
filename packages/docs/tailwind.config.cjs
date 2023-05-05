const defaultTheme = require("tailwindcss/defaultTheme");

module.exports = {
  content: ["./src/**/*.{html,astro,js,ts,md,mdx}"],
  theme: {
    extend: {
      animation: {
        extendwidth: "extendwidth 1s ease-in-out",
      },
      keyframes: {
        extendwidth: {
          "0%": { width: "0%" },
          "100%": { width: "100%" },
        },
      },
    },
  },
};
