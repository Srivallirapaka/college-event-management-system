/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        rust: '#E06A26',
        'black-base': '#000000',
        'gray-sec': '#CCCCCC',
        neon: {
          cyan: '#00ffff',
          magenta: '#ff00ff',
          lime: '#00ff00',
          pink: '#ff1493',
          purple: '#9d00ff',
        },
      },
      boxShadow: {
        'rust-glow': '0 0 15px rgba(224, 106, 38, 0.4)',
        'rust-focus': '0 0 0 2px rgba(224, 106, 38, 0.8)',
        neon: '0 0 10px rgba(0, 255, 255, 0.8)',
        'neon-lg': '0 0 20px rgba(0, 255, 255, 0.6)',
        'neon-pink': '0 0 10px rgba(255, 0, 255, 0.8)',
      },
    },
  },
  plugins: [],
}
