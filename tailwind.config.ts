import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        navy: {
          50: "#eef4fb",
          100: "#d6e4f3",
          200: "#aec6e6",
          300: "#7ba3d3",
          400: "#4c7fbf",
          500: "#2f63a3",
          600: "#214c83",
          700: "#1a3d6b",
          800: "#142f52",
          900: "#0e2440",
          950: "#07142b",
        },
        gold: {
          50: "#fdf8ec",
          100: "#f9edcb",
          200: "#f2d992",
          300: "#eac059",
          400: "#e0a938",
          500: "#d4a017",
          600: "#b87f10",
          700: "#935e11",
          800: "#784b15",
          900: "#663e16",
        },
        cream: {
          50: "#fbfaf7",
          100: "#f4f1ea",
        },
      },
      fontFamily: {
        sans: ["var(--font-sans)", "ui-sans-serif", "system-ui", "sans-serif"],
        display: ["var(--font-display, var(--font-sans))", "ui-sans-serif", "system-ui", "sans-serif"],
      },
      boxShadow: {
        soft: "0 1px 2px rgb(14 36 64 / 0.04), 0 4px 14px -4px rgb(14 36 64 / 0.08)",
        "soft-lg":
          "0 10px 30px -10px rgb(14 36 64 / 0.14), 0 24px 48px -16px rgb(14 36 64 / 0.12)",
        gold: "0 12px 28px -10px rgb(212 160 23 / 0.5)",
        "navy-glow": "0 10px 30px -10px rgb(20 47 82 / 0.55)",
        ring: "inset 0 1px 0 rgb(255 255 255 / 0.06)",
      },
      backgroundImage: {
        "gold-gradient":
          "linear-gradient(135deg, #eac059 0%, #d4a017 55%, #b87f10 100%)",
        "navy-gradient":
          "linear-gradient(150deg, #122c50 0%, #081830 55%, #050d1f 100%)",
        "radial-gold":
          "radial-gradient(60% 80% at 85% 0%, rgb(212 160 23 / 0.16) 0%, transparent 65%)",
        "radial-white":
          "radial-gradient(50% 60% at 90% 0%, rgb(255 255 255 / 0.06) 0%, transparent 60%)",
      },
      keyframes: {
        "fade-in": {
          "0%": { opacity: "0" },
          "100%": { opacity: "1" },
        },
        "slide-up": {
          "0%": { opacity: "0", transform: "translateY(18px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        "slide-down": {
          "0%": { opacity: "0", transform: "translateY(-12px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        float: {
          "0%,100%": { transform: "translateY(0)" },
          "50%": { transform: "translateY(-8px)" },
        },
        "pulse-ring": {
          "0%": { transform: "scale(0.9)", opacity: "0.7" },
          "70%": { transform: "scale(1.6)", opacity: "0" },
          "100%": { transform: "scale(1.6)", opacity: "0" },
        },
        shimmer: {
          "0%": { backgroundPosition: "-200% 0" },
          "100%": { backgroundPosition: "200% 0" },
        },
        "shine-x": {
          "0%": { transform: "translateX(-150%) skewX(-15deg)" },
          "100%": { transform: "translateX(300%) skewX(-15deg)" },
        },
      },
      animation: {
        "fade-in": "fade-in 0.6s ease-out both",
        "slide-up": "slide-up 0.7s cubic-bezier(0.16,1,0.3,1) both",
        "slide-down": "slide-down 0.45s cubic-bezier(0.16,1,0.3,1) both",
        float: "float 5s ease-in-out infinite",
        "pulse-ring": "pulse-ring 2s ease-out infinite",
        shimmer: "shimmer 2.5s linear infinite",
        "shine-x": "shine-x 1.1s ease-out",
      },
    },
  },
  plugins: [],
};

export default config;