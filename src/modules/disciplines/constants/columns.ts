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
    headerClass: 'th-filled th-sep',
  },
  {
    key: 'control',
    class: 'col-control',
    header: 'Вид контроля',
    headerClass: 'th-filled th-sep',
  },
  {
    key: 'topic',
    class: 'col-topic',
    header: 'Тема',
    headerClass: 'col-topic th-filled th-sep',
  },
  {
    key: 'date',
    class: 'col-date',
    header: 'Дата загрузки',
    headerClass: 'th-filled th-sep',
  },
  {
    key: 'version',
    class: 'col-version',
    header: 'Версия',
    headerClass: 'th-filled th-sep',
  },
  {
    key: 'check',
    class: 'col-check',
    header: 'Проверка',
    headerClass: 'th-filled th-sep',
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
