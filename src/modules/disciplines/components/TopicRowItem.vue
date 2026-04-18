<template>
  <tr class="topic-row">
    <td />
    <td />
    <td
      v-if="row.showControl"
      class="col-control control-cell"
      :rowspan="row.controlRowSpan"
    >
      <div class="control-type-block">
        <span class="control-type-title">{{ row.controlText || '—' }}</span>
        <div class="control-sub">
          Недели {{ row.weekStart }}–{{ row.weekEnd }}
        </div>
      </div>
    </td>
    <td class="topic-cell col-topic">
      <div class="topic-text">
        {{ row.topic }}
      </div>
    </td>

    <td class="col-date">
      <div class="date-cell">
        <v-icon
          size="16"
          class="table-icon"
        >
          mdi-clock-outline
        </v-icon>
        <span>
          {{ report?.uploadDate || '—' }}
        </span>
      </div>
    </td>

    <td class="col-version version-cell">
      <span
        v-if="report"
        class="version-plain"
      >
        v{{ report.version }}
      </span>
      <span
        v-else
        class="no-report"
      >
        Учебная работа не загружена
      </span>
    </td>
    <td class="col-check">
      <template v-if="report">
        <div
          v-if="report.check != null"
          :class="['check-cell', reportCheckStateClass(report)]"
        >
          <v-icon size="16">
            {{ reportCheckStatusIcon(report) }}
          </v-icon>
          {{ report.check }}%
        </div>
        <span
          v-else
          class="no-report"
        >
          —
        </span>
      </template>
      <span
        v-else
        class="no-report"
      >
        —
      </span>
    </td>
    <td class="col-status status-cell">
      <span
        v-if="report"
        class="status-text status-uploaded"
      >
        {{ report.status || 'Загружен' }}
      </span>
      <span
        v-else
        class="status-text status-missing"
      >
        Не загружен
      </span>
    </td>
    <td class="col-action action-cell">
      <div class="action-cell-inner">
        <template v-if="report">
          <v-btn
            icon
            variant="text"
            size="small"
            class="action-icon-btn"
            title="Скачать"
            @click.stop="$emit('download', report)"
          >
            <img
              :src="downloadIcon"
              alt="Скачать"
              class="action-icon-img"
            />
          </v-btn>
          <v-btn
            v-if="report.check != null"
            icon
            variant="text"
            size="small"
            class="action-icon-btn"
            title="Проверка учебной работы"
            @click.stop="$emit('viewReport', report)"
          >
            <img
              :src="eyeIcon"
              alt="Просмотр отчёта"
              class="action-icon-img"
            />
          </v-btn>
        </template>
      </div>
    </td>
  </tr>
</template>

<script setup lang="ts">
  import downloadIcon from '@/assets/icons/download.svg';
  import eyeIcon from '@/assets/icons/eye.svg';
  import type { ReportDto, TopicRow } from '../modal/reports';
  import {
    reportCheckStateClass,
    reportCheckStatusIcon,
  } from '../utils/reportCheckDisplay';

  defineProps<{
    row: TopicRow;
    report: ReportDto | null;
  }>();

  defineEmits<{
    (e: 'download', report: ReportDto): void;
    (e: 'viewReport', report: ReportDto): void;
  }>();
</script>

<style scoped>
  .topic-row td {
    padding: 10px 12px;
    border-bottom: 1px solid #e5e7eb;
    text-align: left;
    vertical-align: top;
  }

  .topic-row td.col-date,
  .topic-row td.col-check {
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }

  .table-icon {
    display: inline-block;
    vertical-align: middle;
    line-height: 1;
    transform: translateY(1px);
  }

  .control-type-block {
    min-width: 0;
  }

  .control-type-title {
    display: block;
    font-weight: 600;
    color: #1e3a8a;
    line-height: 1.35;
    word-break: break-word;
  }

  .control-sub {
    font-size: 12px;
    color: #6b7280;
    margin-top: 4px;
    line-height: 1.3;
  }

  .topic-row {
    transition: background 0.15s cubic-bezier(0.4, 0, 0.2, 1);
  }

  .topic-row:hover {
    background-color: #eff6ff;
  }

  .topic-cell {
    font-weight: 500;
    white-space: normal;
    overflow: visible;
    word-break: break-word;
  }

  .topic-text {
    line-height: 1.45;
    color: #1e3a8a;
  }

  .version-cell {
    white-space: normal;
    word-break: break-word;
  }

  .version-plain {
    font-weight: 600;
    color: #374151;
  }

  .status-cell {
    white-space: normal;
    word-break: break-word;
  }

  .status-text {
    font-size: 13px;
    font-weight: 500;
    line-height: 1.35;
  }

  .status-uploaded {
    color: #15803d;
  }

  .status-missing {
    color: #9ca3af;
  }

  .check-cell {
    display: inline-flex;
    align-items: center;
    gap: 6px;
    font-weight: 600;
  }
  .check-ok {
    color: #16a34a;
  }
  .check-error {
    color: #dc2626;
  }

  .action-cell {
    text-align: right;
    vertical-align: middle;
    overflow: visible;
    white-space: nowrap;
  }

  .action-cell-inner {
    display: inline-flex;
    gap: 4px;
    align-items: center;
    justify-content: flex-end;
  }

  .no-report {
    color: #9ca3af;
    font-style: italic;
  }

  .date-cell {
    display: flex;
    align-items: center;
    gap: 4px;
  }

  .action-icon-btn {
    min-width: 32px;
    width: 32px;
    height: 32px;
  }

  .action-icon-img {
    width: 16px;
    height: 16px;
    display: block;
  }
</style>
