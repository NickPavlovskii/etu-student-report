/** Подпись количества записей для чипов и тулбаров (1 запись / 2 записи / 5 записей) */
export function recordsCountLabel(n: number): string {
  const m = n % 100;
  const d = n % 10;
  if (m >= 11 && m <= 19) {
    return `${n} записей`;
  }
  if (d === 1) {
    return `${n} запись`;
  }
  if (d >= 2 && d <= 4) {
    return `${n} записи`;
  }
  return `${n} записей`;
}
