import { http } from './http';

export type AdminStatsDto = {
  teachersCount?: number;
  disciplinesCount?: number;
  groupsCount?: number;
  templatesCount?: number;
  employees?: number;
  disciplines?: number;
  groups?: number;
  templates?: number;
};

export type TeacherDto = {
  lastName: string;
  firstName?: string;
  patronymic?: string;
  fio?: string;
  email?: string;
  role?: string;
  position?: string;
  rank?: string;
  degree?: string;
  disciplinesCount?: number;
};

export type AuditLogEntryDto = {
  id: number;
  createdAt: string;
  action: string;
  entityType?: string;
  entityId?: string;
  actor?: string;
  details?: string;
  /** Когда действие было отменено (откат) */
  rolledBackAt?: string;
  /** Кто отменил действие */
  rolledBackBy?: string;
};

export async function getAdminStats(academicYear?: string): Promise<AdminStatsDto> {
  const params = academicYear ? { academicYear } : {};
  const { data } = await http.get<AdminStatsDto>('/admin/stats', { params });
  return data ?? {};
}

/**
 * GET /api/admin/teachers
 * Список преподавателей. Query: search (по имени или email).
 * Ответ: массив { lastName, firstName, patronymic, fio, email, role, disciplinesCount, ... }
 */
export async function getAdminTeachers(search?: string): Promise<TeacherDto[]> {
  const params = search ? { search } : {};
  const { data } = await http.get<TeacherDto[]>('/admin/teachers', { params });
  return Array.isArray(data) ? data : [];
}

/**
 * GET /api/admin/teachers/{lastName}
 * Получить преподавателя по фамилии.
 */
export async function getAdminTeacher(lastName: string): Promise<TeacherDto> {
  const { data } = await http.get<TeacherDto>(
    `/admin/teachers/${encodeURIComponent(lastName)}`
  );
  return data ?? ({} as TeacherDto);
}

/**
 * PUT /api/admin/teachers/{lastName}
 * Обновить роль и email. Query: actor (кто изменил).
 * Body: { email?, role? } или { roles?: string[] }, например { roles: ["Преподаватель", "Администратор"] } или { role: "ADMIN" }.
 */
export async function updateAdminTeacher(
  lastName: string,
  body: { email?: string; role?: string; roles?: string[] },
  actor?: string
): Promise<TeacherDto> {
  const params = actor ? { actor } : {};
  const { data } = await http.put<TeacherDto>(
    `/admin/teachers/${encodeURIComponent(lastName)}`,
    body,
    { params }
  );
  return data ?? ({} as TeacherDto);
}

/**
 * GET /api/admin/disciplines
 * Все дисциплины кафедры — массив названий (string[]).
 */
export async function getAdminDisciplines(): Promise<string[]> {
  const { data } = await http.get<string[]>('/admin/disciplines');
  return Array.isArray(data) ? data : [];
}

/**
 * GET /api/admin/audit-log
 * Журнал событий. Query: dateFrom (YYYY-MM-DD), dateTo, action, actor.
 * action: REPORT_UPLOADED | TEMPLATE_CREATED | TEMPLATE_UPDATED | TEMPLATE_DELETED | ROLE_CHANGED
 */
export async function getAuditLog(params?: {
  dateFrom?: string;
  dateTo?: string;
  action?: string;
  actor?: string;
}): Promise<AuditLogEntryDto[]> {
  const { data } = await http.get<AuditLogEntryDto[]>('/admin/audit-log', {
    params: params ?? {},
  });
  return Array.isArray(data) ? data : [];
}

/**
 * POST /api/admin/audit-log/{id}/rollback
 * Откатить действие (например, отменить загрузку отчёта).
 * После отката запись остаётся в журнале с заполненными rolledBackAt, rolledBackBy.
 */
export async function rollbackAuditEntry(
  entryId: number,
  actor?: string
): Promise<AuditLogEntryDto> {
  const params = actor ? { actor } : {};
  const { data } = await http.post<AuditLogEntryDto>(
    `/admin/audit-log/${entryId}/rollback`,
    {},
    { params }
  );
  return data ?? ({} as AuditLogEntryDto);
}
