<template>
  <v-card
    class="card table"
    elevation="0"
  >
    <etu-data-table
      :columns="columns"
      :rows="pagedRows"
      row-key="id"
      scrollable
      :shadow="false"
      :loading="loading"
      table-min-width="1180px"
      wrap-class="archive-dt-wrap"
      empty-text="Записи не найдены"
    >
      <template #cell-workControl="{ row }">
        <div class="work-type-cell">
          <etu-label-chip
            v-if="row.workControl"
            variant="inline"
            size="sm"
            shape="rounded"
            preset="blue"
            icon-position="none"
            root-class="archive-work-chip"
            :label="row.workControl"
          />
          <span
            v-else
            class="dash"
          >
            —
          </span>
        </div>
      </template>
      <template #cell-topic="{ row }">
        <span
          class="topic-cell"
          :title="row.topic"
        >
          {{ row.topic }}
        </span>
      </template>
      <template #cell-uploadDate="{ row }">
        <div class="date">
          <v-icon
            class="table-icon"
            size="16"
          >
            mdi-calendar-outline
          </v-icon>
          <span class="date-cell">{{ formatDate(row.uploadDate) }}</span>
        </div>
      </template>
      <template #cell-actions="{ row }">
        <v-menu
          location="bottom end"
          offset="4"
          transition="scale-transition"
        >
          <template #activator="{ props: menuProps }">
            <v-btn
              v-bind="menuProps"
              icon
              size="small"
              variant="text"
              class="dl-btn"
              :title="'Скачать работу'"
            >
              <img
                :src="downloadIcon"
                alt=""
                class="dl-icon"
              />
            </v-btn>
          </template>
          <div class="archive-download-menu">
            <div class="archive-download-menu__title">Скачать</div>
            <button
              type="button"
              class="archive-download-menu__item"
              @click="$emit('download', row, 'docx')"
            >
              <v-icon
                size="18"
                class="archive-download-menu__ico"
              >
                mdi-file-word-outline
              </v-icon>
              <span>Скачать DOCX</span>
            </button>
            <button
              type="button"
              class="archive-download-menu__item"
              @click="$emit('download', row, 'pdf')"
            >
              <v-icon
                size="18"
                class="archive-download-menu__ico"
              >
                mdi-file-pdf-box
              </v-icon>
              <span>Скачать PDF</span>
            </button>
          </div>
        </v-menu>
      </template>
    </etu-data-table>

    <div
      v-if="!loading && pageCount > 1"
      class="pagination-wrap"
    >
      <v-pagination
        v-model="page"
        density="comfortable"
        rounded
        :length="pageCount"
        :total-visible="7"
      />
    </div>
  </v-card>
</template>

<script setup lang="ts">
  import { computed, ref, watch } from 'vue';
  import downloadIcon from '@/assets/icons/download.svg';
  import type { ArchiveReportRow } from '@/modules/archive/model/reports';
  import type { TableColumn } from '@/components/global/etu-data-table/types';

  const props = defineProps<{
    columns: TableColumn<ArchiveReportRow>[];
    items: ArchiveReportRow[];
    loading: boolean;
    formatDate: (s: string | null) => string;
  }>();

  defineEmits<{
    (e: 'download', item: ArchiveReportRow, format?: 'docx' | 'pdf'): void;
  }>();

  const ITEMS_PER_PAGE = 10;
  const page = ref(1);

  const pageCount = computed(() =>
    Math.max(1, Math.ceil(props.items.length / ITEMS_PER_PAGE))
  );

  const pagedRows = computed(() => {
    const start = (page.value - 1) * ITEMS_PER_PAGE;
    return props.items.slice(start, start + ITEMS_PER_PAGE);
  });

  watch(
    () => props.items.length,
    () => {
      page.value = 1;
    }
  );

  watch(pageCount, (n) => {
    if (page.value > n) page.value = Math.max(1, n);
  });
</script>

<style scoped>
  .card {
    background: #fff;
    border: 1px solid #e5e7eb;
    border-radius: 16px;
    box-shadow: 0 1px 3px rgba(0, 0, 0, 0.06);
  }

  .table {
    overflow: hidden;
  }

  .pagination-wrap {
    display: flex;
    justify-content: center;
    padding: 12px 16px 16px;
    border-top: 1px solid #f3f4f6;
  }

  :deep(.archive-dt-wrap) {
    border-radius: 14px;
    --etu-dt-border: #e5e7eb;
    --etu-dt-bg: #ffffff;
    --etu-dt-cell-border: #f3f4f6;
    --etu-dt-th-color: #9ca3af;
    --etu-dt-th-bg: #f9fafb;
    --etu-dt-th-border: #e5e7eb;
    --etu-dt-sep: #e5e7eb;
    --etu-dt-row-hover: #fafafa;
    --etu-dt-font: 14px;
    --etu-dt-th-font: 11px;
    --etu-dt-th-weight: 700;
    --etu-dt-th-spacing: 0.07em;
  }

  :deep(.archive-dt-wrap .data-row) {
    background: #ffffff;
  }

  :deep(.etu-dt-table td.cell-bold) {
    font-weight: 700;
    color: #374151;
  }

  .work-type-cell {
    min-width: 0;
  }

  .dash {
    color: #9ca3af;
  }

  :deep(.archive-work-chip.etu-label-chip--inline) {
    max-width: 100%;
    align-items: center;
  }

  :deep(.archive-work-chip.etu-label-chip--inline .etu-label-chip__text) {
    white-space: nowrap;
    line-height: 1.35;
    overflow: hidden;
    text-overflow: ellipsis;
    max-width: 100%;
  }

  .topic-cell {
    display: -webkit-box;
    -webkit-line-clamp: 4;
    -webkit-box-orient: vertical;
    overflow: hidden;
    line-height: 1.45;
    color: #1e3a8a;
    font-weight: 500;
  }
  .date {
    display: flex;
    align-items: center;
  }
  .table-icon {
    color: #6b7280;
    margin-right: 6px;
    vertical-align: middle;
  }

  .date-cell {
    color: #374151;
  }

  .dl-btn {
    color: #6b7280;
  }

  .dl-btn:hover {
    color: #374151;
    background: rgba(37, 99, 235, 0.06) !important;
  }

  .dl-icon {
    width: 18px;
    height: 18px;
    display: block;
  }

  /* Как выпадающий блок «Роли» в UserRoleCell: белая карточка, голубая рамка */
  .archive-download-menu {
    background: #fff !important;
    border: 1.5px solid #bfdbfe;
    border-radius: 11px;
    padding: 10px 0;
    min-width: 200px;
    box-shadow:
      0 10px 36px rgba(28, 25, 23, 0.13),
      0 2px 6px rgba(28, 25, 23, 0.06);
  }

  .archive-download-menu__title {
    padding: 0 14px 8px;
    font-size: 10px;
    font-weight: 800;
    color: #a8a29e;
    text-transform: uppercase;
    letter-spacing: 0.08em;
    border-bottom: 1px solid #f0efed;
    margin-bottom: 4px;
  }

  .archive-download-menu__item {
    display: flex;
    align-items: center;
    gap: 10px;
    width: 100%;
    padding: 9px 14px;
    margin: 0;
    border: none;
    background: transparent;
    cursor: pointer;
    font-size: 13px;
    font-weight: 500;
    font-family: inherit;
    color: #1c1917;
    text-align: left;
    transition: background 0.12s;
  }

  .archive-download-menu__item:hover {
    background: #eff6ff;
  }

  .archive-download-menu__ico {
    color: #64748b;
    flex-shrink: 0;
  }
</style>
