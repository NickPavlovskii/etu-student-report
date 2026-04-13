import type { AxiosInstance } from 'axios';
import type { ArchiveModule, DownloadFormat } from '../types';

export default function archiveModule(api: AxiosInstance): ArchiveModule {
  return {
    async fetchArchiveReportsForTeacher(
      lastName: string,
      academicYear?: string
    ) {
      const params = academicYear ? { academicYear } : {};
      const { data } = await api.get(
        `/teachers/${encodeURIComponent(lastName)}/archive/reports`,
        { params }
      );
      return data;
    },
    async fetchArchiveReportsAll(
      teacherLastName?: string,
      academicYear?: string
    ) {
      const params: Record<string, string> = {};
      if (teacherLastName) {
        params.teacherLastName = teacherLastName;
      }
      if (academicYear) {
        params.academicYear = academicYear;
      }
      const { data } = await api.get('/archive/reports', {
        params: Object.keys(params).length ? params : undefined,
      });
      return data;
    },
    async downloadArchiveReport(
      reportId: number,
      format?: DownloadFormat
    ): Promise<Blob> {
      const params = format ? { format } : {};
      const res = await api.get(`/reports/${reportId}/download`, {
        responseType: 'blob',
        params: Object.keys(params).length ? params : undefined,
      });
      return res.data;
    },
  };
}
