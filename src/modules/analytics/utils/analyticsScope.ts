import type {
  BySemesterRow,
  DisciplineWithTeacherRowDto,
  DisciplinesTableItem,
  TeachersSummaryItem,
  StudyPeriod,
} from '@/api/info';
import type {
  AnalyticsDisciplineTableRow,
  TeacherPlanCardNormalized,
} from '../model';

export function parsePlanSemester(semester: unknown): number | null {
  if (semester == null || semester === '') return null;
  const n =
    typeof semester === 'number'
      ? semester
      : parseInt(String(semester).trim(), 10);
  if (!Number.isFinite(n) || n < 1) return null;
  return n;
}

export function matchesStudyPeriod(
  semesterNum: number | null,
  period: StudyPeriod
): boolean {
  if (period === 'academic_year') return true;
  if (semesterNum == null) return false;
  const odd = semesterNum % 2 === 1;
  if (period === 'autumn_semester') return odd;
  return !odd;
}

export function filterByStudyPeriod<T extends { semester?: unknown }>(
  rows: T[],
  period: StudyPeriod
): T[] {
  if (period === 'academic_year') return rows;
  return rows.filter((r) =>
    matchesStudyPeriod(parsePlanSemester(r.semester), period)
  );
}

export function teacherCardsResponseToArray(res: unknown): unknown[] {
  if (Array.isArray(res)) return res;
  if (res && typeof res === 'object') {
    const o = res as Record<string, unknown>;
    for (const k of ['data', 'items', 'cards'] as const) {
      const v = o[k];
      if (Array.isArray(v)) return v;
    }
    const d = o.data;
    if (d && typeof d === 'object' && !Array.isArray(d)) {
      const inner = d as Record<string, unknown>;
      for (const k of ['items', 'cards'] as const) {
        const v = inner[k];
        if (Array.isArray(v)) return v;
      }
    }
  }
  return [];
}

export function normalizeTeacherDisciplineCard(
  raw: unknown
): TeacherPlanCardNormalized | null {
  if (!raw || typeof raw !== 'object') return null;
  const o = raw as Record<string, unknown>;
  const disciplineName = String(
    o.disciplineName ?? o.discipline_name ?? ''
  ).trim();
  if (!disciplineName) return null;
  const course =
    o.course != null && o.course !== '' ? String(o.course) : null;
  const semester =
    o.semester != null && o.semester !== '' ? String(o.semester) : null;
  const groupsCount =
    Number(o.groupsCount ?? o.groups_count ?? 0) || 0;
  return { disciplineName, course, semester, groupsCount };
}

function dedupeTeacherCards(
  cards: TeacherPlanCardNormalized[]
): TeacherPlanCardNormalized[] {
  const m = new Map<string, TeacherPlanCardNormalized>();
  for (const c of cards) {
    const key = `${c.disciplineName.trim()}|${c.course ?? ''}|${c.semester ?? ''}`;
    const prev = m.get(key);
    if (!prev || c.groupsCount > prev.groupsCount) m.set(key, c);
  }
  return [...m.values()];
}

function splitInt(total: number, parts: number, index: number): number {
  if (parts <= 0 || !Number.isFinite(total)) return 0;
  const t = Math.max(0, Math.floor(total));
  const base = Math.floor(t / parts);
  const rem = t - base * parts;
  return base + (index < rem ? 1 : 0);
}

function mergeDisciplinesStatsByName(
  rows: DisciplinesTableItem[]
): Map<string, { e: number; u: number; s: number }> {
  const m = new Map<string, { e: number; u: number; s: number }>();
  for (const r of rows) {
    const n = r.disciplineName.trim();
    const cur = m.get(n) ?? { e: 0, u: 0, s: 0 };
    cur.e += Number(r.expectedCount) || 0;
    cur.u += Number(r.uploadedCount) || 0;
    cur.s += Number(r.studentsCount) || 0;
    m.set(n, cur);
  }
  return m;
}

export function buildPersonalDisciplinesTableFromCards(
  rawCards: unknown[],
  period: StudyPeriod,
  disciplinesTable: DisciplinesTableItem[],
  bySemesterFallback: BySemesterRow[]
): DisciplinesTableItem[] {
  const normalized = rawCards
    .map((x) => normalizeTeacherDisciplineCard(x))
    .filter((x): x is TeacherPlanCardNormalized => x != null);
  const deduped = dedupeTeacherCards(normalized);
  const filtered = filterByStudyPeriod(deduped, period);
  if (filtered.length === 0) {
    return disciplinesTableFromBySemester(bySemesterFallback);
  }

  const statsByName = mergeDisciplinesStatsByName(disciplinesTable);
  const byName = new Map<string, TeacherPlanCardNormalized[]>();
  for (const c of filtered) {
    const n = c.disciplineName.trim();
    if (!byName.has(n)) byName.set(n, []);
    byName.get(n)!.push(c);
  }

  const sorted = [...filtered].sort((a, b) => {
    const d = a.disciplineName.localeCompare(b.disciplineName, 'ru');
    if (d !== 0) return d;
    return String(a.course).localeCompare(String(b.course), 'ru');
  });

  const result: DisciplinesTableItem[] = [];
  for (const c of sorted) {
    const n = c.disciplineName.trim();
    const siblings = byName.get(n) ?? [c];
    const k = siblings.length;
    const idx = Math.max(0, siblings.findIndex((x) => x === c));
    const st = statsByName.get(n);
    const totE = st?.e ?? 0;
    const totU = st?.u ?? 0;
    const totS = st?.s ?? 0;
    const disambig =
      k > 1 || (c.course != null && c.semester != null);
    const label = disambig
      ? `${n} · курс ${c.course ?? '—'}, сем. ${c.semester ?? '—'}`
      : n;
    result.push({
      disciplineName: label,
      groupsCount: c.groupsCount,
      studentsCount: splitInt(totS, k, idx),
      expectedCount: splitInt(totE, k, idx),
      uploadedCount: splitInt(totU, k, idx),
    });
  }
  return result;
}

export function disciplinesTableFromBySemester(
  rows: BySemesterRow[]
): DisciplinesTableItem[] {
  return [...rows]
    .map((r) => ({
      disciplineName: `Курс ${r.course ?? '—'}, семестр ${r.semester ?? '—'}`,
      groupsCount: Number(r.groupsCount) || 0,
      studentsCount: Number(r.studentsCount) || 0,
      expectedCount: Number(r.expectedCount) || 0,
      uploadedCount:
        Number(r.uploadedCount ?? r.totalWorks) || 0,
    }))
    .sort((a, b) => b.expectedCount - a.expectedCount);
}

export function planRowsToDisciplineWidgetRows(
  rows: DisciplineWithTeacherRowDto[]
): AnalyticsDisciplineTableRow[] {
  return rows
    .filter((r) => {
      const t = r.teacherFio?.trim() || r.teacherLastName?.trim() || '';
      return Boolean(t);
    })
    .map((r) => ({
      planRowId: r.planRowId,
      disciplineName: r.disciplineName?.trim() || '—',
      teacherFio: r.teacherFio?.trim() || r.teacherLastName?.trim() || '',
      teacherLastName: r.teacherLastName,
      course: r.course,
      semester: r.semester,
      groups: r.groups,
      groupsCount: Number(r.groupsCount) || 0,
      studentsCount: Number(r.studentsCount) || 0,
      expectedCount: Number(r.expectedCount) || 0,
      uploadedCount: Number(r.uploadedCount) || 0,
    }))
    .sort((a, b) => {
      const d = a.disciplineName.localeCompare(b.disciplineName, 'ru');
      if (d !== 0) return d;
      return a.teacherFio.localeCompare(b.teacherFio, 'ru');
    });
}

export function disciplineTableItemsToWidgetRows(
  items: DisciplinesTableItem[]
): AnalyticsDisciplineTableRow[] {
  return items.map((r, i) => ({
    planRowId: -(i + 1),
    disciplineName: r.disciplineName,
    teacherFio: '—',
    groups: undefined,
    groupsCount: r.groupsCount,
    studentsCount: r.studentsCount,
    expectedCount: r.expectedCount,
    uploadedCount: r.uploadedCount,
  }));
}

export function aggregateDisciplinesTableFromPlan(
  rows: DisciplineWithTeacherRowDto[]
): DisciplinesTableItem[] {
  const map = new Map<
    string,
    {
      expectedCount: number;
      uploadedCount: number;
      groupsCount: number;
      studentsCount: number;
    }
  >();
  for (const row of rows) {
    const name = row.disciplineName?.trim() || '—';
    const cur = map.get(name) ?? {
      expectedCount: 0,
      uploadedCount: 0,
      groupsCount: 0,
      studentsCount: 0,
    };
    cur.expectedCount += Number(row.expectedCount) || 0;
    cur.uploadedCount += Number(row.uploadedCount) || 0;
    cur.groupsCount += Number(row.groupsCount) || 0;
    cur.studentsCount += Number(row.studentsCount) || 0;
    map.set(name, cur);
  }
  return [...map.entries()]
    .map(([disciplineName, v]) => ({
      disciplineName,
      ...v,
    }))
    .sort((a, b) => b.expectedCount - a.expectedCount);
}

export function aggregateTeachersSummaryFromPlan(
  rows: DisciplineWithTeacherRowDto[]
): TeachersSummaryItem[] {
  const map = new Map<
    string,
    {
      expectedCount: number;
      uploadedCount: number;
      disciplines: Set<string>;
    }
  >();
  for (const row of rows) {
    const t =
      row.teacherFio?.trim() || row.teacherLastName?.trim() || '';
    if (!t) continue;
    const cur = map.get(t) ?? {
      expectedCount: 0,
      uploadedCount: 0,
      disciplines: new Set<string>(),
    };
    cur.expectedCount += Number(row.expectedCount) || 0;
    cur.uploadedCount += Number(row.uploadedCount) || 0;
    cur.disciplines.add(row.disciplineName?.trim() || '');
    map.set(t, cur);
  }
  return [...map.entries()]
    .map(([teacherFio, v]) => ({
      teacherFio,
      teacherLastName: teacherFio,
      expectedCount: v.expectedCount,
      uploadedCount: v.uploadedCount,
      totalWorks: v.uploadedCount,
      disciplinesCount: v.disciplines.size,
    }))
    .sort((a, b) => b.expectedCount - a.expectedCount);
}
