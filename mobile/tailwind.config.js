/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./app/**/*.{js,jsx,ts,tsx}", "./components/**/*.{js,jsx,ts,tsx}"],
  presets: [require("nativewind/preset")],
  theme: {
    extend: {
      colors: {
        // Dark Spiritual Palette
        background: {
          DEFAULT: '#0F172A', // Primary dark background
          50: '#F8FAFC',
          100: '#F1F5F9',
          200: '#E2E8F0',
          300: '#CBD5E1',
          400: '#94A3B8',
          500: '#64748B',
          600: '#475569',
          700: '#334155',
          800: '#1E293B', // Secondary surface
          900: '#0F172A',
        },
        surface: {
          DEFAULT: '#1E293B', // Secondary surface
          50: '#F1F5F9',
          100: '#E2E8F0',
          200: '#CBD5E1',
          300: '#94A3B8',
          glass: 'rgba(30, 41, 59, 0.7)',
          glassDark: 'rgba(15, 23, 42, 0.8)',
        },
        // Spiritual Gold Accent
        gold: {
          DEFAULT: '#EAB308',
          50: '#FEFCE8',
          100: '#FEF9C3',
          200: '#FEF08A',
          300: '#FDE047',
          400: '#FACC15',
          500: '#EAB308',
          600: '#CA8A04',
          700: '#A16207',
        },
        // Calm Blue Highlight
        blue: {
          DEFAULT: '#3B82F6',
          50: '#EFF6FF',
          100: '#DBEAFE',
          200: '#BFDBFE',
          300: '#93C5FD',
          400: '#60A5FA',
          500: '#3B82F6',
          600: '#2563EB',
          700: '#1D4ED8',
        },
        // Text Colors
        text: {
          primary: '#F8FAFC', // Light primary
          secondary: '#E2E8F0', // Light secondary
          muted: '#94A3B8', // Muted text
          subtle: '#64748B', // Subtle text
        },
        // Extended palette
        primary: {
          DEFAULT: '#0F172A',
          50: '#F8FAFC',
          100: '#F1F5F9',
          200: '#E2E8F0',
          300: '#CBD5E1',
          400: '#94A3B8',
          500: '#64748B',
          600: '#475569',
          700: '#334155',
          800: '#1E293B',
          900: '#0F172A',
        },
        secondary: {
          DEFAULT: '#1E293B',
          50: '#F8FAFC',
          100: '#F1F5F9',
          200: '#E2E8F0',
          300: '#CBD5E1',
          400: '#94A3B8',
          500: '#64748B',
          600: '#475569',
          700: '#334155',
          800: '#1E293B',
          900: '#0F172A',
        },
      },
      spacing: {
        '18': '4.5rem',
        '22': '5.5rem',
        '26': '6.5rem',
        '30': '7.5rem',
        '34': '8.5rem',
        '38': '9.5rem',
        '42': '10.5rem',
        '46': '11.5rem',
        '50': '12.5rem',
      },
      boxShadow: {
        // Dark theme shadows
        'dark': '0 4px 20px rgba(0, 0, 0, 0.5), 0 2px 8px rgba(0, 0, 0, 0.3)',
        'dark-lg': '0 8px 32px rgba(0, 0, 0, 0.6), 0 4px 16px rgba(0, 0, 0, 0.4)',
        'dark-xl': '0 16px 64px rgba(0, 0, 0, 0.7), 0 8px 32px rgba(0, 0, 0, 0.5)',
        // Gold glow shadows
        'gold-glow': '0 0 20px rgba(234, 179, 8, 0.3), 0 0 40px rgba(234, 179, 8, 0.2)',
        'gold-glow-lg': '0 0 30px rgba(234, 179, 8, 4), 0 0 60px rgba(234, 179, 8, 0.25)',
        // Blue glow shadows
        'blue-glow': '0 0 20px rgba(59, 130, 246, 0.3), 0 0 40px rgba(59, 130, 246, 0.2)',
        // Glass effect with dark tint
        'glass-dark': '0 8px 32px rgba(15, 23, 42, 0.4), 0 4px 16px rgba(30, 41, 59, 0.3)',
        'glass-dark-lg': '0 16px 64px rgba(15, 23, 42, 0.5), 0 8px 32px rgba(30, 41, 59, 0.4)',
        // Surface elevation shadows
        'surface': '0 4px 16px rgba(30, 41, 59, 0.4), 0 2px 8px rgba(0, 0, 0, 0.3)',
        'surface-lg': '0 8px 32px rgba(30, 41, 59, 0.5), 0 4px 16px rgba(0, 0, 0, 0.4)',
      },
      animation: {
        'pulse-slow': 'pulse 4s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'breathe': 'breathe 6s ease-in-out infinite',
        'glow': 'glow 3s ease-in-out infinite',
        'float': 'float 4s ease-in-out infinite',
        'gold-pulse': 'goldPulse 2s ease-in-out infinite',
      },
      keyframes: {
        breathe: {
          '0%, 100%': { transform: 'scale(1)' },
          '50%': { transform: 'scale(1.02)' },
        },
        glow: {
          '0%, 100%': { opacity: '0.8' },
          '50%': { opacity: '1' },
        },
        float: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-8px)' },
        },
        goldPulse: {
          '0%, 100%': { opacity: '1' },
          '50%': { opacity: '0.7' },
        },
      },
      borderRadius: {
        '3xl': '24px',
        '4xl': '32px',
        '5xl': '40px',
      },
      letterSpacing: {
        'tight-xs': '0.025em',
      },
    },
  },
  plugins: [],
}
