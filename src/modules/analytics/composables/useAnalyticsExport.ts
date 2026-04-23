import * as XLSX from 'xlsx';
import { useDownload } from '@/composables/useDownload';

function columnWidthsFromMatrix(matrix: (string | number)[][]): { wch: number }[] {
  if (!matrix.length) return [];
  const colCount = matrix[0]?.length ?? 0;
  const widths: { wch: number }[] = [];
  for (let c = 0; c < colCount; c += 1) {
    const len = Math.max(
      ...matrix.map((row) => String(row[c] ?? '').length),
      8
    );
    widths.push({ wch: Math.min(len + 2, 60) });
  }
  return widths;
}

export function useAnalyticsExport() {
  const { downloadBlob } = useDownload();

  function exportToExcel(
    headers: string[],
    rows: (string | number)[][],
    filename: string,
    sheetName = 'Данные'
  ) {
    const safeSheet = sheetName.replace(/[[\]:*?/\\]/g, ' ').slice(0, 31) || 'Данные';
    const matrix: (string | number)[][] = [headers, ...rows];
    const ws = XLSX.utils.aoa_to_sheet(matrix);
    ws['!cols'] = columnWidthsFromMatrix(matrix);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, safeSheet);
    const wbout = XLSX.write(wb, { bookType: 'xlsx', type: 'array' });
    const blob = new Blob([wbout], {
      type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    });
    const safeName = filename.endsWith('.xlsx') ? filename : `${filename}.xlsx`;
    downloadBlob(blob, safeName);
  }

  async function exportChartToPng(
    element: HTMLElement | null | undefined,
    filename: string
  ) {
    if (!element) return;
    const { default: html2canvas } = await import('html2canvas');
    const canvas = await html2canvas(element, {
      scale: 2,
      backgroundColor: '#ffffff',
      useCORS: true,
      logging: false,
    });
    await new Promise<void>((resolve, reject) => {
      canvas.toBlob(
        (blob) => {
          if (blob) {
            const name = filename.endsWith('.png') ? filename : `${filename}.png`;
            downloadBlob(blob, name);
            resolve();
          } else {
            reject(new Error('Не удалось сформировать PNG'));
          }
        },
        'image/png'
      );
    });
  }

  return { exportToExcel, exportChartToPng };
}
