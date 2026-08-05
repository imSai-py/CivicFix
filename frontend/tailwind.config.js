/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: "class",
  theme: {
    extend: {
      colors: {
        background: "#0a0a12",
        surface: "#0f0f1a",
        "surface-container": "#141422",
        "surface-container-high": "#1e1e30",
        "surface-container-highest": "#28283e",
        "surface-variant": "#1e1e30",
        "surface-dim": "#0f0f1a",
        primary: "#ff2d78",
        "primary-container": "#b3004e",
        secondary: "#00ffcc",
        "secondary-container": "#004d3d",
        tertiary: "#ffe04a",
        "tertiary-container": "#665200",
        "on-surface": "#e8e0f0",
        "on-surface-variant": "#a098b0",
        outline: "#5a5068",
        "outline-variant": "#302840",
      },
      fontFamily: {
        headline: ["Sora", "sans-serif"],
        display: ["Sora", "sans-serif"],
        body: ["Inter", "sans-serif"],
        label: ["Space Grotesk", "sans-serif"],
      },
    },
  },
  plugins: [],
}
