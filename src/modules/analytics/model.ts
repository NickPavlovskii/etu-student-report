import type { DisciplineWithTeacherRowDto } from '@/api/info';

/** Результат `useTablePagination` для `AnalyticsWidgetCard`. */
export type AnalyticsWidgetPaginationVm = ReturnType<
  typeof import('@/composables/useTablePagination').useTablePagination<unknown>
>;

export type ScopeMode = 'department' | 'personal';

export type AnalyticsViewMode = 'chart' | 'table';

/** Элемент вертикального bar-chart (ожидается / загружено). */
export type VBarItem = {
  label: string;
  shortLabel: string;
  plan: number;
  uploaded: number;
  moodle?: number;
};

/** Строка горизонтального bar-chart (ключ, заголовок, план / факт). */
export type HBarRow = {
  key: string;
  title: string;
  plan: number;
  uploaded: number;
  moodle?: number;
};

export type TeacherPlanCardNormalized = {
  disciplineName: string;
  course: string | null;
  semester: string | null;
  groupsCount: number;
};

/** Строка-дочка в дереве преподавателей (аналитика кафедры). */
export type TeacherTreeChildRow = {
  disciplineName: string;
  planRowId?: number;
  plan: number;
  uploaded: number;
  moodle?: number;
  groupTags: string[];
};

/** Свернутый блок «преподаватель → дисциплины». */
export type TeacherTreeBlock = {
  teacher: string;
  plan: number;
  uploaded: number;
  moodle?: number;
  pct: number;
  children: TeacherTreeChildRow[];
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
  moodleLinksCount?: number;
};
