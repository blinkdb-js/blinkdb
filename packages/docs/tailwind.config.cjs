const defaultTheme = require("tailwindcss/defaultTheme");

/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./src/**/*.{html,astro,js,jsx,ts,tsx,md,mdx}"],
  theme: {
    extend: {
      backgroundImage: {
        "dot-top": "linear-gradient(to top, var(--tw-gradient-from), var(--tw-gradient-from) min(30%, 6em), transparent), radial-gradient(#777 0.65px, var(--tw-gradient-to) 0.65px)",
        "dot-bottom": "linear-gradient(to bottom, var(--tw-gradient-from), var(--tw-gradient-from) min(30%, 6em), transparent), radial-gradient(#777 0.65px, var(--tw-gradient-to) 0.65px)"
      },
      backgroundSize: {
        "dot-top": "cover, 13px 13px",
        "dot-bottom": "cover, 13px 13px"
      }
    },
  },
};
