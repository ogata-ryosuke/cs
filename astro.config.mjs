import { defineConfig } from "astro/config";
import tailwind from "@astrojs/tailwind";

export default defineConfig({
  integrations: [tailwind()],
  output: "static",
  // GitHub Pages デプロイ時（サブパス）の場合：
  // site: 'https://username.github.io/carrer-sheet',
  // base: '/carrer-sheet',
});
