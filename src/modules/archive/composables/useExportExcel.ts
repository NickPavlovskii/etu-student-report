import * as XLSX from 'xlsx';
import type { ArchiveReportRow } from '@/types/reports';
import { useDownload } from '@/composables/useDownload';
import { formatArchiveDate } from '../utils';

export function useExportExcel() {
  const { downloadBlob } = useDownload();

  function exportToExcel(
    rows: ArchiveReportRow[],
    includeTeacher: boolean,
    filename = 'архив_учебных_работ.xlsx'
  ) {
    const headers = includeTeacher
      ? ['Преподаватель', 'Студент', 'Группа', 'Дисциплина', 'Тип работы', 'Тема', 'Дата загрузки']
      : ['Студент', 'Группа', 'Дисциплина', 'Тип работы', 'Тема', 'Дата загрузки'];

    const data = rows.map((r) => {
      const row = includeTeacher
        ? [
            r.uploadedBy ?? '—',
            r.studentName ?? '—',
            r.groupName ?? '—',
            r.disciplineName ?? '—',
            r.workControl ?? '—',
            r.topic ?? '—',
            formatArchiveDate(r.uploadDate),
          ]
        : [
            r.studentName ?? '—',
            r.groupName ?? '—',
            r.disciplineName ?? '—',
            r.workControl ?? '—',
            r.topic ?? '—',
            formatArchiveDate(r.uploadDate),
          ];
      return row;
    });

    const wsData = [headers, ...data];
    const ws = XLSX.utils.aoa_to_sheet(wsData);

    const colWidths = wsData[0]?.map((_, i) => ({
      wch: Math.min(Math.max(...wsData.map((row) => String(row[i] ?? '').length), 10), 50),
    })) ?? [];
    ws['!cols'] = colWidths;

    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Архив');

    const wbout = XLSX.write(wb, { bookType: 'xlsx', type: 'array' });
    const blob = new Blob([wbout], {
      type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    });
    downloadBlob(blob, filename);
  }

  return { exportToExcel };
}
