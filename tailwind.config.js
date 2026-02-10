/** @type {import('tailwindcss').Config} */
export default {
  darkMode: ["class"],
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: '#2F6FED',
          dark: '#2153D1',
        },
        secondary: '#1BBF72',
        warning: '#F59E0B',
        error: '#EF4444',
        text: {
          DEFAULT: '#111827',
          secondary: '#6B7280',
        },
        border: '#E5E7EB',
        background: '#F8FAFC',
        panel: '#FFFFFF',
      },
      borderRadius: {
        'lg': '24px',
        'md': '16px',
        'sm': '12px',
        'full': '999px',
      },
      boxShadow: {
        'sm': '0 4px 16px rgba(15, 23, 42, 0.08)',
        'lg': '0 16px 32px rgba(15, 23, 42, 0.12)',
        'card': '0 10px 18px rgba(15, 23, 42, 0.06)',
        'card-lg': '0 16px 36px rgba(15, 23, 42, 0.07)',
        'pricing': '0 16px 44px rgba(15, 23, 42, 0.08)',
        'pricing-highlight': '0 24px 60px rgba(15, 23, 42, 0.12)',
        'chat': '0 30px 80px rgba(15, 23, 42, 0.15)',
        'toast': '0 12px 28px rgba(15, 23, 42, 0.22)',
      },
      fontFamily: {
        sans: ['"Noto Sans CJK SC"', '"Source Han Sans SC"', '"Alibaba PuHuiTi"', 'Inter', '"SF Pro Display"', 'Segoe UI', 'sans-serif'],
      },
      maxWidth: {
        'container': '1200px',
      },
      animation: {
        'spin': 'spin 0.8s linear infinite',
      },
    },
  },
  plugins: [],
}
