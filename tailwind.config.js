/** @type {import('tailwindcss').Config} */
export default {
  darkMode: "class", // 👈 important: enables <html class="dark"> toggling
  content: [
    "./index.html",
    "./src/**/*.{js,jsx}"
  ],
  theme: {
    extend: {
      colors: {
        lime: {
          DEFAULT: "#00ff80",
          400: "#00ff80"
        }
      }
    }
  },
  plugins: []
};