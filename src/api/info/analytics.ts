import type { AxiosInstance } from 'axios';
import type {
  AdminAnalyticsKpi,
  AnalyticsModule,
  AnalyticsQueryParams,
  BySemesterRow,
  DisciplineWithTeacherRowDto,
  DisciplinesTableItem,
  TeacherStatsKpi,
  TeachersSummaryItem,
} from '../types';

export default function analyticsModule(api: AxiosInstance): AnalyticsModule {
  return {
    async getTeacherStats(lastName: string, params: AnalyticsQueryParams) {
      const { data } = await api.get<TeacherStatsKpi>(
        `/teachers/${encodeURIComponent(lastName)}/stats`,
        { params }
      );
      return data;
    },
    async getTeacherStatsDisciplinesTable(
      lastName: string,
      params: AnalyticsQueryParams
    ) {
      const { data } = await api.get<DisciplinesTableItem[]>(
        `/teachers/${encodeURIComponent(lastName)}/stats/disciplines-table`,
        { params }
      );
      return Array.isArray(data) ? data : [];
    },
    async getTeacherStatsBySemester(
      lastName: string,
      params: AnalyticsQueryParams
    ) {
      const { data } = await api.get<BySemesterRow[]>(
        `/teachers/${encodeURIComponent(lastName)}/stats/by-semester`,
        { params }
      );
      return Array.isArray(data) ? data : [];
    },
    async getAdminAnalytics(params: AnalyticsQueryParams) {
      const { data } = await api.get<AdminAnalyticsKpi>('/admin/analytics', {
        params,
      });
      return data;
    },
    async getAdminAnalyticsTeachersSummary(params: AnalyticsQueryParams) {
      try {
        const { data } = await api.get<TeachersSummaryItem[]>(
          '/admin/analytics/teachers-summary',
          { params }
        );
        if (!Array.isArray(data)) {
          return [];
        }
        return data.map((item) => ({
          ...item,
          teacherFio: item.teacherFio ?? item.teacherLastName,
          teacherLastName: item.teacherLastName ?? item.teacherFio,
          uploadedCount: item.uploadedCount ?? item.totalWorks,
          totalWorks: item.totalWorks ?? item.uploadedCount,
        }));
      } catch {
        return [];
      }
    },
    async getAdminAnalyticsDisciplinesTable(params: AnalyticsQueryParams) {
      const { data } = await api.get<DisciplinesTableItem[]>(
        '/admin/analytics/disciplines-table',
        { params }
      );
      return Array.isArray(data) ? data : [];
    },
    async getAdminAnalyticsBySemester(params: AnalyticsQueryParams) {
      const { data } = await api.get<BySemesterRow[]>(
        '/admin/analytics/by-semester',
        { params }
      );
      return Array.isArray(data) ? data : [];
    },
    async getDepartmentDisciplinesWithTeachers(params: AnalyticsQueryParams) {
      const { data } = await api.get<DisciplineWithTeacherRowDto[]>(
        '/admin/analytics/disciplines-with-teachers',
        { params }
      );
      return Array.isArray(data) ? data : [];
    },
  };
}
