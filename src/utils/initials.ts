/**
 * Возвращает инициалы из строки (ФИО): первые буквы первых двух слов или первые 2 символа.
 */
export function initials(str: string): string {
  const s = (str || '').trim();
  if (!s) return '—';
  const parts = s.split(/\s+/).filter(Boolean);
  if (parts.length >= 2) {
    const a = parts[0]?.[0];
    const b = parts[1]?.[0];
    if (a && b) {
      return (a + b).toUpperCase();
    }
  }
  return s.slice(0, 2).toUpperCase();
}
