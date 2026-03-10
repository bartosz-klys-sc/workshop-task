/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  theme: {
    extend: {
      colors: {
        scalable: {
          50: "#fff7ee",
          100: "#ffe9d4",
          200: "#ffd3a8",
          300: "#ffb66d",
          400: "#ff9440",
          500: "#ff7a00",
          600: "#e66c00",
          700: "#bf5b00",
          800: "#994900",
          900: "#7a3b00",
        },
      },
      boxShadow: {
        card: "0 10px 24px rgba(28, 28, 28, 0.08)",
      },
    },
  },
  plugins: [],
};
