import type { TableColumn } from '@/components/global/etu-data-table/types';

/** Карточка дисциплины на вкладке «Дисциплины» админки */
export type AdminDisciplineCardItem = {
  discipline: string;
  codeRow: string | number;
  course: string | number;
  semester: string | number;
  educationLevel?: string;
  educationForm?: string;
  loaded: number | string;
  progress: number;
  groupsCount: number;
  groups: string[];
  teacherFio?: string;
  teacherLastName?: string;
  /** Фамилия для GET /teachers/{ln}/discipline/{planRowId}/… при переданной нагрузке из плана */
  reportApiLastName?: string;
};

/** Поля ФИО из ответа API преподавателя (разрешение имён в аудите) */
export type TeacherFioSource = {
  fioShort?: string;
  fio?: string;
  lastName?: string;
  firstName?: string;
  patronymic?: string;
};

/** Колонки таблицы пользователей ИС (вкладка «Пользователи») */
export type UserTableColumn = TableColumn & {
  class: string;
  headerClass: string;
};

/** Колонки таблицы журнала событий (admin / audit) */
export type AuditTableColumn = TableColumn & {
  title: string;
};

/** Колонки таблицы «Назначения» (план / факт преподаватель) */
export type AssignmentsTableColumn = TableColumn & {
  class: string;
  headerClass: string;
};
