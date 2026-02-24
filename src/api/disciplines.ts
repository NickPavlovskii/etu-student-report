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

export { getDiscipline as getDisciplineCard };

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

export type ControlScheduleDto = {
  groupName: string;
  weekStart: number;
  weekEnd: number;
  controlText: string;
  topics: string[];
};

export async function getDisciplineControls(
  lastName: string,
  planRowId: number,
  academicYear?: string
): Promise<ControlScheduleDto[]> {
  const params = academicYear ? { academicYear } : {};
  const { data } = await http.get(
    `/teachers/${encodeURIComponent(lastName)}/discipline/${planRowId}/controls`,
    { params }
  );
  return data;
}

export type UploadReportPayload = {
  studentId: number;
  groupName: string;
  topic?: string;
  controlType: string;
  workType: string;
  workTitle: string;
  academicYear: string;
  autoCheck: boolean;
  check?: number | null;
  status: string;
  uploadedBy: string;
  file: File;
};

export async function uploadDisciplineReport(
  lastName: string,
  planRowId: number,
  payload: UploadReportPayload
) {
  const form = new FormData();
  form.append('studentId', String(payload.studentId));
  form.append('groupName', payload.groupName);
  form.append('topic', payload.topic ?? '');
  form.append('controlType', payload.controlType);
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
    { headers: { 'Content-Type': undefined } as Record<string, unknown> }
  );
  return data;
}

export async function downloadReport(reportId: number): Promise<Blob> {
  const res = await http.get(`/reports/${reportId}/download`, {
    responseType: 'blob',
  });
  return res.data;
}
