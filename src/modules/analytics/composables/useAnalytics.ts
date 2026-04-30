import type { ComputedRef, Ref } from 'vue';
import { ref, shallowRef, computed, watch } from 'vue';
import { useUser } from '@/composables/useUser';
import {
  getTeacherStats,
  getTeacherStatsDisciplinesTable,
  getTeacherStatsBySemester,
  getAdminAnalytics,
  getAdminAnalyticsTeachersSummary,
  getAdminAnalyticsDisciplinesTable,
  getAdminAnalyticsBySemester,
  getDepartmentDisciplinesWithTeachers,
  getDisciplineCards,
  type TeacherStatsKpi,
  type AdminAnalyticsKpi,
  type DisciplinesTableItem,
  type BySemesterRow,
  type TeachersSummaryItem,
  type DisciplineWithTeacherRowDto,
  type AnalyticsQueryParams,
  type StudyPeriod,
} from '@/api/info';
import { teacherCardsResponseToArray } from '../utils/analyticsScope';
import type { ScopeMode } from '../model';

function normalizeAcademicYear(raw: string): string {
  return raw.replace(/\//g, '-').trim();
}

function getMoodleWorksCount(
  row: { moodleLinksCount?: number; moodleUploadedCount?: number }
): number {
  return Number(row.moodleLinksCount ?? row.moodleUploadedCount) || 0;
}

export type { ScopeMode } from '../model';

export function useAnalytics(filters: {
  academicYear: Ref<string>;
  studyPeriod: Ref<StudyPeriod>;
  scopeMode?: Ref<ScopeMode>;
  fetchEnabled?: Ref<boolean> | ComputedRef<boolean>;
}) {
  const { lastName, canSeeAll } = useUser();

  const fetchEnabled = filters.fetchEnabled ?? ref(true);

  const loading = ref(false);
  const error = ref<string | null>(null);

  const params = computed((): AnalyticsQueryParams | null => {
    const academicYear = normalizeAcademicYear(filters.academicYear.value);
    if (!academicYear) return null;
    const sp = filters.studyPeriod.value;
    const base: AnalyticsQueryParams = { academicYear };
    if (sp && sp !== 'academic_year') {
      base.studyPeriod = sp;
    }
    return base;
  });

  const teacherKpi = ref<TeacherStatsKpi | null>(null);
  const adminKpi = ref<AdminAnalyticsKpi | null>(null);
  const disciplinesTable = shallowRef<DisciplinesTableItem[]>([]);
  const bySemester = shallowRef<BySemesterRow[]>([]);
  const teachersSummary = shallowRef<TeachersSummaryItem[]>([]);
  const disciplinesWithTeachers = shallowRef<DisciplineWithTeacherRowDto[]>([]);
  const teacherDisciplineCards = ref<unknown[]>([]);

  const scope = computed(() => filters.scopeMode?.value ?? 'department');
  const showDepartmentStats = computed(
    () => canSeeAll.value && scope.value === 'department'
  );

  async function loadAll() {
    if (!fetchEnabled.value) return;
    if (!lastName.value && !canSeeAll.value) return;
    const q = params.value;
    if (!q) {
      teacherKpi.value = null;
      adminKpi.value = null;
      disciplinesTable.value = [];
      bySemester.value = [];
      teachersSummary.value = [];
      disciplinesWithTeachers.value = [];
      teacherDisciplineCards.value = [];
      return;
    }

    loading.value = true;
    error.value = null;
    try {
      const useAdminApi = canSeeAll.value && scope.value === 'department';

      if (useAdminApi) {
        const [kpi, tSummary, disc, sem, det] = await Promise.all([
          getAdminAnalytics(q),
          getAdminAnalyticsTeachersSummary(q),
          getAdminAnalyticsDisciplinesTable(q),
          getAdminAnalyticsBySemester(q),
          getDepartmentDisciplinesWithTeachers(q),
        ]);
        adminKpi.value = kpi;
        teachersSummary.value = tSummary;
        disciplinesTable.value = disc;
        bySemester.value = sem;
        disciplinesWithTeachers.value = det;
        teacherKpi.value = null;
        teacherDisciplineCards.value = [];
      } else {
        const ln = lastName.value;
        if (!ln) {
          throw new Error('Не удалось определить преподавателя');
        }
        const [kpi, disc, sem, cardsRes] = await Promise.all([
          getTeacherStats(ln, q),
          getTeacherStatsDisciplinesTable(ln, q),
          getTeacherStatsBySemester(ln, q),
          getDisciplineCards(ln, q.academicYear).catch(() => null),
        ]);
        teacherKpi.value = kpi;
        disciplinesTable.value = disc;
        bySemester.value = sem;
        adminKpi.value = null;
        teachersSummary.value = [];
        disciplinesWithTeachers.value = [];
        teacherDisciplineCards.value = teacherCardsResponseToArray(cardsRes);
      }
    } catch (e) {
      error.value = e instanceof Error ? e.message : 'Ошибка загрузки';
      teacherKpi.value = null;
      adminKpi.value = null;
      disciplinesTable.value = [];
      bySemester.value = [];
      teachersSummary.value = [];
      disciplinesWithTeachers.value = [];
      teacherDisciplineCards.value = [];
    } finally {
      loading.value = false;
    }
  }

  const kpi = computed(() => {
    const rows = disciplinesTable.value;
    if (rows.length > 0) {
      let expectedCount = 0;
      let totalWorks = 0;
      let moodleWorks = 0;
      for (const r of rows) {
        expectedCount += Number(r.expectedCount) || 0;
        totalWorks += Number(r.uploadedCount) || 0;
        moodleWorks += getMoodleWorksCount(r);
      }
      return {
        expectedCount,
        totalWorks,
        moodleWorks,
        totalTeachers: adminKpi.value?.totalTeachers,
      };
    }
    if (adminKpi.value) {
      const a = adminKpi.value;
      return {
        expectedCount: a.expectedCount ?? 0,
        totalWorks: a.totalWorks ?? 0,
        moodleWorks: a.moodleWorks ?? 0,
        totalTeachers: a.totalTeachers,
      };
    }
    if (teacherKpi.value) {
      const t = teacherKpi.value;
      return {
        expectedCount: t.expectedCount ?? 0,
        totalWorks: t.totalWorks ?? 0,
        moodleWorks: t.moodleWorks ?? 0,
      };
    }
    return null;
  });

  watch(
    [
      () => normalizeAcademicYear(filters.academicYear.value),
      () => filters.studyPeriod.value,
      () => (filters.scopeMode?.value ?? 'department'),
      () => fetchEnabled.value,
      () => canSeeAll.value,
    ],
    () => {
      if (!fetchEnabled.value) {
        return;
      }
      void loadAll();
    }
  );

  return {
    loading,
    error,
    loadAll,
    kpi,
    disciplinesTable,
    bySemester,
    teachersSummary,
    disciplinesWithTeachers,
    teacherDisciplineCards,
    canSeeAll,
    showDepartmentStats,
  };
}
