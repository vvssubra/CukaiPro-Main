/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: "class",
  theme: {
    extend: {
      colors: {
        "primary": "#064E3B",       // Forest Green (brand)
        "primary-stitch": "#064c39", // Stitch design variant
        "secondary": "#1E293B",     // Slate
        "background-light": "#f6f8f7",
        "background-dark": "#10221d",
        "slate-custom": "#1E293B",
      },
      fontFamily: {
        "display": ["Inter", "sans-serif"],
      },
      borderRadius: {
        "DEFAULT": "0.25rem",
        "lg": "0.5rem",
        "xl": "0.75rem",
        "full": "9999px",
      },
      keyframes: {
        "hero-ripple": {
          "0%": { transform: "scale(0.5)", opacity: "0.7" },
          "100%": { transform: "scale(1.5)", opacity: "0" },
        },
        "ripple-grid-pulse": {
          "0%, 100%": { opacity: "0.4" },
          "50%": { opacity: "0.9" },
        },
      },
      animation: {
        "hero-ripple": "hero-ripple 4s ease-out infinite",
        "ripple-grid-pulse": "ripple-grid-pulse 3s ease-in-out infinite",
      },
      backgroundImage: {
        "hero-grid-pattern": "linear-gradient(to right, rgb(6 78 59 / 0.08) 1px, transparent 1px), linear-gradient(to bottom, rgb(6 78 59 / 0.08) 1px, transparent 1px)",
      },
      backgroundSize: {
        "hero-grid": "48px 48px",
      },
    },
  },
  plugins: [],
};
