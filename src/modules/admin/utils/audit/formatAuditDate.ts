/**
 * Форматирует ISO-дату из журнала аудита в вид ДД.ММ.ГГГГ ЧЧ:ММ.
 */
export function formatAuditDate(iso: string): string {
  if (!iso) {
    return '—';
  }
  const d = new Date(iso);
  const day = String(d.getDate()).padStart(2, '0');
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const year = d.getFullYear();
  const h = String(d.getHours()).padStart(2, '0');
  const m = String(d.getMinutes()).padStart(2, '0');
  return `${day}.${month}.${year} ${h}:${m}`;
}
