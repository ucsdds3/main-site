/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      fontFamily: {
        /* Match src/Styles/index.css @theme --font-body so DaisyUI / font-sans match the main site */
        sans: ['"Albert Sans"', '"Darker Grotesque"', "sans-serif"],
      },
    },
  },
  plugins: [require("daisyui")],
};
