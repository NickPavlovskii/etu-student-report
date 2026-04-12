<template>
  <div
    v-if="total > 0"
    class="analytics-pager analytics-pager--pill"
    data-analytics-pager=""
  >
    <span class="analytics-pager__meta">{{ rangeLabel }}</span>
    <v-pagination
      v-if="pageCount > 1"
      v-model="page"
      class="analytics-pager__pages analytics-pager__v-pagination"
      rounded="circle"
      density="comfortable"
      :length="pageCount"
      :total-visible="totalVisible"
    />
  </div>
</template>

<script setup lang="ts">
  const page = defineModel<number>('page', { required: true });

  withDefaults(
    defineProps<{
      pageCount: number;
      total: number;
      rangeLabel: string;
      totalVisible?: number;
    }>(),
    { totalVisible: 7 }
  );
</script>

<style scoped>
  .analytics-pager {
    display: flex;
    flex-wrap: nowrap;
    align-items: center;
    justify-content: flex-end;
    gap: 12px;
    margin-top: 16px;
    padding-top: 12px;
    border-top: 1px solid #eef0f4;
    min-height: 52px;
    box-sizing: border-box;
  }
  .analytics-pager__meta {
    font-size: 13px;
    color: #6b7280;
    margin-right: auto;
    flex-shrink: 0;
    font-variant-numeric: tabular-nums;
  }
  .analytics-pager__pages {
    flex: 0 1 auto;
    min-width: 0;
    max-width: 100%;
    overflow-x: auto;
    overflow-y: hidden;
    scrollbar-width: thin;
  }
  .analytics-pager__pages.analytics-pager__v-pagination :deep(.v-pagination) {
    display: inline-flex;
    justify-content: flex-end;
  }

  .analytics-pager[data-analytics-pager].analytics-pager--pill
    .analytics-pager__pages.analytics-pager__v-pagination
    :deep(.v-pagination__list) {
    flex-wrap: nowrap;
    justify-content: flex-end;
    white-space: nowrap;
  }

  .analytics-pager[data-analytics-pager].analytics-pager--pill
    .analytics-pager__pages.analytics-pager__v-pagination
    :deep(.v-pagination__item .v-btn) {
    border-radius: 999px;
    min-width: 40px;
    font-weight: 500;
    background-color: #f1f5f9;
    color: #64748b;
    box-shadow: none;
  }

  .analytics-pager[data-analytics-pager].analytics-pager--pill
    .analytics-pager__pages.analytics-pager__v-pagination
    :deep(.v-pagination__item .v-btn .v-icon) {
    color: #64748b;
  }

  .analytics-pager[data-analytics-pager].analytics-pager--pill
    .analytics-pager__pages.analytics-pager__v-pagination
    :deep(.v-pagination__item--is-active .v-btn) {
    background-color: #1e293b;
    color: #fff;
  }

  .analytics-pager[data-analytics-pager].analytics-pager--pill
    .analytics-pager__pages.analytics-pager__v-pagination
    :deep(.v-pagination__item--is-active .v-btn .v-icon) {
    color: #fff;
  }

  .analytics-pager[data-analytics-pager].analytics-pager--pill
    .analytics-pager__pages.analytics-pager__v-pagination
    :deep(.v-pagination__item .v-btn:hover:not(:disabled)) {
    background-color: #e2e8f0;
    color: #475569;
  }

  .analytics-pager[data-analytics-pager].analytics-pager--pill
    .analytics-pager__pages.analytics-pager__v-pagination
    :deep(.v-pagination__item--is-active .v-btn:hover:not(:disabled)) {
    background-color: #0f172a;
    color: #fff;
  }

  .analytics-pager[data-analytics-pager].analytics-pager--pill
    .analytics-pager__pages.analytics-pager__v-pagination
    :deep(.v-pagination__item .v-btn .v-btn__overlay) {
    opacity: 0;
  }
</style>
