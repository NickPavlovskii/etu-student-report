export type ArchiveReportDto = {
  id: number;
  planRowId: number;
  studentId: number;
  studentName: string;
  groupName: string;
  disciplineName: string;
  teacherLastName: string;
  uploadedBy: string;
  topic: string | null;
  controlType: string | null;
  workTitle: string;
  academicYear: string;
  uploadDate: string | null;
  version: number;
  check: number | null;
  status: string;
  fileName: string;
};

export type ArchiveReportRow = {
  id: number;
  studentName: string;
  groupName: string;
  disciplineName: string;
  workControl: string;
  topic: string;
  uploadDate: string | null;
  uploadedBy: string;
  check: number | null;
  status: 'checked' | 'pending' | 'error';
  fileName?: string;
};
