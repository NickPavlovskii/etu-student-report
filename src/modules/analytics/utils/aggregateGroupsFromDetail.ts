import type { DisciplineWithTeacherRowDto } from '@/api/info';
import type { VBarItem } from '../model';
import { clip, formatGroupsForDisplay, normalizeGroupDigits } from './format';

export function aggregateGroupsFromDetail(
  rows: DisciplineWithTeacherRowDto[]
): VBarItem[] {
  const map = new Map<string, { plan: number; uploaded: number }>();
  for (const row of rows) {
    const gList = formatGroupsForDisplay(row.groups);
    if (gList.length === 0) continue;
    const p = row.expectedCount / gList.length;
    const u = row.uploadedCount / gList.length;
    for (const g of gList) {
      const key = /^\d+$/.test(g.trim()) ? normalizeGroupDigits(g) : g.trim();
      const cur = map.get(key) ?? { plan: 0, uploaded: 0 };
      cur.plan += p;
      cur.uploaded += u;
      map.set(key, cur);
    }
  }
  return [...map.entries()]
    .map(([raw, v]) => {
      const plan = Math.round(v.plan);
      const uploaded = Math.round(v.uploaded);
      const label = /^\d+$/.test(raw)
        ? `Гр. ${normalizeGroupDigits(raw)}`
        : raw;
      return {
        label,
        shortLabel: clip(label, 8),
        plan,
        uploaded,
      };
    })
    .sort((a, b) => b.plan - a.plan);
}
