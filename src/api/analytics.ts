/**
 * API аналитики: статистика преподавателя и кафедры.
 * Данные по student_reports и validation_results.
 */
import { http } from './http';

/** KPI преподавателя/кафедры: totalWorks, withTemplateResult, pendingTemplateCheck, avgPercent */
export type TeacherStatsKpi = {
  totalWorks: number;
  withTemplateResult?: number;
  pendingTemplateCheck?: number;
  checkedByTemplate?: number;
  notChecked?: number;
  withValidation?: number;
  passed?: number;
  failed?: number;
  avgPercent: number;
  problematicCount?: number;
};

export type AdminAnalyticsKpi = {
  totalTeachers?: number;
  totalWorks: number;
  withTemplateResult?: number;
  pendingTemplateCheck?: number;
  avgPercent: number;
  problematicPct?: number;
};

export type GroupsDetailItem = {
  groupNorm: string;
  disciplineName: string;
  controlType: string;
  total: number;
  withValidation: number;
  passed: number;
  failed: number;
  avgPercent: number;
};

export type GroupsTableItem = {
  groupName: string;
  disciplineName: string;
  studentsCount: number;
  uploaded: number;
  expected: number;
  avgPercent: number;
  criticalErrors: number;
  warnings: number;
};

export type UploadDynamicsItem = {
  month: string;
  uploaded: number;
  checked: number;
};

export type ComplianceBucket = {
  bucket: string;
  count: number;
};

export type FrequentErrorItem = {
  category: string;
  count: number;
};

export type ProblematicGroupItem = {
  groupName: string;
  reports: number;
  avgPercent: number;
  invalidCount: number;
};

export type ByControlTypeItem = {
  controlType: string;
  total: number;
  withValidation: number;
  passed: number;
  avgPercent: number;
};

export type MonthlyItem = {
  month: string;
  total: number;
  withValidation: number;
  passed: number;
  avgPercent: number;
};

/** По спецификации: teacherFio, disciplinesCount, expectedCount, uploadedCount, avgPercent */
export type TeachersSummaryItem = {
  teacherFio?: string;
  teacherLastName?: string;
  disciplinesCount?: number;
  expectedCount?: number;
  uploadedCount?: number;
  totalWorks?: number;
  groupsCount?: number;
  passed?: number;
  avgPercent: number;
  notChecked?: number;
};

// --- Teacher API ---

export async function getTeacherStats(
  lastName: string,
  params?: { dateFrom?: string; dateTo?: string }
): Promise<TeacherStatsKpi> {
  const { data } = await http.get<TeacherStatsKpi>(
    `/teachers/${encodeURIComponent(lastName)}/stats`,
    { params: params ?? {} }
  );
  return data;
}

export async function getTeacherStatsGroups(
  lastName: string,
  params?: { dateFrom?: string; dateTo?: string }
): Promise<GroupsDetailItem[]> {
  const { data } = await http.get<GroupsDetailItem[]>(
    `/teachers/${encodeURIComponent(lastName)}/stats/groups`,
    { params: params ?? {} }
  );
  return Array.isArray(data) ? data : [];
}

export async function getTeacherStatsGroupsTable(
  lastName: string,
  params?: { dateFrom?: string; dateTo?: string }
): Promise<GroupsTableItem[]> {
  const { data } = await http.get<GroupsTableItem[]>(
    `/teachers/${encodeURIComponent(lastName)}/stats/groups-table`,
    { params: params ?? {} }
  );
  return Array.isArray(data) ? data : [];
}

export async function getTeacherStatsByControlType(
  lastName: string,
  params?: { dateFrom?: string; dateTo?: string }
): Promise<ByControlTypeItem[]> {
  const { data } = await http.get<ByControlTypeItem[]>(
    `/teachers/${encodeURIComponent(lastName)}/stats/by-control-type`,
    { params: params ?? {} }
  );
  return Array.isArray(data) ? data : [];
}

export async function getTeacherStatsMonthly(
  lastName: string,
  params?: { dateFrom?: string; dateTo?: string }
): Promise<MonthlyItem[]> {
  const { data } = await http.get<MonthlyItem[]>(
    `/teachers/${encodeURIComponent(lastName)}/stats/monthly`,
    { params: params ?? {} }
  );
  return Array.isArray(data) ? data : [];
}

export async function getTeacherStatsUploadDynamics(
  lastName: string,
  params?: { dateFrom?: string; dateTo?: string }
): Promise<UploadDynamicsItem[]> {
  const { data } = await http.get<UploadDynamicsItem[]>(
    `/teachers/${encodeURIComponent(lastName)}/stats/upload-dynamics`,
    { params: params ?? {} }
  );
  return Array.isArray(data) ? data : [];
}

export async function getTeacherStatsComplianceBuckets(
  lastName: string,
  params?: { dateFrom?: string; dateTo?: string }
): Promise<ComplianceBucket[]> {
  const { data } = await http.get<ComplianceBucket[]>(
    `/teachers/${encodeURIComponent(lastName)}/stats/compliance-buckets`,
    { params: params ?? {} }
  );
  return Array.isArray(data) ? data : [];
}

export async function getTeacherStatsFrequentErrors(
  lastName: string,
  params?: { dateFrom?: string; dateTo?: string; useWarnings?: boolean }
): Promise<FrequentErrorItem[]> {
  const { data } = await http.get<FrequentErrorItem[]>(
    `/teachers/${encodeURIComponent(lastName)}/stats/frequent-errors`,
    { params: params ?? {} }
  );
  return Array.isArray(data) ? data : [];
}

export async function getTeacherStatsProblematicGroups(
  lastName: string,
  params?: { dateFrom?: string; dateTo?: string }
): Promise<ProblematicGroupItem[]> {
  const { data } = await http.get<ProblematicGroupItem[]>(
    `/teachers/${encodeURIComponent(lastName)}/stats/problematic-groups`,
    { params: params ?? {} }
  );
  return Array.isArray(data) ? data : [];
}

// --- Admin API ---

/** Дисциплина кафедры с ФИО преподавателя и метриками (одна строка на пару дисциплина+преподаватель) */
export type DisciplineWithTeacherRowDto = {
  disciplineName: string;
  teacherFio: string;
  course?: string | number;
  semester?: string | number;
  educationLevel?: string;
  educationForm?: string;
  lectureHours?: number;
  practiceHours?: number;
  hasExam?: boolean;
  hasPass?: boolean;
  hasPassMark?: boolean;
  /** Идентификатор строки плана (MIN(plan_row_id) по дисциплине+преподаватель+курс+семестр). Ссылка на страницу: /teachers/{lastName}/discipline/{planRowId} */
  planRowId?: number;
  groupsCount: number;
  studentsCount: number;
  expectedCount: number;
  uploadedCount: number;
};

export async function getDepartmentDisciplinesWithTeachers(
  params?: { dateFrom?: string; dateTo?: string }
): Promise<DisciplineWithTeacherRowDto[]> {
  const { data } = await http.get<DisciplineWithTeacherRowDto[]>(
    '/admin/analytics/disciplines-with-teachers',
    { params: params ?? {} }
  );
  return Array.isArray(data) ? data : [];
}

export async function getAdminAnalytics(
  params?: { dateFrom?: string; dateTo?: string }
): Promise<AdminAnalyticsKpi> {
  const { data } = await http.get<AdminAnalyticsKpi>('/admin/analytics', {
    params: params ?? {},
  });
  return data;
}

export async function getAdminAnalyticsTeachersSummary(
  params?: { dateFrom?: string; dateTo?: string }
): Promise<TeachersSummaryItem[]> {
  try {
    const { data } = await http.get<TeachersSummaryItem[]>(
      '/admin/analytics/teachers-summary',
      { params: params ?? {} }
    );
    if (!Array.isArray(data)) return [];
    return data.map((item) => ({
      ...item,
      teacherFio: item.teacherFio ?? item.teacherLastName,
      teacherLastName: item.teacherLastName ?? item.teacherFio,
      totalWorks: item.totalWorks ?? item.uploadedCount,
      uploadedCount: item.uploadedCount ?? item.totalWorks,
    }));
  } catch {
    return [];
  }
}

export async function getAdminAnalyticsByControlType(
  params?: { dateFrom?: string; dateTo?: string; teacherLastName?: string }
): Promise<ByControlTypeItem[]> {
  const { data } = await http.get<ByControlTypeItem[]>(
    '/admin/analytics/by-control-type',
    { params: params ?? {} }
  );
  return Array.isArray(data) ? data : [];
}

export async function getAdminAnalyticsMonthly(
  params?: { dateFrom?: string; dateTo?: string; teacherLastName?: string }
): Promise<MonthlyItem[]> {
  const { data } = await http.get<MonthlyItem[]>(
    '/admin/analytics/monthly',
    { params: params ?? {} }
  );
  return Array.isArray(data) ? data : [];
}

export async function getAdminAnalyticsUploadDynamics(
  params?: { dateFrom?: string; dateTo?: string; teacherLastName?: string }
): Promise<UploadDynamicsItem[]> {
  const { data } = await http.get<UploadDynamicsItem[]>(
    '/admin/analytics/upload-dynamics',
    { params: params ?? {} }
  );
  return Array.isArray(data) ? data : [];
}

export async function getAdminAnalyticsComplianceBuckets(
  params?: { dateFrom?: string; dateTo?: string; teacherLastName?: string }
): Promise<ComplianceBucket[]> {
  const { data } = await http.get<ComplianceBucket[]>(
    '/admin/analytics/compliance-buckets',
    { params: params ?? {} }
  );
  return Array.isArray(data) ? data : [];
}

export async function getAdminAnalyticsFrequentErrors(
  params?: {
    dateFrom?: string;
    dateTo?: string;
    teacherLastName?: string;
    useWarnings?: boolean;
  }
): Promise<FrequentErrorItem[]> {
  const { data } = await http.get<FrequentErrorItem[]>(
    '/admin/analytics/frequent-errors',
    { params: params ?? {} }
  );
  return Array.isArray(data) ? data : [];
}

export async function getAdminAnalyticsProblematicGroups(
  params?: { dateFrom?: string; dateTo?: string; teacherLastName?: string }
): Promise<ProblematicGroupItem[]> {
  const { data } = await http.get<ProblematicGroupItem[]>(
    '/admin/analytics/problematic-groups',
    { params: params ?? {} }
  );
  return Array.isArray(data) ? data : [];
}

export async function getAdminAnalyticsByDisciplines(
  params?: { dateFrom?: string; dateTo?: string; teacherLastName?: string }
): Promise<GroupsDetailItem[]> {
  const { data } = await http.get<GroupsDetailItem[]>(
    '/admin/analytics/by-disciplines',
    { params: params ?? {} }
  );
  return Array.isArray(data) ? data : [];
}

export type DisciplinesTableItem = {
  disciplineName: string;
  groupsCount: number;
  studentsCount: number;
  uploadedCount: number;
  expectedCount: number;
  progressPercent: number;
  avgPercent: number;
};

export async function getTeacherStatsDisciplinesTable(
  lastName: string,
  params?: { dateFrom?: string; dateTo?: string }
): Promise<DisciplinesTableItem[]> {
  const { data } = await http.get<DisciplinesTableItem[]>(
    `/teachers/${encodeURIComponent(lastName)}/stats/disciplines-table`,
    { params: params ?? {} }
  );
  return Array.isArray(data) ? data : [];
}

export async function getAdminAnalyticsDisciplinesTable(
  params?: { dateFrom?: string; dateTo?: string; teacherLastName?: string }
): Promise<DisciplinesTableItem[]> {
  const { data } = await http.get<DisciplinesTableItem[]>(
    '/admin/analytics/disciplines-table',
    { params: params ?? {} }
  );
  return Array.isArray(data) ? data : [];
}

export type ErrorsByDisciplineItem = { category: string; disciplineName: string; count: number };
export type FailingCriteriaItem = { criteria: string; count: number };

export async function getTeacherStatsErrorsByDiscipline(
  lastName: string,
  params?: { dateFrom?: string; dateTo?: string }
): Promise<ErrorsByDisciplineItem[]> {
  const { data } = await http.get<ErrorsByDisciplineItem[]>(
    `/teachers/${encodeURIComponent(lastName)}/stats/errors-by-discipline`,
    { params: params ?? {} }
  );
  return Array.isArray(data) ? data : [];
}

export async function getTeacherStatsFailingCriteria(
  lastName: string,
  params?: { dateFrom?: string; dateTo?: string }
): Promise<FailingCriteriaItem[]> {
  const { data } = await http.get<FailingCriteriaItem[]>(
    `/teachers/${encodeURIComponent(lastName)}/stats/failing-criteria`,
    { params: params ?? {} }
  );
  return Array.isArray(data) ? data : [];
}

export async function getAdminAnalyticsErrorsByDiscipline(
  params?: { dateFrom?: string; dateTo?: string; teacherLastName?: string }
): Promise<ErrorsByDisciplineItem[]> {
  const { data } = await http.get<ErrorsByDisciplineItem[]>(
    '/admin/analytics/errors-by-discipline',
    { params: params ?? {} }
  );
  return Array.isArray(data) ? data : [];
}

export async function getAdminAnalyticsFailingCriteria(
  params?: { dateFrom?: string; dateTo?: string; teacherLastName?: string }
): Promise<FailingCriteriaItem[]> {
  const { data } = await http.get<FailingCriteriaItem[]>(
    '/admin/analytics/failing-criteria',
    { params: params ?? {} }
  );
  return Array.isArray(data) ? data : [];
}

// --- Filters ---

export async function getFiltersTeachers(): Promise<string[]> {
  try {
    const { data } = await http.get<string[]>('/filters/teachers');
    return Array.isArray(data) ? data : [];
  } catch {
    return [];
  }
}

export async function getFiltersDisciplines(): Promise<string[]> {
  try {
    const { data } = await http.get<string[]>('/filters/disciplines');
    return Array.isArray(data) ? data : [];
  } catch {
    return [];
  }
}
