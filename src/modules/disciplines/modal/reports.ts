/** Типы отчётов и учебного плана на странице дисциплины */

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
  moodleUrl?: string | null;
  storageType?: string | null;
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
