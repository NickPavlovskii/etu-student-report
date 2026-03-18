<template>
  <div class="tab-panel">
    <div class="toolbar audit-toolbar">
      <el-input
        :model-value="auditSearch"
        placeholder="Поиск по пользователю или действию..."
        clearable
        class="search-input"
        :prefix-icon="SearchIcon"
        @input="(v) => { $emit('update:auditSearch', v); debouncedLoadAudit(); }"
      />
      <v-select
        :model-value="auditActionFilter"
        :items="auditActionItems"
        item-title="title"
        item-value="value"
        placeholder="Все действия"
        density="compact"
        variant="outlined"
        hide-details
        class="filter-select"
        clearable
        @update:model-value="$emit('update:auditActionFilter', $event)"
      />
      <v-select
        :model-value="auditDatePreset"
        :items="auditDateItems"
        item-title="title"
        item-value="value"
        placeholder="Период"
        density="compact"
        variant="outlined"
        hide-details
        class="filter-select"
        @update:model-value="$emit('update:auditDatePreset', $event)"
      />
    </div>
    <v-table class="audit-table">
      <thead>
        <tr>
          <th>Дата и время</th>
          <th>Пользователь</th>
          <th>Действие</th>
          <th>Объект</th>
          <th>Детали</th>
          <th class="col-actions"></th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="entry in auditLog" :key="entry.id">
          <td>{{ formatAuditDate(entry.createdAt) }}</td>
          <td>
            <div class="cell-user">
              <div class="avatar avatar-sm">{{ initials(entry.actor || '') }}</div>
              <span>{{ entry.actor || '—' }}</span>
            </div>
          </td>
          <td>
            <span class="audit-action-chip" :class="actionChipClass(entry.action)">
              {{ actionLabel(entry.action) }}
            </span>
          </td>
          <td>{{ entry.entityType || entry.entityId || '—' }}</td>
          <td>{{ entry.details || '—' }}</td>
          <td class="col-actions">
            <v-btn
              v-if="canRollback(entry)"
              icon
              variant="text"
              size="small"
              title="Отменить действие"
              @click="openRollbackConfirm(entry)"
            >
              <v-icon>mdi-undo</v-icon>
            </v-btn>
            <span v-else-if="entry.rolledBackAt" class="rolled-back-label" :title="entry.rolledBackBy ? `Отменено: ${entry.rolledBackBy}` : ''">
              Отменено
            </span>
            <span v-else>—</span>
          </td>
        </tr>
        <tr v-if="!auditLog.length && !auditLoading">
          <td colspan="6" class="text-center">Нет записей</td>
        </tr>
      </tbody>
    </v-table>
    <div v-if="auditLoading" class="loading-overlay">
      <v-progress-circular indeterminate color="primary" />
    </div>

    <rollback-confirm-dialog
      :model-value="rollbackDialog"
      :loading="rollbackLoading"
      @update:model-value="(v) => $emit('update:rollbackDialog', v)"
      @confirm="$emit('confirm-rollback')"
    />

    <v-snackbar
      :model-value="rollbackSnackbar.visible"
      :color="rollbackSnackbar.error ? 'error' : 'success'"
      :timeout="4000"
      location="bottom"
      variant="tonal"
      @update:model-value="(v) => $emit('update:rollbackSnackbarVisible', v)"
    >
      {{ rollbackSnackbar.message }}
    </v-snackbar>
  </div>
</template>

<script setup lang="ts">
import { Search } from '@element-plus/icons-vue';
import type { AuditLogEntryDto } from '@/api/admin';
import { initials as getInitials } from '@/utils/initials';
import RollbackConfirmDialog from './RollbackConfirmDialog.vue';

const SearchIcon = Search;

const props = defineProps<{
  auditLog: AuditLogEntryDto[];
  auditSearch: string;
  auditActionFilter: string;
  auditDatePreset: string;
  auditLoading: boolean;
  auditActionItems: readonly { title: string; value: string }[];
  auditDateItems: readonly { title: string; value: string }[];
  rollbackDialog: boolean;
  rollbackLoading: boolean;
  rollbackSnackbar: { visible: boolean; message: string; error: boolean };
  formatAuditDate: (iso: string) => string;
  actionLabel: (action: string) => string;
  actionChipClass: (action: string) => string;
  canRollback: (entry: AuditLogEntryDto) => boolean;
  loadAuditLog: () => Promise<void>;
  debouncedLoadAudit: () => void;
  onAuditDatePresetChange: () => void;
  openRollbackConfirm: (entry: AuditLogEntryDto) => void;
}>();

function initials(str: string) {
  return getInitials(str);
}

defineEmits<{
  'update:auditSearch': [value: string];
  'update:auditActionFilter': [value: string];
  'update:auditDatePreset': [value: string];
  'update:rollbackDialog': [value: boolean];
  'update:rollbackSnackbarVisible': [value: boolean];
  'confirm-rollback': [];
}>();
</script>

<style scoped>
.tab-panel {
  min-height: 320px;
  position: relative;
}
.toolbar.audit-toolbar {
  display: flex;
  align-items: center;
  gap: 16px;
  margin-bottom: 20px;
  flex-wrap: wrap;
}
.search-input {
  flex: 1;
  min-width: 240px;
  max-width: 400px;
}
.filter-select {
  width: 180px;
}
.audit-table {
  width: 100%;
  border-collapse: collapse;
  font-size: 14px;
}
.audit-table th,
.audit-table td {
  padding: 12px 16px;
  border-bottom: 1px solid #e5e7eb;
  text-align: left;
}
.audit-table th {
  font-weight: 600;
  color: #374151;
  background: #f9fafb;
}
.col-actions {
  width: 90px;
  text-align: center;
}
.rolled-back-label {
  font-size: 12px;
  color: #6b7280;
  font-style: italic;
}
.cell-user {
  display: flex;
  align-items: center;
  gap: 12px;
}
.avatar {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 14px;
  font-weight: 600;
  color: #fff;
  flex-shrink: 0;
  background: #6b7280;
}
.avatar-sm {
  width: 32px;
  height: 32px;
  font-size: 12px;
}
.audit-action-chip {
  display: inline-block;
  padding: 4px 10px;
  border-radius: 999px;
  font-size: 12px;
  font-weight: 500;
}
.chip-blue { background: #dbeafe; color: #1d4ed8; }
.chip-green { background: #dcfce7; color: #15803d; }
.chip-orange { background: #ffedd5; color: #c2410c; }
.chip-red { background: #fee2e2; color: #b91c1c; }
.chip-purple { background: #f3e8ff; color: #6d28d9; }
.chip-gray { background: #f3f4f6; color: #4b5563; }
.loading-overlay {
  position: absolute;
  inset: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(255, 255, 255, 0.7);
}
.text-center {
  text-align: center;
  padding: 24px;
  color: #6b7280;
}
</style>
