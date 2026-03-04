/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './App.{js,ts,tsx}',
    './src/**/*.{js,ts,tsx}',
  ],
  presets: [require('nativewind/preset')],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        danger: '#dc2626',
        success: '#16a34a',
        warning: '#d97706',
        info: '#2563eb',
      },
    },
  },
  plugins: [],
};
