import type { DisciplineWithTeacherRowDto } from '@/api/info';

export type ScopeMode = 'department' | 'personal';

export type AnalyticsViewMode = 'chart' | 'table';

/** Элемент вертикального bar-chart (ожидается / загружено). */
export type VBarItem = {
  label: string;
  shortLabel: string;
  plan: number;
  uploaded: number;
};

/** Строка горизонтального bar-chart (ключ, заголовок, план / факт). */
export type HBarRow = {
  key: string;
  title: string;
  plan: number;
  uploaded: number;
};

export type TeacherPlanCardNormalized = {
  disciplineName: string;
  course: string | null;
  semester: string | null;
  groupsCount: number;
};

export type AnalyticsDisciplineTableRow = {
  planRowId?: number;
  disciplineName: string;
  teacherFio: string;
  teacherLastName?: string;
  course?: string | number;
  semester?: string | number;
  groups?: DisciplineWithTeacherRowDto['groups'];
  groupsCount: number;
  studentsCount: number;
  expectedCount: number;
  uploadedCount: number;
};
