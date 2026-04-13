export function useProgressFormat() {
  function progressPct(uploaded: number, plan: number): number {
    if (!plan || plan <= 0) return 0;
    return Math.min(100, Math.round((uploaded / plan) * 100));
  }

  /** CSS-класс цвета полосы: зелёный ≥80%, фиолетовый ≥45%, жёлтый <45% */
  function progressClass(uploaded: number, plan: number): string {
    const p = progressPct(uploaded, plan);
    if (p >= 80) return 'prog__fill--high';
    if (p >= 45) return 'prog__fill--mid';
    return 'prog__fill--low';
  }

  /** Подпись «42 / 100» или «— / 100» при отсутствии данных */
  function uploadedSlashExpected(
    uploaded: number | null | undefined,
    expected: number | null | undefined
  ): string {
    const e =
      typeof expected === 'number' && !Number.isNaN(expected) ? expected : NaN;
    if (!Number.isFinite(e) || e < 0) return '—';
    const u =
      typeof uploaded === 'number' && !Number.isNaN(uploaded) ? uploaded : null;
    if (u === null) return `— / ${e}`;
    return `${u} / ${e}`;
  }

  /** Безопасное приведение к числу: null/undefined/NaN → 0 */
  function num(v: number | undefined | null): number {
    return typeof v === 'number' && !Number.isNaN(v) ? v : 0;
  }

  return { progressPct, progressClass, uploadedSlashExpected, num };
}
