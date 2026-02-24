import { http } from './http';

export async function getDisciplineCards(lastName: string, academicYear?: string) {
  const params = academicYear ? { academicYear } : {};
  const { data } = await http.get(
    `/teachers/${encodeURIComponent(lastName)}/disciplines/cards`,
    { params }
  );
  return data;
}

export async function getDiscipline(lastName: string, planRowId: number, academicYear?: string) {
  const params = academicYear ? { academicYear } : {};
  const { data } = await http.get(
    `/teachers/${encodeURIComponent(lastName)}/discipline/${planRowId}`,
    { params }
  );
  return data;
}

export async function getDisciplineGroups(lastName: string, planRowId: number, academicYear?: string) {
  const params = academicYear ? { academicYear } : {};
  const { data } = await http.get(
    `/teachers/${encodeURIComponent(lastName)}/discipline/${planRowId}/groups`,
    { params }
  );
  return data;
}

export async function getTeacherGroups(lastName: string, academicYear?: string) {
  const params = academicYear ? { academicYear } : {};
  const { data } = await http.get(
    `/teachers/${encodeURIComponent(lastName)}/groups`,
    { params }
  );
  return data;
}

export async function getDisciplineStudents(
  lastName: string,
  planRowId: number,
  academicYear?: string
) {
  const params = academicYear ? { academicYear } : {};
  const { data } = await http.get(
    `/teachers/${encodeURIComponent(lastName)}/discipline/${planRowId}/students`,
    { params }
  );
  return data;
}

export async function getDisciplineReports(
  lastName: string,
  planRowId: number,
  academicYear?: string
) {
  const params = academicYear ? { academicYear } : {};
  const { data } = await http.get(
    `/teachers/${encodeURIComponent(lastName)}/discipline/${planRowId}/reports`,
    { params }
  );
  return data;
}

export async function uploadDisciplineReport(
  lastName: string,
  planRowId: number,
  payload: {
    studentId: number;
    groupName: string;
    topic?: string;
    workType: string;
    workTitle: string;
    academicYear: string;
    autoCheck: boolean;
    check?: number | null;
    status: string;
    uploadedBy: string;
    file: File;
  }
) {
  const form = new FormData();
  form.append('studentId', String(payload.studentId));
  form.append('groupName', payload.groupName);
  form.append('topic', payload.topic ?? '');
  form.append('workType', payload.workType);
  form.append('workTitle', payload.workTitle);
  form.append('academicYear', payload.academicYear);
  form.append('autoCheck', String(payload.autoCheck));
  form.append(
    'check',
    payload.check === null || payload.check === undefined
      ? ''
      : String(payload.check)
  );
  form.append('status', payload.status);
  form.append('uploadedBy', payload.uploadedBy);
  form.append('file', payload.file);

  const { data } = await http.post(
    `/teachers/${encodeURIComponent(lastName)}/discipline/${planRowId}/reports`,
    form,
    { headers: { 'Content-Type': 'multipart/form-data' } }
  );
  return data;
}

export async function downloadReport(reportId: number) {
  const res = await http.get(`/reports/${reportId}/download`, {
    responseType: 'blob',
  });
  return res.data;
}