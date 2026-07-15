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
        background: '#FFFFFF',
        textPrimary: '#111111',
        textSecondary: '#6B7280',
        borderLight: '#E5E7EB',
        accentGreen: '#16A34A',
      },
    },
  },
  plugins: [],
}
