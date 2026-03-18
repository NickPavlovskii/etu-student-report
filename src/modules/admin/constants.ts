/** Опции ролей для селекта в таблице сотрудников */
export const ROLE_ITEMS = [
  { title: 'Преподаватель', value: 'TEACHER' },
  { title: 'Администратор', value: 'ADMIN' },
] as const;

/** Опции фильтра действий в журнале событий */
export const AUDIT_ACTION_ITEMS = [
  { title: 'Все действия', value: '' },
  { title: 'Загрузка работы', value: 'REPORT_UPLOADED' },
  { title: 'Проверка работы', value: 'WORK_CHECKED' },
  { title: 'Создание шаблона', value: 'TEMPLATE_CREATED' },
  { title: 'Изменение шаблона', value: 'TEMPLATE_UPDATED' },
  { title: 'Удаление шаблона', value: 'TEMPLATE_DELETED' },
  { title: 'Смена роли', value: 'ROLE_CHANGED' },
] as const;

/** Опции периода в журнале событий */
export const AUDIT_DATE_ITEMS = [
  { title: 'За сегодня', value: 'today' },
  { title: 'За неделю', value: 'week' },
  { title: 'За месяц', value: 'month' },
  { title: 'Всё время', value: '' },
] as const;

/** Человекочитаемые названия действий аудита */
export const AUDIT_ACTION_LABELS: Record<string, string> = {
  REPORT_UPLOADED: 'Загрузка работы',
  WORK_CHECKED: 'Проверка работы',
  TEMPLATE_CREATED: 'Создание шаблона',
  TEMPLATE_UPDATED: 'Изменение шаблона',
  TEMPLATE_DELETED: 'Удаление шаблона',
  ROLE_CHANGED: 'Смена роли',
};

/** CSS-классы для чипов типов действий в журнале */
export const AUDIT_ACTION_CHIP_CLASSES: Record<string, string> = {
  REPORT_UPLOADED: 'chip-blue',
  WORK_CHECKED: 'chip-green',
  TEMPLATE_CREATED: 'chip-green',
  TEMPLATE_UPDATED: 'chip-orange',
  TEMPLATE_DELETED: 'chip-red',
  ROLE_CHANGED: 'chip-purple',
};
