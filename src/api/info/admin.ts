import type { AxiosInstance } from 'axios';
import type {
  AdminModule,
  AdminStatsDto,
  AuditLogEntryDto,
  AuditLogQueryParams,
  TeacherDto,
} from '../types';

export default function adminModule(api: AxiosInstance): AdminModule {
  return {
    async getAdminStats(academicYear?: string): Promise<AdminStatsDto> {
      const params = academicYear ? { academicYear } : {};
      const { data } = await api.get<AdminStatsDto>('/admin/stats', { params });
      return data ?? {};
    },
    async getAdminTeachers(search?: string): Promise<TeacherDto[]> {
      const params = search ? { search } : {};
      const { data } = await api.get<TeacherDto[]>('/admin/teachers', { params });
      return Array.isArray(data) ? data : [];
    },
    async getAdminTeacher(lastName: string): Promise<TeacherDto> {
      const { data } = await api.get<TeacherDto>(
        `/admin/teachers/${encodeURIComponent(lastName)}`
      );
      return data ?? ({} as TeacherDto);
    },
    async updateAdminTeacher(
      lastName: string,
      body: { email?: string; role?: string; roles?: string[] },
      actor?: string
    ): Promise<TeacherDto> {
      const params = actor ? { actor } : {};
      const { data } = await api.put<TeacherDto>(
        `/admin/teachers/${encodeURIComponent(lastName)}`,
        body,
        { params }
      );
      return data ?? ({} as TeacherDto);
    },
    async getAdminDisciplines(): Promise<string[]> {
      const { data } = await api.get<string[]>('/admin/disciplines');
      return Array.isArray(data) ? data : [];
    },
    async getAuditLog(params?: AuditLogQueryParams): Promise<AuditLogEntryDto[]> {
      const { data } = await api.get<AuditLogEntryDto[]>('/admin/audit-log', {
        params: params ?? {},
      });
      return Array.isArray(data) ? data : [];
    },
    async rollbackAuditEntry(
      entryId: number,
      actor?: string
    ): Promise<AuditLogEntryDto> {
      const params = actor ? { actor } : {};
      const { data } = await api.post<AuditLogEntryDto>(
        `/admin/audit-log/${entryId}/rollback`,
        {},
        { params }
      );
      return data ?? ({} as AuditLogEntryDto);
    },
  };
}
