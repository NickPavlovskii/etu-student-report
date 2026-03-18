/**
 * Очищает название (убирает кавычки, пробелы) или возвращает прочерк.
 */
export function sanitizeTitle(v: unknown): string {
  return (
    String(v ?? '')
      .replace(/"/g, '')
      .trim() || '—'
  );
}
