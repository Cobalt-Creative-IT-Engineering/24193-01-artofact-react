/** @type {import('tailwindcss').Config} */
// Palette + breakpoints alignés sur doc/design_system.md (source de vérité).
// Si tu modifies un token ici, propage-le dans src/index.css (variables CSS).

export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    // Breakpoints DS : 400 (mobile) / 768 (tablet) / 1440 (desktop)
    screens: {
      sm:  "400px",
      md:  "768px",
      lg:  "1440px",
    },
    extend: {
      colors: {
        neutral: {
          100: "#FFFFFF",
          300: "#E5E5E5",
          500: "#8E9DA9",
          700: "#5B707F",
          900: "#1F313D",
        },
        primary: {
          100: "#E3F4F7",
          300: "#8EE1EF",
          500: "#4EBBCA",
          700: "#448893",
          900: "#2F595F",
        },
        secondary: {
          100: "#F6FCEA",
          300: "#D9F299",
          500: "#B3CF5D",
          700: "#8DA054",
          900: "#464F2F",
        },
        tertiary: {
          100: "#F8F7F6",
          300: "#F5ECE5",
          500: "#F3E1D1",
          700: "#957D64",
          900: "#605244",
        },
      },
      maxWidth: {
        "container-mobile":  "400px",
        "container-tablet":  "768px",
        "container-desktop": "1440px",
        container:           "1264px",
      },
      borderRadius: {
        pill: "9999px",
      },
    },
  },
  plugins: [],
};
