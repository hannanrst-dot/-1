import type { Config } from "tailwindcss";

export default {
  content: ["./src/**/*.{js,ts,jsx,tsx,mdx}"],
  theme: {
    extend: {
      colors: {
        brand: {
          50: "#fff1f3",
          100: "#ffe0e5",
          200: "#ffc6d0",
          300: "#ff9dae",
          400: "#ff647f",
          500: "#f83b5c",
          600: "#e51b45",
          700: "#c11039",
          800: "#a11136",
          900: "#8a1234",
        },
        ink: {
          50: "#f6f7f9",
          100: "#eceef2",
          200: "#d5d9e2",
          300: "#b1b9c9",
          400: "#8792ab",
          500: "#687490",
          600: "#535d77",
          700: "#444c61",
          800: "#3b4152",
          900: "#353946",
          950: "#23252e",
        },
        gold: "#f0a500",
      },
      fontFamily: {
        sans: ["Vazirmatn", "system-ui", "sans-serif"],
      },
      boxShadow: {
        card: "0 1px 3px rgba(16,24,40,.06), 0 1px 2px rgba(16,24,40,.04)",
        pop: "0 12px 40px -12px rgba(16,24,40,.22)",
      },
      keyframes: {
        "fade-in": { "0%": { opacity: "0" }, "100%": { opacity: "1" } },
        "slide-up": {
          "0%": { opacity: "0", transform: "translateY(12px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        shimmer: {
          "100%": { transform: "translateX(-100%)" },
        },
      },
      animation: {
        "fade-in": "fade-in .25s ease-out",
        "slide-up": "slide-up .3s ease-out",
      },
    },
  },
  plugins: [],
} satisfies Config;
