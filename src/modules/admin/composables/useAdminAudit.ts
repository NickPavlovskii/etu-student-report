import { ref } from 'vue';
import {
  getAuditLog,
  rollbackAuditEntry,
  getTeacherRows,
  type AuditLogEntryDto,
} from '@/api/info';
import { useUser } from '@/composables/useUser';
import { datePresetToRange } from '@/utils/datePreset';
import {
  formatAuditDate as formatDate,
  auditActionLabel as resolveAuditActionLabel,
  AUDIT_ACTION_ITEMS,
  AUDIT_DATE_ITEMS,
} from '../utils/audit';
import type { TeacherFioSource } from '../model';

export const auditActionItems = AUDIT_ACTION_ITEMS;
export const auditDateItems = AUDIT_DATE_ITEMS;

const USER_LIKE_ENTITY_TYPES = new Set([
  'USER',
  'TEACHER',
  'TEACHER_PROFILE',
  'STUDENT',
]);

function normalizeEntityTypeKey(type: string): string {
  return type.trim().toUpperCase().replace(/\s+/g, '_');
}

function fioFromTeacher(t: unknown, fallbackLastName: string): string {
  if (!t || typeof t !== 'object') {
    return fallbackLastName;
  }

  const o = t as TeacherFioSource;
  if (o.fioShort) {
    return String(o.fioShort).trim();
  }
  if (o.fio) {
    return String(o.fio).trim();
  }

  const ln = String(o.lastName ?? fallbackLastName ?? '').trim();
  const fn = String(o.firstName ?? '').trim();
  const pt = String(o.patronymic ?? '').trim();
  const full = [ln, fn, pt].filter(Boolean).join(' ').trim();

  return fn || pt ? full : ln || fallbackLastName;
}

function looksLikeLastName(value: string): boolean {
  return value.length > 0 && !value.includes(' ') && !/^\d+$/.test(value);
}

function collectNamesToResolve(entries: AuditLogEntryDto[]): Set<string> {
  const names = new Set<string>();

  for (const entry of entries) {
    const actor = String(entry.actor ?? '').trim();
    if (actor) {
      names.add(actor);
    }

    const entityId = String(entry.entityId ?? '').trim();
    if (!looksLikeLastName(entityId)) {
      continue;
    }

    const entityType = normalizeEntityTypeKey(String(entry.entityType ?? ''));
    const isRoleChange = String(entry.action ?? '').trim() === 'ROLE_CHANGED';

    if (USER_LIKE_ENTITY_TYPES.has(entityType) || isRoleChange) {
      names.add(entityId);
    }
  }

  return names;
}

async function buildFioCache(names: Set<string>): Promise<Map<string, string>> {
  const cache = new Map<string, string>();

  await Promise.all(
    [...names].map(async (name) => {
      if (name.includes(' ')) {
        cache.set(name, name);
        return;
      }

      try {
        const data = await getTeacherRows(name);
        const teacher = Array.isArray(data) ? data[0] : data;
        cache.set(name, fioFromTeacher(teacher, name));
      } catch {
        cache.set(name, name);
      }
    })
  );

  return cache;
}

function applyFioCache(
  entries: AuditLogEntryDto[],
  fioCache: Map<string, string>
): AuditLogEntryDto[] {
  return entries.map((entry) => {
    const actor = String(entry.actor ?? '').trim();
    const entityId = String(entry.entityId ?? '').trim();

    let entityFioResolved = entry.entityFioResolved;
    if (entityId.includes(' ')) {
      entityFioResolved = entityId;
    } else if (looksLikeLastName(entityId) && fioCache.has(entityId)) {
      entityFioResolved = fioCache.get(entityId);
    }

    return {
      ...entry,
      actorFio: actor
        ? (fioCache.get(actor) ?? entry.actorFio)
        : entry.actorFio,
      entityFioResolved,
    };
  });
}

export function useAdminAudit() {
  const { user } = useUser();

  const auditLog = ref<AuditLogEntryDto[]>([]);
  const auditSearch = ref('');
  const auditActionFilter = ref('');
  const auditDatePreset = ref('today');
  const auditLoading = ref(false);
  const auditError = ref<string | null>(null);
  const rollbackDialog = ref(false);
  const rollbackLoading = ref(false);
  const rollbackEntry = ref<AuditLogEntryDto | null>(null);
  const rollbackSnackbar = ref({ visible: false, message: '', error: false });

  let auditDebounce: ReturnType<typeof setTimeout> | null = null;
  let loadAuditSeq = 0;

  function formatAuditDate(iso: string): string {
    return formatDate(iso);
  }

  function actionLabel(action: string): string {
    return resolveAuditActionLabel(action);
  }

  function canRollback(entry: AuditLogEntryDto): boolean {
    return !!entry && !entry.rolledBackAt && entry.action === 'REPORT_UPLOADED';
  }

  function clearAuditError() {
    auditError.value = null;
  }

  async function loadAuditLog() {
    const seq = ++loadAuditSeq;
    auditLoading.value = true;
    auditError.value = null;

    try {
      const params: Record<string, string | undefined> = {
        ...datePresetToRange(auditDatePreset.value),
      };
      if (auditActionFilter.value) {
        params.action = auditActionFilter.value;
      }
      if (auditSearch.value) {
        params.actor = auditSearch.value;
      }

      const rows = await getAuditLog(params);
      if (seq !== loadAuditSeq) {
        return;
      }
      auditLog.value = rows;

      if (auditLog.value.length > 0) {
        const names = collectNamesToResolve(auditLog.value);
        const fioCache = await buildFioCache(names);
        if (seq !== loadAuditSeq) {
          return;
        }

        auditLog.value = applyFioCache(auditLog.value, fioCache);
      }
    } catch {
      if (seq !== loadAuditSeq) {
        return;
      }
      auditLog.value = [];
      auditError.value = 'Не удалось загрузить журнал аудита';
    } finally {
      if (seq === loadAuditSeq) {
        auditLoading.value = false;
      }
    }
  }

  function debouncedLoadAudit() {
    if (auditDebounce) {
      clearTimeout(auditDebounce);
    }
    auditDebounce = setTimeout(loadAuditLog, 300);
  }

  function openRollbackConfirm(entry: AuditLogEntryDto) {
    rollbackEntry.value = entry;
    rollbackDialog.value = true;
  }

  async function confirmRollback() {
    const entry = rollbackEntry.value;
    if (!entry) {
      return;
    }
    rollbackLoading.value = true;
    rollbackSnackbar.value = { visible: false, message: '', error: false };

    try {
      await rollbackAuditEntry(entry.id, user.value?.lastName);
      rollbackDialog.value = false;
      rollbackEntry.value = null;
      await loadAuditLog();
      rollbackSnackbar.value = {
        visible: true,
        message: 'Действие отменено',
        error: false,
      };
    } catch (e) {
      console.error('[useAdminAudit] rollback failed', e);
      const msg = (e as { response?: { data?: { message?: string } } })
        ?.response?.data?.message;
      rollbackSnackbar.value = {
        visible: true,
        message:
          msg ||
          'Не удалось отменить действие. Проверьте, что бэкенд поддерживает откат.',
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
    auditError,
    auditActionItems,
    auditDateItems,
    rollbackDialog,
    rollbackLoading,
    rollbackEntry,
    rollbackSnackbar,
    loadAuditLog,
    debouncedLoadAudit,
    formatAuditDate,
    actionLabel,
    canRollback,
    clearAuditError,
    openRollbackConfirm,
    confirmRollback,
  };
}
