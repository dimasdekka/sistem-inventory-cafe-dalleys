/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        primary: "#CAB38D", // Coffee color light
        secondary: "#4A3423", // Coffee color dark
        accent: "#5E8C61", // Green for fresh/eco
        dark: "#1F1B16", // Dark background
        card: "#292520", // Card background
      },
      fontFamily: {
        sans: ["Inter", "sans-serif"],
      },
    },
  },
  plugins: [],
};
