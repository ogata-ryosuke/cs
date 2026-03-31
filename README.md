# career-sheet

職務経歴書（Career Sheet）- Astro + TypeScript + Tailwind CSS

## 開発環境のセットアップ

```bash
# 1. 依存パッケージをインストール
npm install

# 2. 開発サーバー起動
npm run dev

# 3. http://localhost:3000 でプレビュー
```

## ビルド

```bash
# 静的ビルド（GitHub Pages デプロイ用）
npm run build

# 出力は `dist/` ディレクトリに生成されます
```

## GitHub Pages へのデプロイ

### パス設定（サブパス デプロイの場合）

`astro.config.mjs` で以下を編集：

```javascript
export default defineConfig({
  integrations: [tailwind()],
  site: 'https://username.github.io/carrer-sheet',
  base: '/carrer-sheet',
});
```

### GitHub Actions ワークフロー

`.github/workflows/deploy.yml` を作成してください。

## プロジェクト構成

```
src/
  ├── pages/
  │   └── index.astro         # メインページ
  ├── layouts/
  │   └── Layout.astro        # ベースレイアウト
  ├── components/
  │   ├── Header.astro        # 固定ヘッダー
  │   ├── ProfileCard.astro   # プロフィール
  │   ├── SkillsCard.astro    # 技術スタック
  │   ├── ProjectsSection.astro # 案件一覧（フィルタ＋アコーディオン）
  │   ├── ProjectTable.astro  # テーブルラッパー
  │   ├── ProjectRow.astro    # アコーディオン行
  │   └── TechTagBadge.astro  # タグバッジ
  ├── lib/
  │   ├── types.ts            # TypeScript 型定義
  │   └── sample-data.json    # サンプルデータ
  └── styles/
      └── globals.css         # グローバルスタイル
```

## 機能

- **固定ヘッダー** - タイトルと更新日時
- **プロフィール** - 自己紹介とGitHubリンク
- **技術スタック** - 得意分野の技術一覧
- **案件フィルタリング** - タグベースの検索機能
- **アコーディオン** - 案件詳細の展開/折畳
- **静的生成** - GitHub Pages 対応

## ライセンス

MIT
