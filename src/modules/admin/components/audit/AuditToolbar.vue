<template>
  <div class="toolbar">
    <div class="search-wrap">
      <v-icon
        class="search-icon"
        size="18"
        color="#9ca3af"
      >
        mdi-magnify
      </v-icon>
      <input
        :value="auditSearch"
        class="search-input"
        placeholder="Поиск по пользователю или действию..."
        @input="onSearchInput"
      />
      <button
        v-if="auditSearch"
        class="search-clear"
        @click="clearSearch"
      >
        <v-icon size="14">mdi-close</v-icon>
      </button>
    </div>

    <div class="audit-filter-slot audit-filter-slot--action">
      <etu-pill-search-select
        :model-value="auditActionFilter"
        placeholder="Все действия"
        prepend-icon="mdi-filter-outline"
        :items="auditActionItemsList"
        :clearable="true"
        :show-null-option="false"
        :clear-value="''"
        :searchable="false"
        :menu-width="280"
        @update:model-value="onActionFilter"
      >
        <template #selection="{ item, label, loading }">
          <etu-label-chip
            v-if="item && !loading"
            variant="chip"
            :label="actionFilterItemLabel(item)"
            :icon="auditActionIcon(String(item.value ?? ''))"
            :preset="auditActionPreset(String(item.value ?? ''))"
          />
          <span
            v-else
            class="audit-select-fallback"
          >
            {{ label }}
          </span>
        </template>
        <template #item="{ item }">
          <etu-label-chip
            variant="chip"
            :label="actionFilterItemLabel(item)"
            :icon="auditActionIcon(String(item.value ?? ''))"
            :preset="auditActionPreset(String(item.value ?? ''))"
          />
        </template>
      </etu-pill-search-select>
    </div>

    <div class="audit-filter-slot audit-filter-slot--date">
      <etu-pill-search-select
        :model-value="auditDatePreset"
        :items="auditDateItemsList"
        placeholder="Период"
        prepend-icon="mdi-calendar-outline"
        :clearable="false"
        :show-null-option="false"
        :searchable="false"
        :menu-width="260"
        @update:model-value="onDatePreset"
      >
        <template #selection="{ item, label, loading }">
          <etu-label-chip
            v-if="item && !loading"
            variant="chip"
            size="sm"
            root-class="date-preset-chip"
            :label="item.title"
          />
          <span
            v-else
            class="audit-select-fallback"
          >
            {{ label }}
          </span>
        </template>
        <template #item="{ item }">
          <etu-label-chip
            variant="chip"
            size="sm"
            root-class="date-preset-chip"
            :label="item.title"
          />
        </template>
      </etu-pill-search-select>
    </div>

    <admin-count-chip
      v-if="recordCount"
      :label="recordsLabel"
    />
  </div>
</template>

<script setup lang="ts">
  import { computed } from 'vue';
  import AdminCountChip from '../AdminCountChip.vue';
  import { recordsCountLabel } from '../../utils/recordsCountLabel';
  import {
    auditActionIcon,
    auditActionLabel,
    auditActionPreset,
  } from '@/modules/admin/utils/audit';

  const props = defineProps<{
    auditSearch: string;
    auditActionFilter: string;
    auditDatePreset: string;
    recordCount: number;
    auditActionItems: readonly { title: string; value: string }[];
    auditDateItems: readonly { title: string; value: string }[];
    debouncedLoadAudit: () => void;
  }>();

  const emit = defineEmits<{
    'update:auditSearch': [value: string];
    'update:auditActionFilter': [value: string];
    'update:auditDatePreset': [value: string];
  }>();

  const auditActionItemsList = computed(() => [...props.auditActionItems]);
  const auditDateItemsList = computed(() => [...props.auditDateItems]);
  const recordsLabel = computed(() => recordsCountLabel(props.recordCount));

  function actionFilterItemLabel(item: { value?: unknown; title?: unknown }) {
    const v = item.value;
    if (v !== null && v !== undefined && String(v) !== '') {
      return auditActionLabel(String(v));
    }
    return String(item.title ?? '');
  }

  function onSearchInput(e: Event) {
    emit('update:auditSearch', (e.target as HTMLInputElement).value);
    props.debouncedLoadAudit();
  }

  function clearSearch() {
    emit('update:auditSearch', '');
    props.debouncedLoadAudit();
  }

  function onActionFilter(v: string | null) {
    emit('update:auditActionFilter', v ?? '');
    props.debouncedLoadAudit();
  }

  function onDatePreset(v: string | null) {
    emit('update:auditDatePreset', v ?? '');
    props.debouncedLoadAudit();
  }
</script>

<style scoped>
  .toolbar {
    display: flex;
    align-items: center;
    gap: 10px;
    margin-bottom: 20px;
    flex-wrap: wrap;
  }

  .search-wrap,
  .audit-filter-slot {
    display: flex;
    align-items: center;
  }

  .search-wrap {
    flex: 1;
    min-width: 240px;
    max-width: 360px;
    height: 38px;
    background: #eff6ff;
    border: 1.5px solid #bfdbfe;
    border-radius: 12px;
    padding: 0 10px 0 12px;
    gap: 6px;
    transition:
      border-color 0.18s,
      box-shadow 0.18s,
      background 0.18s;
  }

  .search-wrap:focus-within {
    border-color: #2563eb;
    background: #fff;
    box-shadow: 0 0 0 3px rgba(37, 99, 235, 0.18);
  }

  .audit-filter-slot {
    flex: 0 1 260px;
    min-width: 150px;
    max-width: 260px;
    width: 100%;
  }

  .audit-filter-slot :deep(.etu-pss-trigger) {
    width: 100%;
  }

  .audit-select-fallback {
    font-size: 13px;
    color: #9ca3af;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  .date-preset-chip {
    background: #f3f4f6 !important;
    color: #111827 !important;
    font-weight: 600 !important;
    border-radius: 999px !important;
  }

  .audit-filter-slot :deep(.etu-pss-item) {
    padding: 4px 10px !important;
    min-height: 36px !important;
    display: flex;
    align-items: center;
  }

  .audit-filter-slot--action :deep(.etu-pss-item .etu-label-chip) {
    height: 26px !important;
    font-size: 12px !important;
    font-weight: 600 !important;
    letter-spacing: 0.01em;
    border-radius: 999px !important;
    padding: 0 10px !important;
    cursor: pointer;
    transition:
      filter 0.15s,
      box-shadow 0.15s;
  }

  .audit-filter-slot--action
    :deep(.etu-pss-item:hover:not(.etu-pss-item--empty) .etu-label-chip) {
    filter: brightness(0.96);
    box-shadow: 0 1px 4px rgba(0, 0, 0, 0.08);
  }

  .audit-filter-slot--action :deep(.etu-pss-item--selected .etu-label-chip) {
    box-shadow: 0 0 0 2px rgba(37, 99, 235, 0.25);
  }

  .audit-filter-slot--date :deep(.etu-pss-item .date-preset-chip) {
    margin: 0 !important;
    min-height: 22px !important;
    height: auto !important;
    max-height: none !important;
    font-size: 12px !important;
    border-radius: 999px !important;
  }

  .audit-filter-slot--date :deep(.etu-pss-item--selected .date-preset-chip) {
    box-shadow: 0 0 0 2px rgba(37, 99, 235, 0.25);
  }

  .search-icon {
    flex-shrink: 0;
  }

  .search-input {
    flex: 1;
    align-self: stretch;
    min-height: 0;
    border: none;
    outline: none;
    background: transparent;
    font-size: 14px;
    color: #111827;
    font-family: inherit;
    line-height: 1.35;
    padding: 0;
    margin: 0;
  }

  .search-input::placeholder {
    color: #9ca3af;
  }

  .search-clear {
    border: none;
    background: none;
    cursor: pointer;
    color: #9ca3af;
    display: flex;
    padding: 0;
    transition: color 0.15s;
  }

  .search-clear:hover {
    color: #374151;
  }
</style>
