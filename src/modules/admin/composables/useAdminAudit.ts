import { ref } from 'vue';
import { getAuditLog, rollbackAuditEntry, type AuditLogEntryDto } from '@/api/admin';
import { useUser } from '@/composables/useUser';
import { datePresetToRange } from '@/utils/datePreset';
import { formatAuditDate as formatDate } from '@/utils/formatAuditDate';
import {
  AUDIT_ACTION_ITEMS,
  AUDIT_DATE_ITEMS,
  AUDIT_ACTION_LABELS,
  AUDIT_ACTION_CHIP_CLASSES,
} from '../constants';

export const auditActionItems = AUDIT_ACTION_ITEMS;
export const auditDateItems = AUDIT_DATE_ITEMS;

export function useAdminAudit() {
  const { user } = useUser();
  const auditLog = ref<AuditLogEntryDto[]>([]);
  const auditSearch = ref('');
  const auditActionFilter = ref('');
  const auditDatePreset = ref('today');
  const auditLoading = ref(false);
  let auditDebounce: ReturnType<typeof setTimeout> | null = null;

  const rollbackDialog = ref(false);
  const rollbackLoading = ref(false);
  const rollbackEntry = ref<AuditLogEntryDto | null>(null);
  const rollbackSnackbar = ref({ visible: false, message: '', error: false });

  function formatAuditDate(iso: string): string {
    return formatDate(iso);
  }

  function actionLabel(action: string): string {
    return AUDIT_ACTION_LABELS[action] || action;
  }

  function actionChipClass(action: string): string {
    return AUDIT_ACTION_CHIP_CLASSES[action] || 'chip-gray';
  }

  function canRollback(entry: AuditLogEntryDto): boolean {
    if (!entry || entry.rolledBackAt) return false;
    return entry.action === 'REPORT_UPLOADED';
  }

  async function loadAuditLog() {
    auditLoading.value = true;
    try {
      const params: { dateFrom?: string; dateTo?: string; action?: string; actor?: string } = {
        ...datePresetToRange(auditDatePreset.value),
      };
      if (auditActionFilter.value) params.action = auditActionFilter.value;
      if (auditSearch.value) params.actor = auditSearch.value;
      auditLog.value = await getAuditLog(params);
    } catch {
      auditLog.value = [];
    } finally {
      auditLoading.value = false;
    }
  }

  function debouncedLoadAudit() {
    if (auditDebounce) clearTimeout(auditDebounce);
    auditDebounce = setTimeout(loadAuditLog, 300);
  }

  function onAuditDatePresetChange() {
    loadAuditLog();
  }

  function openRollbackConfirm(entry: AuditLogEntryDto) {
    rollbackEntry.value = entry;
    rollbackDialog.value = true;
  }

  async function confirmRollback() {
    const entry = rollbackEntry.value;
    if (!entry) return;
    rollbackLoading.value = true;
    rollbackSnackbar.value = { visible: false, message: '', error: false };
    try {
      await rollbackAuditEntry(entry.id, user.value?.lastName);
      rollbackDialog.value = false;
      rollbackEntry.value = null;
      await loadAuditLog();
      rollbackSnackbar.value = { visible: true, message: 'Действие отменено', error: false };
    } catch (e) {
      console.error(e);
      const msg = (e as { response?: { data?: { message?: string } } })?.response?.data?.message;
      rollbackSnackbar.value = {
        visible: true,
        message:
          msg || 'Не удалось отменить действие. Проверьте, что бэкенд поддерживает откат.',
        error: true,
      };
    } finally {
      rollbackLoading.value = false;
    }
  }

  return {
    auditLog,
    auditSearch,
    auditActionFilter,
    auditDatePreset,
    auditLoading,
    auditActionItems,
    auditDateItems,
    rollbackDialog,
    rollbackLoading,
    rollbackEntry,
    rollbackSnackbar,
    loadAuditLog,
    debouncedLoadAudit,
    onAuditDatePresetChange,
    formatAuditDate,
    actionLabel,
    actionChipClass,
    canRollback,
    openRollbackConfirm,
    confirmRollback,
  };
}
