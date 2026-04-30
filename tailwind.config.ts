import type { Config } from "tailwindcss";
const config: Config = {
  content: ["./src/**/*.{js,ts,jsx,tsx,mdx}"],
  theme: {
    extend: {
      fontFamily: {
        serif: ["DM Serif Display", "serif"],
        sans:  ["DM Sans", "sans-serif"],
      },
      colors: {
        bg:      "#06080f",
        surface: "#111624",
        surface2:"#181e30",
        accent:  "#6ee7b7",
        accent2: "#38bdf8",
        accent3: "#a78bfa",
      },
    },
  },
  plugins: [],
};
export default config;
