/**
 * パイプ演算子（フォーマッター）
 *
 * {{value|join:", "}}       - 配列を文字列結合
 * {{value|default:"—"}}     - null/undefined 時のデフォルト値
 * {{value|monthFormat}}     - 月数を "○年○ヶ月" 形式に変換
 * {{value|age}}             - "YYYY/MM/DD" の誕生日から現在の年齢を計算
 */

import type { PipeOp } from './placeholder-parser.js';

type Formatter = (value: unknown, arg?: string) => unknown;

const formatters: Record<string, Formatter> = {
  join(value: unknown, arg?: string): unknown {
    if (!Array.isArray(value)) return value;
    const separator = arg ?? ', ';
    // エスケープされた改行を実際の改行に変換
    const resolvedSep = separator.replace(/\\n/g, '\n');
    return value.join(resolvedSep);
  },

  default(value: unknown, arg?: string): unknown {
    if (value === null || value === undefined || value === '') {
      return arg ?? '';
    }
    return value;
  },

  age(value: unknown): unknown {
    if (typeof value !== 'string' || value === '') return value;
    const parts = value.split('/').map(Number);
    if (parts.length < 3 || parts.some(Number.isNaN)) return value;
    const [y, m, d] = parts;
    const today = new Date();
    let age = today.getFullYear() - y;
    const monthDiff = today.getMonth() + 1 - m;
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < d)) {
      age--;
    }
    return age;
  },

  monthFormat(value: unknown): unknown {
    const months = Number(value);
    if (Number.isNaN(months) || months < 0) return String(value);

    const years = Math.floor(months / 12);
    const remaining = months % 12;

    if (years === 0) return `${remaining}ヶ月`;
    if (remaining === 0) return `${years}年`;
    return `${years}年${remaining}ヶ月`;
  },
};

/**
 * パイプ演算子チェーンを値に適用
 */
export function applyPipes(value: unknown, pipes: PipeOp[]): unknown {
  let result = value;
  for (const pipe of pipes) {
    const fn = formatters[pipe.name];
    if (!fn) {
      throw new Error(`Unknown formatter: "${pipe.name}"`);
    }
    result = fn(result, pipe.arg);
  }
  return result;
}
