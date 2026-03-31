# GitHub Pages デプロイ手順

## 前提条件

- GitHub アカウント
- リポジトリが存在することしてリモート設定済み

## ステップ 1: GitHub Pages 設定

1. GitHub repo → **Settings** → **Pages**
2. **Build and deployment** セクション
   - Source: `GitHub Actions` を選択
   - Branch: `main` (既にデプロイワークフロー設定済み)

## ステップ 2: デプロイ可能状態の確認

```bash
# ローカル確認
npm run build
ls -la dist/
# → index.html が生成されていることを確認
```

## ステップ 3: git push で自動デプロイ

```bash
git push origin main
```

GitHub Actions が自動実行：
- `.github/workflows/deploy.yml` が起動
- npm install + npm run build 実行
- 出力を `dist/` に生成
- GitHub Pages にデプロイ

## ステップ 4: 動作確認

1. GitHub repo → **Actions** タブで実行状況確認
2. デプロイ完了後、URL にアクセス：
   - ルート配置: `https://username.github.io/carrer-sheet`
   - サブパス配置: `https://username.github.io/cs/` （basePath 設定要）

## サブパス配置の場合

`astro.config.mjs` を編集：

```javascript
export default defineConfig({
  integrations: [tailwind()],
  output: "static",
  site: 'https://username.github.io/carrer-sheet',
  base: '/carrer-sheet',
});
```

その後、git push で自動デプロイ。

## トラブルシューティング

| 問題 | 原因 | 解決策 |
|------|------|--------|
| Pages が見つからない | GitHub Pages 設定なし | Settings → Pages で有効化 |
| 404 エラー | アセットパスずれ | `base` と `site` を確認 |
| CSS が読み込まれない | Tailwind ビルド失敗 | `npm run build` でローカル確認 |
| アクション失敗 | ノードバージョン不一致 | node 20 で統一（.github/workflows/deploy.yml） |
