# Career Sheet - デザイン分析ドキュメント

## Phase 1: デザイン分析・準備

### 1-1. セクション構成

```
Page (1440px, #FAFAFA)
├── Header (56px, #FFFFFF)
│   ├── Title: 職務経歴書 / Career Sheet
│   └── UpdateDate: 更新日: 2026年3月
│
├── Main (layout: vertical, gap: 48px, padding: 48px 80px)
│   ├── 01. Profile Section
│   │   ├── Title: プロフィール
│   │   └── ProfileCard
│   │       ├── Bio (長文テキスト)
│   │       └── GitHub Link
│   │
│   ├── 02. Strengths Section
│   │   ├── Title: 得意分野
│   │   └── List (6項目、checkmark+テキスト)
│   │
│   ├── 03. Skills Section
│   │   ├── Title: 得意技術
│   │   └── SkillsCard (Table形式)
│   │       ├── Frontend Row
│   │       ├── Backend Row
│   │       ├── Infrastructure Row
│   │       └── AI/LLM Row
│   │
│   ├── 04. Self-PR Section
│   │   ├── Title: 自己PR
│   │   └── PRCard (2 subsections)
│   │       ├── 略歴
│   │       └── 強み
│   │
│   └── 05. Projects Section
│       ├── Title: 案件一覧
│       ├── FilterBar (技術タグ)
│       └── ProjectTable (アコーディオン形式)
│           ├── Header Row
│           ├── Project Rows (展開可能)
│           └── Expanded Panel (詳細情報)
```

---

### 1-2. デザイン変数抽出

#### 📐 Color Palette

| 変数名                | 16進カラー | 用途                     |
| --------------------- | ---------- | ------------------------ |
| `bg-page`             | #FAFAFA    | ページ背景               |
| `bg-surface`          | #FFFFFF    | カード・テーブル背景     |
| `bg-section`          | #F4F4F5    | テーブルヘッダー背景     |
| `border-light`        | #E4E4E7    | ボーダー・区切り線       |
| `text-primary`        | #09090B    | 見出し・本文             |
| `text-secondary`      | #71717A    | サブテキスト             |
| `text-muted`          | #52525B    | 非アクティブテキスト     |
| `text-link`           | #2563EB    | リンク・アクティブ色     |
| `icon-success`        | #16A34A    | 成功アイコン（チェック） |
| `bg-selected`         | #EFF6FF    | 選択状態背景             |
| `border-selected`     | #BFDBFE    | 選択状態ボーダー         |
| `text-selected`       | #1D4ED8    | 選択状態テキスト         |
| `text-selected-light` | #3B82F6    | 選択状態テキスト淡色     |

#### 🔤 Typography

| 用途             | フォント | サイズ  | ウェイト       | 高さ      |
| ---------------- | -------- | ------- | -------------- | --------- |
| ページタイトル   | Inter    | 15px    | 700 (bold)     | -         |
| セクション見出し | Inter    | 20px    | 700 (bold)     | -         |
| 副見出し         | Inter    | 14px    | 600 (semibold) | -         |
| 本文             | Inter    | 13px    | 400 (normal)   | 1.5 / 1.7 |
| サブテキスト     | Inter    | 12px    | 400 (normal)   | -         |
| 小さいテキスト   | Inter    | 10px    | 400 (normal)   | -         |
| タグ             | Inter    | 11-12px | 400-500        | -         |

#### 📏 Spacing Scale

| 値   | 用途                   |
| ---- | ---------------------- |
| 8px  | コンポーネント内 gap   |
| 12px | 小セクション間隔       |
| 16px | カード内 padding       |
| 24px | カード padding         |
| 48px | セクション左右 padding |
| 48px | セクション上下 gap     |
| 80px | ページ上下 padding     |

#### 🎯 Border & Radius

| 値  | 用途                     |
| --- | ------------------------ |
| 1px | 標準ボーダー             |
| 8px | カード corner radius     |
| 6px | タグバッジ corner radius |

---

### 1-3. コンポーネント設計

#### Header

- 固定・sticky位置
- 左：タイトル + サブタイトル（ロゴ）
- 右：更新日時
- 下：ボーダー #E4E4E7

#### ProfileCard

- 幅: 100%
- 背景: #FFFFFF
- ボーダー: 1px #E4E4E7
- corner-radius: 8px
- 内容: 自己紹介テキスト + GitHub リンク
- リンク色: #2563EB

#### SkillsCard

- Table形式（フロントエンド / バックエンド / インフラ / AI/LLM）
- 各行は：ラベル（固定幅168px）+ 技術スタック（可変幅）

#### ProjectsSection

- **FilterBar**: 技術タグフィルター
  - タグ: #FAFAFA背景、#71717A文字（デフォルト）
  - アクティブ時: #09090B背景、#FFFFFF文字
  - 「すべて」タグ: デフォルトアクティブ
- **ProjectTable**: アコーディオン形式
  - ヘッダー行（グレー背景）
  - Project行（白）：いくつかは展開状態（青背景）も表示
  - 展開時：詳細パネル表示（青背景 #EFF6FF）

---

### 1-4. データ構造

```typescript
// プロジェクト データ
interface Project {
  id: number;
  period: {
    start: string; // "2026/01" format
    end: string; // "2026/03" format
  };
  monthCount: number;
  name: string;
  technologies: string[];
  teamSize: number;
  description?: string;
}

// キャリアシート 全体
interface CareerSheetData {
  profile: {
    bio: string;
    github?: string;
  };
  specialties: {
    title: string;
    items: string[]; // 6-8 items with checkmark
  };
  skills: {
    frontend: string[];
    backend: string[];
    infrastructure: string[];
    ai: string[];
  };
  selfPR: {
    summary: string;
    strengths: string[];
  };
  projects: Project[];
}

// フィルター状態
interface FilterState {
  selectedTags: string[] | null; // null = "All", [] = none
}

// アコーディオン状態
interface AccordionState {
  expandedProjectId: number | null;
}
```

---

### 1-5. 状態管理計画

```typescript
// Page Component (app/page.tsx)
const [selectedTags, setSelectedTags] = useState<string[] | null>(null);
const [expandedProjectId, setExpandedProjectId] = useState<number | null>(null);

// Filtered projects
const filteredProjects =
  selectedTags === null ? projects : projects.filter((p) => selectedTags.some((tag) => p.technologies.includes(tag)));
```

---

## Phase 1 完了チェックリスト

- [x] デザイン構造分析完成
- [x] セクション・コンポーネント分割完成
- [x] 色・フォント・スペーシング変数抽出完成
- [x] データスキーマ定義完成
- [ ] TypeScript `types/index.ts` 実装
- [ ] `tailwind.config.js` 設定テンプレート作成
- [ ] サンプル JSON データ作成

---

## 次のステップ

Phase 1-2: TypeScript型定義ファイル生成 → 実行
