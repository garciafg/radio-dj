/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        neon: {
          pink: '#ff71ce',
          blue: '#01cdfe',
          green: '#05ffa1',
          yellow: '#fffb96',
          purple: '#b967ff'
        },
        retro: {
          black: '#1a1a1a',
          dark: '#2d2d2d',
          gray: '#4a4a4a',
          light: '#d1d1d1'
        }
      },
      fontFamily: {
        retro: ['VT323', 'monospace'],
        display: ['Press Start 2P', 'cursive'],
        sans: ['Inter', 'sans-serif']
      },
      backgroundImage: {
        'grid-pattern': "linear-gradient(to right, #2d2d2d 1px, transparent 1px), linear-gradient(to bottom, #2d2d2d 1px, transparent 1px)",
        'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
      },
      animation: {
        'neon-pulse': 'neon-pulse 2s ease-in-out infinite',
        'float': 'float 6s ease-in-out infinite',
      },
      keyframes: {
        'neon-pulse': {
          '0%, 100%': { opacity: '1' },
          '50%': { opacity: '0.5' },
        },
        'float': {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-20px)' },
        }
      }
    },
  },
  plugins: [],
} 