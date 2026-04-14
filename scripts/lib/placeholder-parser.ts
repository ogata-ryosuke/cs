/**
 * プレースホルダー構文パーサー
 *
 * 構文:
 *   {{key}}              - 単一値
 *   {{key.nested}}       - ドットアクセス
 *   {{key|pipe:"arg"}}   - パイプ演算子付き
 *   {{#each arrayKey}}   - 配列ループ開始
 *   {{/each}}            - 配列ループ終了
 */

export interface Placeholder {
  raw: string;
  path: string;
  pipes: PipeOp[];
}

export interface PipeOp {
  name: string;
  arg?: string;
}

export interface EachBlock {
  startRow: number;
  endRow: number;
  arrayPath: string;
}

const PLACEHOLDER_RE = /\{\{([^}]+)\}\}/g;
const EACH_START_RE = /^\s*\{\{#each\s+([^}]+)\}\}\s*$/;
const EACH_END_RE = /^\s*\{\{\/each\}\}\s*$/;

/**
 * セル文字列内のすべてのプレースホルダーを検出
 */
export function findPlaceholders(text: string): Placeholder[] {
  const results: Placeholder[] = [];
  let match: RegExpExecArray | null;

  const re = new RegExp(PLACEHOLDER_RE.source, 'g');
  while ((match = re.exec(text)) !== null) {
    const inner = match[1].trim();

    // #each / /each はスキップ
    if (inner.startsWith('#each') || inner === '/each') continue;

    const parsed = parseInner(inner);
    results.push({ raw: match[0], ...parsed });
  }

  return results;
}

/**
 * "path|pipe1:\"arg\"|pipe2" をパース
 */
function parseInner(inner: string): { path: string; pipes: PipeOp[] } {
  const segments = inner.split('|').map((s) => s.trim());
  const path = segments[0];
  const pipes: PipeOp[] = [];

  for (let i = 1; i < segments.length; i++) {
    const seg = segments[i];
    const colonIdx = seg.indexOf(':');
    if (colonIdx === -1) {
      pipes.push({ name: seg });
    } else {
      const name = seg.slice(0, colonIdx).trim();
      let arg = seg.slice(colonIdx + 1).trim();
      // クォートを除去
      if (
        (arg.startsWith('"') && arg.endsWith('"')) ||
        (arg.startsWith("'") && arg.endsWith("'"))
      ) {
        arg = arg.slice(1, -1);
      }
      pipes.push({ name, arg });
    }
  }

  return { path, pipes };
}

/**
 * セル文字列が {{#each arrayPath}} かチェック
 */
export function parseEachStart(text: string): string | null {
  const match = EACH_START_RE.exec(text.trim());
  return match ? match[1].trim() : null;
}

/**
 * セル文字列が {{/each}} かチェック
 */
export function isEachEnd(text: string): boolean {
  return EACH_END_RE.test(text.trim());
}

/**
 * ドットパスでオブジェクトから値を取得
 * 例: resolveValue({ a: { b: 1 } }, "a.b") => 1
 */
export function resolveValue(data: Record<string, unknown>, path: string): unknown {
  const keys = path.split('.');
  let current: unknown = data;

  for (const key of keys) {
    if (current === null || current === undefined) return undefined;
    if (typeof current !== 'object') return undefined;
    current = (current as Record<string, unknown>)[key];
  }

  return current;
}
