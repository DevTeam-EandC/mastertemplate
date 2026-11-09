/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  theme: {
    extend: {
      colors: {
        brand: {
          blue: "#134074",
          navy: "#13315C",
          ink: "#0B2545",
          steel: "#8DA9C4",
          mist: "#EEF4ED",
        },
      },
      boxShadow: {
        soft: "0 10px 35px rgba(11, 37, 69, 0.07)",
      },
    },
  },
  plugins: [],
};
