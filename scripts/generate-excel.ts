#!/usr/bin/env tsx
/**
 * JSON → Excel テンプレートエンジン CLI
 *
 * 使い方:
 *   npx tsx scripts/generate-excel.ts [options]
 *
 * オプション:
 *   --template, -t  テンプレートファイルパス (default: scripts/templates/career-sheet.xlsx)
 *   --data, -d      JSON データファイルパス   (default: src/lib/career-data.json)
 *   --output, -o    出力ファイルパス          (default: output/career-sheet-YYYYMMDD.xlsx)
 *
 * テンプレート構文:
 *   {{key}}                   - 単一値プレースホルダー
 *   {{key.nested.path}}       - ドットアクセス
 *   {{key|join:", "}}         - パイプ演算子（配列→文字列結合）
 *   {{key|default:"—"}}       - デフォルト値
 *   {{key|monthFormat}}       - 月数→「○年○ヶ月」
 *   {{#each arrayKey}}        - 配列ループ開始（行展開）
 *   {{/each}}                 - 配列ループ終了
 */

import * as fs from 'node:fs';
import * as path from 'node:path';
import ExcelJS from 'exceljs';
import { processTemplate } from './lib/template-engine.js';

/**
 * 生成後の Excel を開き直し、指定テキストと完全一致するセルの
 * 「1行目のみ太字」の richText に変換する。
 * テンプレートエンジンはセル値を単一文字列で埋めるため、
 * セル内の部分書式（先頭行のみ太字）はここで後処理として適用する。
 */
async function boldFirstLine(outputPath: string, fullText: string): Promise<void> {
  const workbook = new ExcelJS.Workbook();
  await workbook.xlsx.readFile(outputPath);

  let applied = false;
  workbook.eachSheet((worksheet) => {
    worksheet.eachRow((row) => {
      row.eachCell((cell) => {
        if (applied || cell.value !== fullText) return;

        const newlineIdx = fullText.indexOf('\n');
        const firstLine = newlineIdx === -1 ? fullText : fullText.slice(0, newlineIdx);
        const rest = newlineIdx === -1 ? '' : fullText.slice(newlineIdx);
        const baseFont = cell.font ? { ...cell.font } : {};

        cell.value = {
          richText: [
            { text: firstLine, font: { ...baseFont, bold: true } },
            ...(rest ? [{ text: rest, font: { ...baseFont } }] : []),
          ],
        };
        applied = true;
      });
    });
  });

  if (applied) {
    await workbook.xlsx.writeFile(outputPath);
  }
}

function deepMerge(
  target: Record<string, unknown>,
  source: Record<string, unknown>,
): void {
  for (const [key, value] of Object.entries(source)) {
    const tVal = target[key];
    if (
      value !== null &&
      typeof value === 'object' &&
      !Array.isArray(value) &&
      tVal !== null &&
      typeof tVal === 'object' &&
      !Array.isArray(tVal)
    ) {
      deepMerge(tVal as Record<string, unknown>, value as Record<string, unknown>);
    } else {
      target[key] = value;
    }
  }
}

function parseArgs(args: string[]): { template: string; data: string; output: string } {
  const today = new Date();
  const dateStr = `${today.getFullYear()}${String(today.getMonth() + 1).padStart(2, '0')}${String(today.getDate()).padStart(2, '0')}`;

  const defaults = {
    template: 'scripts/templates/career-sheet.xlsx',
    data: 'src/lib/career-data.json',
    output: `output/career-sheet-${dateStr}.xlsx`,
  };

  for (let i = 0; i < args.length; i++) {
    const arg = args[i];
    const next = args[i + 1];

    if ((arg === '--template' || arg === '-t') && next) {
      defaults.template = next;
      i++;
    } else if ((arg === '--data' || arg === '-d') && next) {
      defaults.data = next;
      i++;
    } else if ((arg === '--output' || arg === '-o') && next) {
      defaults.output = next;
      i++;
    }
  }

  return defaults;
}

async function main(): Promise<void> {
  const args = parseArgs(process.argv.slice(2));

  // パスを絶対パスに解決
  const templatePath = path.resolve(args.template);
  const dataPath = path.resolve(args.data);
  const outputPath = path.resolve(args.output);

  // 入力ファイルの存在チェック
  if (!fs.existsSync(templatePath)) {
    console.error(`テンプレートが見つかりません: ${templatePath}`);
    process.exit(1);
  }
  if (!fs.existsSync(dataPath)) {
    console.error(`データファイルが見つかりません: ${dataPath}`);
    process.exit(1);
  }

  // 出力ディレクトリの作成
  const outputDir = path.dirname(outputPath);
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }

  // JSON データの読み込み
  const rawData = fs.readFileSync(dataPath, 'utf-8');
  const data = JSON.parse(rawData) as Record<string, unknown>;

  // プライベートデータの自動マージ（career-data.private.json が存在する場合）
  const privateDataPath = dataPath.replace(/\.json$/, '.private.json');
  if (fs.existsSync(privateDataPath)) {
    const rawPrivate = fs.readFileSync(privateDataPath, 'utf-8');
    const privateData = JSON.parse(rawPrivate) as Record<string, unknown>;
    deepMerge(data, privateData);

    // profile 配下のフィールドをトップレベルにも展開（テンプレートの {{name}} 等に対応）
    const profile = data.profile as Record<string, unknown> | undefined;
    if (profile) {
      for (const [key, value] of Object.entries(profile)) {
        if (!(key in data)) {
          data[key] = value;
        }
      }
    }

    console.log(`プライベート: ${privateDataPath}`);
  }

  // projects 内の phases 配列を phase オブジェクトに変換
  // （テンプレートの {{phase.detailedDesign ? "●" : ""}} に対応）
  const projects = data.projects as Record<string, unknown>[] | undefined;
  if (Array.isArray(projects)) {
    // id 降順ソート（新しい案件が上に来る）
    projects.sort((a, b) => Number(b.id ?? 0) - Number(a.id ?? 0));

    for (const project of projects) {
      if (Array.isArray(project.phases)) {
        const phaseObj: Record<string, boolean> = {};
        for (const p of project.phases as string[]) {
          phaseObj[p] = true;
        }
        project.phase = phaseObj;
      }
    }
  }

  // aiUtilization を Excel セル用の整形済みテキストに派生
  // （テンプレートのセルでは {{#each}} が使えないため、複数行文字列に組み立てる）
  const ai = data.aiUtilization as
    | {
        currentLevel: string;
        currentCaption: string;
        provenLevel: string;
        provenNote: string;
        levels: { label: string; caption?: string; items: string[] }[];
        environment: string[];
      }
    | undefined;
  if (ai) {
    const head = `${ai.currentLevel}（${ai.currentCaption}）／${ai.provenLevel} ${ai.provenNote}`;
    const levels = ai.levels
      .map((group) => {
        const caption = group.caption ? `（${group.caption}）` : '';
        const items = group.items.map((item) => `・${item}`).join('\n');
        return `【${group.label}】${caption}\n${items}`;
      })
      .join('\n\n');
    const environment = `＜環境＞\n${ai.environment.join('、')}`;
    (data.aiUtilization as Record<string, unknown>).excelText =
      `${head}\n\n${levels}\n\n${environment}`;
  }

  console.log(`テンプレート: ${templatePath}`);
  console.log(`データ:       ${dataPath}`);
  console.log(`出力先:       ${outputPath}`);
  console.log('');

  await processTemplate(templatePath, data, outputPath);

  // AI活用レベルセルの1行目（レベルサマリー）のみ太字化
  if (ai) {
    await boldFirstLine(
      outputPath,
      (data.aiUtilization as Record<string, unknown>).excelText as string,
    );
  }

  console.log('Excel ファイルを生成しました。');
}

main().catch((err: unknown) => {
  console.error('エラー:', err);
  process.exit(1);
});
