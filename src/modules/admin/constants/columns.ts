import type { UserTableColumn } from '../model';

export type { UserTableColumn };

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
