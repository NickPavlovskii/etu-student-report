import type { AxiosInstance } from 'axios';
import type {
  AdminModule,
  AdminStatsDto,
  AuditLogEntryDto,
  AuditLogQueryParams,
  DisciplineTeacherAssignmentDto,
  TeacherDto,
  UpdateDisciplineTeacherAssignmentRequest,
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
    async getDisciplineTeacherAssignments(
      search?: string
    ): Promise<DisciplineTeacherAssignmentDto[]> {
      const params = search ? { search } : {};
      const { data } = await api.get<DisciplineTeacherAssignmentDto[]>(
        '/admin/discipline-teacher-assignments',
        { params }
      );
      return Array.isArray(data) ? data : [];
    },
    async getDisciplineTeacherAssignment(
      planRowId: number
    ): Promise<DisciplineTeacherAssignmentDto> {
      const { data } = await api.get<DisciplineTeacherAssignmentDto>(
        `/admin/discipline-teacher-assignments/${planRowId}`
      );
      return data ?? ({} as DisciplineTeacherAssignmentDto);
    },
    async putDisciplineTeacherAssignment(
      planRowId: number,
      body: UpdateDisciplineTeacherAssignmentRequest
    ): Promise<DisciplineTeacherAssignmentDto> {
      const { data } = await api.put<DisciplineTeacherAssignmentDto>(
        `/admin/discipline-teacher-assignments/${planRowId}`,
        body
      );
      return data ?? ({} as DisciplineTeacherAssignmentDto);
    },
    async deleteDisciplineTeacherAssignment(
      planRowId: number,
      actor?: string
    ): Promise<void> {
      const params = actor ? { actor } : {};
      await api.delete(`/admin/discipline-teacher-assignments/${planRowId}`, {
        params,
      });
    },
  };
}
