import type { AuditTableColumn } from '../../model';

export type { AuditTableColumn };

export const AUDIT_TABLE_COLUMNS: AuditTableColumn[] = [
  {
    key: 'date',
    headerClass: 'th th-sep',
    header: 'Дата и время',
    title: 'Когда произошло событие',
  },
  {
    key: 'user',
    headerClass: 'th th-sep',
    header: 'Пользователь',
    title: 'Кто выполнил действие',
  },
  {
    key: 'action',
    headerClass: 'th th-sep',
    header: 'Действие',
    title: 'Что произошло: загрузка работы, смена роли и т. п.',
  },
  {
    key: 'entity',
    headerClass: 'th th-sep',
    header: 'О чём событие',
    title: 'К какой записи в системе относится событие',
  },
  {
    key: 'details',
    headerClass: 'th th-sep',
    header: 'Подробности',
    title:
      'Дополнительные сведения: что изменилось, роли, тема работы и т. п.',
  },
  {
    key: 'rollback',
    headerClass: 'th col-actions',
    header: '',
    title: 'Отмена действия',
    ariaLabel: 'Действия',
  },
];
