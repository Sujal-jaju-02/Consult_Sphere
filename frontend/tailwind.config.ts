import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: ["class"],
  content: [
    "./app/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
    "./lib/**/*.{ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        canvas: "#FAFAF9",
        ink: "#1F2937",
        sage: {
          50: "#F3F7F4",
          100: "#E6F0EA",
          200: "#CBE1D4",
          300: "#A9CFBA",
          400: "#7DB89A",
          500: "#4F9A77",
          600: "#3C7A5E",
          700: "#2F5F4A",
          800: "#264C3C",
          900: "#1F3F32"
        },
        lavender: {
          50: "#F6F4FF",
          100: "#EEE9FF",
          200: "#DDD3FF",
          300: "#C4B3FF",
          400: "#A68CFF",
          500: "#8A63FF",
          600: "#7447FF",
          700: "#5F2FF0",
          800: "#4E26C6",
          900: "#3F1F9E"
        },
        coral: {
          50: "#FFF3F0",
          100: "#FFE4DD",
          200: "#FFC7B6",
          300: "#FFA48A",
          400: "#FF7A55",
          500: "#FF5A2D",
          600: "#EA3D15",
          700: "#C23112",
          800: "#9C2912",
          900: "#7F2413"
        }
      },
      boxShadow: {
        soft: "0 10px 30px rgba(15, 23, 42, 0.08)",
        lift: "0 12px 40px rgba(15, 23, 42, 0.12)",
      },
      borderRadius: {
        xl: "1rem",
        "2xl": "1.25rem",
        "3xl": "1.5rem",
      },
      keyframes: {
        shimmer: {
          "0%": { backgroundPosition: "200% 0" },
          "100%": { backgroundPosition: "-200% 0" },
        },
      },
      animation: {
        shimmer: "shimmer 1.6s linear infinite",
      },
    },
  },
  plugins: [],
};

export default config;
