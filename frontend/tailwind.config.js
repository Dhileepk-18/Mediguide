/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // Luxury Deep Teal Brand Scale
        health: {
          50: '#F0F6F8',
          100: '#DCEBF0',
          200: '#BDDAE4',
          300: '#9EBAD1', // Sky accent
          400: '#5C90A8',
          500: '#1B5263',
          600: '#0E3E4F',
          700: '#0B3441', // Deep Teal Primary
          800: '#07242E',
          900: '#06171E',
          950: '#030C10',
        },
        // Warm Editorial Canvas
        surface: {
          DEFAULT: '#FFFFFF',
          muted: '#FAFBFB', // Warm White Canvas
          card: '#FFFFFF',
          border: '#E8EDEF',
          borderDark: '#CBD7DC',
        },
        // High-Contrast Midnight & Slate Typography
        ink: {
          main: '#061017', // Midnight
          muted: '#5A6C77', // Reassuring slate
          subtle: '#8C9DA8',
        },
        // Warm Gold Editorial Highlight
        accent: {
          light: '#F8F3E8',
          DEFAULT: '#C9A24D', // Warm Gold
          hover: '#B58E3C',
          dark: '#7D6025',
        },
        // Sky Blue Data Accent
        skydata: {
          50: '#F2F7FB',
          100: '#E2EEF7',
          200: '#C5DDEE',
          DEFAULT: '#9EBAD1',
          dark: '#39679B',
        },
        // Clinical Status Tokens
        status: {
          success: '#2A7A5B', // Clinical green
          warning: '#C9A24D', // Warm gold
          danger: '#B83A3A',  // Clinical red
          info: '#39679B',    // Steel blue
        }
      },
      fontFamily: {
        sans: ['"Plus Jakarta Sans"', 'Inter', 'system-ui', 'sans-serif'],
        display: ['"Plus Jakarta Sans"', 'Inter', 'system-ui', 'sans-serif'],
      },
      boxShadow: {
        'soft': '0 2px 15px -3px rgba(6, 16, 23, 0.04), 0 4px 6px -2px rgba(6, 16, 23, 0.02)',
        'soft-lg': '0 12px 30px -6px rgba(6, 16, 23, 0.06), 0 6px 12px -4px rgba(6, 16, 23, 0.03)',
        'luxury': '0 20px 40px -15px rgba(11, 52, 65, 0.08), 0 0 0 1px rgba(232, 237, 239, 0.8)',
        'glass': '0 8px 32px 0 rgba(11, 52, 65, 0.06)',
      },
      borderRadius: {
        'xl': '0.875rem', // 14px
        '2xl': '1.125rem', // 18px (V1.0 spec)
        '3xl': '1.5rem', // 24px (V1.0 spec)
        '4xl': '2rem',
      }
    },
  },
  plugins: [],
}
