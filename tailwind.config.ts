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
        // WhatsApp green palette
        primary: {
          50: "#f0fdf6",
          100: "#d8f8e8",
          200: "#aff0d1",
          300: "#74e2b3",
          400: "#35cc8f",
          500: "#25D366", // WhatsApp green
          600: "#1aaa53",
          700: "#128C7E", // WhatsApp dark green
          800: "#0e6b5f",
          900: "#0b4f47",
        },
        // Off-white surface for landing page
        offwhite: "#f7f8f5",
        // Dark sidebar surfaces
        surface: {
          900: "#0d0d0d",
          800: "#141414",
          700: "#1c1c1c",
          600: "#242424",
        },
      },
      fontFamily: {
        sans: ["Inter", "system-ui", "sans-serif"],
      },
    },
  },
  plugins: [],
};
export default config;
