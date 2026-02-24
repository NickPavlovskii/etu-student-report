import { ref, watch } from 'vue';
import type { ReportDto } from '@/types/reports';

const STORAGE_KEY = 'reports_storage';

const savedReports = localStorage.getItem(STORAGE_KEY);
export const reports = ref<ReportDto[]>(savedReports ? JSON.parse(savedReports) : []);

watch(
  reports,
  (val) => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(val));
  },
  { deep: true }
);

export function useReportsStorage() {
  const loadReports = () => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      reports.value = JSON.parse(saved);
    }
  };

  const addReport = (report: ReportDto) => {
    const index = reports.value.findIndex(
      (r) => r.studentId === report.studentId && r.topic === report.topic
    );
    if (index !== -1) {
      reports.value[index] = report;
    } else {
      reports.value.push(report);
    }
  };

  const getReport = (studentId: number, topic: string) => {
    return (
      reports.value.find(
        (r) => r.studentId === studentId && r.topic === topic
      ) ?? null
    );
  };

  const getReportsByStudent = (studentId: number) => {
    return reports.value.filter((r) => r.studentId === studentId);
  };

  const getByStudentId = (studentId: number) => {
    const studentReports = getReportsByStudent(studentId);
    return studentReports.length > 0 ? studentReports[0] : null;
  };

  return {
    reports,
    loadReports,
    addReport,
    getReport,
    getReportsByStudent,
    getByStudentId,
  };
}
