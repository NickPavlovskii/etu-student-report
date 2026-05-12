import type { BatchValidationResult, ValidationResult } from '@/api/types';

export function normalizeBatchFileKey(name: string): string {
  const s = String(name ?? '').trim();
  const base = (s.split(/[/\\]/).pop() ?? s).trim();
  return base.toLowerCase();
}

/**
 * Проставляет `row.validation` по ответу validateBatch: сначала по имени файла, иначе по порядку.
 */
export function applyBatchValidationToRowsMutable<
  T extends { file: File | null; validation?: ValidationResult | null }
>(res: BatchValidationResult, fileRows: T[]): void {
  const items = res.results ?? [];
  const byKey = new Map<string, ValidationResult>();
  for (const x of items) {
    const k = normalizeBatchFileKey(x.filename);
    if (k) byKey.set(k, x.result);
  }
  fileRows.forEach((r, i) => {
    const k = normalizeBatchFileKey(r.file?.name ?? '');
    let val = k ? byKey.get(k) : undefined;
    if (!val && items[i]?.result) {
      val = items[i].result;
    }
    r.validation = val ?? null;
  });
}
