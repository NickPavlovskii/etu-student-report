<template>
  <v-card class="card table" elevation="0">
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
          variant="tonal"
        >
          {{ item.workControl || '—' }}
        </v-chip>
      </template>
      <template #item.uploadDate="{ item }">
        <v-icon
          class="table-icon"
          size="16"
        >
          mdi-clock-outline
        </v-icon>
        <span class="date-cell">
          {{ formatDate(item.uploadDate) }}
        </span>
      </template>
      <template #item.actions="{ item }">
        <v-btn
          icon
          size="small"
          variant="text"
          class="dl-btn"
          @click="$emit('download', item)"
        >
          <v-icon size="18">
            mdi-download
          </v-icon>
        </v-btn>
      </template>
    </v-data-table>
  </v-card>
</template>

<script setup lang="ts">
import type { ArchiveReportRow } from '@/types/reports';

defineProps<{
  headers: unknown[];
  items: ArchiveReportRow[];
  loading: boolean;
  formatDate: (s: string | null) => string;
}>();

defineEmits<{
  (e: 'download', item: ArchiveReportRow): void;
}>();
</script>

<style scoped>
.card {
  background: #fff;
  border: 1px solid #e5e7eb;
  border-radius: 14px;
  box-shadow: 0 8px 20px rgba(17, 24, 39, 0.04);
}
.table {
  margin: 0 auto;
  overflow: hidden;
}
.data-table {
  border-radius: 14px;
}
:deep(.v-data-table-header th) {
  background: #f9fafb;
  color: #374151;
  font-size: 12.5px;
  font-weight: 700;
  position: relative;
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
:deep(.v-data-table__tr) {
  border-bottom: 1px solid #f1f5f9;
}
:deep(.v-data-table__tr:hover) {
  background: #f3f4f6;
}
.chip {
  border-radius: 10px;
  background-color: #eff6ff;
  color: #1d4ed8;
  font-weight: 600;
}
.date-cell {
  color: #374151;
  font-weight: 600;
}
.dl-btn {
  color: #2563eb;
  border-radius: 10px;
}
</style>
