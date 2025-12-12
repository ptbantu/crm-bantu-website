/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // 保留原有primary色系（向后兼容）
        primary: {
          50: '#E6F7FF',
          100: '#BAE7FF',
          200: '#91D5FF',
          300: '#69C0FF',
          400: '#40A9FF',
          500: '#1890FF',
          600: '#096DD9',
          700: '#0050B3',
          800: '#003A8C',
          900: '#002766',
        },
        // 阿里云ECS风格色彩体系
        ali: {
          primary: '#1890FF',
          'primary-hover': '#40A9FF',
          'primary-active': '#096DD9',
          'primary-light': '#E6F7FF',
          orange: '#FF6A00',
          'orange-hover': '#FF8533',
          'tech-blue': '#1890FF',
          success: '#52C41A',
          'success-hover': '#73D13D',
          warning: '#FAAD14',
          'warning-hover': '#FFC53D',
          error: '#FF4D4F',
          'error-hover': '#FF7875',
          'dark-bg': '#001529',
          'dark-hover': '#112240',
          'dark-active': '#1890FF',
          'text-primary': '#262626',
          'text-secondary': '#8C8C8C',
          'text-disabled': '#BFBFBF',
          'bg-gray': '#F5F5F5',
          'bg-light': '#FAFAFA',
          border: '#F0F0F0',
          'border-dark': '#D9D9D9',
        },
      },
      fontFamily: {
        sans: [
          'PingFang SC',
          'Microsoft YaHei',
          '-apple-system',
          'BlinkMacSystemFont',
          'Segoe UI',
          'Helvetica Neue',
          'Arial',
          'sans-serif',
        ],
      },
      fontSize: {
        'ali-base': ['14px', '1.5715'],
        'ali-sm': ['12px', '1.5'],
        'ali-lg': ['16px', '1.5'],
        'ali-xl': ['20px', '1.4'],
      },
      boxShadow: {
        'ali-card': '0 1px 4px rgba(0, 21, 41, 0.08)',
        'ali-card-hover': '0 2px 8px rgba(0, 21, 41, 0.12)',
      },
      borderRadius: {
        'ali': '4px',
      },
    },
  },
  plugins: [],
}

