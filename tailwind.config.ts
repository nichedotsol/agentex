import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        'ax-cyan': '#00ff9f',
        'ax-cyan-dim': '#00ff9f80',
        'ax-red': '#ff0055',
        'ax-blue': '#00d9ff',
        'ax-bg': '#000000',
        'ax-bg-elevated': '#0a0a0a',
        'ax-border': '#1a1a1a',
        'ax-text': '#ffffff',
        'ax-text-dim': '#666666',
      },
      fontFamily: {
        sans: ['var(--font-inter)'],
        mono: ['var(--font-jetbrains)'],
        pixel: ['var(--font-vt323)'],
      },
      animation: {
        'scanline': 'scanline 8s linear infinite',
        'pulse-slow': 'pulse 2s ease-in-out infinite',
        'glitch': 'glitch 3s infinite',
        'float': 'float 6s ease-in-out infinite',
        'rgb-shift': 'rgb-shift 2s infinite',
      },
      keyframes: {
        scanline: {
          '0%': { transform: 'translateY(0)' },
          '100%': { transform: 'translateY(10px)' },
        },
        glitch: {
          '0%, 100%': { transform: 'translate(0)' },
          '33%': { transform: 'translate(-2px, 2px)' },
          '66%': { transform: 'translate(2px, -2px)' },
        },
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-10px)' },
        },
        'rgb-shift': {
          '0%, 100%': { 
            textShadow: '2px 0 0 rgba(255, 0, 85, 0.75), -2px 0 0 rgba(0, 255, 159, 0.75)' 
          },
          '50%': { 
            textShadow: '-2px 0 0 rgba(255, 0, 85, 0.75), 2px 0 0 rgba(0, 255, 159, 0.75)' 
          },
        },
      },
      backdropBlur: {
        xs: '2px',
      },
    },
  },
  plugins: [],
}
export default config
