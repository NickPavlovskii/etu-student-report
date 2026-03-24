import type { TableColumn } from '@/components/global/etu-data-table/types';
import type { ArchiveReportRow } from '@/modules/archive/model/reports';

const thSep = 'th th-sep';

export const ARCHIVE_TABLE_COLUMNS: TableColumn<ArchiveReportRow>[] = [
  {
    key: 'studentName',
    header: 'Студент',
    headerClass: thSep,
    cellClass: 'cell-bold',
  },
  {
    key: 'groupName',
    header: 'Группа',
    headerClass: thSep,
  },
  {
    key: 'disciplineName',
    header: 'Дисциплина',
    headerClass: thSep,
  },
  {
    key: 'workControl',
    header: 'Тип работы',
    headerClass: thSep,
    width: '200px',
    cellStyle: { minWidth: '200px', verticalAlign: 'middle' },
  },
  {
    key: 'topic',
    header: 'Тема',
    headerClass: thSep,
  },
  {
    key: 'uploadDate',
    header: 'Дата загрузки',
    headerClass: thSep,
  },
];

export const ARCHIVE_COLUMN_TEACHER: TableColumn<ArchiveReportRow> = {
  key: 'uploadedBy',
  header: 'Преподаватель',
  headerClass: thSep,
  cellClass: 'cell-bold',
};

export const ARCHIVE_COLUMN_ACTIONS: TableColumn<ArchiveReportRow> = {
  key: 'actions',
  header: '',
  headerClass: 'th col-actions',
  sortable: false,
  ariaLabel: 'Действия',
};
