/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
        serif: ['"Cormorant Garamond"', 'serif'],
      },
      colors: {
        background: 'rgb(var(--color-bg) / <alpha-value>)',
        textPrimary: 'rgb(var(--color-text-primary) / <alpha-value>)',
        textSecondary: 'rgb(var(--color-text-secondary) / <alpha-value>)',
        borderLight: 'rgb(var(--color-border) / <alpha-value>)',
        accentGreen: 'rgb(var(--color-accent) / <alpha-value>)',
      },
    },
  },
  plugins: [],
}
