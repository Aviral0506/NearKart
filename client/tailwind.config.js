/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],  theme: {
    extend: {
      colors: {
        "primary-200": "#9D4EDD",        // Zepto-style vibrant purple
        "primary-100": "#C77DFF", // Softer purple for hover / backgrounds

        "secondary-200": "#FF3CAC",       // Neon pink accent
        "secondary-100": "#FF99C8", // Lighter pink for subtle highlights
      },
    },
  },
  plugins: [],
}

