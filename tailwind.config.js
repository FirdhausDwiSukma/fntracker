/** @type {import('tailwindcss').Config} */
export default {
  content: [
    './index.html',
    './src/**/*.{js,ts,jsx,tsx}',
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        primary: '#FACC15',   // Yellow — main accent
        dark: '#000000',      // Black — borders, text
        light: '#FFFFFF',     // White — backgrounds
        danger: '#EF4444',    // Red — errors, destructive actions
        'gray-neo': '#F5F5F5', // Light gray — subtle backgrounds
        success: '#22C55E',   // Green — success states
      },
      boxShadow: {
        'neo-sm': '2px 2px 0px #000000',
        'neo':    '4px 4px 0px #000000',
        'neo-lg': '8px 8px 0px #000000',
      },
      borderWidth: {
        'neo':       '2px',
        'neo-thick': '4px',
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        mono: ['JetBrains Mono', 'monospace'],
      },
    },
  },
  plugins: [],
}
