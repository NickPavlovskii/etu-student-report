import { ref } from 'vue';

type Report = {
  studentId: number;
  topic: string;
  uploadDate: string;
  version: number;
  check: number | null;
  url: string;
};

const reports = ref<Record<string, Report>>({});

/**
 * ключ: `${studentId}__${topic}`
 */
export function useReportsStorage() {
  const makeKey = (studentId: number, topic: string) =>
    `${studentId}__${topic}`;

  const addReport = (report: Report) => {
    reports.value[makeKey(report.studentId, report.topic)] = report;
  };

  const getReport = (studentId: number, topic: string) => {
    return reports.value[makeKey(studentId, topic)] ?? null;
  };

  const getReportsByStudent = (studentId: number) => {
    return Object.values(reports.value).filter(
      (r) => r.studentId === studentId
    );
  };

  return {
    addReport,
    getReport,
    getReportsByStudent,
  };
}
