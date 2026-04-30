/** Словари для человекочитаемого разбора сущностей и подробностей (formatEntity / formatDetails) */
export const ENTITY_TYPE_LABELS: Readonly<Record<string, string>> = {
  REPORT: 'Отчёт о работе студента',
  STUDENT_REPORT: 'Отчёт о работе студента',
  WORK_REPORT: 'Отчёт о работе',
  TEMPLATE: 'Шаблон документа',
  DOCUMENT_TEMPLATE: 'Шаблон документа',
  DISCIPLINE: 'Дисциплина',
  /** Как в логах Java: «Discipline plan row» */
  DISCIPLINE_PLAN_ROW: 'Строка рабочей программы (дисциплина)',
  PLAN_ROW: 'Строка учебного плана',
  PLANROW: 'Строка учебного плана',
  USER: 'Учётная запись пользователя',
  TEACHER: 'Преподаватель',
  TEACHER_PROFILE: 'Карточка преподавателя',
  STUDENT: 'Студент',
  GROUP: 'Учебная группа',
  ROLE: 'Настройки ролей',
  AUDIT_ENTRY: 'Запись журнала',
  FILE: 'Файл',
};

export const USER_LIKE_TYPE_KEYS = new Set([
  'USER',
  'TEACHER',
  'TEACHER_PROFILE',
  'STUDENT',
]);

export const ROLE_LABELS: Readonly<Record<string, string>> = {
  TEACHER: 'Преподаватель',
  ADMIN: 'Администратор',
  HEAD: 'Заведующий кафедрой',
  HEAD_DEPARTMENT: 'Зав. кафедры',
};

export const FIELD_LABELS: Readonly<Record<string, string>> = {
  role: 'Роль',
  roles: 'Роли',
  email: 'Электронная почта',
  lastname: 'Фамилия',
  last_name: 'Фамилия',
  firstname: 'Имя',
  first_name: 'Имя',
  patronymic: 'Отчество',
  discipline: 'Дисциплина',
  disciplineid: 'Дисциплина',
  discipline_id: 'Дисциплина',
  planrowid: 'Строка учебного плана',
  plan_row_id: 'Строка учебного плана',
  templateid: 'Шаблон',
  template_id: 'Шаблон',
  reportid: 'Отчёт',
  report_id: 'Отчёт',
  studentid: 'Студент',
  student_id: 'Студент',
  groupname: 'Группа',
  group_name: 'Группа',
  topic: 'Тема',
  worktype: 'Тип работы',
  work_type: 'Тип работы',
  controltype: 'Тип контроля',
  control_type: 'Тип контроля',
  status: 'Статус',
  action: 'Действие',
  entitytype: 'Тип объекта',
  entity_type: 'Тип объекта',
  entityid: 'Идентификатор',
  entity_id: 'Идентификатор',
  actuallastname: 'Фамилия преподавателя (факт)',
  actual_last_name: 'Фамилия преподавателя (факт)',
  actualfirstname: 'Имя (факт)',
  actual_first_name: 'Имя (факт)',
  actualpatronymic: 'Отчество (факт)',
  actual_patronymic: 'Отчество (факт)',
  updatedby: 'Кто внёс изменение',
  updated_by: 'Кто внёс изменение',
};

export const ACTION_INTRO: Readonly<Record<string, string>> = {
  REPORT_UPLOADED: 'Загрузка отчета по учебной работе',
  WORK_CHECKED: 'Работа проверена преподавателем.',
  TEMPLATE_CREATED: 'Создан шаблон документа.',
  TEMPLATE_UPDATED: 'Шаблон документа обновлён.',
  TEMPLATE_DELETED: 'Шаблон документа удалён.',
  ROLE_CHANGED: '',
  ACTION_ROLLED_BACK: 'Действие отменено администратором.',
};

export const ROLLBACK_ACTION_RU: Readonly<Record<string, string>> = {
  'Загрузка работы': 'Загрузка отчёта о работе студента отменена.',
  'Загрузка отчёта': 'Загрузка отчёта о работе студента отменена.',
  'Изменение роли': 'Изменение роли пользователя отменено.',
  'Смена роли': 'Изменение роли пользователя отменено.',
  'Создание шаблона': 'Создание шаблона документа отменено.',
  'Обновление шаблона': 'Обновление шаблона документа отменено.',
  'Удаление шаблона': 'Удаление шаблона документа отменено.',
  'Назначение преподавателя по дисциплине':
    'Назначение фактического преподавателя отменено.',
  'Сброс преподавателя по дисциплине':
    'Сброс фактического преподавателя отменён.',
};

export const PAIR_RE = /^([a-zA-Z_][\w]*)\s*:\s*([\s\S]+)$/;
