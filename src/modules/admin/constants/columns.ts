import type { AssignmentsTableColumn, UserTableColumn } from '../model';

export type { AssignmentsTableColumn, UserTableColumn };

export const USER_TABLE_COLUMNS: UserTableColumn[] = [
  {
    key: 'fio',
    class: 'col-fio',
    header: 'Сотрудник',
    headerClass: 'th-filled th-sep',
  },
  {
    key: 'disciplines',
    class: 'col-disciplines',
    header: 'Дисциплины',
    headerClass: 'th-filled th-sep',
  },
  {
    key: 'rank',
    class: 'col-position',
    header: 'Ранг',
    headerClass: 'th-filled th-sep',
  },
  {
    key: 'degree',
    class: 'col-position',
    header: 'Степень',
    headerClass: 'th-filled th-sep',
  },
  {
    key: 'role',
    class: 'col-role',
    header: 'Роль',
    headerClass: 'th-filled',
  },
];

export const ASSIGNMENTS_TABLE_COLUMNS: AssignmentsTableColumn[] = [
  {
    key: 'disciplineName',
    class: 'col-discipline',
    header: 'Дисциплина',
    headerClass: 'th-filled th-sep',
  },
  {
    key: 'course',
    class: 'col-course',
    header: 'Курс',
    headerClass: 'th-filled th-sep',
  },
  {
    key: 'semester',
    class: 'col-semester',
    header: 'Семестр',
    headerClass: 'th-filled th-sep',
  },
  {
    key: 'planTeacher',
    class: 'col-plan',
    header: 'По РПД',
    headerClass: 'th-filled th-sep',
  },
  {
    key: 'actualTeacher',
    class: 'col-actual',
    header: 'Фактический преподаватель',
    headerClass: 'th-filled th-sep',
  },
  {
    key: 'actions',
    class: 'col-actions',
    header: '',
    headerClass: 'th-filled',
  },
];
