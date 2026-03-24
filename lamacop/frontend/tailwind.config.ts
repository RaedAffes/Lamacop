import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./src/**/*.{js,ts,jsx,tsx,mdx}"],
  theme: {
    extend: {
      colors: {
        primary: "#2563EB",
        accent: "#16A34A",
      },
      boxShadow: {
        card: "0 8px 30px rgba(37, 99, 235, 0.08)",
      },
    },
  },
  plugins: [],
};

export default config;
