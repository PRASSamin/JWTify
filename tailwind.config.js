/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        shoika: ['Shoika', 'sans-serif'],
      },
      keyframes: {
        bounce2: {
          '0%, 100%': { transform: 'translateY(-50%)' },
          '50%': { transform: 'translateY(0)' },
        }
      },
      animation: {
        bounce2: 'bounce2 1s infinite',
      }


    },
  },
  plugins: [],
}

