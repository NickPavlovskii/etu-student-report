import type { Ref } from 'vue';
import { ref, computed, watch } from 'vue';
import { useUser } from '@/composables/useUser';
import {
  getTeacherStats,
  getTeacherStatsGroupsTable,
  getTeacherStatsByControlType,
  getTeacherStatsUploadDynamics,
  getTeacherStatsComplianceBuckets,
  getTeacherStatsFrequentErrors,
  getTeacherStatsProblematicGroups,
  getAdminAnalytics,
  getAdminAnalyticsByControlType,
  getAdminAnalyticsUploadDynamics,
  getAdminAnalyticsComplianceBuckets,
  getAdminAnalyticsFrequentErrors,
  getAdminAnalyticsProblematicGroups,
  getAdminAnalyticsByDisciplines,
  getAdminAnalyticsTeachersSummary,
  getFiltersTeachers,
} from '@/api/analytics';
import type {
  TeacherStatsKpi,
  AdminAnalyticsKpi,
  GroupsTableItem,
  ByControlTypeItem,
  UploadDynamicsItem,
  ComplianceBucket,
  FrequentErrorItem,
  ProblematicGroupItem,
  TeachersSummaryItem,
} from '@/api/analytics';

export type ViewMode = 'chart' | 'table';

function toDateRange(
  range: 'week' | 'month' | 'all',
  month: number | null,
  year: number | null
): { dateFrom: string; dateTo: string } {
  const now = new Date();
  const y = year ?? now.getFullYear();
  const m = month ?? now.getMonth();

  if (range === 'all') {
    return {
      dateFrom: `${y - 1}-09-01`,
      dateTo: `${y}-08-31`,
    };
  }
  if (range === 'week') {
    const to = new Date(now);
    const from = new Date(now);
    from.setDate(from.getDate() - 7);
    return {
      dateFrom: from.toISOString().slice(0, 10),
      dateTo: to.toISOString().slice(0, 10),
    };
  }
  const lastDay = new Date(y, m + 1, 0);
  const firstDay = new Date(y, m, 1);
  return {
    dateFrom: firstDay.toISOString().slice(0, 10),
    dateTo: lastDay.toISOString().slice(0, 10),
  };
}

export type ScopeMode = 'department' | 'personal';

export function useAnalytics(filters: {
  dateRange: Ref<'week' | 'month' | 'all'>;
  month: Ref<number | null>;
  year: Ref<number | null>;
  teacherLastName: Ref<string>;
  scopeMode?: Ref<ScopeMode>;
}) {
  const { lastName, canSeeAll } = useUser();

  const loading = ref(false);
  const error = ref<string | null>(null);

  const params = computed(() => {
    const range = filters.dateRange.value ?? 'month';
    const month = filters.month.value ?? new Date().getMonth();
    const year = filters.year.value ?? new Date().getFullYear();
    const { dateFrom, dateTo } = toDateRange(range, month, year);
    const useDept = canSeeAll.value && scope.value === 'department';
    const teacherLastName = useDept && filters.teacherLastName.value
      ? filters.teacherLastName.value
      : undefined;
    return { dateFrom, dateTo, teacherLastName };
  });

  const teacherKpi = ref<TeacherStatsKpi | null>(null);
  const adminKpi = ref<AdminAnalyticsKpi | null>(null);
  const groupsTable = ref<GroupsTableItem[]>([]);
  const byControlType = ref<ByControlTypeItem[]>([]);
  const byDisciplines = ref<ByControlTypeItem[]>([]);
  const uploadDynamics = ref<UploadDynamicsItem[]>([]);
  const complianceBuckets = ref<ComplianceBucket[]>([]);
  const frequentErrors = ref<FrequentErrorItem[]>([]);
  const problematicGroups = ref<ProblematicGroupItem[]>([]);
  const teachersList = ref<string[]>([]);
  const teachersSummary = ref<TeachersSummaryItem[]>([]);

  const scope = computed(() => filters.scopeMode?.value ?? 'department');
  const showDepartmentStats = computed(
    () => canSeeAll.value && scope.value === 'department'
  );

  async function loadAll() {
    if (!lastName.value && !canSeeAll.value) return;
    loading.value = true;
    error.value = null;
    try {
      const { dateFrom, dateTo, teacherLastName } = params.value;
      const useAdminApi = canSeeAll.value && scope.value === 'department';

      if (useAdminApi) {
        const [kpi, byCtrl, dynamics, buckets, freqErr, problematic, byDisc, teachers, tSummary] =
          await Promise.all([
            getAdminAnalytics({ dateFrom, dateTo }),
            getAdminAnalyticsByControlType({
              dateFrom,
              dateTo,
              teacherLastName: teacherLastName || undefined,
            }),
            getAdminAnalyticsUploadDynamics({
              dateFrom,
              dateTo,
              teacherLastName: teacherLastName || undefined,
            }),
            getAdminAnalyticsComplianceBuckets({
              dateFrom,
              dateTo,
              teacherLastName: teacherLastName || undefined,
            }),
            getAdminAnalyticsFrequentErrors({
              dateFrom,
              dateTo,
              teacherLastName: teacherLastName || undefined,
              useWarnings: false,
            }),
            getAdminAnalyticsProblematicGroups({
              dateFrom,
              dateTo,
              teacherLastName: teacherLastName || undefined,
            }),
            getAdminAnalyticsByDisciplines({
              dateFrom,
              dateTo,
              teacherLastName: teacherLastName || undefined,
            }),
            getFiltersTeachers(),
            getAdminAnalyticsTeachersSummary({ dateFrom, dateTo }),
          ]);
        adminKpi.value = kpi;
        byControlType.value = byCtrl;
        uploadDynamics.value = dynamics;
        complianceBuckets.value = buckets;
        frequentErrors.value = freqErr;
        problematicGroups.value = problematic;
        byDisciplines.value = byDisc as any;
        teachersList.value = teachers;
        teachersSummary.value = tSummary;
        teacherKpi.value = null;
        groupsTable.value = [];
      } else {
        const [kpi, groupsTbl, byCtrl, dynamics, buckets, freqErr, problematic] =
          await Promise.all([
            getTeacherStats(lastName.value, { dateFrom, dateTo }),
            getTeacherStatsGroupsTable(lastName.value, { dateFrom, dateTo }),
            getTeacherStatsByControlType(lastName.value, { dateFrom, dateTo }),
            getTeacherStatsUploadDynamics(lastName.value, { dateFrom, dateTo }),
            getTeacherStatsComplianceBuckets(lastName.value, { dateFrom, dateTo }),
            getTeacherStatsFrequentErrors(lastName.value, { dateFrom, dateTo, useWarnings: false }),
            getTeacherStatsProblematicGroups(lastName.value, { dateFrom, dateTo }),
          ]);
        teacherKpi.value = kpi;
        groupsTable.value = groupsTbl;
        byControlType.value = byCtrl;
        uploadDynamics.value = dynamics;
        complianceBuckets.value = buckets;
        frequentErrors.value = freqErr;
        problematicGroups.value = problematic;
        adminKpi.value = null;
        byDisciplines.value = [];
        teachersList.value = [];
        teachersSummary.value = [];
      }
    } catch (e) {
      error.value = e instanceof Error ? e.message : 'Ошибка загрузки';
      teacherKpi.value = null;
      adminKpi.value = null;
      groupsTable.value = [];
      byControlType.value = [];
      uploadDynamics.value = [];
      complianceBuckets.value = [];
      frequentErrors.value = [];
      problematicGroups.value = [];
    } finally {
      loading.value = false;
    }
  }

  const kpi = computed(() => {
    if (canSeeAll.value && adminKpi.value) {
      const a = adminKpi.value;
      const withRes = a.withTemplateResult ?? a.totalWorks;
      const pending = a.pendingTemplateCheck ?? 0;
      return {
        totalWorks: a.totalWorks,
        withTemplateResult: withRes,
        pendingTemplateCheck: pending,
        avgPercent: a.avgPercent,
      };
    }
    if (teacherKpi.value) {
      const t = teacherKpi.value;
      const withRes =
        t.withTemplateResult ?? t.checkedByTemplate ?? t.withValidation ?? t.totalWorks;
      const pending =
        t.pendingTemplateCheck ?? t.notChecked ?? Math.max(0, t.totalWorks - (withRes ?? 0));
      return {
        totalWorks: t.totalWorks,
        withTemplateResult: withRes,
        pendingTemplateCheck: pending,
        avgPercent: t.avgPercent,
      };
    }
    return null;
  });

  watch([params, scope], loadAll);

  return {
    loading,
    error,
    loadAll,
    kpi,
    groupsTable,
    teachersSummary,
    byControlType,
    byDisciplines,
    uploadDynamics,
    complianceBuckets,
    frequentErrors,
    problematicGroups,
    teachersList,
    canSeeAll,
    showDepartmentStats,
  };
}
