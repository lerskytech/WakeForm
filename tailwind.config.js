/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: '#00C2FF', // Bright blue
          dark: '#0084B0', // Darker blue
          light: '#80E1FF', // Lighter blue
        },
        secondary: {
          DEFAULT: '#00FFB2', // Teal
          dark: '#00B37E', // Darker teal
          light: '#80FFD8', // Lighter teal
        },
        background: {
          dark: '#001424', // Very dark blue
          DEFAULT: '#002548', // Dark blue
          light: '#003B6D', // Medium blue
        },
        accent: {
          DEFAULT: '#FFFFFF', // White
          blue: '#E0F7FF', // Very light blue
        }
      },
      animation: {
        'pulse-slow': 'pulse 4s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'float': 'float 6s ease-in-out infinite',
        'breathe': 'breathe 8s ease-in-out infinite',
        'wave': 'wave 10s ease-in-out infinite',
        'glow': 'glow 3s ease-in-out infinite',
      },
      keyframes: {
        float: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-10px)' },
        },
        breathe: {
          '0%, 100%': { transform: 'scale(1)' },
          '50%': { transform: 'scale(1.05)' },
        },
        wave: {
          '0%': { transform: 'translateX(0) translateY(0)' },
          '25%': { transform: 'translateX(5px) translateY(-5px)' },
          '50%': { transform: 'translateX(0) translateY(0)' },
          '75%': { transform: 'translateX(-5px) translateY(5px)' },
          '100%': { transform: 'translateX(0) translateY(0)' },
        },
        glow: {
          '0%, 100%': { filter: 'brightness(1)' },
          '50%': { filter: 'brightness(1.3)' },
        }
      },
    },
  },
  plugins: [],
}
