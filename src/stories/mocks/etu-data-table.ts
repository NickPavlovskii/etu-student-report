import type { TableColumn } from '@/components/global/etu-data-table/types';

export type StoryDataTableRow = Record<string, unknown>;

export const ETU_DATA_TABLE_MOCK_COLUMNS: TableColumn<StoryDataTableRow>[] = [
  { key: 'title', header: 'Название', sortable: true },
  { key: 'status', header: 'Статус', width: '140px' },
  { key: 'updated', header: 'Обновлено', width: '120px' },
];

export const ETU_DATA_TABLE_MOCK_ROWS: StoryDataTableRow[] = [
  { id: 1, title: 'Курсовая работа', status: 'Проверка', updated: '20.04' },
  { id: 2, title: 'Отчёт по практике', status: 'Принято', updated: '18.04' },
  { id: 3, title: 'Реферат', status: 'Черновик', updated: '12.04' },
];

export const ETU_DATA_TABLE_EMPTY_TEXT = 'Нет записей для отображения';
