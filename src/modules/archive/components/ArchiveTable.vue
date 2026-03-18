<template>
  <v-card
    class="card table"
    elevation="0"
  >
    <v-data-table
      class="data-table"
      item-key="id"
      :headers="headers"
      :items="items"
      :items-per-page="10"
      :loading="loading"
    >
      <template #item.workControl="{ item }">
        <v-chip
          size="small"
          class="chip"
        >
          {{ item.workControl || '—' }}
        </v-chip>
      </template>
      <template #item.uploadDate="{ item }">
        <div class="date">
          <v-icon
            class="table-icon"
            size="16"
          >
            mdi-calendar-outline
          </v-icon>
          <span class="date-cell">{{ formatDate(item.uploadDate) }}</span>
        </div>
      </template>
      <template #item.actions="{ item }">
        <v-menu
          location="bottom end"
          transition="scale-transition"
        >
          <template #activator="{ props: menuProps }">
            <v-btn
              v-bind="menuProps"
              icon
              size="small"
              variant="text"
              class="dl-btn"
            >
              <img
                :src="downloadIcon"
                alt="Скачать"
                class="dl-icon"
              >
            </v-btn>
          </template>
          <v-list density="compact">
            <v-list-item
              prepend-icon="mdi-file-word-outline"
              title="Скачать DOCX"
              @click="$emit('download', item, 'docx')"
            />
            <v-list-item
              prepend-icon="mdi-file-pdf-box"
              title="Скачать PDF"
              @click="$emit('download', item, 'pdf')"
            />
          </v-list>
        </v-menu>
      </template>
    </v-data-table>
  </v-card>
</template>

<script setup lang="ts">
import downloadIcon from '@/assets/icons/download.svg';
import type { ArchiveReportRow } from '@/types/reports';

defineProps<{
    headers: unknown[];
    items: ArchiveReportRow[];
    loading: boolean;
    formatDate: (s: string | null) => string;
  }>();

  defineEmits<{
    (e: 'download', item: ArchiveReportRow, format?: 'docx' | 'pdf'): void;
  }>();
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

  .data-table {
    border-radius: 16px;
  }

  :deep(.v-data-table-header th) {
    background: #f9fafb;
    color: #374151;
    font-size: 14px;
    font-weight: 600;
    padding: 12px 16px;
  }

  :deep(.v-data-table-header th.th-filled:has(+ th.th-filled))::after {
    content: '';
    position: absolute;
    right: 0;
    top: 50%;
    transform: translateY(-50%);
    height: 60%;
    width: 1px;
    background: #e5e7eb;
  }

  :deep(.v-data-table__tbody tr:nth-child(odd)) {
    background: #f9fafb;
  }

  :deep(.v-data-table__tbody tr:nth-child(even)) {
    background: #ffffff;
  }

  :deep(.v-data-table__tbody tr:hover) {
    background: #f3f4f6 !important;
  }

  :deep(.v-data-table td) {
    padding: 12px 16px;
    color: #374151;
    font-size: 14px;
  }

  :deep(.v-data-table td.cell-bold) {
    font-weight: 700;
  }

  .chip {
    border-radius: 8px;
    background: #EFF6FF !important;
    color: #1D4ED8 !important;
    font-weight: 600;
    font-size: 13px;
  }
  .date {
    display: flex;
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
}

.dl-icon {
  width: 18px;
  height: 18px;
  display: block;
}
</style>
