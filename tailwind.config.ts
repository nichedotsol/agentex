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
        // Primary brand colors - more sophisticated
        'ax-primary': '#6366f1', // Indigo
        'ax-primary-hover': '#818cf8',
        'ax-primary-light': '#a5b4fc',
        'ax-accent': '#10b981', // Emerald
        'ax-accent-hover': '#34d399',
        
        // Neutral palette - professional grays
        'ax-bg': '#0a0a0a',
        'ax-bg-elevated': '#111111',
        'ax-bg-hover': '#1a1a1a',
        'ax-border': '#1f1f1f',
        'ax-border-hover': '#2a2a2a',
        'ax-text': '#fafafa',
        'ax-text-secondary': '#a3a3a3',
        'ax-text-tertiary': '#737373',
        
        // Semantic colors
        'ax-success': '#10b981',
        'ax-warning': '#f59e0b',
        'ax-error': '#ef4444',
        'ax-info': '#3b82f6',
      },
      fontFamily: {
        sans: ['var(--font-geist)', 'var(--font-inter)', 'system-ui', 'sans-serif'],
        mono: ['var(--font-geist-mono)', 'monospace'],
      },
      animation: {
        'fade-in': 'fadeIn 0.3s ease-out',
        'slide-up': 'slideUp 0.4s ease-out',
        'pulse-subtle': 'pulseSubtle 2s ease-in-out infinite',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { opacity: '0', transform: 'translateY(10px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        pulseSubtle: {
          '0%, 100%': { opacity: '1' },
          '50%': { opacity: '0.8' },
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
