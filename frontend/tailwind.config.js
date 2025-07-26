/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: ["class"],
  content: [
    './pages/**/*.{js,jsx}',
    './components/**/*.{js,jsx}',
    './app/**/*.{js,jsx}',
    './src/**/*.{js,jsx}',
  ],
  prefix: "",
  theme: {
    container: {
      center: true,
      padding: "2rem",
      screens: {
        "2xl": "1400px",
      },
    },
    extend: {
      colors: {
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        primary: {
          DEFAULT: "hsl(var(--primary))",
          foreground: "hsl(var(--primary-foreground))",
          50: '#f0f0ff',
          100: '#e0e0ff',
          200: '#c7c7ff',
          300: '#a0a0ff',
          400: '#7c7cff',
          500: '#4f46e5',
          600: '#4338ca',
          700: '#3730a3',
          800: '#312e81',
          900: '#1e1b4b',
          950: '#0f0d2a',
        },
        secondary: {
          DEFAULT: "hsl(var(--secondary))",
          foreground: "hsl(var(--secondary-foreground))",
          50: '#faf5ff',
          100: '#f3e8ff',
          200: '#e9d5ff',
          300: '#d8b4fe',
          400: '#c084fc',
          500: '#7c3aed',
          600: '#7c3aed',
          700: '#6d28d9',
          800: '#5b21b6',
          900: '#4c1d95',
          950: '#2e1065',
        },
        destructive: {
          DEFAULT: "hsl(var(--destructive))",
          foreground: "hsl(var(--destructive-foreground))",
        },
        muted: {
          DEFAULT: "hsl(var(--muted))",
          foreground: "hsl(var(--muted-foreground))",
        },
        accent: {
          DEFAULT: "hsl(var(--accent))",
          foreground: "hsl(var(--accent-foreground))",
          50: '#fdf2f8',
          100: '#fce7f3',
          200: '#fbcfe8',
          300: '#f9a8d4',
          400: '#f472b6',
          500: '#ec4899',
          600: '#db2777',
          700: '#be185d',
          800: '#9d174d',
          900: '#831843',
          950: '#500724',
        },
        popover: {
          DEFAULT: "hsl(var(--popover))",
          foreground: "hsl(var(--popover-foreground))",
        },
        card: {
          DEFAULT: "hsl(var(--card))",
          foreground: "hsl(var(--card-foreground))",
        },
      },
      backgroundImage: {
        'vr-gradient': 'linear-gradient(135deg, #4f46e5 0%, #7c3aed 50%, #ec4899 100%)',
        'vr-gradient-subtle': 'linear-gradient(135deg, rgba(79, 70, 229, 0.1) 0%, rgba(124, 58, 237, 0.1) 50%, rgba(236, 72, 153, 0.1) 100%)',
        'vr-gradient-dark': 'linear-gradient(135deg, #312e81 0%, #5b21b6 50%, #831843 100%)',
        'glass-gradient': 'linear-gradient(135deg, rgba(255, 255, 255, 0.1) 0%, rgba(255, 255, 255, 0.05) 100%)',
        'marketplace-bg': 'radial-gradient(ellipse at top, rgba(124, 58, 237, 0.15) 0%, rgba(15, 23, 42, 0.9) 50%, rgba(15, 23, 42, 1) 100%)',
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
      },
      keyframes: {
        "accordion-down": {
          from: { height: "0" },
          to: { height: "var(--radix-accordion-content-height)" },
        },
        "accordion-up": {
          from: { height: "var(--radix-accordion-content-height)" },
          to: { height: "0" },
        },
        "fade-in": {
          "0%": { opacity: "0", transform: "translateY(10px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        "slide-up": {
          "0%": { opacity: "0", transform: "translateY(20px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        "scale-in": {
          "0%": { opacity: "0", transform: "scale(0.95)" },
          "100%": { opacity: "1", transform: "scale(1)" },
        },
        "float": {
          "0%, 100%": { transform: "translateY(0px)" },
          "50%": { transform: "translateY(-10px)" },
        },
        "glow": {
          "0%, 100%": { boxShadow: "0 0 20px rgba(124, 58, 237, 0.5)" },
          "50%": { boxShadow: "0 0 40px rgba(124, 58, 237, 0.8)" },
        },
        "shimmer": {
          "0%": { backgroundPosition: "-200% 0" },
          "100%": { backgroundPosition: "200% 0" },
        },
      },
      animation: {
        "accordion-down": "accordion-down 0.2s ease-out",
        "accordion-up": "accordion-up 0.2s ease-out",
        "fade-in": "fade-in 0.5s ease-out",
        "slide-up": "slide-up 0.5s ease-out",
        "scale-in": "scale-in 0.3s ease-out",
        "float": "float 3s ease-in-out infinite",
        "glow": "glow 2s ease-in-out infinite",
        "shimmer": "shimmer 2s linear infinite",
      },
      boxShadow: {
        'vr': '0 25px 50px -12px rgba(124, 58, 237, 0.25)',
        'vr-lg': '0 35px 60px -12px rgba(124, 58, 237, 0.35)',
        'glass': '0 8px 32px 0 rgba(31, 38, 135, 0.37)',
        'glow': '0 0 30px rgba(124, 58, 237, 0.5)',
        'glow-pink': '0 0 30px rgba(236, 72, 153, 0.5)',
        'inner-glow': 'inset 0 2px 4px 0 rgba(124, 58, 237, 0.2)',
      },
      backdropBlur: {
        'xs': '2px',
        'vr': '20px',
      },
      fontSize: {
        'xs': ['0.75rem', { lineHeight: '1rem' }],
        'sm': ['0.875rem', { lineHeight: '1.25rem' }],
        'base': ['1rem', { lineHeight: '1.5rem' }],
        'lg': ['1.125rem', { lineHeight: '1.75rem' }],
        'xl': ['1.25rem', { lineHeight: '1.75rem' }],
        '2xl': ['1.5rem', { lineHeight: '2rem' }],
        '3xl': ['1.875rem', { lineHeight: '2.25rem' }],
        '4xl': ['2.25rem', { lineHeight: '2.5rem' }],
        '5xl': ['3rem', { lineHeight: '1' }],
        '6xl': ['3.75rem', { lineHeight: '1' }],
      },
      spacing: {
        '18': '4.5rem',
        '88': '22rem',
        '128': '32rem',
      },
      zIndex: {
        '60': '60',
        '70': '70',
        '80': '80',
        '90': '90',
        '100': '100',
      },
      backgroundSize: {
        'size-200': '200% 200%',
      },
    },
  },
  plugins: [
    require("tailwindcss-animate"),
    function({ addUtilities }) {
      const newUtilities = {
        '.bg-size-200': {
          'background-size': '200% 200%',
        },
        '.text-gradient-vr': {
          'background': 'linear-gradient(135deg, #4f46e5 0%, #7c3aed 50%, #ec4899 100%)',
          '-webkit-background-clip': 'text',
          '-webkit-text-fill-color': 'transparent',
          'background-clip': 'text',
        },
        '.glass-card': {
          'background': 'rgba(255, 255, 255, 0.05)',
          'backdrop-filter': 'blur(20px)',
          '-webkit-backdrop-filter': 'blur(20px)',
          'border': '1px solid rgba(255, 255, 255, 0.1)',
          'box-shadow': '0 8px 32px 0 rgba(31, 38, 135, 0.37)',
        },
        '.btn-vr': {
          'background': 'linear-gradient(135deg, #4f46e5 0%, #7c3aed 50%, #ec4899 100%)',
          'color': 'white',
          'border': 'none',
          'border-radius': '0.75rem',
          'font-weight': '600',
          'transition': 'all 0.3s ease',
          'box-shadow': '0 4px 14px 0 rgba(124, 58, 237, 0.4)',
          '&:hover': {
            'transform': 'translateY(-2px)',
            'box-shadow': '0 8px 25px 0 rgba(124, 58, 237, 0.6)',
          },
          '&:active': {
            'transform': 'translateY(0)',
          },
        },
        '.btn-outline-vr': {
          'background': 'transparent',
          'color': 'white',
          'border': '2px solid rgba(124, 58, 237, 0.5)',
          'border-radius': '0.75rem',
          'font-weight': '600',
          'transition': 'all 0.3s ease',
          'backdrop-filter': 'blur(10px)',
          '&:hover': {
            'background': 'linear-gradient(135deg, #4f46e5 0%, #7c3aed 50%, #ec4899 100%)',
            'border-color': 'transparent',
            'transform': 'translateY(-2px)',
            'box-shadow': '0 8px 25px 0 rgba(124, 58, 237, 0.4)',
          },
        },
      }
      addUtilities(newUtilities)
    }
  ],
}
