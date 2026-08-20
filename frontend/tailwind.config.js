/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        health: {
          50: '#F4F8F6',
          100: '#E4F4ED',
          200: '#C8E7DA',
          300: '#AEDCC9', // Light green / mint accent
          400: '#7CBFA3',
          500: '#486A5B', // Primary deep healthcare green
          600: '#3D5B4E',
          700: '#334D42',
          800: '#273B33',
          900: '#1C2B25',
          950: '#0E1714',
        },
        surface: {
          DEFAULT: '#FFFFFF',
          muted: '#F5F7F3', // Off-white background
          card: '#FFFFFF',
          border: '#E1E5E1',
        },
        ink: {
          main: '#060D0D', // Very dark green / black
          muted: '#6B726E', // Muted secondary gray
          subtle: '#9BA3A0',
        },
        status: {
          success: '#10B981',
          warning: '#F59E0B',
          danger: '#EF4444',
          info: '#3B82F6',
        }
      },
      fontFamily: {
        sans: ['"Plus Jakarta Sans"', 'Inter', 'system-ui', 'sans-serif'],
      },
      boxShadow: {
        'soft': '0 2px 15px -3px rgba(6, 13, 13, 0.04), 0 4px 6px -2px rgba(6, 13, 13, 0.02)',
        'soft-lg': '0 10px 25px -5px rgba(6, 13, 13, 0.05), 0 8px 10px -6px rgba(6, 13, 13, 0.03)',
        'glass': '0 8px 32px 0 rgba(72, 106, 91, 0.08)',
      },
      borderRadius: {
        '2xl': '1rem',
        '3xl': '1.5rem',
        '4xl': '2rem',
      }
    },
  },
  plugins: [],
}
