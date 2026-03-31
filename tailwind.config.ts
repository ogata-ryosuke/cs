import type { Config } from 'tailwindcss'

const config: Config = {
  content: ['./src/**/*.{astro,html,js,jsx,md,mdx,svelte,ts,tsx,vue}'],
  theme: {
    extend: {
      colors: {
        // Primary palette
        primary: {
          50: '#F0F9FF',
          100: '#E0F2FE',
          500: '#0EA5E9',
          600: '#0284C7',
          700: '#0369A1',
          900: '#082F49',
        },
        // Semantic colors
        'bg-page': '#FAFBFC',
        'bg-surface': '#FFFFFF',
        'bg-section': '#F5F7FA',
        'border-light': '#E5E7EB',
        'text-primary': '#1F2937',
        'text-secondary': '#6B7280',
        'text-tertiary': '#9CA3AF',
        'icon-success': '#10B981',
        'tag-selected-bg': '#000000',
        'tag-selected-text': '#FFFFFF',
        'tag-unselected-bg': '#F3F4F6',
        'tag-unselected-text': '#9CA3AF',
      },
      spacing: {
        xs: '8px',
        sm: '12px',
        md: '16px',
        lg: '24px',
        xl: '48px',
        '2xl': '80px',
      },
      fontSize: {
        small: ['12px', { lineHeight: '1.5' }],
        body: ['14px', { lineHeight: '1.6' }],
        subheading: ['16px', { lineHeight: '1.6', fontWeight: '600' }],
        sectionHeading: ['20px', { lineHeight: '1.5', fontWeight: '700' }],
        header: ['24px', { lineHeight: '1', fontWeight: '700' }],
      },
      height: {
        header: '56px',
      },
      width: {
        skillsLabel: '168px',
      },
      maxWidth: {
        page: '1440px',
      },
      borderRadius: {
        card: '8px',
      },
      fontFamily: {
        sans: ['-apple-system', 'BlinkMacSystemFont', '"Segoe UI"', 'Roboto', '"Helvetica Neue"', 'Arial', 'sans-serif'],
      },
    },
  },
  plugins: [],
}
export default config
