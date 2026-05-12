import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        accent: {
          DEFAULT: "#0EA5A4",
          fg: "#053F3F",
          soft: "#E6FAF9",
        },
        ink: {
          900: "#0B0F12",
          700: "#27313A",
          500: "#5B6772",
          300: "#A7B0B8",
          100: "#E6E9EC",
          50: "#F4F6F8",
        },
      },
      fontFamily: {
        sans: [
          "-apple-system",
          "BlinkMacSystemFont",
          "SF Pro Text",
          "Inter",
          "Segoe UI",
          "Roboto",
          "system-ui",
          "sans-serif",
        ],
      },
      boxShadow: {
        card: "0 1px 2px rgba(11,15,18,0.04), 0 8px 24px rgba(11,15,18,0.06)",
      },
      borderRadius: {
        xl2: "1.25rem",
      },
      transitionTimingFunction: {
        spring: "cubic-bezier(0.22, 1, 0.36, 1)",
      },
    },
  },
  plugins: [],
};

export default config;
