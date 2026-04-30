<template>
  <div class="disciplines-widget">
    <analytics-widget-card
      v-model:view-mode="viewMode"
      icon="mdi-school-outline"
      title="Загрузки по дисциплинам"
      :subtitle="subtitle"
      :has-data="rows.length > 0"
      empty-text="Нет данных по дисциплинам за этот учебный год"
      :pagination="pagination"
    >
      <template #head-actions>
        <analytics-widget-export-actions
          v-if="rows.length > 0"
          :chart-png-disabled="viewMode !== 'chart'"
          @export-excel="onExportExcel"
          @export-chart-png="onExportChartPng"
        />
      </template>
      <template v-if="viewMode === 'chart'">
        <div
          ref="chartRoot"
          class="widget-body__scroll analytics-chart-capture"
        >
          <analytics-v-bar-chart
            :items="bars"
            :chart-height="200"
          />
        </div>
      </template>
      <template v-else>
        <div class="widget-body__scroll">
          <template v-if="usePlanDetail">
            <div class="table-scroll table-scroll--plan-detail">
              <etu-data-table
                scrollable
                wrap-class="analytics-etu-dt"
                table-class="analytics-table--detail analytics-table--plan-detail"
                :columns="disciplinesPlanTableColumns"
                :rows="pagination.pagedItems"
              >
                <template #tbody>
                  <tr
                    v-for="row in pagination.pagedItems"
                    :key="detailRowKey(row)"
                  >
                    <td class="cell-discipline">
                      {{ row.disciplineName }}
                    </td>
                    <td class="cell-person">
                      {{
                        row.teacherFio?.trim() ||
                        row.teacherLastName?.trim() ||
                        '—'
                      }}
                    </td>
                    <td class="cell-th-num cell-muted">
                      {{ row.course ?? '—' }}
                    </td>
                    <td class="cell-th-num cell-muted">
                      {{ row.semester ?? '—' }}
                    </td>
                    <td class="cell-groups">
                      <template
                        v-for="g in formatGroupsForDisplay(row.groups)"
                        :key="detailRowKey(row) + '-' + g"
                      >
                        <span class="grp-tag grp-tag--plan">
                          {{ planRowGroupChipLabel(g) }}
                        </span>
                      </template>
                      <span
                        v-if="!formatGroupsForDisplay(row.groups).length"
                        class="cell-empty-dash"
                      >
                        —
                      </span>
                    </td>
                    <td class="cell-th-num">{{ row.studentsCount }}</td>
                    <td class="cell-upload-prog-wrap">
                      <progress-bar
                        :uploaded="row.uploadedCount"
                        :plan="row.expectedCount"
                      />
                      <div class="moodle-note">
                        Из них в Moodle: {{ getMoodleCount(row) }}
                      </div>
                    </td>
                  </tr>
                  <tr
                    v-if="rows.length"
                    class="row-total"
                  >
                    <td colspan="6">Итого</td>
                    <td class="cell-upload-prog-wrap">
                      <progress-bar
                        :uploaded="totals.up"
                        :plan="totals.plan"
                      />
                      <div class="moodle-note">
                        Из них в Moodle: {{ totals.moodle }}
                      </div>
                    </td>
                  </tr>
                </template>
              </etu-data-table>
            </div>
          </template>
          <template v-else>
            <etu-data-table
              wrap-class="analytics-etu-dt"
              table-class="analytics-table"
              :columns="disciplinesSimpleTableColumns"
              :rows="pagination.pagedItems"
            >
              <template #tbody>
                <tr
                  v-for="row in pagination.pagedItems"
                  :key="detailRowKey(row)"
                >
                  <td>{{ row.disciplineName }}</td>
                  <td>{{ row.groupsCount }}</td>
                  <td>{{ row.studentsCount }}</td>
                  <td class="cell-upload-prog-wrap">
                    <progress-bar
                      :uploaded="row.uploadedCount"
                      :plan="row.expectedCount"
                    />
                    <div class="moodle-note">
                      Из них в Moodle: {{ getMoodleCount(row) }}
                    </div>
                  </td>
                </tr>
                <tr
                  v-if="rows.length"
                  class="row-total"
                >
                  <td colspan="3">Итого</td>
                  <td class="cell-upload-prog-wrap">
                    <progress-bar
                      :uploaded="totals.up"
                      :plan="totals.plan"
                    />
                    <div class="moodle-note">
                      Из них в Moodle: {{ totals.moodle }}
                    </div>
                  </td>
                </tr>
              </template>
            </etu-data-table>
          </template>
        </div>
      </template>
    </analytics-widget-card>
  </div>
</template>

<script setup lang="ts">
  import { ref, computed, toValue } from 'vue';
  import { useTablePagination } from '@/composables/useTablePagination';
  import ProgressBar from '@/components/shared/ProgressBar.vue';
  import type {
    AnalyticsDisciplineTableRow,
    AnalyticsViewMode,
    VBarItem,
  } from '../../model';
  import {
    disciplinesSimpleTableColumns,
    disciplinesPlanTableColumns,
  } from '../../constants/columns';
  import {
    clip,
    formatGroupsForDisplay,
    planRowGroupChipLabel,
  } from '../../utils/format';
  import AnalyticsWidgetCard from '../shared/AnalyticsWidgetCard.vue';
  import AnalyticsVBarChart from '../charts/AnalyticsVBarChart.vue';
  import AnalyticsWidgetExportActions from '../AnalyticsWidgetExportActions.vue';
  import { useAnalyticsExport } from '../../composables/useAnalyticsExport';

  const props = defineProps<{
    rows: AnalyticsDisciplineTableRow[];
    usePlanDetail: boolean;
    subtitle: string;
  }>();

  const viewMode = ref<AnalyticsViewMode>('table');
  const chartRoot = ref<HTMLElement | null>(null);
  const pagination = useTablePagination(() => props.rows);
  const { exportToExcel, exportChartToPng } = useAnalyticsExport();

  const totals = computed(() => {
    let plan = 0;
    let up = 0;
    let moodle = 0;
    for (const r of props.rows) {
      plan += r.expectedCount;
      up += r.uploadedCount;
      moodle += getMoodleCount(r);
    }
    return { plan, up, moodle };
  });

  function getMoodleCount(row: AnalyticsDisciplineTableRow): number {
    return Number((row as any).moodleLinksCount ?? (row as any).moodleUploadedCount) || 0;
  }

  function detailRowKey(row: AnalyticsDisciplineTableRow) {
    return [
      row.planRowId,
      row.disciplineName,
      row.teacherFio,
      row.course,
      row.semester,
    ].join('-');
  }

  function disciplineBarLabel(row: AnalyticsDisciplineTableRow): string {
    const t = row.teacherFio?.trim() || row.teacherLastName?.trim() || '';
    if (!t || t === '—') return row.disciplineName;
    return `${row.disciplineName} · ${t}`;
  }

  const bars = computed((): VBarItem[] =>
    toValue(pagination.pagedItems).map((r) => {
      const label = disciplineBarLabel(r);
      return {
        label,
        shortLabel: clip(label, 22),
        plan: r.expectedCount,
        uploaded: r.uploadedCount,
        moodle: getMoodleCount(r),
      };
    })
  );

  function groupsCellForExcel(row: AnalyticsDisciplineTableRow): string {
    const list = formatGroupsForDisplay(row.groups);
    if (!list.length) return '—';
    return list.map((g) => planRowGroupChipLabel(g)).join('; ');
  }

  function onExportExcel() {
    const t = totals.value;
    if (props.usePlanDetail) {
      const body = props.rows.map((r) => [
        r.disciplineName,
        r.teacherFio?.trim() || r.teacherLastName?.trim() || '—',
        r.course ?? '—',
        r.semester ?? '—',
        groupsCellForExcel(r),
        r.studentsCount,
        r.expectedCount,
        r.uploadedCount,
        getMoodleCount(r),
      ]);
      body.push(['Итого', '', '', '', '', '', t.plan, t.up, t.moodle]);
      exportToExcel(
        [
          'Дисциплина',
          'Преподаватель',
          'Курс',
          'Семестр',
          'Группы',
          'Студентов',
          'Ожидается',
          'Загружено',
          'Из них в Moodle',
        ],
        body,
        'analitika_zagruzki_po_disciplinam_plan',
        'Дисциплины'
      );
    } else {
      const body = props.rows.map((r) => [
        r.disciplineName,
        r.groupsCount,
        r.studentsCount,
        r.expectedCount,
        r.uploadedCount,
        getMoodleCount(r),
      ]);
      body.push(['Итого', '', '', t.plan, t.up, t.moodle]);
      exportToExcel(
        [
          'Дисциплина',
          'Групп',
          'Студентов',
          'Ожидается',
          'Загружено',
          'Из них в Moodle',
        ],
        body,
        'analitika_zagruzki_po_disciplinam',
        'Дисциплины'
      );
    }
  }

  async function onExportChartPng() {
    try {
      await exportChartToPng(chartRoot.value, 'analitika_discipliny_grafik');
    } catch (e) {
      console.warn('Экспорт графика:', e);
    }
  }
</script>

<style scoped>
  .disciplines-widget {
    display: flex;
    flex-direction: column;
    flex: 1 1 auto;
    width: 100%;
    min-height: 0;
  }
  .disciplines-widget :deep(.widget-card) {
    flex: 1 1 auto;
    min-height: 100%;
  }
  .table-scroll {
    overflow-x: auto;
    margin: 0 -4px;
  }
  .table-scroll--plan-detail {
    margin: 0;
    border-radius: 14px;
    border: 1px solid #e2e8f0;
    background: #fff;
    box-shadow: 0 1px 2px rgba(15, 23, 42, 0.04);
  }
  .moodle-note {
    margin-top: 6px;
    font-size: 12px;
    color: #4f46e5;
    font-weight: 600;
  }
</style>
