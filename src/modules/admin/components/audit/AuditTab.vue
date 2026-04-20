<template>
  <div class="tab-panel">
    <audit-toolbar
      :audit-search="auditSearch"
      :audit-action-filter="auditActionFilter"
      :audit-date-preset="auditDatePreset"
      :record-count="auditLog.length"
      :audit-action-items="a.auditActionItems"
      :audit-date-items="a.auditDateItems"
      :debounced-load-audit="a.debouncedLoadAudit"
      @update:audit-search="setAuditSearch"
      @update:audit-action-filter="setAuditActionFilter"
      @update:audit-date-preset="onAuditDatePresetUpdate"
    />

    <audit-table
      :audit-log="auditLog"
      :audit-loading="auditLoading"
      :format-audit-date="a.formatAuditDate"
      :action-label="a.actionLabel"
      :can-rollback="a.canRollback"
      :open-rollback-confirm="a.openRollbackConfirm"
    />

    <etu-tea-loader
      overlay
      label="Загрузка"
      :loading="auditLoading"
    />

    <rollback-confirm-dialog
      :model-value="rollbackDialog"
      :loading="rollbackLoading"
      @update:model-value="setRollbackDialog"
      @confirm="a.confirmRollback"
    />

    <v-snackbar
      :model-value="rollbackSnackbar.visible"
      location="bottom"
      variant="tonal"
      :color="rollbackSnackbarColor"
      :timeout="4000"
      @update:model-value="onRollbackSnackbarVisible"
    >
      {{ rollbackSnackbar.message }}
    </v-snackbar>
  </div>
</template>

<script setup lang="ts">
  import { computed, inject } from 'vue';
  import AuditToolbar from './AuditToolbar.vue';
  import AuditTable from './AuditTable.vue';
  import RollbackConfirmDialog from './RollbackConfirmDialog.vue';
  import type { AdminAuditContext } from '../../injectionKeys';
  import { adminAuditKey } from '../../injectionKeys';

  const injectedAudit = inject(adminAuditKey);
  if (!injectedAudit) {
    throw new Error('AuditTab: adminAuditKey не найден (ожидается AdminPage)');
  }
  const a: AdminAuditContext = injectedAudit;

  const auditLog = computed(() => a.auditLog.value);
  const auditSearch = computed(() => a.auditSearch.value);
  const auditActionFilter = computed(() => a.auditActionFilter.value);
  const auditDatePreset = computed(() => a.auditDatePreset.value);
  const auditLoading = computed(() => a.auditLoading.value);
  const rollbackDialog = computed(() => a.rollbackDialog.value);
  const rollbackLoading = computed(() => a.rollbackLoading.value);
  const rollbackSnackbar = computed(() => a.rollbackSnackbar.value);

  const rollbackSnackbarColor = computed(() =>
    rollbackSnackbar.value.error ? 'error' : 'success'
  );

  function setAuditSearch(value: string) {
    a.auditSearch.value = value;
  }

  function setAuditActionFilter(value: string) {
    a.auditActionFilter.value = value;
  }

  function onAuditDatePresetUpdate(value: string) {
    a.auditDatePreset.value = value;
    void a.loadAuditLog();
  }

  function setRollbackDialog(value: boolean) {
    a.rollbackDialog.value = value;
  }

  function onRollbackSnackbarVisible(visible: boolean) {
    a.rollbackSnackbar.value = { ...a.rollbackSnackbar.value, visible };
  }
</script>

<style scoped>
  .tab-panel {
    min-height: 320px;
    position: relative;
  }
</style>
