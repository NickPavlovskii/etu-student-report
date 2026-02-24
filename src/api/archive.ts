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

export async function downloadArchiveReport(reportId: number): Promise<Blob> {
  const res = await http.get(`/reports/${reportId}/download`, {
    responseType: 'blob',
  });
  return res.data;
}
