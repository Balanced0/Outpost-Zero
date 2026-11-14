/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      fontFamily: {
        sans: ['"Plus Jakarta Sans"', '-apple-system', 'BlinkMacSystemFont', '"Segoe UI"', 'Roboto', 'sans-serif'],
        display: ['"Space Grotesk"', '"Plus Jakarta Sans"', 'sans-serif'],
        mono: ['"JetBrains Mono"', 'ui-monospace', 'SFMono-Regular', 'Menlo', 'Monaco', 'Consolas', 'monospace'],
      },
      keyframes: {
        'fade-in': {
          '0%': { opacity: '0', transform: 'translateY(6px) scale(0.99)' },
          '100%': { opacity: '1', transform: 'translateY(0) scale(1)' },
        },
        'modal-in': {
          '0%': { opacity: '0', transform: 'translateY(14px) scale(0.96)' },
          '100%': { opacity: '1', transform: 'translateY(0) scale(1)' },
        },
        'pulse-subtle': {
          '0%, 100%': { opacity: '1' },
          '50%': { opacity: '0.65' },
        },
        'float-slow': {
          '0%, 100%': { transform: 'translateY(0px) rotate(0deg)' },
          '50%': { transform: 'translateY(-10px) rotate(1.5deg)' },
        },
        'float-medium': {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-5px)' },
        },
        'shimmer': {
          '0%': { transform: 'translateX(-120%) skewX(-15deg)' },
          '100%': { transform: 'translateX(220%) skewX(-15deg)' },
        },
        'radar-sweep': {
          '0%': { transform: 'rotate(0deg)' },
          '100%': { transform: 'rotate(360deg)' },
        },
        'orbit-reverse': {
          '0%': { transform: 'rotate(360deg)' },
          '100%': { transform: 'rotate(0deg)' },
        },
        'twinkle': {
          '0%, 100%': { opacity: '0.25', transform: 'scale(0.85)' },
          '50%': { opacity: '1', transform: 'scale(1.25)' },
        },
        'meteor': {
          '0%': { transform: 'translateX(0) translateY(0) rotate(-35deg)', opacity: '0' },
          '10%': { opacity: '1' },
          '40%': { transform: 'translateX(-420px) translateY(290px) rotate(-35deg)', opacity: '0' },
          '100%': { transform: 'translateX(-420px) translateY(290px) rotate(-35deg)', opacity: '0' },
        },
        'scanline': {
          '0%': { transform: 'translateY(-100%)' },
          '100%': { transform: 'translateY(400%)' },
        },
        'glow-pulse': {
          '0%, 100%': { filter: 'drop-shadow(0 0 8px rgba(249,115,22,0.45))' },
          '50%': { filter: 'drop-shadow(0 0 20px rgba(249,115,22,0.85))' },
        },
      },
      animation: {
        'fade-in': 'fade-in 0.25s cubic-bezier(0.16, 1, 0.3, 1) forwards',
        'modal-in': 'modal-in 0.36s cubic-bezier(0.16, 1, 0.3, 1) forwards',
        'pulse-subtle': 'pulse-subtle 2.4s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'float-slow': 'float-slow 6s ease-in-out infinite',
        'float-medium': 'float-medium 3.6s ease-in-out infinite',
        'shimmer': 'shimmer 3.2s cubic-bezier(0.4, 0, 0.2, 1) infinite',
        'radar-sweep': 'radar-sweep 8s linear infinite',
        'spin-slow': 'radar-sweep 28s linear infinite',
        'spin-slower': 'radar-sweep 55s linear infinite',
        'orbit-reverse': 'orbit-reverse 36s linear infinite',
        'twinkle': 'twinkle 3.2s ease-in-out infinite',
        'meteor': 'meteor 7s linear infinite',
        'scanline': 'scanline 4.5s linear infinite',
        'glow-pulse': 'glow-pulse 3s ease-in-out infinite',
      },
    },
  },
  plugins: [],
}
