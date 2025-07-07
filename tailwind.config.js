/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      // we'll add custom styles here
      colors: {
        primary: "#00b8e6",
        secondary: "#ff6f61",
        accent: "#f4d35e",
      },
    },
  },
  plugins: [],
};
