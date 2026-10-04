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
        },
        // Sapphire Clinic Palette (Clean Minimalist Clinic)
        sapphire: {
          50: '#EFF6FF',
          100: '#DBEAFE',
          200: '#BFDBFE',
          300: '#93C5FD',
          400: '#60A5FA',
          500: '#3B82F6',
          600: '#2563EB',
          700: '#1D4ED8',
          800: '#1E40AF',
          900: '#1E3A8A',
          DEFAULT: '#1D4ED8',
        },
        clinic: {
          canvas: '#F8FAFC',
          surface: '#FFFFFF',
          card: '#FFFFFF',
          border: 'rgba(226, 232, 240, 0.85)',
          subtle: '#F1F5F9',
          text: '#0F172A',
          muted: '#64748B',
          accent: '#0284C7',
        },
      },
      fontFamily: {
        sans: ['"Plus Jakarta Sans"', 'Inter', 'system-ui', 'sans-serif'],
        serif: ['"Source Serif 4"', 'Georgia', 'serif'],
        display: ['"Plus Jakarta Sans"', 'Inter', 'sans-serif'],
      },
      boxShadow: {
        hairline: '0 0 0 1px rgba(226, 232, 240, 0.9)',
        drawer: '-8px 0 32px rgba(15, 23, 42, 0.08)',
        soft: '0 2px 8px rgba(15, 23, 42, 0.04)',
        clinic: '0 4px 20px -2px rgba(15, 23, 42, 0.04), 0 1px 3px rgba(15, 23, 42, 0.02)',
        luxury: '0 16px 36px -12px rgba(29, 78, 216, 0.10), 0 0 0 1px rgba(226, 232, 240, 0.8)',
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
