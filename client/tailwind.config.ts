import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      fontFamily: {
        sans: ["Inter", "ui-sans-serif", "system-ui", "sans-serif"],
      },
      colors: {
        primary: {
          DEFAULT: "#4F46E5",
          50: "#EEEEFE",
          100: "#E0DFFE",
          200: "#C1BFFD",
          300: "#A39FF9",
          400: "#827FF5",
          500: "#6460F1",
          600: "#4F46E5",
          700: "#3730B9",
          800: "#2A2494",
          900: "#1F1B70",
        },
        success: { DEFAULT: "#10B981", light: "#D1FAE5", dark: "#065F46" },
        warning: { DEFAULT: "#F59E0B", light: "#FEF3C7", dark: "#78350F" },
        danger: { DEFAULT: "#EF4444", light: "#FEE2E2", dark: "#7F1D1D" },
        info: { DEFAULT: "#3B82F6", light: "#DBEAFE", dark: "#1E3A5F" },
      },
      animation: {
        "fade-in": "fadeIn 0.2s ease-in-out",
        "slide-in": "slideIn 0.25s ease-out",
        "spin-slow": "spin 2s linear infinite",
      },
      keyframes: {
        fadeIn: {
          "0%": { opacity: "0", transform: "translateY(-4px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        slideIn: {
          "0%": { transform: "translateX(-100%)" },
          "100%": { transform: "translateX(0)" },
        },
      },
    },
  },
  plugins: [],
};

export default config;
