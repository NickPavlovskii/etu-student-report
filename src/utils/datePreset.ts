/**
 * Календарная дата в локальном часовом поясе браузера (YYYY-MM-DD).
 * Не использовать toISOString() для «сегодня» — там UTC, из‑за сдвига дня
 * фильтр «За сегодня» не совпадает с датой событий на бэкенде.
 */
function toYmdLocal(d: Date): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

/**
 * Преобразует пресет периода в диапазон дат { dateFrom, dateTo } (YYYY-MM-DD).
 */
export function datePresetToRange(preset: string): { dateFrom?: string; dateTo?: string } {
  const now = new Date();
  const to = toYmdLocal(now);
  if (preset === 'today') {
    return { dateFrom: to, dateTo: to };
  }
  if (preset === 'week') {
    const d = new Date(now);
    d.setDate(d.getDate() - 7);
    return { dateFrom: toYmdLocal(d), dateTo: to };
  }
  if (preset === 'month') {
    const d = new Date(now);
    d.setMonth(d.getMonth() - 1);
    return { dateFrom: toYmdLocal(d), dateTo: to };
  }
  return {};
}
