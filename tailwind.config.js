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
        "sans": ["Inter", "sans-serif"],
        "display": ["Plus Jakarta Sans", "Inter", "sans-serif"],
      },
      fontSize: {
        xs: ["0.75rem", { lineHeight: "1.5" }],
        sm: ["0.875rem", { lineHeight: "1.5" }],
        base: ["1rem", { lineHeight: "1.6" }],
        lg: ["1.125rem", { lineHeight: "1.6" }],
        xl: ["1.25rem", { lineHeight: "1.5" }],
        "2xl": ["1.5rem", { lineHeight: "1.4" }],
        "3xl": ["1.875rem", { lineHeight: "1.3" }],
        "4xl": ["2.25rem", { lineHeight: "1.2" }],
        "5xl": ["3rem", { lineHeight: "1.15" }],
      },
      borderRadius: {
        "DEFAULT": "0.25rem",
        lg: "0.5rem",
        xl: "0.75rem",
        "2xl": "1rem",
        "3xl": "1.5rem",
        full: "9999px",
      },
      boxShadow: {
        card: "0 1px 3px 0 rgb(0 0 0 / 0.06), 0 1px 2px -1px rgb(0 0 0 / 0.06)",
        "card-hover": "0 4px 6px -1px rgb(0 0 0 / 0.08), 0 2px 4px -2px rgb(0 0 0 / 0.06)",
        modal: "0 25px 50px -12px rgb(0 0 0 / 0.2)",
        dropdown: "0 10px 15px -3px rgb(0 0 0 / 0.08), 0 4px 6px -4px rgb(0 0 0 / 0.04)",
        "nav": "0 1px 3px 0 rgb(0 0 0 / 0.06)",
      },
      transitionDuration: {
        DEFAULT: "200ms",
        fast: "150ms",
        slow: "250ms",
      },
      transitionTimingFunction: {
        DEFAULT: "cubic-bezier(0.4, 0, 0.2, 1)",
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
        "fade-in": {
          "0%": { opacity: "0" },
          "100%": { opacity: "1" },
        },
        "fade-in-up": {
          "0%": { opacity: "0", transform: "translateY(8px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        "scale-in": {
          "0%": { opacity: "0", transform: "scale(0.96)" },
          "100%": { opacity: "1", transform: "scale(1)" },
        },
        "slide-in-right": {
          "0%": { opacity: "0", transform: "translateX(16px)" },
          "100%": { opacity: "1", transform: "translateX(0)" },
        },
        "toast-exit": {
          "0%": { opacity: "1", transform: "translateX(0)" },
          "100%": { opacity: "0", transform: "translateX(16px)" },
        },
      },
      animation: {
        "hero-ripple": "hero-ripple 4s ease-out infinite",
        "ripple-grid-pulse": "ripple-grid-pulse 3s ease-in-out infinite",
        "fade-in": "fade-in 0.2s ease-out forwards",
        "fade-in-up": "fade-in-up 0.25s ease-out forwards",
        "scale-in": "scale-in 0.2s ease-out forwards",
        "slide-in-right": "slide-in-right 0.25s ease-out forwards",
        "toast-exit": "toast-exit 0.2s ease-in forwards",
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
