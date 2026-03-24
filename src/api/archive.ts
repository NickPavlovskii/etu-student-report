import { http } from './http';

export async function fetchArchiveReportsForTeacher(
  lastName: string,
  academicYear?: string
) {
  const params = academicYear ? { academicYear } : {};
  const { data } = await http.get(
    `/teachers/${encodeURIComponent(lastName)}/archive/reports`,
    { params }
  );
  return data;
}

export async function fetchArchiveReportsAll(
  teacherLastName?: string,
  academicYear?: string
) {
  const params: Record<string, string> = {};
  if (teacherLastName) params.teacherLastName = teacherLastName;
  if (academicYear) params.academicYear = academicYear;
  const { data } = await http.get('/archive/reports', {
    params: Object.keys(params).length ? params : undefined,
  });
  return data;
}

export type DownloadFormat = 'docx' | 'pdf';

export async function downloadArchiveReport(
  reportId: number,
  format?: DownloadFormat
): Promise<Blob> {
  const params = format ? { format } : {};
  const res = await http.get(`/reports/${reportId}/download`, {
    responseType: 'blob',
    params: Object.keys(params).length ? params : undefined,
  });
  return res.data;
}
