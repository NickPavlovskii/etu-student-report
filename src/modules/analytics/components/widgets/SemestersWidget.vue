<template>
  <div class="semesters-widget">
    <analytics-widget-card
      v-model:view-mode="viewMode"
      icon="mdi-calendar-month-outline"
      title="Загрузки по семестрам"
      empty-text="Нет данных по семестрам за этот учебный год"
      :has-data="rows.length > 0"
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
          <etu-data-table
            scrollable
            wrap-class="analytics-etu-dt analytics-etu-dt--semesters"
            table-class="analytics-table--semesters"
            :columns="semesterTableColumns"
            :rows="pagination.pagedItems"
          >
            <template #tbody>
              <tr
                v-for="row in pagination.pagedItems"
                :key="rowKey(row)"
              >
                <td class="cell-sem-num">{{ row.course ?? '—' }}</td>
                <td class="cell-sem-num">{{ row.semester ?? '—' }}</td>
                <td class="cell-upload-prog-wrap">
                  <progress-bar
                    :uploaded="numSemUpload(row)"
                    :plan="row.expectedCount"
                  />
                  <div class="moodle-note">
                    Из них в Moodle: {{ semMoodleNum(row) }}
                  </div>
                </td>
              </tr>
              <tr class="row-total">
                <td colspan="2">Итого</td>
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
    </analytics-widget-card>
  </div>
</template>

<script setup lang="ts">
  import { ref, computed, toValue } from 'vue';
  import type { BySemesterRow } from '@/api/info';
  import { useTablePagination } from '@/composables/useTablePagination';
  import { useProgressFormat } from '@/composables/useProgressFormat';
  import ProgressBar from '@/components/shared/ProgressBar.vue';
  import type { AnalyticsViewMode, VBarItem } from '../../model';
  import { semesterTableColumns } from '../../constants/columns';
  import AnalyticsWidgetCard from '../shared/AnalyticsWidgetCard.vue';
  import AnalyticsVBarChart from '../charts/AnalyticsVBarChart.vue';
  import AnalyticsWidgetExportActions from '../AnalyticsWidgetExportActions.vue';
  import { useAnalyticsExport } from '../../composables/useAnalyticsExport';

  const props = defineProps<{
    rows: BySemesterRow[];
  }>();

  const viewMode = ref<AnalyticsViewMode>('table');
  const chartRoot = ref<HTMLElement | null>(null);
  const { num } = useProgressFormat();

  const pagination = useTablePagination(() => props.rows);
  const { exportToExcel, exportChartToPng } = useAnalyticsExport();

  function numSemUpload(row: BySemesterRow) {
    return num(row.uploadedCount ?? row.totalWorks);
  }

  function rowKey(row: BySemesterRow) {
    return `sem-${String(row.course ?? '')}-${String(row.semester ?? '')}`;
  }

  function semMoodleNum(row: BySemesterRow) {
    return Number(row.moodleLinksCount ?? row.moodleUploadedCount) || 0;
  }

  const bars = computed((): VBarItem[] =>
    toValue(pagination.pagedItems).map((r) => {
      const c = r.course ?? '—';
      const s = r.semester ?? '—';
      const label = `К${c}, с${s}`;
      return {
        label,
        shortLabel: label,
        plan: r.expectedCount,
        uploaded: numSemUpload(r),
        moodle: semMoodleNum(r),
      };
    })
  );

  const totals = computed(() => {
    let plan = 0;
    let up = 0;
    let moodle = 0;
    for (const r of props.rows) {
      plan += r.expectedCount;
      up += numSemUpload(r);
      moodle += semMoodleNum(r);
    }
    return { plan, up, moodle };
  });

  function onExportExcel() {
    const t = totals.value;
    const body = props.rows.map((r) => [
      r.course ?? '—',
      r.semester ?? '—',
      r.expectedCount,
      numSemUpload(r),
      semMoodleNum(r),
    ]);
    body.push(['Итого', '—', t.plan, t.up, t.moodle]);
    exportToExcel(
      ['Курс', 'Семестр', 'Ожидается', 'Загружено', 'Из них в Moodle'],
      body,
      'analitika_zagruzki_po_semestram',
      'Семестры'
    );
  }

  async function onExportChartPng() {
    try {
      await exportChartToPng(chartRoot.value, 'analitika_semestry_grafik');
    } catch (e) {
      console.warn('Экспорт графика:', e);
    }
  }
</script>

<style scoped>
  .semesters-widget {
    display: flex;
    flex-direction: column;
    flex: 1 1 auto;
    width: 100%;
    min-height: 0;
  }
  .semesters-widget :deep(.widget-card) {
    flex: 1 1 auto;
    min-height: 100%;
  }
  .semesters-widget
    :deep(.analytics-etu-dt--semesters .analytics-table--semesters) {
    table-layout: fixed;
    width: 100%;
  }
  .semesters-widget :deep(.cell-sem-num) {
    text-align: center;
    white-space: nowrap;
    color: #4b5563;
    font-variant-numeric: tabular-nums;
  }
  .semesters-widget :deep(.cell-upload-prog-wrap) {
    width: 100%;
    text-align: left;
    vertical-align: middle;
  }
  .semesters-widget :deep(.upload-prog) {
    display: block;
    width: 100%;
    max-width: none;
    min-width: 0;
    box-sizing: border-box;
    vertical-align: middle;
  }
  .semesters-widget :deep(.upload-prog__label) {
    text-align: left;
    margin-bottom: 6px;
  }
  .semesters-widget :deep(.upload-prog__track) {
    height: 8px;
    width: 100%;
  }
  .semesters-widget :deep(.row-total) {
    font-weight: 600;
    background: #f9fafb;
  }
  .semesters-widget :deep(.row-total td) {
    border-top: 2px solid #e5e7eb;
  }
  .moodle-note {
    margin-top: 6px;
    font-size: 12px;
    color: #4f46e5;
    font-weight: 600;
  }
</style>
