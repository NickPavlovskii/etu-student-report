export type ReportDto = {
  id: number;
  planRowId: number;
  studentId: number;
  groupName: string;
  teacherLastName: string;
  topic: string | null;
  workType: string;
  workTitle: string;
  academicYear: string;
  uploadDate: string | null;
  version: number;
  check: number | null;
  status: string;
  uploadedBy: string;
  fileName: string;
};

export type ControlScheduleDto = {
  planRowId?: number;
  groupName: string;
  weekStart?: number;
  weekEnd?: number;
  controlText: string;
  topics: string;
};

export type TopicRow = {
  key: string;
  topic: string;
  controlText: string;
  weekStart: number;
  weekEnd: number;
  showControl: boolean;
  controlRowSpan: number;
};

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
}

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