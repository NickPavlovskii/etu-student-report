import type { ReportDto } from '../modal/reports';

export function getReportMoodleUrl(report: ReportDto | null | undefined): string {
  const url = String(report?.moodleUrl ?? '').trim();
  return url;
}

export function isMoodleReport(report: ReportDto | null | undefined): boolean {
  const storage = String(report?.storageType ?? '').trim().toLowerCase();
  const status = String(report?.status ?? '').trim().toLowerCase();
  if (storage === 'moodle') return true;
  if (status.includes('moodle') || status.includes('мудл')) return true;
  return getReportMoodleUrl(report).length > 0;
}
