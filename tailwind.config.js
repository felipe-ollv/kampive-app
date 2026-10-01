/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: 'class',
  content: ['./src/**/*.{js,jsx,ts,tsx}'],
  presets: [require('nativewind/preset')],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: '#07241a',
          dark: '#142921',
          light: '#2d5444',
          container: '#e1e9e2',
          on_container: '#0c2018',
        },
        secondary: {
          DEFAULT: '#a23f0f',
          hover: '#a63e10',
          container: '#ffdbce',
          on_secondary: '#ffffff',
        },
        surface: {
          DEFAULT: '#fbf9f4',
          low: '#f5f3ee',
          container: '#f0eee9',
          high: '#eae8e3',
          card: '#ffffff',
        },
        ink: { DEFAULT: '#1b1c19', variant: '#424844', muted: '#727974', inverse: '#fbf9f4' },
        line: '#e4e2dd',
      },
      fontFamily: {
        jakarta: ['PlusJakartaSans_400Regular'],
        medium: ['PlusJakartaSans_500Medium'],
        semibold: ['PlusJakartaSans_600SemiBold'],
        bold: ['PlusJakartaSans_700Bold'],
        display: ['PlusJakartaSans_800ExtraBold'],
      },
    },
  },
  plugins: [],
};
