/** @type {import('tailwindcss').Config} */
export default {
    content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
    theme: {
      extend: {
        fontFamily: {
          display: ['"DM Serif Display"', 'Georgia', 'serif'],
          sans: ['Outfit', 'system-ui', 'sans-serif'],
        },
        colors: {
          ocean: {
            50: '#eefbf8',
            100: '#d5f5ed',
            200: '#aeeadc',
            300: '#7ad9c6',
            400: '#45c1ac',
            500: '#28a593',
            600: '#1d8578',
            700: '#1b6a62',
            800: '#1a5550',
            900: '#1a4743',
            950: '#0f2e2b',
          },
          sand: {
            50: '#fdfbf7',
            100: '#faf6f0',
            200: '#f3efe8',
            300: '#e8dfd3',
            400: '#d9c9b8',
            500: '#c5ad96',
            600: '#b5977d',
            700: '#8b6d5a',
            800: '#735a4c',
            900: '#5f4b41',
          },
          wood: {
            light: '#d4b896',
            DEFAULT: '#9a7b4f',
            dark: '#5c4610',
          },
          palm: '#1a5550',
        },
        backgroundImage: {
          'wood-grain':
            'url("data:image/svg+xml,%3Csvg width=\'60\' height=\'60\' viewBox=\'0 0 60 60\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cg fill=\'none\' fill-rule=\'evenodd\'%3E%3Cg fill=\'%239a7b4f\' fill-opacity=\'0.04\'%3E%3Cpath d=\'M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z\'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")',
          'gradient-island':
            'linear-gradient(165deg, #fdfbf7 0%, #f5f1eb 25%, #eef8f5 55%, #d8f0ea 85%, #c5e9e0 100%)',
          'gradient-ocean':
            'linear-gradient(135deg, #1a5550 0%, #1d8578 50%, #28a593 100%)',
          'gradient-sand-ocean':
            'linear-gradient(180deg, #faf6f0 0%, #f0f9f6 50%, #e5f5f0 100%)',
          'gradient-menu':
            'linear-gradient(180deg, #fdfbf8 0%, #f8f5f0 30%, #eef9f6 70%, #e0f4ef 100%)',
          'wave-pattern':
            'url("data:image/svg+xml,%3Csvg xmlns=\'http://www.w3.org/2000/svg\' viewBox=\'0 0 1440 320\'%3E%3Cpath fill=\'%231a5550\' fill-opacity=\'0.03\' d=\'M0,160L48,176C96,192,192,224,288,213.3C384,203,480,149,576,138.7C672,128,768,160,864,165.3C960,171,1056,149,1152,138.7C1248,128,1344,128,1392,128L1440,128L1440,320L1392,320C1344,320,1248,320,1152,320C1056,320,960,320,864,320C768,320,672,320,576,320C480,320,384,320,288,320C192,320,96,320,48,320L0,320Z\'%3E%3C/path%3E%3C/svg%3E")',
          'palm-pattern':
            'url("data:image/svg+xml,%3Csvg width=\'80\' height=\'80\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cpath d=\'M40 8c-2 4-6 12-6 20s2 16 4 20c-4-2-8-8-8-16s2-14 4-18c-2 4-4 10-4 16 0 6 2 10 4 12-2-1-4-5-4-10 0-4 2-8 4-10z\' fill=\'%231a5550\' fill-opacity=\'0.035\'/%3E%3C/svg%3E")',
          'sand-dots':
            'radial-gradient(circle at 1px 1px, rgba(26,85,80,0.04) 1px, transparent 0)',
        },
        backgroundSize: {
          'sand-dots': '24px 24px',
        },
        boxShadow: {
          island:
            '0 4px 20px -4px rgba(26, 85, 80, 0.12), 0 0 0 1px rgba(26, 85, 80, 0.05)',
          'island-lg':
            '0 20px 50px -12px rgba(26, 85, 80, 0.18), 0 0 0 1px rgba(26, 85, 80, 0.06)',
          'island-xl':
            '0 25px 60px -15px rgba(26, 85, 80, 0.2), 0 0 0 1px rgba(26, 85, 80, 0.08)',
          inner: 'inset 0 2px 4px 0 rgba(26, 85, 80, 0.04)',
          'card-hover': '0 12px 40px -10px rgba(26, 85, 80, 0.2)',
        },
        borderRadius: {
          '2xl': '1rem',
          '3xl': '1.5rem',
          '4xl': '2rem',
        },
        animation: {
          'fade-in': 'fadeIn 0.4s ease-out',
          'slide-up': 'slideUp 0.4s ease-out',
          'slide-in-right': 'slideInRight 0.3s ease-out',
          float: 'float 4s ease-in-out infinite',
        },
        keyframes: {
          fadeIn: {
            '0%': { opacity: '0' },
            '100%': { opacity: '1' },
          },
          slideUp: {
            '0%': { opacity: '0', transform: 'translateY(12px)' },
            '100%': { opacity: '1', transform: 'translateY(0)' },
          },
          slideInRight: {
            '0%': { transform: 'translateX(100%)' },
            '100%': { transform: 'translateX(0)' },
          },
          float: {
            '0%, 100%': { transform: 'translateY(0)' },
            '50%': { transform: 'translateY(-6px)' },
          },
        },
        transitionDuration: {
          400: '400ms',
        },
      },
    },
    plugins: [],
  }
  