import type { DisciplineWithTeacherRowDto } from '@/api/info';
import type { VBarItem } from '../model';
import { clip, formatGroupsForDisplay, normalizeGroupDigits } from './format';

export function aggregateGroupsFromDetail(
  rows: DisciplineWithTeacherRowDto[]
): VBarItem[] {
  const map = new Map<string, { plan: number; uploaded: number; moodle: number }>();
  for (const row of rows) {
    const gList = formatGroupsForDisplay(row.groups);
    if (gList.length === 0) continue;
    const p = row.expectedCount / gList.length;
    const u = row.uploadedCount / gList.length;
    const m = Number(row.moodleLinksCount || 0) / gList.length;
    for (const g of gList) {
      const key = /^\d+$/.test(g.trim()) ? normalizeGroupDigits(g) : g.trim();
      const cur = map.get(key) ?? { plan: 0, uploaded: 0, moodle: 0 };
      cur.plan += p;
      cur.uploaded += u;
      cur.moodle += m;
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
        moodle: Math.round(v.moodle),
      };
    })
    .sort((a, b) => b.plan - a.plan);
}
