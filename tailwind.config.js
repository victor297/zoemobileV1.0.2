/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./App.{js,jsx,ts,tsx}",
    "./screens/**/*.{js,jsx,ts,tsx}",
    "./components/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        exo: ["exo", "sans"],
        exoSemibold: ["exoSemibold", "sans"],
        roboto: ["roboto", "sans"],
        robotoBold: ["robotoBold", "sans"],
      },
      colors: {
        green: "#78C257",
        lightGreen: "#ECF6E7",
        grey: "#667085",
        bgLightGray2: "#E6E6E6",
        bgWhite: "#FFFFFF",
        lightGrayText: "#636D77",
        darkGrayText: "#364356",
        gold: "#d97706",
      },
    },
  },
  plugins: [],
};
