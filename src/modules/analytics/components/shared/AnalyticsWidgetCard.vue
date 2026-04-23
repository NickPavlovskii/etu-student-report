<template>
  <v-card
    class="widget-card"
    elevation="0"
  >
    <div
      class="widget-head"
      :class="{ 'widget-head--simple': headSimple }"
    >
      <div class="widget-head__left">
        <v-icon
          size="22"
          class="widget-head__ico"
        >
          {{ icon }}
        </v-icon>
        <div>
          <h3 class="widget-title">{{ title }}</h3>
          <p
            v-if="subtitle"
            class="widget-sub"
          >
            {{ subtitle }}
          </p>
        </div>
      </div>
      <div class="widget-head__actions">
        <div class="widget-head__extras">
          <slot name="head-actions" />
        </div>
        <v-btn-toggle
          v-model="viewMode"
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
    </div>
    <div
      class="widget-body widget-body--toggle-view"
      :class="{ 'widget-body--paired-col': bodyPairedCol }"
    >
      <template v-if="!hasData">
        <p class="widget-empty">{{ emptyText }}</p>
      </template>
      <template v-else>
        <slot />
        <analytics-table-pagination
          v-if="pagination"
          v-model:page="pagination.page"
          :page-count="pagination.pageCount"
          :total="pagination.total"
          :range-label="pagination.rangeLabel"
        />
      </template>
    </div>
  </v-card>
</template>

<script setup lang="ts">
  import type { AnalyticsViewMode } from '../../model';
  import AnalyticsTablePagination from '../AnalyticsTablePagination.vue';
  import type { AnalyticsWidgetPaginationVm } from '../../model';

  withDefaults(
    defineProps<{
      icon: string;
      title: string;
      subtitle?: string;
      hasData: boolean;
      emptyText: string;
      headSimple?: boolean;
      bodyPairedCol?: boolean;
      pagination?: AnalyticsWidgetPaginationVm;
    }>(),
    {
      headSimple: false,
      bodyPairedCol: false,
      subtitle: undefined,
      pagination: undefined,
    }
  );

  const viewMode = defineModel<AnalyticsViewMode>('viewMode', { required: true });
</script>

<style scoped>
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
  .widget-head__actions {
    display: flex;
    align-items: center;
    gap: 8px;
    flex-shrink: 0;
    flex-wrap: wrap;
    justify-content: flex-end;
  }
  .widget-head__extras {
    display: flex;
    align-items: center;
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
  .widget-body--paired-col > .widget-body__scroll {
    flex: 1 1 auto;
    min-height: 0;
    flex-shrink: 1;
  }
  .widget-body__scroll {
    box-sizing: border-box;
    overflow-y: visible;
    overflow-x: auto;
    flex-shrink: 0;
    width: 100%;
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
</style>
