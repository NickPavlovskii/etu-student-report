const thFilled = { headerProps: { class: 'th-filled' } as const };

export const ARCHIVE_COLUMNS = [
  {
    title: 'Студент',
    key: 'studentName',
    ...thFilled,
  },
  {
    title: 'Группа',
    key: 'groupName',
    ...thFilled,
  },
  {
    title: 'Дисциплина',
    key: 'disciplineName',
    ...thFilled,
  },
  {
    title: 'Вид контроля',
    key: 'workControl',
    ...thFilled,
  },
  {
    title: 'Тема',
    key: 'topic',
    ...thFilled,
  },
  {
    title: 'Дата загрузки',
    key: 'uploadDate',
    ...thFilled,
  },
];

export const ARCHIVE_COLUMN_TEACHER = {
  title: 'Преподаватель',
  key: 'uploadedBy',
  ...thFilled,
};

export const ARCHIVE_COLUMN_ACTIONS = {
  title: '',
  key: 'actions',
  sortable: false,
};
