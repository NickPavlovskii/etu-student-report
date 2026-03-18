export type StudentsTableColumn = {
  key: string;
  class: string;
  header: string;
  headerClass: string;
};

export const STUDENTS_TABLE_COLUMNS: StudentsTableColumn[] = [
  {
    key: 'expand',
    class: 'col-expand',
    header: '',
    headerClass: 'col-expand th-empty',
  },
  {
    key: 'id',
    class: 'col-id',
    header: 'ID лк / Зачётка',
    headerClass: 'th-filled',
  },
  {
    key: 'control',
    class: 'col-control',
    header: 'Вид контроля',
    headerClass: 'th-filled',
  },
  {
    key: 'topic',
    class: 'col-topic',
    header: 'Тема',
    headerClass: 'col-topic th-filled',
  },
  {
    key: 'date',
    class: 'col-date',
    header: 'Дата загрузки',
    headerClass: 'th-filled',
  },
  {
    key: 'version',
    class: 'col-version',
    header: 'Версия',
    headerClass: 'th-filled',
  },
  {
    key: 'check',
    class: 'col-check',
    header: 'Проверка',
    headerClass: 'th-filled',
  },
  {
    key: 'status',
    class: 'col-status',
    header: 'Статус',
    headerClass: 'th-filled',
  },
  { key: 'action',
    class: 'col-action',
    header: '',
    headerClass: 'th-empty'
  },
];
