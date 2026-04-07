import { defineConfig } from "astro/config";
import tailwind from "@astrojs/tailwind";
import sitemap from "@astrojs/sitemap";

import react from "@astrojs/react";

export default defineConfig({
  integrations: [tailwind(), react(), sitemap()],
  output: "static",
  site: "https://cs.variantcode.co.jp",
  base: "/",
});