/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        wood: {
          light: '#D2B48C',
          medium: '#8B4513',
          dark: '#654321'
        },
        paper: {
          light: '#F5F5DC',
          medium: '#F0E68C',
          dark: '#DDD'
        },
        anthracite: {
          50: '#f6f6f6',
          100: '#e7e7e7',
          200: '#d1d1d1',
          300: '#b0b0b0',
          400: '#888888',
          500: '#6d6d6d',
          600: '#5d5d5d',
          700: '#4f4f4f',
          800: '#454545',
          900: '#3d3d3d',
          950: '#2a2a2a'
        }
      },
      fontFamily: {
        handwritten: ['Kalam', 'cursive'],
        serif: ['Crimson Text', 'serif']
      },
      animation: {
        'dice-roll': 'diceRoll 0.6s ease-in-out',
        'dice-bounce': 'diceBounce 0.3s ease-out',
        'score-highlight': 'scoreHighlight 0.5s ease-in-out',
        'timer-pulse': 'timerPulse 1s ease-in-out infinite'
      },
      keyframes: {
        diceRoll: {
          '0%': { transform: 'rotateX(0deg) rotateY(0deg)' },
          '25%': { transform: 'rotateX(90deg) rotateY(45deg)' },
          '50%': { transform: 'rotateX(180deg) rotateY(90deg)' },
          '75%': { transform: 'rotateX(270deg) rotateY(135deg)' },
          '100%': { transform: 'rotateX(360deg) rotateY(180deg)' }
        },
        diceBounce: {
          '0%': { transform: 'scale(1)' },
          '50%': { transform: 'scale(1.1)' },
          '100%': { transform: 'scale(1)' }
        },
        scoreHighlight: {
          '0%': { backgroundColor: 'transparent' },
          '50%': { backgroundColor: '#fbbf24' },
          '100%': { backgroundColor: 'transparent' }
        },
        timerPulse: {
          '0%': { opacity: '1' },
          '50%': { opacity: '0.5' },
          '100%': { opacity: '1' }
        }
      },
      boxShadow: {
        'dice': '0 4px 8px rgba(0, 0, 0, 0.3), inset 0 1px 0 rgba(255, 255, 255, 0.2)',
        'paper': '0 2px 4px rgba(0, 0, 0, 0.1), 0 8px 16px rgba(0, 0, 0, 0.1)',
        'wood': 'inset 0 1px 0 rgba(255, 255, 255, 0.1), 0 2px 4px rgba(0, 0, 0, 0.2)'
      }
    },
  },
  plugins: [],
}
