/**
 * prebuild スクリプト
 *
 * src/lib/career-data.private.json が存在しない場合、
 * 環境変数 CAREER_DATA_PRIVATE から生成する。
 */

import fs from 'node:fs';

const dest = 'src/lib/career-data.private.json';

if (fs.existsSync(dest)) {
  console.log(`[prebuild] ${dest} exists, skipping.`);
  process.exit(0);
}

const envValue = process.env.CAREER_DATA_PRIVATE;

if (envValue) {
  fs.writeFileSync(dest, envValue, 'utf-8');
  console.log(`[prebuild] ${dest} created from CAREER_DATA_PRIVATE env var.`);
} else {
  console.error(`[prebuild] ERROR: ${dest} not found and CAREER_DATA_PRIVATE env var is not set.`);
  process.exit(1);
}
