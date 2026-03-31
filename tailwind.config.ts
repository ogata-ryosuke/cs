import type { Config } from 'tailwindcss'

const config: Config = {
  content: ['./src/**/*.{astro,html,js,jsx,md,mdx,svelte,ts,tsx,vue}'],
  theme: {
    extend: {
      colors: {
        // Primary palette
        primary: {
          50: '#EFF6FF',  // Pencil展開背景 (#EFF6FF)
          100: '#E0F2FE',
          500: '#0EA5E9',
          600: '#0284C7',
          700: '#0369A1',
          900: '#082F49',
        },
        // Semantic colors (matching Pencil design)
        'bg-page': '#FAFAFA',           // Pencil: #FAFAFA
        'bg-surface': '#FFFFFF',        // Pencil: #FFFFFF
        'bg-section': '#F4F4F5',        // Pencil: #F4F4F5 (テーブルヘッダー背景)
        'border-light': '#E4E4E7',      // Pencil: #E4E4E7 (すべての境界線)
        'text-primary': '#09090B',      // Pencil: #09090B (見出し・メインテキスト)
        'text-secondary': '#71717A',    // Pencil: #71717A (ラベル・補助テキスト)
        'text-tertiary': '#9CA3AF',     // Pencil: #9CA3AF (薄い補助テキスト)
        'icon-success': '#16A34A',      // Pencil: #16A34A (チェックアイコン)
        'tag-selected-bg': '#000000',   // Pencil: #000000 (選択フィルタ背景)
        'tag-selected-text': '#FFFFFF', // Pencil: #FFFFFF (選択フィルタテキスト)
        'tag-unselected-bg': '#FAFAFA', // Pencil: #FAFAFA (未選択フィルタ背景)
        'tag-unselected-text': '#9CA3AF', // Pencil: #9CA3AF (未選択フィルタテキスト)
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
