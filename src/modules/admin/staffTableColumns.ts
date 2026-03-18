export type StaffTableColumn = {
  key: string;
  class: string;
  header: string;
  headerClass: string;
};

export const STAFF_TABLE_COLUMNS: StaffTableColumn[] = [
  { key: 'fio', class: 'col-fio', header: 'ФИО', headerClass: 'th-filled' },
  { key: 'email', class: 'col-email', header: 'EMAIL', headerClass: 'th-filled' },
  { key: 'position', class: 'col-position', header: 'ДОЛЖНОСТЬ', headerClass: 'th-filled' },
  { key: 'role', class: 'col-role', header: 'РОЛЬ', headerClass: 'th-filled' },
  { key: 'disciplines', class: 'col-disciplines', header: 'ДИСЦИПЛИНЫ', headerClass: 'th-filled' },
];
