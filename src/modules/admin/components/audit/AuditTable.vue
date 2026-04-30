<template>
  <etu-data-table
    row-key="id"
    scrollable
    table-min-width="700px"
    empty-icon="mdi-clipboard-text-search-outline"
    empty-text="Записи не найдены"
    :columns="auditColumns"
    :rows="auditLog"
    :loading="auditLoading"
    :show-skeleton="true"
    :shadow="false"
  >
    <template #cell-date="{ row }">
      <span class="cell-date">{{ formatAuditDate(row.createdAt) }}</span>
    </template>

    <template #cell-user="{ row }">
      <div class="cell-person">
        <div class="avatar avatar-sm">
          {{ initials(row.actorFio || row.actor || '') }}
        </div>
        <span class="actor-name">
          {{ row.actorFio || row.actor }}
        </span>
      </div>
    </template>

    <template #cell-action="{ row }">
      <div class="cell-action">
        <etu-label-chip
          variant="inline"
          :label="actionLabel(row.action)"
          :icon="auditActionIcon(row.action)"
          :preset="auditActionPreset(row.action)"
        />
      </div>
    </template>

    <template #cell-entity="{ row }">
      <span class="cell-entity">{{ formatAuditEntityLabel(row) }}</span>
    </template>

    <template #cell-details="{ row }">
      <span class="cell-details">
        <template
          v-for="(seg, idx) in detailsSegments(
            formatAuditDetails(row.details, {
              action: row.action,
              entityType: row.entityType,
              entityId: row.entityId,
              entityLabel: formatAuditEntityLabel(row),
            })
          )"
          :key="`${row.id}-d-${idx}`"
        >
          <span
            v-if="seg.strong"
            class="cell-details-strong"
          >
            {{ seg.text }}
          </span>
          <template v-else>{{ seg.text }}</template>
        </template>
      </span>
    </template>

    <template #cell-rollback="{ row }">
      <div class="col-actions">
        <v-btn
          v-if="canRollback(row)"
          icon
          variant="text"
          size="small"
          class="rollback-btn"
          title="Отменить действие"
          @click="openRollbackConfirm(row)"
        >
          <v-icon size="16">mdi-undo</v-icon>
        </v-btn>
        <span
          v-else-if="row.rolledBackAt"
          class="rolled-back-label"
          :title="rolledBackTitle(row)"
        >
          Отменено
        </span>
      </div>
    </template>
  </etu-data-table>
</template>

<script setup lang="ts">
  import { computed } from 'vue';
  import { initials as getInitials } from '@/utils/initials';
  import {
    AUDIT_TABLE_COLUMNS,
    auditActionIcon,
    auditActionPreset,
    formatAuditDetails,
    formatAuditEntityLabel,
  } from '@/modules/admin/utils/audit';
  import type { AuditLogEntryDto } from '@/api/info';
  import type { TableColumn } from '@/components/global/etu-data-table/types';

  defineProps<{
    auditLog: AuditLogEntryDto[];
    auditLoading: boolean;
    formatAuditDate: (iso: string) => string;
    actionLabel: (action: string) => string;
    canRollback: (entry: AuditLogEntryDto) => boolean;
    openRollbackConfirm: (entry: AuditLogEntryDto) => void;
  }>();

  const AUDIT_CELL_CLASS: Record<string, string> = {
    date: 'cell-date',
    user: '',
    action: 'cell-action',
    entity: 'cell-entity',
    details: 'cell-details',
    rollback: 'col-actions',
  };

  const auditColumns = computed<TableColumn<AuditLogEntryDto>[]>(() =>
    AUDIT_TABLE_COLUMNS.map((c) => ({
      key: c.key,
      header: c.header,
      headerClass: c.headerClass,
      title: c.title,
      ariaLabel: c.ariaLabel,
      cellClass: AUDIT_CELL_CLASS[c.key] ?? '',
    }))
  );

  function initials(str: string) {
    return getInitials(str);
  }

  function rolledBackTitle(row: AuditLogEntryDto): string {
    return row.rolledBackBy ? `Отменено: ${row.rolledBackBy}` : '';
  }

  function detailsSegments(text: string): { text: string; strong: boolean }[] {
    const s = String(text ?? '');
    if (!s) {
      return [{ text: '', strong: false }];
    }

    const out: { text: string; strong: boolean }[] = [];
    // Поддерживаем оба варианта кавычек из бэка: «...» и "..."
    const re = /«([^»]+)»|"([^"]+)"/g;
    let last = 0;
    let m: RegExpExecArray | null = null;
    while ((m = re.exec(s)) !== null) {
      const start = m.index;
      const end = re.lastIndex;
      if (start > last) {
        out.push({ text: s.slice(last, start), strong: false });
      }
      const inner = (m[1] ?? m[2] ?? '').trim();
      if (inner) {
        out.push({ text: inner, strong: true });
      }
      last = end;
    }
    if (last < s.length) {
      out.push({ text: s.slice(last), strong: false });
    }
    return out.length ? out : [{ text: s, strong: false }];
  }
</script>

<style scoped>
  .cell-date {
    white-space: nowrap;
    font-size: 13px;
    color: #6b7280;
  }

  .cell-entity {
    max-width: 280px;
    white-space: normal;
    line-height: 1.45;
    color: #374151;
    font-size: 13px;
  }

  .cell-details {
    max-width: 360px;
    white-space: normal;
    line-height: 1.45;
    color: #374151;
    font-size: 13px;
  }

  .cell-details-strong {
    color: #111827;
    font-weight: 700;
  }

  .cell-action {
    vertical-align: middle;
  }

  .cell-action :deep(.etu-label-chip--inline) {
    max-width: 100%;
  }

  .col-actions {
    width: 80px;
    text-align: center;
  }

  :deep(thead th.col-actions) {
    width: 80px;
    text-align: center;
  }

  .cell-person {
    display: flex;
    align-items: center;
    gap: 10px;
  }

  .actor-name {
    font-weight: 500;
    color: #374151;
  }

  .avatar {
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    font-weight: 700;
    color: #fff;
    flex-shrink: 0;
    background: linear-gradient(135deg, #8b5cf6, #6b7280);
  }

  .avatar-sm {
    width: 32px;
    height: 32px;
    font-size: 11px;
  }

  /* Vuetify text/icon-кнопка: без !important — цепочка классов + :deep */
  .col-actions :deep(.rollback-btn.v-btn.v-btn--variant-text.v-btn--icon) {
    color: #6b7280;
    transition:
      color 0.2s ease,
      background-color 0.2s ease,
      box-shadow 0.2s ease;
  }

  .col-actions :deep(.rollback-btn.v-btn.v-btn--variant-text.v-btn--icon .v-icon) {
    color: inherit;
    transition: color 0.2s ease;
  }

  .col-actions :deep(.rollback-btn.v-btn.v-btn--variant-text.v-btn--icon:hover) {
    color: #dc2626;
    background-color: #fef2f2;
  }

  .col-actions :deep(.rollback-btn.v-btn.v-btn--variant-text.v-btn--icon:focus-visible) {
    outline: none;
    box-shadow: 0 0 0 2px #fff, 0 0 0 4px #fca5a5;
  }

  .col-actions :deep(.rollback-btn.v-btn.v-btn--variant-text.v-btn--icon:active) {
    color: #b91c1c;
    background-color: #fee2e2;
  }

  .rolled-back-label {
    font-size: 11px;
    color: #9ca3af;
    font-style: italic;
    font-weight: 500;
  }
</style>
