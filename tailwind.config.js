/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./app/frontend/**/*.{js,jsx,ts,tsx,html}"],
  theme: {
    extend: {
      colors: {
        background: {
          pink: '#F6C1E1',
          lavender: '#DCCBFF',
          blue: '#CFE9FF',
        },
        glass: {
          stroke: 'rgba(255, 255, 255, 0.5)',
          surface: 'rgba(255, 255, 255, 0.4)',
        }
      },
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
      },
      boxShadow: {
        'glass': '0 8px 32px 0 rgba(31, 38, 135, 0.07)',
        'neumorph': '5px 5px 10px #d1d9e6, -5px -5px 10px #ffffff',
      }
    },
  },
  plugins: [],
}