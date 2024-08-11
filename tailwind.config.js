/** @type {import('tailwindcss').Config} */
import { nextui } from "@nextui-org/react";

export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
    "./node_modules/@nextui-org/theme/dist/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      backgroundImage: {
        "gradient-radial": "radial-gradient(var(--tw-gradient-stops))",

        "gradient-conic":
          "conic-gradient(from 180deg at 50% 50%, var(--tw-gradient-stops))",
      },
    },
  },
  darkMode: "class",
  plugins: [
    nextui({
      themes: {
        light: {
          colors: {
            primary: {
              DEFAULT: "#f7bf24",
            },
            secondary: {
              DEFAULT: "#d7a200",
            },
            success: {
              DEFAULT: "#84cc16",
              foreground: "#fff",
              600: "#84bd2f",
            },
            danger: {
              DEFAULT: "#ef5844",
            },
            focus: "#f7bf24",
          },
        },
      },
    }),
  ],
};
