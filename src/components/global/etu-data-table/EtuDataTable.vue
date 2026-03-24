<template>
  <div
    :class="[
      'etu-dt-wrap',
      {
        'etu-dt-wrap--shadow': shadow,
        'etu-dt-wrap--scroll': scrollable,
      },
      wrapClass,
    ]"
  >
    <table
      :class="['etu-dt-table', tableClass]"
      :style="tableMinWidth ? { minWidth: tableMinWidth } : undefined"
    >
      <slot name="colgroup" />

      <thead v-if="!hideHeader">
        <tr>
          <th
            v-for="col in columns"
            :key="col.key"
            :class="[col.headerClass, col.sortable && 'th-sortable']"
            :style="col.width ? { width: col.width } : undefined"
            :title="col.title"
            :aria-label="col.ariaLabel || col.title || col.header"
            @click="col.sortable ? onSort(col.key) : undefined"
          >
            <slot
              :name="`header-${col.key}`"
              :column="col"
            >
              {{ col.header }}
            </slot>
            <span
              v-if="col.sortable"
              :class="[
                'sort-indicator',
                {
                  active: sortKey === col.key,
                  desc: sortKey === col.key && sortOrder === 'desc',
                },
              ]"
            >
              ▲
            </span>
          </th>
        </tr>
      </thead>

      <tbody>
        <slot
          v-if="$slots.tbody"
          name="tbody"
        />
        <template v-else-if="loading && showSkeleton">
          <tr
            v-for="n in skeletonRows"
            :key="`sk-${n}`"
            class="skeleton-row"
          >
            <td
              v-for="col in columns"
              :key="col.key"
            >
              <div
                class="skeleton-cell"
                :style="{ width: col.skeletonWidth || '60%' }"
              />
            </td>
          </tr>
        </template>

        <template v-else-if="rows.length">
          <tr
            v-for="(row, rowIndex) in rows"
            :key="rowKeyValue(row, rowIndex)"
            :class="['data-row', rowClass?.(row, rowIndex)]"
            :style="rowStyle?.(row, rowIndex)"
            @click="emit('row-click', row, rowIndex)"
          >
            <td
              v-for="col in columns"
              :key="col.key"
              :class="col.cellClass"
              :style="col.cellStyle"
            >
              <slot
                :name="`cell-${col.key}`"
                :row="row"
                :value="row[col.key]"
                :index="rowIndex"
                :column="col"
              >
                {{
                  col.formatter
                    ? col.formatter(row[col.key], row)
                    : row[col.key]
                }}
              </slot>
            </td>
          </tr>
        </template>

        <tr v-else-if="!loading">
          <td
            :colspan="Math.max(columns.length, 1)"
            class="cell-empty"
          >
            <slot name="empty">
              <div class="cell-empty-inner">
                <v-icon
                  size="40"
                  color="#d1d5db"
                >
                  {{ emptyIcon }}
                </v-icon>
                <p>{{ emptyText }}</p>
              </div>
            </slot>
          </td>
        </tr>
      </tbody>

      <tfoot v-if="$slots.footer">
        <tr>
          <td :colspan="Math.max(columns.length, 1)">
            <slot name="footer" />
          </td>
        </tr>
      </tfoot>
    </table>
  </div>
</template>

<script setup lang="ts" generic="T extends Record<string, any>">
  import { ref } from 'vue';
  import type { TableColumn } from './types';

  const props = withDefaults(
    defineProps<{
      columns: TableColumn<T>[];
      rows: T[];
      rowKey?: keyof T & string;
      rowClass?: (row: T, index: number) => string | string[] | undefined;
      rowStyle?: (row: T, index: number) => Record<string, string> | undefined;
      loading?: boolean;
      showSkeleton?: boolean;
      skeletonRows?: number;
      hideHeader?: boolean;
      emptyIcon?: string;
      emptyText?: string;
      wrapClass?: string | string[] | Record<string, boolean>;
      tableClass?: string | string[] | Record<string, boolean>;
      shadow?: boolean;
      scrollable?: boolean;
      tableMinWidth?: string;
    }>(),
    {
      rowKey: undefined,
      loading: false,
      showSkeleton: true,
      skeletonRows: 5,
      hideHeader: false,
      emptyIcon: 'mdi-clipboard-text-search-outline',
      emptyText: 'Записи не найдены',
      wrapClass: undefined,
      tableClass: undefined,
      rowClass: undefined,
      rowStyle: undefined,
      variant: 'neutral',
      shadow: false,
      scrollable: false,
      tableMinWidth: undefined,
    }
  );

  const emit = defineEmits<{
    'row-click': [row: T, index: number];
    sort: [key: string, order: 'asc' | 'desc'];
  }>();

  const sortKey = ref<string | null>(null);
  const sortOrder = ref<'asc' | 'desc'>('asc');

  function rowKeyValue(row: T, rowIndex: number): string | number {
    if (props.rowKey != null && props.rowKey !== '') {
      const v = row[props.rowKey];
      if (v != null && v !== '') return v as string | number;
    }
    return `row-${rowIndex}`;
  }

  function onSort(key: string) {
    if (sortKey.value === key) {
      sortOrder.value = sortOrder.value === 'asc' ? 'desc' : 'asc';
    } else {
      sortKey.value = key;
      sortOrder.value = 'asc';
    }
    emit('sort', key, sortOrder.value);
  }
</script>

<style scoped>
  .etu-dt-wrap {
    border-radius: 14px;
    border: 1.5px solid var(--etu-dt-border, #e5e7eb);
    overflow: hidden;
    background: var(--etu-dt-bg, #fff);
    --etu-dt-border: #e5e7eb;
    --etu-dt-bg: #fff;
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
    --etu-dt-cell-pad-y: 12px;
    --etu-dt-cell-pad-x: 16px;
  }

  .etu-dt-wrap--shadow {
    box-shadow:
      0 1px 2px rgba(28, 25, 23, 0.04),
      0 4px 12px rgba(28, 25, 23, 0.03);
  }

  .etu-dt-wrap--scroll {
    overflow-x: auto;
  }

  .etu-dt-table {
    width: 100%;
    border-collapse: collapse;
    font-size: var(--etu-dt-font, 14px);
    min-width: 0;
  }

  .etu-dt-table :deep(th),
  .etu-dt-table :deep(td) {
    padding: var(--etu-dt-cell-pad-y, 12px) var(--etu-dt-cell-pad-x, 16px);
    border-bottom: 1px solid var(--etu-dt-cell-border, #f3f4f6);
    text-align: left;
    vertical-align: middle;
  }

  .etu-dt-table :deep(tbody tr:last-child td) {
    border-bottom: none;
  }

  /* Заголовки: `th`, `th-filled` + разделитель `th-sep` */
  .etu-dt-table :deep(thead .th),
  .etu-dt-table :deep(thead th.th-filled) {
    font-size: var(--etu-dt-th-font, 11px);
    font-weight: var(--etu-dt-th-weight, 700);
    color: var(--etu-dt-th-color, #9ca3af);
    text-transform: uppercase;
    letter-spacing: var(--etu-dt-th-spacing, 0.07em);
    background: var(--etu-dt-th-bg, #f9fafb);
    white-space: nowrap;
  }

  .etu-dt-table :deep(thead th.th-sep) {
    position: relative;
    overflow: visible;
  }

  .etu-dt-table :deep(thead th.th-sep)::after {
    content: '';
    position: absolute;
    right: 0;
    top: 50%;
    transform: translateY(-50%);
    height: 60%;
    width: 1px;
    background: var(--etu-dt-sep, #e5e7eb);
    pointer-events: none;
    z-index: 1;
  }

  .th-sortable {
    cursor: pointer;
    user-select: none;
  }

  .th-sortable:hover {
    color: #6b7280;
  }

  .sort-indicator {
    display: inline-block;
    margin-left: 4px;
    font-size: 9px;
    opacity: 0.3;
    transition:
      opacity 0.15s,
      transform 0.15s;
  }

  .sort-indicator.active {
    opacity: 1;
  }

  .sort-indicator.desc {
    transform: rotate(180deg);
  }

  .data-row {
    transition: background 0.12s;
  }

  .data-row:hover {
    background: var(--etu-dt-row-hover, #fafafa);
  }

  .skeleton-row :deep(td) {
    padding: 16px;
  }

  .skeleton-cell {
    height: 14px;
    border-radius: 6px;
    background: linear-gradient(90deg, #f3f4f6 25%, #e5e7eb 50%, #f3f4f6 75%);
    background-size: 200% 100%;
    animation: etu-dt-shimmer 1.5s infinite ease-in-out;
  }

  @keyframes etu-dt-shimmer {
    0% {
      background-position: 200% 0;
    }
    100% {
      background-position: -200% 0;
    }
  }

  .cell-empty {
    padding: 52px 24px;
    color: #9ca3af;
    border-bottom: none !important;
    text-align: center !important;
    vertical-align: middle;
  }

  .cell-empty-inner {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    width: 100%;
  }

  .cell-empty-inner p {
    margin: 10px 0 0;
    font-size: 14px;
  }
</style>
