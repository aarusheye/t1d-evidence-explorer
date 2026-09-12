/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class',
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        // Color-blind-safe palette (Okabe-Ito derived) for risk tiers
        risk: {
          low: '#0072B2', // blue
          moderate: '#E69F00', // orange
          high: '#D55E00', // vermillion
          veryhigh: '#CC79A7', // reddish purple
        },
        brand: {
          50: '#eef6ff',
          100: '#d9eaff',
          500: '#2563eb',
          600: '#1d4ed8',
          700: '#1e40af',
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'Avenir', 'Helvetica', 'Arial', 'sans-serif'],
      },
    },
  },
  plugins: [],
};
