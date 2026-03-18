export function useDownload() {
  function downloadBlob(blob: Blob, filename = 'file') {
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
  }

  /**
   * Скачать или просмотреть аннотированный файл из base64.
   * PDF — открывает в новой вкладке, DOCX — скачивает.
   */
  function downloadAnnotatedFile(
    base64: string,
    fileName = 'document_замечания.docx'
  ) {
    if (!base64) return;
    const bytes = Uint8Array.from(atob(base64), (c) => c.charCodeAt(0));
    const isPdf = fileName.toLowerCase().endsWith('.pdf');
    const blob = new Blob([bytes], {
      type: isPdf
        ? 'application/pdf'
        : 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    });
    if (isPdf) {
      const url = URL.createObjectURL(blob);
      window.open(url, '_blank', 'noopener');
      setTimeout(() => URL.revokeObjectURL(url), 60000);
    } else {
      downloadBlob(blob, fileName);
    }
  }

  return { downloadBlob, downloadAnnotatedFile };
}
