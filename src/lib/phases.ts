/**
 * 担当工程（開発フェーズ）の表示契約
 * Web カードと Excel 出力で同じキー順・同じ日本語ラベルを共有し、
 * 表示のドリフトを防ぐ単一の真実とする。
 */
import type { PhaseKey } from './types';

/** ライフサイクル順に並べた工程キー（表示順の唯一の定義） */
export const PHASE_ORDER: readonly PhaseKey[] = [
  'requirementDefinition',
  'basicDesign',
  'detailedDesign',
  'implementation',
  'integrationTest',
  'systemTest',
  'maintenance',
] as const;

/** 工程キー → 日本語ラベル */
export const PHASE_LABELS: Record<PhaseKey, string> = {
  requirementDefinition: '要件定義',
  basicDesign: '基本設計',
  detailedDesign: '詳細設計',
  implementation: '実装',
  integrationTest: '結合テスト',
  systemTest: 'システムテスト',
  maintenance: '保守',
};
