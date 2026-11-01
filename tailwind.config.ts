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
          DEFAULT: "var(--bg)",
          elevated: "var(--bg-elevated)",
          soft: "var(--bg-soft)",
        },
        mist: {
          DEFAULT: "var(--accent)",
          soft: "var(--accent-soft)",
          muted: "var(--text-muted)",
          dim: "var(--text-dim)",
        },
        gold: {
          DEFAULT: "var(--gold)",
          deep: "var(--gold-deep)",
        },
      },
      fontFamily: {
        sans: ["var(--font-sans)", "sans-serif"],
        display: ["var(--font-display)", "serif"],
        serif: ["var(--font-serif)", "serif"],
      },
      maxWidth: {
        content: "1220px",
      },
    },
  },
  plugins: [],
};

export default config;
