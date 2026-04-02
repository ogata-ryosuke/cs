# career-sheet

職務経歴書（Career Sheet）- Astro + React + TypeScript + Tailwind CSS

## 開発環境のセットアップ

```bash
# 1. 依存パッケージをインストール
npm install

# 2. 開発サーバー起動
npm run dev

# 3. http://localhost:4321 でプレビュー
```

## ビルド

```bash
# 静的ビルド（GitHub Pages デプロイ用）
npm run build

# 出力は `dist/` ディレクトリに生成されます
```

## GitHub Pages へのデプロイ

### パス設定

`astro.config.mjs` で `site` と `base` を編集：

```javascript
export default defineConfig({
  integrations: [tailwind(), react()],
  output: "static",
  site: "https://ogata-ryosuke.github.io",
  base: "/cs",
});
```

### GitHub Actions ワークフロー

`.github/workflows/deploy.yml` で `main` ブランチへの push 時に自動デプロイされます。

## プロジェクト構成

```
src/
  ├── pages/
  │   └── index.astro              # メインページ
  ├── layouts/
  │   └── Layout.astro             # ベースレイアウト
  ├── components/
  │   ├── Header.astro             # 固定ヘッダー
  │   ├── ProfileCard.astro        # プロフィール
  │   ├── SkillsCard.astro         # 技術スタック
  │   ├── react/
  │   │   ├── ProjectsSection.tsx  # 案件一覧（フィルタ＋カード）
  │   │   ├── ProjectCardList.tsx  # 案件カードリスト
  │   │   ├── TechFilterBar.tsx    # 技術タグフィルターバー
  │   │   └── TechBadge.tsx        # 技術タグバッジ
  │   └── ui/
  │       ├── badge.tsx            # バッジコンポーネント
  │       ├── button.tsx           # ボタンコンポーネント
  │       ├── collapsible.tsx      # 折畳コンポーネント
  │       └── table.tsx            # テーブルコンポーネント
  ├── lib/
  │   ├── types.ts                 # TypeScript 型定義
  │   ├── career-data.json         # 経歴データ
  │   ├── tech-categories.ts       # 技術カテゴリ分類
  │   └── utils.ts                 # ユーティリティ関数
  └── styles/
      └── globals.css              # グローバルスタイル
```

## 機能

- **固定ヘッダー** - タイトルと更新日時
- **プロフィール** - 自己紹介とGitHubリンク
- **技術スタック** - 得意分野の技術一覧（テーブル形式）
- **案件フィルタリング** - 技術タグによるAND検索
- **案件カード** - 全案件をカードレイアウトで表示（展開/折畳対応）
- **静的生成** - GitHub Pages 自動デプロイ対応
