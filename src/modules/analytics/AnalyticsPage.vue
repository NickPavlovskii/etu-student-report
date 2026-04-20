<template>
  <etu-loading-page v-if="loading" />
  <v-container
    v-else
    fluid
    class="page"
  >
    <etu-page-header
      icon="mdi-chart-box-outline"
      title="Аналитика по работам"
      icon-color="#2563eb"
      icon-bg-color="#eff6ff"
      :subtitle="headerSubtitle"
    >
      <template #right>
        <analytics-study-period-switcher v-model="studyPeriod" />
      </template>
    </etu-page-header>

    <analytics-scope-switcher
      v-if="canSeeAll"
      v-model="scopeMode"
    />

    <v-alert
      v-if="error"
      type="error"
      variant="tonal"
      class="mb-4"
      closable
    >
      {{ error }}
    </v-alert>

    <template v-if="displayKpi">
      <kpi-hero-card
        :total-works="displayKpi.totalWorks"
        :expected-count="displayKpi.expectedCount"
      />

      <v-row
        dense
        class="widgets-row"
        align="stretch"
      >
        <v-col cols="12">
          <disciplines-widget
            :rows="disciplinesTableForScope"
            :use-plan-detail="disciplinesUsePlanDetailTable"
            :subtitle="disciplinesWidgetHint"
          />
        </v-col>
      </v-row>

      <template v-if="showDepartmentStats">
        <v-row
          dense
          class="widgets-row widgets-row--dept-pair"
          align="stretch"
        >
          <v-col
            cols="12"
            lg="6"
          >
            <groups-widget :rows="groupRows" />
          </v-col>

          <v-col
            cols="12"
            lg="6"
          >
            <teachers-widget :rows="teachersSummaryForScope" />
          </v-col>
        </v-row>
      </template>

      <v-row
        dense
        class="widgets-row"
        align="stretch"
      >
        <v-col cols="12">
          <semesters-widget :rows="bySemesterForScope" />
        </v-col>

        <v-col
          v-if="showDepartmentStats && teacherDetailBlocks.length"
          cols="12"
        >
          <v-card
            class="widget-card"
            elevation="0"
          >
            <div class="widget-head widget-head--simple">
              <div class="widget-head__left">
                <v-icon
                  size="22"
                  class="widget-head__ico"
                >
                  mdi-file-tree-outline
                </v-icon>
                <div>
                  <h3 class="widget-title">Детализация по преподавателям</h3>
                  <p class="widget-sub">
                    {{ teacherTreeWidgetHint }}
                  </p>
                </div>
              </div>
              <v-btn-toggle
                v-model="viewTeacherTree"
                class="view-toggle view-toggle--pill"
                data-analytics-view-toggle
                density="comfortable"
                variant="flat"
                mandatory
              >
                <v-btn
                  value="table"
                  size="small"
                >
                  <v-icon start>mdi-table-large</v-icon>
                  Таблица
                </v-btn>
                <v-btn
                  value="chart"
                  size="small"
                >
                  <v-icon start>mdi-chart-bar</v-icon>
                  График
                </v-btn>
              </v-btn-toggle>
            </div>
            <div class="widget-body widget-body--toggle-view">
              <template
                v-if="viewTeacherTree === 'chart' && teacherDetailBlocks.length"
              >
                <div class="widget-body__scroll">
                  <analytics-horizontal-bar-chart :rows="teacherTreeBarRows" />
                </div>
                <analytics-table-pagination
                  v-model:page="teacherTreePagination.page"
                  :page-count="teacherTreePagination.pageCount"
                  :total="teacherTreePagination.total"
                  :range-label="teacherTreePagination.rangeLabel"
                />
              </template>
              <template
                v-else-if="
                  teacherDetailBlocks.length && viewTeacherTree !== 'chart'
                "
              >
                <div class="widget-body__scroll">
                  <etu-data-table
                    scrollable
                    wrap-class="analytics-etu-dt"
                    table-class="tree-table tree-table--fixed analytics-table--detail"
                    :columns="teacherTreeTableColumns"
                    :rows="[]"
                    :show-skeleton="false"
                  >
                    <template #tbody>
                      <template
                        v-for="block in teacherTreePagination.pagedItems"
                        :key="block.teacher"
                      >
                        <tr
                          class="tree-row tree-row--parent"
                          @click="toggleTeacherExpand(block.teacher)"
                        >
                          <td class="tree-col-chev">
                            <v-icon size="20">
                              {{ teacherTreeChevronIcon(block.teacher) }}
                            </v-icon>
                          </td>
                          <td class="tree-col-name">
                            <strong>{{ block.teacher }}</strong>
                            <span class="tree-meta">
                              · {{ block.children.length }} дисц.
                            </span>
                          </td>
                          <td class="tree-col-groups tree-col-groups--parent" />
                          <td class="tree-col-upload cell-upload-prog-wrap">
                            <progress-bar
                              compact
                              :uploaded="block.uploaded"
                              :plan="block.plan"
                            />
                          </td>
                        </tr>
                        <tr
                          v-for="ch in visibleTeacherChildRows(block)"
                          :key="
                            block.teacher +
                            ch.disciplineName +
                            String(ch.planRowId)
                          "
                          class="tree-row tree-row--child"
                        >
                          <td class="tree-col-chev" />
                          <td class="tree-col-name tree-child-name">
                            {{ ch.disciplineName }}
                          </td>
                          <td class="tree-col-groups">
                            <span
                              v-for="g in ch.groupTags"
                              :key="g"
                              class="grp-tag grp-tag--plan"
                            >
                              {{ planRowGroupChipLabel(g) }}
                            </span>
                          </td>
                          <td class="tree-col-upload cell-upload-prog-wrap">
                            <progress-bar
                              compact
                              :uploaded="ch.uploaded"
                              :plan="ch.plan"
                            />
                          </td>
                        </tr>
                      </template>
                    </template>
                  </etu-data-table>
                </div>
                <analytics-table-pagination
                  v-model:page="teacherTreePagination.page"
                  :page-count="teacherTreePagination.pageCount"
                  :total="teacherTreePagination.total"
                  :range-label="teacherTreePagination.rangeLabel"
                />
              </template>
              <p
                v-else
                class="widget-empty"
              >
                Нет данных для графика
              </p>
            </div>
          </v-card>
        </v-col>
      </v-row>
    </template>
  </v-container>
</template>

<script setup lang="ts">
  import { ref, computed, onMounted, watch, toValue } from 'vue';
  import { useRouter } from 'vue-router';
  import { useUser } from '@/composables/useUser';
  import { useAcademicYear } from '@/composables/useAcademicYear';
  import type { TeachersSummaryItem, StudyPeriod } from '@/api/info';
  import { useTablePagination } from '@/composables/useTablePagination';
  import { useAnalytics } from './composables/useAnalytics';
  import type {
    ScopeMode,
    AnalyticsDisciplineTableRow,
    AnalyticsViewMode,
    TeacherTreeBlock,
    TeacherTreeChildRow,
  } from './model';
  import { teacherTreeTableColumns } from './constants/columns';
  import {
    filterByStudyPeriod,
    aggregateDisciplinesTableFromPlan,
    aggregateTeachersSummaryFromPlan,
    buildPersonalDisciplinesTableFromCards,
    planRowsToDisciplineWidgetRows,
    disciplineTableItemsToWidgetRows,
    buildTeacherDetailBlocks,
  } from './utils/analyticsScope';
  import { planRowGroupChipLabel } from './utils/format';
  import { aggregateGroupsFromDetail } from './utils/aggregateGroupsFromDetail';
  import ProgressBar from '@/components/shared/ProgressBar.vue';
  import AnalyticsScopeSwitcher from './components/AnalyticsScopeSwitcher.vue';
  import KpiHeroCard from './components/widgets/KpiHeroCard.vue';
  import DisciplinesWidget from './components/widgets/DisciplinesWidget.vue';
  import GroupsWidget from './components/widgets/GroupsWidget.vue';
  import TeachersWidget from './components/widgets/TeachersWidget.vue';
  import SemestersWidget from './components/widgets/SemestersWidget.vue';
  import AnalyticsStudyPeriodSwitcher from './components/AnalyticsStudyPeriodSwitcher.vue';
  import AnalyticsHorizontalBarChart from './components/charts/AnalyticsHorizontalBarChart.vue';
  import AnalyticsTablePagination from './components/AnalyticsTablePagination.vue';

  const router = useRouter();
  const { user, canSeeAll } = useUser();
  const { academicYear } = useAcademicYear();

  const academicYearForDisplay = computed(() =>
    academicYear.value.replace(/\//g, '-').replace(/-/g, '–').trim()
  );

  const scopeMode = ref<ScopeMode>('personal');
  const viewTeacherTree = ref<AnalyticsViewMode>('table');

  const expandedTeachers = ref<Set<string>>(new Set());

  const studyPeriod = ref<StudyPeriod>('academic_year');

  function studyPeriodShortLabel(p: StudyPeriod): string {
    switch (p) {
      case 'autumn_semester':
        return 'осенний семестр';
      case 'spring_semester':
        return 'весенний семестр';
      default:
        return 'весь учебный год';
    }
  }

  const headerSubtitle = computed(
    () =>
      `План и факт: ${studyPeriodShortLabel(studyPeriod.value)}, год ${academicYearForDisplay.value}.`
  );

  const disciplinesWidgetHint = computed(() => {
    if (studyPeriod.value === 'academic_year') {
      return 'Сколько работ загружено из плана за учебный год.';
    }
    return `Сколько работ загружено из плана за ${studyPeriodShortLabel(studyPeriod.value)}.`;
  });

  const teacherTreeWidgetHint = computed(() => {
    if (studyPeriod.value === 'academic_year') {
      return 'План и факт по преподавателю за выбранный учебный год.';
    }
    return `План и факт по преподавателю за ${studyPeriodShortLabel(studyPeriod.value)}.`;
  });

  const {
    loading,
    error,
    loadAll,
    kpi,
    disciplinesTable,
    bySemester,
    teachersSummary,
    disciplinesWithTeachers,
    teacherDisciplineCards,
    showDepartmentStats,
  } = useAnalytics({
    academicYear,
    scopeMode,
    studyPeriod,
  });

  const disciplinesWithTeachersFiltered = computed(() =>
    filterByStudyPeriod(disciplinesWithTeachers.value, studyPeriod.value)
  );

  const disciplinesPlanDetailRows = computed(
    (): AnalyticsDisciplineTableRow[] => {
      if (
        !showDepartmentStats.value ||
        disciplinesWithTeachers.value.length === 0
      ) {
        return [];
      }
      return planRowsToDisciplineWidgetRows(
        disciplinesWithTeachersFiltered.value
      );
    }
  );

  const disciplinesUsePlanDetailTable = computed(
    () => disciplinesPlanDetailRows.value.length > 0
  );

  const disciplinesSimpleTableForScope = computed(() => {
    const period = studyPeriod.value;
    if (showDepartmentStats.value && disciplinesWithTeachers.value.length > 0) {
      if (disciplinesUsePlanDetailTable.value) return [];
      return aggregateDisciplinesTableFromPlan(
        disciplinesWithTeachersFiltered.value
      );
    }
    if (!showDepartmentStats.value && period !== 'academic_year') {
      return buildPersonalDisciplinesTableFromCards(
        teacherDisciplineCards.value,
        period,
        disciplinesTable.value,
        filterByStudyPeriod(bySemester.value, period)
      );
    }
    return disciplinesTable.value;
  });

  const disciplinesTableForScope = computed(
    (): AnalyticsDisciplineTableRow[] => {
      if (disciplinesUsePlanDetailTable.value) {
        return disciplinesPlanDetailRows.value;
      }
      return disciplineTableItemsToWidgetRows(
        disciplinesSimpleTableForScope.value
      );
    }
  );

  const bySemesterForScope = computed(() =>
    filterByStudyPeriod(bySemester.value, studyPeriod.value)
  );

  const teachersSummaryForScope = computed((): TeachersSummaryItem[] => {
    if (showDepartmentStats.value && disciplinesWithTeachers.value.length > 0) {
      return aggregateTeachersSummaryFromPlan(
        filterByStudyPeriod(disciplinesWithTeachers.value, studyPeriod.value)
      );
    }
    return teachersSummary.value;
  });

  const displayKpi = computed(() => {
    const rows = disciplinesTableForScope.value;
    const period = studyPeriod.value;
    if (rows.length > 0) {
      let expectedCount = 0;
      let totalWorks = 0;
      for (const r of rows) {
        expectedCount += Number(r.expectedCount) || 0;
        totalWorks += Number(r.uploadedCount) || 0;
      }
      return {
        expectedCount,
        totalWorks,
        totalTeachers: kpi.value?.totalTeachers,
      };
    }
    if (!showDepartmentStats.value && period !== 'academic_year') {
      return {
        expectedCount: 0,
        totalWorks: 0,
        totalTeachers: undefined,
      };
    }
    return kpi.value;
  });

  const groupRows = computed(() =>
    aggregateGroupsFromDetail(
      filterByStudyPeriod(disciplinesWithTeachers.value, studyPeriod.value)
    )
  );

  const teacherDetailBlocks = computed(() =>
    buildTeacherDetailBlocks(
      filterByStudyPeriod(disciplinesWithTeachers.value, studyPeriod.value)
    )
  );

  const teacherTreePagination = useTablePagination(teacherDetailBlocks);

  const teacherTreeBarRows = computed(() =>
    toValue(teacherTreePagination.pagedItems).map((block) => ({
      key: block.teacher,
      title: block.teacher,
      plan: block.plan,
      uploaded: block.uploaded,
    }))
  );

  function toggleTeacherExpand(teacher: string) {
    const next = new Set(expandedTeachers.value);
    if (next.has(teacher)) next.delete(teacher);
    else next.add(teacher);
    expandedTeachers.value = next;
  }

  function teacherTreeChevronIcon(teacherKey: string) {
    return expandedTeachers.value.has(teacherKey)
      ? 'mdi-chevron-down'
      : 'mdi-chevron-right';
  }

  function visibleTeacherChildRows(block: TeacherTreeBlock): TeacherTreeChildRow[] {
    return expandedTeachers.value.has(block.teacher) ? [...block.children] : [];
  }

  onMounted(async () => {
    if (user.value?.lastName || canSeeAll.value) {
      await loadAll();
    } else {
      router.push('/auth');
    }
  });

  watch(showDepartmentStats, (dept) => {
    if (dept) {
      expandedTeachers.value = new Set(
        teacherDetailBlocks.value.slice(0, 5).map((b) => b.teacher)
      );
    } else {
      expandedTeachers.value = new Set();
    }
  });

  watch(teacherDetailBlocks, (blocks) => {
    if (!showDepartmentStats.value || !blocks.length) return;
    if (expandedTeachers.value.size === 0) {
      expandedTeachers.value = new Set(
        blocks.slice(0, 5).map((b) => b.teacher)
      );
    }
  });
</script>

<style scoped>
  .page {
    background: #f5f6f8;
    padding: 28px 30px 50px;
    min-height: 100%;
  }

  .widgets-row {
    margin-top: 0;
  }
  .widgets-row :deep(.v-col) {
    display: flex;
    flex-direction: column;
    align-self: stretch;
  }

  .widgets-row :deep(.v-col > .widget-card) {
    flex: 1 1 auto;
    width: 100%;
    min-height: 100%;
  }
  .widgets-row :deep(.v-col > .semesters-widget),
  .widgets-row :deep(.v-col > .disciplines-widget),
  .widgets-row :deep(.v-col > .groups-widget),
  .widgets-row :deep(.v-col > .teachers-widget) {
    flex: 1 1 auto;
    width: 100%;
    min-height: 100%;
    display: flex;
    flex-direction: column;
  }

  .widget-card {
    border-radius: 16px;
    border: 1px solid #e5e7eb;
    background: #fff;
    box-shadow: 0 1px 3px rgba(0, 0, 0, 0.06);
    padding: 20px 22px 22px;
    flex: 1 1 auto;
    align-self: stretch;
    display: flex;
    flex-direction: column;
    min-width: 0;
    width: 100%;
    box-sizing: border-box;
  }
  .widget-head {
    display: flex;
    align-items: flex-start;
    justify-content: space-between;
    gap: 16px;
    flex-wrap: wrap;
    flex-shrink: 0;
    margin-bottom: 16px;
  }
  .widget-head--simple {
    align-items: center;
  }
  .widget-head__left {
    display: flex;
    gap: 12px;
    align-items: flex-start;
    min-width: 0;
  }
  .widget-head__ico {
    color: #6366f1;
    margin-top: 2px;
  }
  .widget-title {
    margin: 0;
    font-size: 17px;
    font-weight: 600;
    color: #111827;
  }
  .widget-sub {
    margin: 4px 0 0;
    font-size: 13px;
    color: #6b7280;
  }
  .view-toggle {
    flex-shrink: 0;
  }
  .view-toggle:not(.view-toggle--pill) :deep(.v-btn) {
    text-transform: none;
    letter-spacing: normal;
    font-weight: 500;
  }

  .v-btn-toggle.view-toggle--pill[data-analytics-view-toggle] {
    display: inline-flex;
    flex-wrap: nowrap;
    align-items: stretch;
    gap: 0;
    max-width: 100%;
    height: auto;
    min-height: 0;
    padding: 3px;
    background: #f0f2f5;
    border: none;
    border-radius: 999px;
    box-shadow: none;
    overflow: visible;
    overflow-x: visible;
  }
  .v-btn-toggle.view-toggle--pill[data-analytics-view-toggle] > :deep(.v-btn) {
    flex: 1 1 0;
    min-width: 0;
    border-radius: 999px;
    min-height: 34px;
    padding-inline: 14px;
    border: none;
    box-shadow: none;
    letter-spacing: 0.04em;
    text-transform: uppercase;
    font-weight: 500;
    font-size: 11px;
    background: transparent;
    color: #595959;
  }
  .v-btn-toggle.view-toggle--pill[data-analytics-view-toggle]
    > :deep(.v-btn .v-icon) {
    color: currentColor;
    opacity: 0.85;
    font-size: 18px;
  }
  .v-btn-toggle.view-toggle--pill[data-analytics-view-toggle]
    > :deep(.v-btn:hover:not(.v-btn--active):not(.v-btn--selected)) {
    background: rgba(0, 0, 0, 0.04);
    color: #434343;
  }
  .v-btn-toggle.view-toggle--pill[data-analytics-view-toggle]
    > :deep(.v-btn.v-btn--active),
  .v-btn-toggle.view-toggle--pill[data-analytics-view-toggle]
    > :deep(.v-btn.v-btn--selected) {
    background: #fff;
    color: #1890ff;
    box-shadow:
      0 1px 4px rgba(15, 23, 42, 0.1),
      0 1px 2px rgba(15, 23, 42, 0.06);
  }
  .v-btn-toggle.view-toggle--pill[data-analytics-view-toggle]
    > :deep(.v-btn.v-btn--active .v-icon),
  .v-btn-toggle.view-toggle--pill[data-analytics-view-toggle]
    > :deep(.v-btn.v-btn--selected .v-icon) {
    color: #1890ff;
    opacity: 1;
  }
  .v-btn-toggle.view-toggle--pill[data-analytics-view-toggle]
    > :deep(.v-btn.v-btn--active .v-btn__overlay),
  .v-btn-toggle.view-toggle--pill[data-analytics-view-toggle]
    > :deep(.v-btn.v-btn--selected .v-btn__overlay) {
    opacity: 0;
  }
  .widget-body {
    flex: 1 1 auto;
    display: flex;
    flex-direction: column;
    width: 100%;
  }
  .widget-body--toggle-view {
    display: flex;
    flex-direction: column;
  }
  .widget-body--paired-col {
    flex: 1 1 auto;
    min-height: 0;
  }
  .widget-body--paired-col > .analytics-pager {
    margin-top: auto;
    flex-shrink: 0;
  }
  .widget-body--paired-col > .widget-empty {
    margin-top: auto;
  }

  .widget-body__scroll {
    box-sizing: border-box;
    overflow-y: visible;
    overflow-x: auto;
    flex-shrink: 0;
    width: 100%;
  }
  .widget-body--paired-col > .widget-body__scroll {
    flex: 1 1 auto;
    min-height: 0;
    flex-shrink: 1;
  }
  .widget-body :deep(.etu-dt-wrap) {
    flex-shrink: 0;
  }
  .widget-body > .analytics-pager {
    margin-top: auto;
    flex-shrink: 0;
  }
  .widget-body--toggle-view > .analytics-pager {
    margin-top: 12px;
  }
  .widget-empty {
    margin: 8px 0 0;
    color: #9ca3af;
    font-size: 14px;
  }

  .analytics-etu-dt :deep(.analytics-table) {
    font-size: 14px;
  }
  .analytics-table--dense {
    font-size: 12px;
    white-space: nowrap;
  }

  .analytics-etu-dt :deep(.analytics-table:not(.analytics-table--detail)) th {
    font-weight: 600;
    color: #374151;
    background: #f9fafb;
  }

  .analytics-etu-dt
    :deep(.etu-dt-table.analytics-table tbody tr:not(.row-total)) {
    min-height: 64px;
  }
  .analytics-etu-dt
    :deep(.etu-dt-table.analytics-table tbody tr:not(.row-total) td) {
    vertical-align: middle;
  }
  .cell-wrap {
    white-space: normal;
    max-width: 220px;
  }
  .cell-num {
    font-weight: 600;
  }
  .cell-num--up {
    color: #2563eb;
  }
  .cell-uploaded-of {
    font-variant-numeric: tabular-nums;
    white-space: nowrap;
  }
  .cell-upload-prog-wrap {
    text-align: right;
    vertical-align: middle;
  }
  .cell-upload-prog-wrap :deep(.upload-prog) {
    display: inline-block;
    min-width: 132px;
    max-width: 240px;
    width: 100%;
    vertical-align: middle;
  }
  .tree-col-upload.cell-upload-prog-wrap :deep(.upload-prog) {
    min-width: 108px;
    max-width: 168px;
  }
  .row-total {
    font-weight: 600;
    background: #f9fafb;
  }
  .row-total td {
    border-top: 2px solid #e5e7eb;
  }

  .analytics-etu-dt :deep(table.etu-dt-table.analytics-table--detail thead th) {
    background: linear-gradient(180deg, #f8fafc 0%, #f1f5f9 100%);
    color: #64748b;
    font-size: 11px;
    font-weight: 700;
    text-transform: uppercase;
    letter-spacing: 0.055em;
    padding: 13px 16px;
    border-bottom: 1px solid #e2e8f0;
    white-space: nowrap;
  }
  .analytics-etu-dt :deep(.analytics-table--detail) .cell-th-num {
    text-align: center;
    width: 1%;
  }
  .analytics-etu-dt :deep(.analytics-table--detail) tbody td {
    padding: 14px 16px;
    vertical-align: top;
    color: #334155;
    border-bottom: 1px solid #f1f5f9;
    transition: background 0.12s ease;
  }
  .analytics-etu-dt :deep(.analytics-table--detail) tbody tr:hover td {
    background: #f8fafc;
  }
  .analytics-etu-dt :deep(.analytics-table--detail) tbody tr:last-child td {
    border-bottom: none;
  }

  .analytics-etu-dt :deep(.analytics-table--plan-detail) {
    font-size: 14px;
  }
  .analytics-etu-dt :deep(.analytics-table--plan-detail) .cell-discipline {
    font-weight: 600;
    color: #0f172a;
    max-width: min(320px, 36vw);
    line-height: 1.5;
  }
  .analytics-etu-dt :deep(.analytics-table--plan-detail) .cell-person {
    color: #475569;
    max-width: 220px;
    line-height: 1.45;
  }
  .analytics-etu-dt :deep(.analytics-table--plan-detail) .cell-muted {
    color: #64748b;
    font-variant-numeric: tabular-nums;
  }
  .analytics-etu-dt :deep(.analytics-table--plan-detail) .cell-groups {
    min-width: 120px;
    max-width: 360px;
    line-height: 1.6;
  }
  .analytics-etu-dt :deep(.analytics-table--plan-detail) .cell-empty-dash {
    color: #94a3b8;
  }
  .grp-tag--plan {
    display: inline-block;
    font-size: 11px;
    font-weight: 600;
    padding: 4px 11px;
    margin: 2px 6px 2px 0;
    border-radius: 999px;
    background: #eef2ff;
    color: #4338ca;
    border: 1px solid #e0e7ff;
  }

  .analytics-etu-dt :deep(table.tree-table--fixed) {
    table-layout: fixed;
    width: 100%;
  }
  .analytics-etu-dt :deep(th.tree-col-chev),
  .analytics-etu-dt :deep(td.tree-col-chev) {
    width: 44px;
    max-width: 44px;
    padding-left: 10px;
    padding-right: 6px;
    text-align: center;
    vertical-align: middle;
  }
  .analytics-etu-dt :deep(th.tree-col-name),
  .analytics-etu-dt :deep(td.tree-col-name) {
    min-width: 0;
    text-align: left;
    vertical-align: middle;
    word-wrap: break-word;
    overflow-wrap: break-word;
  }
  .analytics-etu-dt :deep(th.tree-col-groups),
  .analytics-etu-dt :deep(td.tree-col-groups) {
    width: 26%;
    min-width: 148px;
    vertical-align: middle;
    text-align: left;
  }
  .analytics-etu-dt :deep(td.tree-col-groups--parent) {
    text-align: center;
    color: #94a3b8;
    font-weight: 500;
  }
  .analytics-etu-dt :deep(th.tree-col-upload),
  .analytics-etu-dt :deep(td.tree-col-upload) {
    width: 172px;
    min-width: 172px;
    text-align: right;
    vertical-align: middle;
  }

  .analytics-etu-dt
    :deep(.tree-table.analytics-table--detail)
    .tree-row--parent {
    cursor: pointer;
    background: #f8fafc;
  }
  .analytics-etu-dt
    :deep(
      table.tree-table.analytics-table--detail
        tbody
        tr.tree-row--parent:hover
        > td
    ) {
    background: #f1f5f9;
  }
  .analytics-etu-dt
    :deep(.tree-table.analytics-table--detail)
    .tree-row--child
    td {
    background: #fff;
  }
  .analytics-etu-dt
    :deep(.tree-table.analytics-table--detail)
    .tree-row--parent
    td {
    font-weight: 500;
    color: #0f172a;
    border-bottom: 1px solid #e2e8f0;
  }
  .analytics-etu-dt
    :deep(
      table.tree-table.analytics-table--detail td.tree-col-name.tree-child-name
    ) {
    font-size: 13px;
    color: #4b5563;
    font-weight: 400;
    padding-left: 6px;
  }
  .tree-meta {
    font-size: 12px;
    color: #9ca3af;
    font-weight: 400;
  }
  .grp-tag {
    display: inline-block;
    font-size: 11px;
    padding: 2px 8px;
    margin: 2px 4px 2px 0;
    border-radius: 6px;
    background: #f3f4f6;
    color: #6b7280;
  }
</style>
