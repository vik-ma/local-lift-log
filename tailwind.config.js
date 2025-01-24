/** @type {import('tailwindcss').Config} */
import { heroui } from "@heroui/react";

export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
    "./node_modules/@heroui/theme/dist/**/*.{js,ts,jsx,tsx}",
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
    heroui({
      themes: {
        light: {
          colors: {
            primary: {
              DEFAULT: "#f7bf24",
              700: "#ad7f00",
            },
            secondary: {
              DEFAULT: "#d7a200",
              700: "#a67d02",
            },
            success: {
              DEFAULT: "#84cc16",
              foreground: "#fff",
              800: "#57870c",
            },
            danger: {
              DEFAULT: "#ef5844",
              800: "#991b1b",
            },
            focus: "#f7bf24",
          },
        },
      },
    }),
  ],
};
