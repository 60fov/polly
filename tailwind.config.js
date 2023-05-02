/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx}',
    './src/components/**/*.{js,ts,jsx,tsx}',
    './src/app/**/*.{js,ts,jsx,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        front: 'rgb(var(--color-front) / <alpha-value>)',
        mid: 'rgb(var(--color-mid) / <alpha-value>)',
        back: 'rgb(var(--color-back) / <alpha-value>)',

        light: 'rgb(var(--color-light) / <alpha-value>)',
        vibrant: 'rgb(var(--color-vibrant) / <alpha-value>)',
        dark: 'rgb(var(--color-dark) / <alpha-value>)',
        
        // vcol: `rgb(var(--text-color) / <alpha-value>)`
      },
    },
  },
  plugins: [],
}
