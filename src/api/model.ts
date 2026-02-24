/** Элемент графика контроля по группе */
export type ControlScheduleDto = {
  groupName: string;
  weekStart: number;
  weekEnd: number;
  controlText: string;
  topics: string[];
};

/** Тело запроса загрузки отчёта по дисциплине */
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
