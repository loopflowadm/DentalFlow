/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class',
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        slate: {
          50: '#f4f7fb',
          100: '#eaeff5',
          200: '#dbe3ed',
          300: '#cbd5e1',
          400: '#94a3b8',
          500: '#64748b',
          600: '#475569',
          700: '#334155',
          800: '#161e2e',    /* Midnight border */
          850: '#0f1624',    /* Midnight card surface */
          900: '#080d19',    /* Midnight sidebar/header */
          950: '#05070f',    /* Midnight deep background */
        },
        'slate-850': '#0f1624',
        primary: 'rgb(var(--color-primary) / <alpha-value>)',
        secondary: 'rgb(var(--color-secondary) / <alpha-value>)',
        accent: 'rgb(var(--color-accent) / <alpha-value>)',
        background: 'rgb(var(--color-background) / <alpha-value>)',
        surface: 'rgb(var(--color-surface) / <alpha-value>)',
        border: 'rgb(var(--color-border) / <alpha-value>)',
        success: 'rgb(var(--color-success) / <alpha-value>)',
        warning: 'rgb(var(--color-warning) / <alpha-value>)',
        danger: 'rgb(var(--color-danger) / <alpha-value>)',
        info: 'rgb(var(--color-info) / <alpha-value>)',
        // Redirecionando violet e indigo para a nova paleta de cores oficial
        violet: {
          50: '#f0f5ff',
          100: '#D9E2FF', // Ice Blue
          200: '#bcd0ff',
          300: '#90b3ff',
          400: '#5a91ff',
          500: '#196BFB', // Electric Blue
          600: '#0e54d6', // Royal/Medium Blue
          700: '#03269A', // Navy Blue
          750: '#021e7d', // Navy Hover
          800: '#021a6b',
          900: '#011042',
          950: '#000926',
        },
        indigo: {
          50: '#f0f5ff',
          100: '#D9E2FF', // Ice Blue
          200: '#bcd0ff',
          300: '#90b3ff',
          400: '#5a91ff',
          500: '#196BFB', // Electric Blue
          600: '#0e54d6', // Royal/Medium Blue
          700: '#03269A', // Navy Blue
          750: '#021e7d',
          800: '#021a6b',
          900: '#011042',
          950: '#000926',
        },
      },
      fontFamily: {
        title: ['Outfit', 'Geist', 'sans-serif'],
        body: ['Inter', 'Manrope', 'sans-serif'],
        geist: ['Geist', 'sans-serif'],
        manrope: ['Manrope', 'sans-serif'],
      },
    },
  },
  plugins: [],
}
