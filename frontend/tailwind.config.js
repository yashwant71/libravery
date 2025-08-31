// frontend/tailwind.config.js
/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      // Here we replace Tailwind's default colors with our CSS variables
      colors: {
        // We define semantic names for our colors
        text: {
          DEFAULT: "var(--color-text-base)",
          muted: "var(--color-text-muted)",
          accent: "var(--color-text-accent)",
        },
        background: {
          primary: "var(--color-bg-primary)",
          secondary: "var(--color-bg-secondary)",
          muted: "var(--color-bg-muted)",
        },
        border: {
          DEFAULT: "var(--color-border-base)",
          accent: "var(--color-border-accent)",
        },
        primary: {
          DEFAULT: "var(--color-primary)",
          hover: "var(--color-primary-hover)",
        },
        secondary: {
          DEFAULT: "var(--color-secondary)",
          hover: "var(--color-secondary-hover)",
        },
        danger: {
          DEFAULT: "var(--color-danger)",
          hover: "var(--color-danger-hover)",
        },
      },
    },
  },
  plugins: [],
};
