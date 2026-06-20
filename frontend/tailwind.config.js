/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        teal: {
          950: "#001a1a",
          900: "#002a2a",
          800: "#003838",
          700: "#004d4d",
          600: "#006666",
          500: "#008080",
          400: "#00a3a3",
          300: "#00c7c7",
        },
        green: {
          money: "#00b894",
          light: "#00d2a8",
          muted: "#006651",
        },
      },
      fontFamily: {
        display: ["Cormorant Garamond", "Georgia", "serif"],
        mono: ["Fira Code", "monospace"],
        sans: ["Inter", "system-ui", "sans-serif"],
      },
      animation: {
        "count-up": "countUp 1.5s ease-out forwards",
        "slide-up": "slideUp 0.5s ease-out forwards",
        "fade-in": "fadeIn 0.6s ease-out forwards",
        "pulse-green": "pulseGreen 2s ease-in-out infinite",
      },
      keyframes: {
        countUp: { from: { opacity: 0, transform: "translateY(10px)" }, to: { opacity: 1, transform: "translateY(0)" } },
        slideUp: { from: { opacity: 0, transform: "translateY(20px)" }, to: { opacity: 1, transform: "translateY(0)" } },
        fadeIn: { from: { opacity: 0 }, to: { opacity: 1 } },
        pulseGreen: { "0%,100%": { boxShadow: "0 0 0 0 rgba(0,184,148,0.3)" }, "50%": { boxShadow: "0 0 0 8px rgba(0,184,148,0)" } },
      },
    },
  },
  plugins: [],
};
