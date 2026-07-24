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
        ink: {
          DEFAULT: "#070708",
          elevated: "#101012",
          soft: "#16161a",
        },
        mist: {
          DEFAULT: "#c8ccd4",
          soft: "#8e95a3",
          muted: "#9a9aa3",
          dim: "#6e6e78",
        },
      },
      fontFamily: {
        sans: ["var(--font-sans)", "sans-serif"],
        display: ["var(--font-display)", "serif"],
        serif: ["var(--font-serif)", "serif"],
      },
      maxWidth: {
        content: "1180px",
      },
    },
  },
  plugins: [],
};

export default config;
