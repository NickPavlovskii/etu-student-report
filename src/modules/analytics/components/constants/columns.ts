import type { TableColumn } from '@/components/global/etu-data-table/types';

export const semesterTableColumns: TableColumn[] = [
  {
    key: 'course',
    header: 'Курс',
    headerClass: 'th-filled th-sep',
    width: '8%',
  },
  {
    key: 'semester',
    header: 'Семестр',
    headerClass: 'th-filled th-sep',
    width: '8%',
  },
  {
    key: 'upload',
    header: 'Загрузка',
    headerClass: 'th-filled',
    width: '70%',
  },
];

export const groupsTableColumns: TableColumn[] = [
  {
    key: 'label',
    header: 'Группа',
    headerClass: 'th-filled th-sep'
  },
  {
    key: 'upload',
    header: 'Загрузка',
    headerClass: 'th-filled'
   },
];

export const teachersTableColumns: TableColumn[] = [
  {
    key: 'teacher',
    header: 'Преподаватель',
    headerClass: 'th-filled th-sep',
  },
  {
    key: 'disciplinesCount',
    header: 'Дисциплин',
    headerClass: 'th-filled th-sep',
    width: '10%',
  },
  { key: 'upload',
    header: 'Загрузка',
    headerClass: 'th-filled'
  },
];

export const disciplinesSimpleTableColumns: TableColumn[] = [
  {
    key: 'disciplineName',
    header: 'Дисциплина',
    headerClass: 'th-filled th-sep',
  },
  {
    key: 'groupsCount',
    header: 'Групп',
    headerClass: 'th-filled th-sep',
    width: '8%',
  },
  {
    key: 'studentsCount',
    header: 'Студентов',
    headerClass: 'th-filled th-sep',
    width: '8%',
  },
  { key: 'upload', header: 'Загрузка', headerClass: 'th-filled' },
];

export const disciplinesPlanTableColumns: TableColumn[] = [
  {
    key: 'disciplineName',
    header: 'Дисциплина',
    headerClass: 'th-filled th-sep',
  },
  {
    key: 'teacher',
    header: 'Преподаватель',
    headerClass: 'th-filled th-sep',
  },
  {
    key: 'course',
    header: 'Курс',
    headerClass: 'th-filled th-sep',
    width: '6%',
  },
  {
    key: 'semester',
    header: 'Семестр',
    headerClass: 'th-filled th-sep',
    width: '6%',
  },
  { key: 'groups', header: 'Группы', headerClass: 'th-filled th-sep' },
  {
    key: 'studentsCount',
    header: 'Студентов',
    headerClass: 'th-filled th-sep',
    width: '8%',
  },
  { key: 'upload', header: 'Загрузка', headerClass: 'th-filled' },
];

export const teacherTreeTableColumns: TableColumn[] = [
  {
    key: '_chev',
    header: '',
    headerClass: 'th-filled th-sep tree-col-chev',
    width: '44px',
  },
  {
    key: 'name',
    header: 'Преподаватель / дисциплина',
    headerClass: 'th-filled th-sep tree-col-name',
  },
  {
    key: 'groups',
    header: 'Группы',
    headerClass: 'th-filled th-sep tree-col-groups',
  },
  {
    key: 'upload',
    header: 'Загрузка',
    headerClass: 'th-filled tree-col-upload',
  },
];
