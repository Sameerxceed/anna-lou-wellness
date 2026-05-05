import type { Config } from 'tailwindcss';

const config: Config = {
  content: [
    './app/**/*.{js,ts,jsx,tsx}',
    './src/**/*.{js,ts,jsx,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        // Brand primary colours
        brand: {
          black: '#231F20',
          plum: '#6E3A5A',
          amber: '#FAA21B',
          blue: '#7BAFDD',
          pink: '#F280AA',
          green: '#5DCAA5',
          gold: '#FFD07A',
        },
        // Pastel tints (backgrounds & sections)
        blush: '#FFDCDE',
        cream: '#FFF0D2',
        lavender: '#E9EBF6',
        'soft-pink': '#FCE8EF',
        mint: '#E1F5EE',
        // Neutrals
        'warm-neutral': '#F5F3EF',
        'warm-cream': '#D5D0C8',
        'mid-grey': '#8C8880',
        'dark-grey': '#3D3D3A',
        ink: '#231F20',
        // Functional aliases
        accent: {
          DEFAULT: '#6E3A5A',
          light: '#8B5A7A',
          dark: '#5A2E4A',
        },
      },
      fontFamily: {
        // Work Sans — headings & titles (replaces Nobel)
        display: ['"Work Sans"', '"Helvetica Neue"', 'Arial', 'sans-serif'],
        // Work Sans — body text
        body: ['"Work Sans"', '"Helvetica Neue"', 'Arial', 'sans-serif'],
        // EB Garamond — editorial, product names
        editorial: ['"EB Garamond"', 'Garamond', 'Georgia', 'serif'],
        // Mulish — UI: nav, prices, CTAs (replaces Proxima Nova)
        sans: ['Mulish', 'system-ui', 'sans-serif'],
      },
      fontSize: {
        'hero': 'clamp(3rem, 8vw, 7rem)',
        'page-title': 'clamp(2.5rem, 6vw, 5rem)',
        'section-title': 'clamp(2.2rem, 5vw, 3.8rem)',
        'label': '0.65rem',
      },
      letterSpacing: {
        'wide-xl': '0.25em',
        'wide-2xl': '0.35em',
      },
      animation: {
        'fade-up': 'fadeUp 1.2s cubic-bezier(0.22, 1, 0.36, 1) forwards',
        'fade-in': 'fadeIn 1s ease forwards',
        'scroll-bounce': 'scrollBounce 2.5s ease-in-out infinite',
      },
      keyframes: {
        fadeUp: {
          from: { opacity: '0', transform: 'translateY(30px)' },
          to: { opacity: '1', transform: 'translateY(0)' },
        },
        fadeIn: {
          to: { opacity: '1' },
        },
        scrollBounce: {
          '0%, 100%': { transform: 'translateX(-50%) translateY(0)' },
          '50%': { transform: 'translateX(-50%) translateY(8px)' },
        },
      },
    },
  },
  plugins: [],
};

export default config;
