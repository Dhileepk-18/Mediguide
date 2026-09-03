/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        // Locked Design Tokens (MediGuide v2.0 Spec)
        ink: {
          DEFAULT: '#061017',
          main: '#061017',
          muted: '#5A6C77',
          subtle: '#8C9DA8',
        },
        teal: {
          DEFAULT: '#0B3441',
          hover: '#08252E',
          light: '#1B5263',
        },
        blue: {
          DEFAULT: '#39679B',
          hover: '#2E5480',
          light: '#E8F0F8',
        },
        sky: {
          DEFAULT: '#9EBAD1',
          light: '#DCEBF0',
          soft: '#F0F6F8',
        },
        white: {
          DEFAULT: '#FAFBFB',
          pure: '#FFFFFF',
        },
        gold: {
          DEFAULT: '#C9A24D',
          hover: '#B58E3C',
          light: '#FBF7ED',
        },
        success: {
          DEFAULT: '#2A7A5B',
          light: '#EDF7F2',
        },
        alert: {
          DEFAULT: '#B83A3A',
          light: '#FDF2F2',
        },

        // Legacy / Palette Aliases for components
        health: {
          50: '#F0F6F8',
          100: '#DCEBF0',
          200: '#BDDAE4',
          300: '#9EBAD1',
          400: '#5C90A8',
          500: '#1B5263',
          600: '#0E3E4F',
          700: '#0B3441',
          800: '#07242E',
          900: '#061017',
          950: '#030C10',
        },
        surface: {
          DEFAULT: '#FFFFFF',
          muted: '#FAFBFB',
          card: '#FFFFFF',
          border: 'rgba(6, 16, 23, 0.10)',
          borderDark: '#CBD7DC',
        },
        accent: {
          light: '#FBF7ED',
          DEFAULT: '#C9A24D',
          hover: '#B58E3C',
          dark: '#7D6025',
        },
        skydata: {
          50: '#F2F7FB',
          100: '#E2EEF7',
          200: '#C5DDEE',
          DEFAULT: '#9EBAD1',
          dark: '#39679B',
        },
        status: {
          success: '#2A7A5B',
          warning: '#C9A24D',
          danger: '#B83A3A',
          info: '#39679B',
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        serif: ['"Source Serif 4"', 'Georgia', 'serif'],
        display: ['"Source Serif 4"', 'Georgia', 'serif'],
      },
      boxShadow: {
        hairline: '0 0 0 1px rgba(6, 16, 23, 0.10)',
        drawer: '-8px 0 32px rgba(6, 16, 23, 0.12)',
        soft: '0 1px 3px rgba(6, 16, 23, 0.05)',
        luxury: '0 16px 36px -12px rgba(11, 52, 65, 0.12), 0 0 0 1px rgba(6, 16, 23, 0.08)',
      },
      borderRadius: {
        panel: '18px',
        xl: '0.875rem',
        '2xl': '1.125rem',
        '3xl': '1.5rem',
        full: '999px',
      },
    },
  },
  plugins: [],
};
