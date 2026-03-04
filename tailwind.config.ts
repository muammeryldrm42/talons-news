import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      fontFamily: {
        mono:    ['var(--font-mono)', 'JetBrains Mono', 'monospace'],
        display: ['var(--font-display)', 'Outfit', 'sans-serif'],
        sans:    ['var(--font-display)', 'Outfit', 'sans-serif'],
      },
      colors: {
        cyber: {
          400: '#22d3ee',
          500: '#06b6d4',
          600: '#0891b2',
        },
      },
      animation: {
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
      },
    },
  },
  plugins: [],
}

export default config
