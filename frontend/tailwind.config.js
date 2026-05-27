/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./src/**/*.{js,jsx,ts,tsx}'],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        cine: {
          bg: '#0a0a0f',
          surface: '#12121a',
          card: '#1a1a26',
          border: '#2a2a3d',
          gold: '#f5c518',
          'gold-dark': '#c49a14',
          accent: '#e50914',
          'accent-dark': '#b20710',
          text: '#e8e8f0',
          muted: '#8888aa',
        },
      },
      fontFamily: {
        display: ['"Bebas Neue"', 'cursive'],
        body: ['"DM Sans"', 'sans-serif'],
        mono: ['"JetBrains Mono"', 'monospace'],
      },
      backgroundImage: {
        'hero-gradient': 'linear-gradient(135deg, #0a0a0f 0%, #12121a 50%, #0f0f1a 100%)',
        'card-gradient': 'linear-gradient(180deg, transparent 0%, rgba(10,10,15,0.9) 100%)',
        'gold-gradient': 'linear-gradient(90deg, #f5c518, #c49a14)',
      },
      animation: {
        'fade-in': 'fadeIn 0.5s ease-out',
        'slide-up': 'slideUp 0.5s ease-out',
        'pulse-slow': 'pulse 3s infinite',
        shimmer: 'shimmer 2s infinite',
        float: 'float 6s ease-in-out infinite',
      },
      keyframes: {
        fadeIn: { from: { opacity: '0' }, to: { opacity: '1' } },
        slideUp: { from: { opacity: '0', transform: 'translateY(20px)' }, to: { opacity: '1', transform: 'translateY(0)' } },
        shimmer: {
          '0%': { backgroundPosition: '-200% 0' },
          '100%': { backgroundPosition: '200% 0' },
        },
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-10px)' },
        },
      },
      boxShadow: {
        glow: '0 0 30px rgba(245, 197, 24, 0.3)',
        'glow-red': '0 0 30px rgba(229, 9, 20, 0.3)',
        card: '0 8px 32px rgba(0, 0, 0, 0.5)',
      },
    },
  },
  plugins: [],
};
