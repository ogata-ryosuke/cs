/**
 * career-data.json と career-data.private.json をマージして返すローダー
 *
 * private.json が存在しない場合はプレースホルダー値でフォールバックする。
 * Astro のフロントマター（サーバーサイド）で使用する想定。
 */

import baseData from './career-data.json';
import type { CareerSheetData } from './types';

interface PrivateData {
  profile?: {
    name?: string;
    gender?: string;
    birthday?: string;
    nearestStation?: string;
    education?: string;
  };
}

let privateData: PrivateData = {};
try {
  // @ts-ignore — ファイルが存在しない環境ではフォールバック
  privateData = (await import('./career-data.private.json')).default;
} catch {
  // private.json が無い場合は空で続行
}

const merged: CareerSheetData = {
  ...(baseData as CareerSheetData),
  profile: {
    ...(baseData as CareerSheetData).profile,
    name: privateData.profile?.name ?? '（氏名未設定）',
    gender: privateData.profile?.gender ?? '',
    birthday: privateData.profile?.birthday ?? '',
    nearestStation: privateData.profile?.nearestStation ?? '',
    education: privateData.profile?.education ?? '',
  },
};

export const careerData = merged;
