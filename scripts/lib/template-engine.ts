/**
 * Excel テンプレートエンジン
 *
 * 処理フロー:
 * 1. ExcelJS でテンプレート .xlsx を読み込み
 * 2. 全シートを走査し {{#each}} ブロックを検出
 * 3. テンプレート行を配列件数分だけ展開（スタイルコピー）
 * 4. 残りの単一値プレースホルダーを置換
 * 5. 制御行（{{#each}}, {{/each}}）を削除
 * 6. .xlsx として書き出し
 */

import ExcelJS from 'exceljs';
import {
  findPlaceholders,
  parseEachStart,
  isEachEnd,
  resolveValue,
} from './placeholder-parser.js';
import { applyPipes } from './formatters.js';

interface MergePattern {
  topRowOffset: number;
  leftCol: number;
  bottomRowOffset: number;
  rightCol: number;
}

interface EachBlock {
  startRow: number;
  endRow: number;
  arrayPath: string;
  templateRows: TemplateRow[];
  mergePatterns: MergePattern[];
}

interface TemplateRow {
  cells: TemplateCell[];
  height?: number;
}

interface TemplateCell {
  col: number;
  value: unknown;
  style: Partial<ExcelJS.Style>;
  mergeTarget?: { row: number; col: number };
}

// 三項演算子式: {{condition?"trueExpr":"falseExpr"}}
// trueExpr は "string"+variable+"string" のような連結式も対応
const TERNARY_RE =
  /\{\{(\w[\w.]*)\s*\?\s*((?:"(?:[^"\\]|\\.)*"|\w[\w.]*)(?:\s*\+\s*(?:"(?:[^"\\]|\\.)*"|\w[\w.]*))*)\s*:\s*("(?:[^"\\]|\\.)*")\s*\}\}/g;

/**
 * テキスト中の三項演算子式をすべて解決して返す
 */
function resolveTernaryExpressions(
  text: string,
  primaryData: Record<string, unknown>,
  fallbackData: Record<string, unknown>,
): string {
  return text.replace(
    new RegExp(TERNARY_RE.source, 'g'),
    (_match: string, condition: string, trueExpr: string, falseExpr: string) => {
      const condValue =
        resolveValue(primaryData, condition) ?? resolveValue(fallbackData, condition);
      const isTruthy =
        condValue !== null &&
        condValue !== undefined &&
        condValue !== '' &&
        condValue !== false &&
        condValue !== 0;
      return evaluateConcatExpr(
        isTruthy ? trueExpr : falseExpr,
        primaryData,
        fallbackData,
      );
    },
  );
}

/**
 * "string"+variable+"string" 形式の連結式を評価
 */
function evaluateConcatExpr(
  expr: string,
  primaryData: Record<string, unknown>,
  fallbackData: Record<string, unknown>,
): string {
  const partRe = /"(?:[^"\\]|\\.)*"|\w[\w.]*/g;
  const parts: string[] = [];
  let m: RegExpExecArray | null;
  while ((m = partRe.exec(expr)) !== null) {
    parts.push(m[0]);
  }

  return parts
    .map((part) => {
      if (part.startsWith('"')) {
        return part
          .slice(1, -1)
          .replace(/\\n/g, '\n')
          .replace(/\\t/g, '\t')
          .replace(/\\"/g, '"');
      }
      const value =
        resolveValue(primaryData, part) ?? resolveValue(fallbackData, part);
      return String(value ?? '');
    })
    .join('');
}

/**
 * テンプレートを処理してExcelファイルを生成
 */
export async function processTemplate(
  templatePath: string,
  data: Record<string, unknown>,
  outputPath: string,
): Promise<void> {
  const workbook = new ExcelJS.Workbook();
  await workbook.xlsx.readFile(templatePath);

  workbook.eachSheet((worksheet) => {
    processSheet(worksheet, data);
  });

  await workbook.xlsx.writeFile(outputPath);
}

/**
 * 1シートを処理
 */
function processSheet(
  worksheet: ExcelJS.Worksheet,
  data: Record<string, unknown>,
): void {
  // Phase 1: #each ブロックを検出・展開（下から上へ処理して行番号ズレを防ぐ）
  const eachBlocks = findEachBlocks(worksheet);

  for (let i = eachBlocks.length - 1; i >= 0; i--) {
    expandEachBlock(worksheet, eachBlocks[i], data);
  }

  // Phase 2: 残りの単一値プレースホルダーを置換
  replacePlaceholders(worksheet, data);
}

/**
 * "B14" のようなセル参照を { row, col } にパース
 */
function parseCellRef(ref: string): { row: number; col: number } {
  const match = ref.match(/^([A-Z]+)(\d+)$/);
  if (!match) throw new Error(`Invalid cell reference: ${ref}`);
  const colStr = match[1];
  const row = parseInt(match[2], 10);
  let col = 0;
  for (let i = 0; i < colStr.length; i++) {
    col = col * 26 + (colStr.charCodeAt(i) - 64);
  }
  return { row, col };
}

/**
 * テンプレート行範囲内のセル結合パターンを取得
 */
function captureMergePatterns(
  worksheet: ExcelJS.Worksheet,
  templateStartRow: number,
  templateEndRow: number,
): MergePattern[] {
  const patterns: MergePattern[] = [];
  const mergeRefs: string[] =
    (worksheet.model as Record<string, unknown>).merges as string[] ?? [];

  for (const ref of mergeRefs) {
    const [startRef, endRef] = ref.split(':');
    const start = parseCellRef(startRef);
    const end = parseCellRef(endRef);

    if (start.row >= templateStartRow && end.row <= templateEndRow) {
      patterns.push({
        topRowOffset: start.row - templateStartRow,
        leftCol: start.col,
        bottomRowOffset: end.row - templateStartRow,
        rightCol: end.col,
      });
    }
  }

  return patterns;
}

/**
 * シート内の全 {{#each}} ... {{/each}} ブロックを検出
 */
function findEachBlocks(worksheet: ExcelJS.Worksheet): EachBlock[] {
  const blocks: EachBlock[] = [];
  const rowCount = worksheet.rowCount;
  let i = 1;

  while (i <= rowCount) {
    const row = worksheet.getRow(i);
    const startText = getCellText(row, 1);

    // 全セルをチェックして #each を探す
    let arrayPath: string | null = null;
    row.eachCell({ includeEmpty: false }, (cell) => {
      if (!arrayPath) {
        const text = String(cell.value ?? '');
        arrayPath = parseEachStart(text);
      }
    });

    if (arrayPath) {
      // 対応する {{/each}} を探す
      let j = i + 1;
      while (j <= rowCount) {
        const endRow = worksheet.getRow(j);
        let foundEnd = false;
        endRow.eachCell({ includeEmpty: false }, (cell) => {
          if (!foundEnd && isEachEnd(String(cell.value ?? ''))) {
            foundEnd = true;
          }
        });
        if (foundEnd) break;
        j++;
      }

      // テンプレート行（#each行と/each行の間）を保存
      const templateRows: TemplateRow[] = [];
      for (let r = i + 1; r < j; r++) {
        templateRows.push(captureRow(worksheet, r));
      }

      // テンプレート行内のセル結合パターンを取得
      const mergePatterns = captureMergePatterns(worksheet, i + 1, j - 1);

      blocks.push({
        startRow: i,
        endRow: j,
        arrayPath,
        templateRows,
        mergePatterns,
      });

      i = j + 1;
    } else {
      i++;
    }
  }

  return blocks;
}

/**
 * 行のセル情報をキャプチャ
 */
function captureRow(worksheet: ExcelJS.Worksheet, rowNum: number): TemplateRow {
  const row = worksheet.getRow(rowNum);
  const cells: TemplateCell[] = [];

  row.eachCell({ includeEmpty: true }, (cell, colNumber) => {
    cells.push({
      col: colNumber,
      value: cell.value,
      style: JSON.parse(JSON.stringify(cell.style ?? {})),
    });
  });

  // 列がまったく取得できなかった場合、使用範囲内のセルをスキャン
  if (cells.length === 0) {
    const colCount = worksheet.columnCount;
    for (let c = 1; c <= colCount; c++) {
      const cell = row.getCell(c);
      cells.push({
        col: c,
        value: cell.value,
        style: JSON.parse(JSON.stringify(cell.style ?? {})),
      });
    }
  }

  return { cells, height: row.height };
}

/**
 * {{#each}} ブロックを展開
 */
function expandEachBlock(
  worksheet: ExcelJS.Worksheet,
  block: EachBlock,
  data: Record<string, unknown>,
): void {
  const array = resolveValue(data, block.arrayPath);
  if (!Array.isArray(array)) {
    // 配列でなければブロックごと削除
    deleteRows(worksheet, block.startRow, block.endRow);
    return;
  }

  const templateRowCount = block.templateRows.length;
  const totalNewRows = array.length * templateRowCount;
  const rowsToReplace = block.endRow - block.startRow + 1; // #each行 + テンプレート行 + /each行

  // テンプレート行内のセル結合を事前に解除（spliceRows による不整合を防ぐ）
  const templateStartRow = block.startRow + 1;
  for (const merge of block.mergePatterns) {
    const top = templateStartRow + merge.topRowOffset;
    const bottom = templateStartRow + merge.bottomRowOffset;
    try {
      worksheet.unMergeCells(top, merge.leftCol, bottom, merge.rightCol);
    } catch {
      // 既に解除済み
    }
  }

  // #each 〜 /each を削除し、同時に展開行を挿入（1回の spliceRows で実行）
  const emptyRows = Array.from({ length: totalNewRows }, () => [] as unknown[]);
  worksheet.spliceRows(block.startRow, rowsToReplace, ...emptyRows);

  // 展開した行にデータを埋める
  if (totalNewRows > 0) {

    // 各配列要素のデータで行を埋める
    for (let itemIdx = 0; itemIdx < array.length; itemIdx++) {
      const item = array[itemIdx] as Record<string, unknown>;

      for (let tplIdx = 0; tplIdx < templateRowCount; tplIdx++) {
        const targetRowNum = block.startRow + itemIdx * templateRowCount + tplIdx;
        const templateRow = block.templateRows[tplIdx];
        const row = worksheet.getRow(targetRowNum);

        // テンプレート行の高さを適用
        if (templateRow.height) {
          row.height = templateRow.height;
        }

        for (const tplCell of templateRow.cells) {
          const cell = row.getCell(tplCell.col);
          const textValue = String(tplCell.value ?? '');

          // プレースホルダーを置換（三項演算子 → 通常プレースホルダーの順）
          const resolved = resolveTemplateCellValue(textValue, item, data);
          cell.value = resolved;

          // スタイルをコピー
          if (tplCell.style) {
            cell.style = JSON.parse(JSON.stringify(tplCell.style));
          }
        }

        row.commit();
      }
    }

    // テンプレート行のセル結合を各展開グループに再適用
    for (let itemIdx = 0; itemIdx < array.length; itemIdx++) {
      const groupStartRow = block.startRow + itemIdx * templateRowCount;

      for (const merge of block.mergePatterns) {
        const top = groupStartRow + merge.topRowOffset;
        const bottom = groupStartRow + merge.bottomRowOffset;
        worksheet.mergeCells(top, merge.leftCol, bottom, merge.rightCol);
      }
    }
  }
}

/**
 * テンプレートセルの値を解決（#each 内のコンテキスト）
 * ローカル（配列要素）を優先し、見つからなければグローバルにフォールバック
 */
function resolveTemplateCellValue(
  text: string,
  localData: Record<string, unknown>,
  globalData: Record<string, unknown>,
): string | number | boolean {
  // 三項演算子式を先に解決
  text = resolveTernaryExpressions(text, localData, globalData);

  const placeholders = findPlaceholders(text);

  if (placeholders.length === 0) return text;

  // セル全体が1つのプレースホルダーの場合、型を保持
  if (placeholders.length === 1 && placeholders[0].raw === text.trim()) {
    const ph = placeholders[0];
    let value = resolveValue(localData, ph.path) ?? resolveValue(globalData, ph.path);
    value = applyPipes(value, ph.pipes);
    if (typeof value === 'number' || typeof value === 'boolean') return value;
    return String(value ?? '');
  }

  // 複数のプレースホルダーがある場合、文字列として結合
  let result = text;
  for (const ph of placeholders) {
    let value = resolveValue(localData, ph.path) ?? resolveValue(globalData, ph.path);
    value = applyPipes(value, ph.pipes);
    result = result.replace(ph.raw, String(value ?? ''));
  }

  return result;
}

/**
 * シート全体の単一値プレースホルダーを置換
 */
function replacePlaceholders(
  worksheet: ExcelJS.Worksheet,
  data: Record<string, unknown>,
): void {
  worksheet.eachRow({ includeEmpty: false }, (row) => {
    row.eachCell({ includeEmpty: false }, (cell) => {
      if (typeof cell.value !== 'string') return;

      // 三項演算子式を先に解決
      const text = resolveTernaryExpressions(cell.value, data, {});

      const placeholders = findPlaceholders(text);
      if (placeholders.length === 0) {
        if (text !== cell.value) cell.value = text;
        return;
      }

      // セル全体が1つのプレースホルダーの場合、型を保持
      if (placeholders.length === 1 && placeholders[0].raw === text.trim()) {
        const ph = placeholders[0];
        let value = resolveValue(data, ph.path);
        value = applyPipes(value, ph.pipes);
        if (typeof value === 'number') {
          cell.value = value;
        } else if (typeof value === 'boolean') {
          cell.value = value;
        } else {
          cell.value = String(value ?? '');
        }
        return;
      }

      // 複数のプレースホルダー → 文字列置換
      let result = text;
      for (const ph of placeholders) {
        let value = resolveValue(data, ph.path);
        value = applyPipes(value, ph.pipes);
        result = result.replace(ph.raw, String(value ?? ''));
      }
      cell.value = result;
    });
  });
}

/**
 * 行を削除（startRow から endRow まで含む）
 */
function deleteRows(
  worksheet: ExcelJS.Worksheet,
  startRow: number,
  endRow: number,
): void {
  const count = endRow - startRow + 1;
  worksheet.spliceRows(startRow, count);
}

/**
 * セルのテキスト値を取得
 */
function getCellText(row: ExcelJS.Row, col: number): string {
  const cell = row.getCell(col);
  return String(cell.value ?? '');
}
