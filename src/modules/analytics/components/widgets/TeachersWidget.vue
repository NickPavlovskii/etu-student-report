<template>
  <div class="teachers-widget">
    <analytics-widget-card
      v-model:view-mode="viewMode"
      icon="mdi-account-tie-outline"
      title="Загрузки по преподавателям"
      subtitle="Сводка по преподавателям кафедры"
      :has-data="rows.length > 0"
      :empty-text="emptyText"
      body-paired-col
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
            :columns="teachersTableColumns"
            :rows="pagination.pagedItems"
            :show-skeleton="false"
          >
            <template #tbody>
              <tr
                v-for="row in pagination.pagedItems"
                :key="teacherKey(row)"
              >
                <td>
                  <div class="teacher-cell">
                    <div
                      class="teacher-avatar"
                      :style="{
                        background: avatarColor(teacherName(row)),
                      }"
                    >
                      {{ initials(teacherName(row)) }}
                    </div>
                    <span>{{ teacherName(row) }}</span>
                  </div>
                </td>
                <td>{{ row.disciplinesCount ?? '—' }}</td>
                <td class="cell-upload-prog-wrap">
                  <progress-bar
                    :uploaded="teacherUploadedNum(row)"
                    :plan="num(row.expectedCount)"
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
  import type { TeachersSummaryItem } from '@/api/info';
  import { useTablePagination } from '@/composables/useTablePagination';
  import { useProgressFormat } from '@/composables/useProgressFormat';
  import ProgressBar from '@/components/shared/ProgressBar.vue';
  import type { AnalyticsViewMode, HBarRow } from '../../model';
  import { initials, avatarColor } from '../../utils/format';
  import { teachersTableColumns } from '../../constants/columns';
  import AnalyticsWidgetCard from '../shared/AnalyticsWidgetCard.vue';
  import AnalyticsHorizontalBarChart from '../charts/AnalyticsHorizontalBarChart.vue';

  const props = withDefaults(
    defineProps<{
      rows: TeachersSummaryItem[];
      emptyText?: string;
    }>(),
    { emptyText: 'Нет данных по преподавателям за этот учебный год' }
  );

  const viewMode = ref<AnalyticsViewMode>('table');
  const { num } = useProgressFormat();
  const pagination = useTablePagination(() => props.rows);

  const totals = computed(() => {
    let plan = 0;
    let up = 0;
    for (const r of props.rows) {
      plan += num(r.expectedCount);
      up += teacherUploadedNum(r);
    }
    return { plan, up };
  });

  function teacherName(row: TeachersSummaryItem) {
    return row.teacherFio ?? row.teacherLastName ?? '—';
  }

  function teacherKey(row: TeachersSummaryItem) {
    return `${teacherName(row)}-${row.disciplinesCount ?? ''}-${row.expectedCount}`;
  }

  function teacherUploadedNum(row: TeachersSummaryItem) {
    const v = row.uploadedCount ?? row.totalWorks;
    return typeof v === 'number' ? v : 0;
  }

  const chartRows = computed((): HBarRow[] =>
    toValue(pagination.pagedItems).map((row) => ({
      key: teacherKey(row),
      title: teacherName(row),
      plan: num(row.expectedCount),
      uploaded: teacherUploadedNum(row),
    }))
  );
</script>

<style scoped>
  .teachers-widget {
    display: flex;
    flex-direction: column;
    flex: 1 1 auto;
    width: 100%;
    min-height: 0;
    height: 100%;
  }
  .teachers-widget :deep(.widget-card) {
    flex: 1 1 auto;
    min-height: 100%;
  }
  .teacher-cell {
    display: flex;
    align-items: center;
    gap: 12px;
  }
  .teacher-avatar {
    width: 36px;
    height: 36px;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    color: white;
    font-size: 12px;
    font-weight: 600;
    flex-shrink: 0;
  }
</style>
