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
      <template v-if="viewMode === 'chart'">
        <div class="widget-body__scroll">
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
            :show-skeleton="false"
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
                </td>
              </tr>
              <tr class="row-total">
                <td>Итого</td>
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
  import { useTablePagination } from '@/composables/useTablePagination';
  import ProgressBar from '@/components/shared/ProgressBar.vue';
  import type { AnalyticsViewMode, HBarRow, VBarItem } from '../../model';
  import { groupsTableColumns } from '../../constants/columns';
  import AnalyticsWidgetCard from '../shared/AnalyticsWidgetCard.vue';
  import AnalyticsHorizontalBarChart from '../charts/AnalyticsHorizontalBarChart.vue';

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
  const pagination = useTablePagination(() => props.rows, 7);

  const totals = computed(() => {
    let plan = 0;
    let up = 0;
    for (const r of props.rows) {
      plan += r.plan;
      up += r.uploaded;
    }
    return { plan, up };
  });

  const chartRows = computed((): HBarRow[] =>
    toValue(pagination.pagedItems).map((row) => ({
      key: row.label,
      title: row.label,
      plan: row.plan,
      uploaded: row.uploaded,
    }))
  );
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
</style>
