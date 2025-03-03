/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'custom-green': '#00c5cc',
        'custom-purple': '#7c2ae8',
      },
    },
  },
  plugins: [
    require('tailwind-scrollbar-hide')
  ],
}
