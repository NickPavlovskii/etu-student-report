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
      <template v-if="viewMode === 'chart'">
        <div class="widget-body__scroll">
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
            :show-skeleton="false"
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
                </td>
              </tr>
              <tr class="row-total">
                <td colspan="2">Итого</td>
                <td class="cell-upload-prog-wrap">
                  <progress-bar
                    :uploaded="totals.up"
                    :plan="totals.plan"
                  />
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

  const props = defineProps<{
    rows: BySemesterRow[];
  }>();

  const viewMode = ref<AnalyticsViewMode>('table');
  const { num } = useProgressFormat();

  const pagination = useTablePagination(() => props.rows);

  function numSemUpload(row: BySemesterRow) {
    return num(row.uploadedCount ?? row.totalWorks);
  }

  function rowKey(row: BySemesterRow) {
    return `sem-${String(row.course ?? '')}-${String(row.semester ?? '')}`;
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
      };
    })
  );

  const totals = computed(() => {
    let plan = 0;
    let up = 0;
    for (const r of props.rows) {
      plan += r.expectedCount;
      up += numSemUpload(r);
    }
    return { plan, up };
  });
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
</style>
