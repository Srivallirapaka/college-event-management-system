/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', 'ui-sans-serif', 'system-ui', '-apple-system', 'Segoe UI', 'Roboto', 'Helvetica Neue', 'Arial', 'sans-serif'],
      },
      colors: {
        rust: '#E06A26',
        'black-base': '#000000',
        'gray-sec': '#CCCCCC',
        neon: {
          cyan: '#00e5ff',
          magenta: '#d500f9',
          lime: '#76ff03',
          pink: '#ff1493',
          purple: '#7c4dff',
          blue: '#2979ff',
        },
        surface: {
          50: '#fafafa',
          100: '#f5f5f5',
          200: '#eeeeee',
          300: '#e0e0e0',
        },
      },
      boxShadow: {
        'rust-glow': '0 0 15px rgba(224, 106, 38, 0.4)',
        'rust-focus': '0 0 0 2px rgba(224, 106, 38, 0.8)',
        neon: '0 0 10px rgba(0, 229, 255, 0.5)',
        'neon-lg': '0 0 24px rgba(0, 229, 255, 0.4)',
        'neon-pink': '0 0 10px rgba(213, 0, 249, 0.5)',
        'neon-subtle': '0 0 20px rgba(0, 229, 255, 0.08)',
        'card': '0 1px 3px rgba(0,0,0,0.06), 0 1px 2px rgba(0,0,0,0.04)',
        'card-hover': '0 10px 40px rgba(0,0,0,0.08), 0 2px 8px rgba(0,0,0,0.04)',
        'float': '0 20px 60px rgba(0,0,0,0.08)',
        'glow-cyan': '0 0 30px rgba(0, 229, 255, 0.15)',
        'glow-purple': '0 0 30px rgba(124, 77, 255, 0.15)',
        'glow-btn': '0 4px 20px rgba(0, 229, 255, 0.25)',
      },
      animation: {
        'fade-in': 'fadeIn 0.5s ease-out',
        'slide-up': 'slideUp 0.5s ease-out',
        'scale-in': 'scaleIn 0.3s ease-out',
        'glow-pulse': 'glowPulse 2s ease-in-out infinite',
        'shimmer': 'shimmer 2s linear infinite',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { opacity: '0', transform: 'translateY(20px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        scaleIn: {
          '0%': { opacity: '0', transform: 'scale(0.95)' },
          '100%': { opacity: '1', transform: 'scale(1)' },
        },
        glowPulse: {
          '0%, 100%': { boxShadow: '0 0 20px rgba(0, 229, 255, 0.2)' },
          '50%': { boxShadow: '0 0 40px rgba(0, 229, 255, 0.4)' },
        },
        shimmer: {
          '0%': { backgroundPosition: '-200% 0' },
          '100%': { backgroundPosition: '200% 0' },
        },
      },
    },
  },
  plugins: [],
}
