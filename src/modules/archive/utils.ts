export function formatArchiveDate(s: string | null): string {
  if (s) {
    if (/^\d{2}\.\d{2}\.\d{4}$/.test(s)) {
      return s;
    }
    if (/^\d{4}-\d{2}-\d{2}/.test(s)) {
      return `${s.slice(8, 10)}.${s.slice(5, 7)}.${s.slice(0, 4)}`;
    }
    return s;
  }
  return '—';
}
