import type { ReportDto } from '../modal/reports';

export const REPORT_CHECK_PASS_THRESHOLD = 90;

export function isReportCheckPassing(
  report: ReportDto | null | undefined
): boolean {
  return (Number(report?.check ?? 0) || 0) >= REPORT_CHECK_PASS_THRESHOLD;
}

export function reportCheckStateClass(
  report: ReportDto
): 'check-ok' | 'check-error' {
  return isReportCheckPassing(report) ? 'check-ok' : 'check-error';
}

export function reportCheckStatusIcon(report: ReportDto): string {
  return isReportCheckPassing(report) ? 'mdi-check-circle' : 'mdi-close-circle';
}
