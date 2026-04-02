/**
 * Career Sheet - TypeScript Type Definitions
 * App全体で使用する型定義
 */

// ============================================
// Project Models
// ============================================

export interface Period {
  start: string; // "YYYY/MM" format
  end: string; // "YYYY/MM" format
}

export interface Project {
  id: number;
  period: Period;
  monthCount: number;
  name: string;
  technologies: string[];
  teamSize: number;
  description?: string;
  contractType?: "社員" | "SES" | "受託";
  isLeader?: boolean;
  learning?: string;
  comments?: string;
}

// ============================================
// CareerSheet Data Models
// ============================================

export interface ProfileData {
  bio: string;
  github?: string;
}

export interface SpecialtiesData {
  title: string;
  items: string[]; // 6-8 items
}

export interface SkillsData {
  frontend: string[];
  backend: string[];
  infrastructure: string[];
  ai: string[];
}

export interface SelfPRData {
  summary: string;
  careerHistory: string[];
  strengths: string[];
}

export interface CareerSheetData {
  updateDate: string;
  profile: ProfileData;
  specialties: SpecialtiesData;
  skills: SkillsData;
  selfPR: SelfPRData;
  projects: Project[];
}

// ============================================
// State Models
// ============================================

export interface FilterState {
  selectedTags: string[] | null; // null = "All", [] = none
}

export interface AccordionState {
  expandedProjectId: number | null;
}

// ============================================
// Component Props
// ============================================

export interface HeaderProps {
  updateDate?: string;
}

export interface ProfileCardProps {
  profile: ProfileData;
}

export interface SpecialtiesCardProps {
  specialties: SpecialtiesData;
}

export interface SkillsRowProps {
  label: string;
  skills: string[];
}

export interface SkillsCardProps {
  skills: SkillsData;
}

export interface SelfPRCardProps {
  selfPR: SelfPRData;
}

export interface FilterBarProps {
  allTags: string[];
  selectedTags: string[] | null;
  onTagClick: (tag: string) => void;
}

export interface ProjectTableProps {
  projects: Project[];
  expandedProjectId: number | null;
  onRowClick: (projectId: number) => void;
}

export interface ProjectRowProps {
  project: Project;
  isExpanded: boolean;
  onToggle: (projectId: number) => void;
  index: number;
}

export interface ExpandedPanelProps {
  project: Project;
}

// ============================================
// Color Palette Types
// ============================================

export const COLORS = {
  bg: {
    page: '#FAFAFA',
    surface: '#FFFFFF',
    section: '#F4F4F5',
    selected: '#EFF6FF',
  },
  border: {
    light: '#E4E4E7',
    selected: '#BFDBFE',
  },
  text: {
    primary: '#09090B',
    secondary: '#71717A',
    muted: '#52525B',
    link: '#2563EB',
    selected: '#1D4ED8',
    selectedLight: '#3B82F6',
  },
  icon: {
    success: '#16A34A',
  },
} as const;

// ============================================
// Typography Types
// ============================================

export const TYPOGRAPHY = {
  pageTitle: {
    fontSize: 15,
    fontWeight: 700,
    fontFamily: 'Inter',
  },
  sectionHeading: {
    fontSize: 20,
    fontWeight: 700,
    fontFamily: 'Inter',
  },
  subheading: {
    fontSize: 14,
    fontWeight: 600,
    fontFamily: 'Inter',
  },
  body: {
    fontSize: 13,
    fontWeight: 400,
    fontFamily: 'Inter',
    lineHeight: 1.5,
  },
  bodyLarge: {
    fontSize: 13,
    fontWeight: 400,
    fontFamily: 'Inter',
    lineHeight: 1.7,
  },
  subtext: {
    fontSize: 12,
    fontWeight: 400,
    fontFamily: 'Inter',
  },
  small: {
    fontSize: 10,
    fontWeight: 400,
    fontFamily: 'Inter',
  },
  tag: {
    fontSize: 11,
    fontWeight: 400,
    fontFamily: 'Inter',
  },
} as const;

// ============================================
// Spacing Scale
// ============================================

export const SPACING = {
  xs: 8,
  sm: 12,
  md: 16,
  lg: 24,
  xl: 48,
  xxl: 80,
} as const;

// ============================================
// Layout Sizes
// ============================================

export const LAYOUT = {
  headerHeight: 56,
  maxWidth: 1440,
  mainPaddingX: 80,
  mainPaddingY: 48,
  skillsLabelWidth: 168,
  cardBorderRadius: 8,
  tagBorderRadius: 6,
  borderWidth: 1,
} as const;
