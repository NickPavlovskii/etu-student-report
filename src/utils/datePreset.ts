/**
 * Преобразует пресет периода в диапазон дат { dateFrom, dateTo } (YYYY-MM-DD).
 */
export function datePresetToRange(preset: string): { dateFrom?: string; dateTo?: string } {
  const now = new Date();
  const to = now.toISOString().slice(0, 10);
  if (preset === 'today') {
    return { dateFrom: to, dateTo: to };
  }
  if (preset === 'week') {
    const d = new Date(now);
    d.setDate(d.getDate() - 7);
    return { dateFrom: d.toISOString().slice(0, 10), dateTo: to };
  }
  if (preset === 'month') {
    const d = new Date(now);
    d.setMonth(d.getMonth() - 1);
    return { dateFrom: d.toISOString().slice(0, 10), dateTo: to };
  }
  return {};
}
