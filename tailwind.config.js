/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        'background': '#000000',
        'text': '#ffffff',
        'heading': '#00712d',
        'subheading': '#d5ed9f',
      },
    },
  },
  plugins: [],
}
