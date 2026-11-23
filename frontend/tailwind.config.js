/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        canvas: {
          DEFAULT: 'var(--bg-canvas)',
          subtle: 'var(--bg-canvas-subtle)',
        },
        surface: {
          1: 'var(--surface-1)',
          2: 'var(--surface-2)',
          3: 'var(--surface-3)',
        },
        stroke: {
          muted: 'var(--stroke-muted)',
          active: 'var(--stroke-active)',
        },
        accent: {
          DEFAULT: 'var(--accent-primary)',
          electric: 'var(--accent-electric)',
          dim: 'var(--accent-dim)',
          hover: '#059669',
        },
        text: {
          primary: 'var(--text-primary)',
          secondary: 'var(--text-secondary)',
          muted: 'var(--text-muted)',
        },
        status: {
          success: '#10b981',
          warning: '#f59e0b',
          error: '#ef4444',
          info: '#38bdf8',
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'sans-serif'],
        mono: ['"JetBrains Mono"', '"Fira Code"', 'monospace'],
      },
      boxShadow: {
        ambient: '0 4px 20px -2px rgba(0, 0, 0, 0.5), 0 0 0 1px var(--stroke-muted)',
        float: '0 12px 32px -4px rgba(0, 0, 0, 0.7), 0 0 0 1px var(--stroke-active)',
        modal: '0 24px 64px -12px rgba(0, 0, 0, 0.85), 0 0 0 1px var(--stroke-active)',
        glow: '0 0 16px -2px rgba(0, 255, 136, 0.25)',
      },
      borderRadius: {
        DEFAULT: '8px',
      },
    },
  },
  plugins: [],
};
