/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: "#2563eb",
        primaryLight: "#60a5fa",
        primaryDark: "#1d4ed8",
        accent: "#22c55e",
        bgSoft: "#f5f5f5"
      }
    },
  },
  plugins: [],
}
