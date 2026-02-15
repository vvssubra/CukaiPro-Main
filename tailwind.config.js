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
    },
  },
  plugins: [],
};
