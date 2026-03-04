/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        mil: {
          bg: '#0a0e14',
          panel: '#0d1117',
          border: '#1e2a3a',
          accent: '#00b4d8',
          green: '#00ff88',
          red: '#ff3333',
          yellow: '#ffd600',
          orange: '#ff8c00',
          dim: '#4a5568',
        }
      },
      fontFamily: {
        mono: ['JetBrains Mono', 'Consolas', 'monospace'],
      }
    },
  },
  plugins: [],
}
