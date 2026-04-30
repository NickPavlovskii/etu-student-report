<template>
  <div class="groups-widget">
    <analytics-widget-card
      v-model:view-mode="viewMode"
      icon="mdi-account-group-outline"
      title="Загрузки по группам"
      subtitle="Оценка по группам"
      body-paired-col
      :has-data="rows.length > 0"
      :empty-text="emptyText"
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
          <analytics-horizontal-bar-chart :rows="chartRows" />
        </div>
      </template>
      <template v-else>
        <div class="widget-body__scroll">
          <etu-data-table
            wrap-class="analytics-etu-dt"
            table-class="analytics-table"
            :columns="groupsTableColumns"
            :rows="pagination.pagedItems"
          >
            <template #tbody>
              <tr
                v-for="row in pagination.pagedItems"
                :key="row.label"
              >
                <td>{{ row.label }}</td>
                <td class="cell-upload-prog-wrap">
                  <progress-bar
                    :uploaded="row.uploaded"
                    :plan="row.plan"
                  />
                  <div class="moodle-note">
                    Из них в Moodle: {{ groupMoodle(row) }}
                  </div>
                </td>
              </tr>
              <tr class="row-total">
                <td>Итого</td>
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
  import { useTablePagination } from '@/composables/useTablePagination';
  import ProgressBar from '@/components/shared/ProgressBar.vue';
  import type { AnalyticsViewMode, HBarRow, VBarItem } from '../../model';
  import { groupsTableColumns } from '../../constants/columns';
  import AnalyticsWidgetCard from '../shared/AnalyticsWidgetCard.vue';
  import AnalyticsHorizontalBarChart from '../charts/AnalyticsHorizontalBarChart.vue';
  import AnalyticsWidgetExportActions from '../AnalyticsWidgetExportActions.vue';
  import { useAnalyticsExport } from '../../composables/useAnalyticsExport';

  const props = withDefaults(
    defineProps<{
      rows: VBarItem[];
      emptyText?: string;
    }>(),
    {
      emptyText: 'Нет данных по группам (нужны план-строки с указанием групп)',
    }
  );

  const viewMode = ref<AnalyticsViewMode>('table');
  const chartRoot = ref<HTMLElement | null>(null);
  const pagination = useTablePagination(() => props.rows, 7);
  const { exportToExcel, exportChartToPng } = useAnalyticsExport();

  const totals = computed(() => {
    let plan = 0;
    let up = 0;
    let moodle = 0;
    for (const r of props.rows) {
      plan += r.plan;
      up += r.uploaded;
      moodle += groupMoodle(r);
    }
    return { plan, up, moodle };
  });

  function groupMoodle(row: VBarItem): number {
    return Number(row.moodle) || 0;
  }

  const chartRows = computed((): HBarRow[] =>
    toValue(pagination.pagedItems).map((row) => ({
      key: row.label,
      title: row.label,
      plan: row.plan,
      uploaded: row.uploaded,
      moodle: groupMoodle(row),
    }))
  );

  function onExportExcel() {
    const t = totals.value;
    const body = props.rows.map((r) => [r.label, r.plan, r.uploaded, groupMoodle(r)]);
    body.push(['Итого', t.plan, t.up, t.moodle]);
    exportToExcel(
      ['Группа', 'Ожидается', 'Загружено', 'Из них в Moodle'],
      body,
      'analitika_zagruzki_po_gruppam',
      'Группы'
    );
  }

  async function onExportChartPng() {
    try {
      await exportChartToPng(chartRoot.value, 'analitika_gruppy_grafik');
    } catch (e) {
      console.warn('Экспорт графика:', e);
    }
  }
</script>

<style scoped>
  .groups-widget {
    display: flex;
    flex-direction: column;
    flex: 1 1 auto;
    width: 100%;
    min-height: 0;
    height: 100%;
  }
  .groups-widget :deep(.widget-card) {
    flex: 1 1 auto;
    min-height: 100%;
  }
  .moodle-note {
    margin-top: 6px;
    font-size: 12px;
    color: #4f46e5;
    font-weight: 600;
  }
</style>
