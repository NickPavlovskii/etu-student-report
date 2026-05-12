import type { DisciplineControlRow, StudentInGroupRow } from '../modal/uploadWorkModal';

export type AutofillContext = {
  groups: string[];
  controls: DisciplineControlRow[];
  studentsByGroup: Record<string, StudentInGroupRow[]>;
  academicYearWhitelist: Set<string>;
};

export type FilenameParseResult = {
  group: string | null;
  studentId: number | null;
  workType: string | null;
  topic: string | null;
  academicYear: string | null;
  workTitle: string;
};

function normalizeFilenameUnderscores(s: string): string {
  return String(s ?? '')
    .normalize('NFKC')
    .replace(/[\uFF3F\uFE4F\u203F\u2017﹍]/g, '_');
}

function normalizeAcademicYearToken(t: string): string {
  return String(t ?? '')
    .replace(/[/／]/g, '-')
    .replace(/[\u2212\u2013\u2014\u2010\u2011]/g, '-');
}

export function extractFullStemTitle(fileName: string): string {
  let base = String(fileName ?? '').replace(/\.[^.]+$/i, '').trim();
  base = normalizeFilenameUnderscores(base);
  return base;
}

export function controlTextsForGroup(controls: DisciplineControlRow[], group: string): string[] {
  const g = String(group ?? '').trim();
  const list: string[] = [];
  const seen = new Set<string>();
  for (const c of controls ?? []) {
    const controlGroup = String(c?.groupName ?? '').trim();
    const controlText = String(c?.controlText ?? '').trim();
    if (controlText && (g === '' || controlGroup === g)) {
      if (!seen.has(controlText)) {
        seen.add(controlText);
        list.push(controlText);
      }
    }
  }
  return list.sort();
}

function normalizeTopics(t: unknown): string[] {
  if (Array.isArray(t)) return t.map((x) => String(x).trim()).filter(Boolean);
  if (typeof t === 'string') {
    try {
      const parsed = JSON.parse(t);
      if (Array.isArray(parsed)) return parsed.map((x) => String(x).trim()).filter(Boolean);
    } catch {
      /* empty */
    }
    return t.split(',').map((x) => x.trim()).filter(Boolean);
  }
  return [];
}

export function topicsForGroupAndWorkTypePure(
  controls: DisciplineControlRow[],
  group: string,
  controlType: string,
  fallbackTopics: string[]
): string[] {
  const ct = String(controlType ?? '').trim();
  if (!ct) return fallbackTopics ?? [];
  const groupName = String(group ?? '').trim();
  const set = new Set<string>();
  for (const c of controls ?? []) {
    const controlGroup = String(c?.groupName ?? '').trim();
    const controlText = String(c?.controlText ?? '').trim();
    if (controlText !== ct) continue;
    if (groupName && controlGroup && controlGroup !== groupName) continue;
    normalizeTopics(c?.topics).forEach((t) => set.add(t));
  }
  const arr = [...set].filter(Boolean).sort((a, b) => a.localeCompare(b));
  return arr.length ? arr : fallbackTopics ?? [];
}

function getStudentIdRaw(s: StudentInGroupRow): number {
  const v = s.studentId ?? s.lkId ?? s.lk_id ?? s['ID ИОТ'];
  const n = Number(v);
  return Number.isFinite(n) ? n : 0;
}

function matchStudentTokenInList(list: StudentInGroupRow[] | undefined, n: number): number | null {
  if (!list?.length) return null;
  for (const s of list) {
    const sid = getStudentIdRaw(s);
    if (sid === n) return sid;
    const book = s.recordBook ?? s.record_book ?? s.gradebook ?? s.Зачетка;
    if (book == null || book === '') continue;
    const digits = String(book).replace(/\D/g, '');
    if (digits && Number(digits) === n) return sid;
  }
  return null;
}

function resolveStudentIdFromFileToken(
  raw: string,
  preferredGroup: string | undefined,
  studentsByGroup: Record<string, StudentInGroupRow[]>
): number | null {
  const num = Number(raw);
  if (!Number.isFinite(num) || num <= 0) return null;
  const pg = String(preferredGroup ?? '').trim();
  if (pg) {
    const inPreferred = matchStudentTokenInList(studentsByGroup[pg], num);
    if (inPreferred != null) return inPreferred;
  }
  for (const [g, list] of Object.entries(studentsByGroup)) {
    if (g === pg) continue;
    const hit = matchStudentTokenInList(list, num);
    if (hit != null) return hit;
  }
  return null;
}

function resolveGroupFromToken(token: string, groupList: string[]): string | null {
  const t = String(token ?? '').trim();
  if (!t) return null;
  const gs = groupList ?? [];
  const exact = gs.find((g) => String(g).trim() === t);
  if (exact != null) return String(exact);
  const tl = t.toLowerCase();
  const sub = gs.find((g) => {
    const s = String(g).trim().toLowerCase();
    return s.includes(tl) || tl.includes(s);
  });
  if (sub != null) return String(sub);
  if (/^\d{3,6}$/.test(t)) {
    const byCode = gs.find((g) => {
      const s = String(g).trim();
      if (s.includes(t)) return true;
      const digits = s.replace(/\D/g, '');
      return digits.endsWith(t) || digits === t || t.endsWith(digits);
    });
    if (byCode != null) return String(byCode);
  }
  return null;
}

function resolveGroupFromStudentRecordId(
  studentId: number,
  studentsByGroup: Record<string, StudentInGroupRow[]>
): string | null {
  if (!Number.isFinite(studentId) || studentId <= 0) return null;
  for (const g of Object.keys(studentsByGroup)) {
    const list = studentsByGroup[g] ?? [];
    for (const s of list) {
      if (getStudentIdRaw(s) === studentId) return g;
    }
  }
  return null;
}

function normalizeForMatch(s: string): string {
  return String(s ?? '')
    .toLowerCase()
    .trim()
    .replace(/_/g, ' ')
    .replace(/\.+/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

function bestMatchOption(input: string, options: string[]): string | null {
  const q = normalizeForMatch(input);
  if (!q) return null;
  const exact = options.find((o) => normalizeForMatch(o) === q);
  if (exact) return exact;
  let bestPrefix: string | null = null;
  let bestLen = -1;
  for (const o of options) {
    const n = normalizeForMatch(o);
    if (!n) continue;
    if (q.startsWith(n) && n.length > bestLen) {
      bestPrefix = o;
      bestLen = n.length;
    }
    if (n.startsWith(q) && q.length > bestLen) {
      bestPrefix = o;
      bestLen = q.length;
    }
  }
  if (bestPrefix) return bestPrefix;
  const contains = options.find((o) => {
    const n = normalizeForMatch(o);
    return n.includes(q) || q.includes(n);
  });
  return contains ?? null;
}

function tokenPrefixMatchesOption(candNorm: string, optNorm: string): boolean {
  if (!candNorm || !optNorm) return false;
  if (candNorm === optNorm) return true;
  if (!optNorm.startsWith(candNorm)) return false;
  const rest = optNorm.slice(candNorm.length);
  return rest.length === 0 || /^[\s.]/.test(rest);
}

function findLongestPrefixMatch(parts: string[], options: string[]): { hit: string; k: number } | null {
  if (!parts.length || !options.length) return null;
  for (let k = parts.length; k >= 1; k--) {
    for (const sep of [' ', '_'] as const) {
      const cand = parts.slice(0, k).join(sep);
      const cn = normalizeForMatch(cand);
      if (!cn) continue;
      for (const o of options) {
        const on = normalizeForMatch(o);
        if (!on) continue;
        if (tokenPrefixMatchesOption(cn, on)) {
          return { hit: o, k };
        }
      }
    }
  }
  return null;
}

function distinctControlTextsAll(controls: DisciplineControlRow[]): string[] {
  const seen = new Set<string>();
  const list: string[] = [];
  for (const c of controls ?? []) {
    const controlText = String(c?.controlText ?? '').trim();
    if (controlText && !seen.has(controlText)) {
      seen.add(controlText);
      list.push(controlText);
    }
  }
  return list.sort((a, b) => a.localeCompare(b));
}

function controlTextsForWorkTypeMatch(controls: DisciplineControlRow[], group: string): string[] {
  const fromOptions = controlTextsForGroup(controls, group);
  return fromOptions.length ? fromOptions : distinctControlTextsAll(controls);
}

function matchWorkTypeFromMiddle(
  middleParts: string[],
  controlOpts: string[]
): { hit: string; consumedTokens: number } | null {
  if (!middleParts.length || !controlOpts.length) return null;
  const prefixHit = findLongestPrefixMatch(middleParts, controlOpts);
  if (prefixHit) {
    return { hit: prefixHit.hit, consumedTokens: prefixHit.k };
  }
  const joined = middleParts.join(' ');
  const whole = bestMatchOption(joined, controlOpts);
  if (whole && normalizeForMatch(joined) === normalizeForMatch(whole)) {
    return { hit: whole, consumedTokens: middleParts.length };
  }
  for (let start = 0; start < middleParts.length; start++) {
    const slice = middleParts.slice(start);
    const hit = findLongestPrefixMatch(slice, controlOpts);
    if (hit) {
      return { hit: hit.hit, consumedTokens: start + hit.k };
    }
  }
  return null;
}

/**
 * Разбор имени файла для массовой загрузки (чистая функция, без Vue/nextTick).
 */
export function parseFilename(fileName: string, ctx: AutofillContext): FilenameParseResult {
  const stem = extractFullStemTitle(fileName);
  const empty: FilenameParseResult = {
    group: null,
    studentId: null,
    workType: null,
    topic: null,
    academicYear: null,
    workTitle: stem,
  };

  let base = stem;
  if (!base) return empty;

  let parts = base.split('_').map((p) => p.trim()).filter(Boolean);
  if (!parts.length) return empty;

  let academicYear: string | null = null;
  const lastRaw = parts[parts.length - 1];
  const lastNorm = normalizeAcademicYearToken(lastRaw);
  if (
    lastRaw &&
    (/^\d{4}-\d{4}$/.test(lastNorm) || /^\d{4}\/\d{4}$/.test(String(lastRaw).replace(/[/／]/g, '/')))
  ) {
    const norm = lastNorm;
    if (ctx.academicYearWhitelist.has(norm)) {
      academicYear = norm;
    }
    parts = parts.slice(0, -1);
  }
  if (!parts.length) {
    return { ...empty, academicYear };
  }

  const second = parts[1] ?? '';
  const secondIsStudentId = /^\d{5,9}$/.test(second);

  const gFromToken = resolveGroupFromToken(parts[0] ?? '', ctx.groups);
  let gFromStudent: string | null = null;
  if (!gFromToken && secondIsStudentId) {
    const tentativeId = Number(second);
    if (Number.isFinite(tentativeId) && tentativeId > 0) {
      gFromStudent = resolveGroupFromStudentRecordId(tentativeId, ctx.studentsByGroup);
    }
  }
  const preferredGroup = gFromToken ?? gFromStudent ?? undefined;

  let studentId: number | null = null;
  if (secondIsStudentId) {
    const sid = resolveStudentIdFromFileToken(second, preferredGroup, ctx.studentsByGroup);
    const resolved = sid ?? Number(second);
    studentId = Number.isFinite(resolved) ? resolved : null;
  }

  const groupResolved = gFromToken ?? gFromStudent ?? null;

  const middleStart = secondIsStudentId ? 2 : 1;
  const middleParts = parts.slice(middleStart);
  if (!middleParts.length) {
    return {
      group: groupResolved,
      studentId,
      workType: null,
      topic: null,
      academicYear,
      workTitle: stem,
    };
  }

  const groupForControls = String(groupResolved ?? '').trim();
  const controlOpts = controlTextsForWorkTypeMatch(ctx.controls, groupForControls);
  const wtHit = matchWorkTypeFromMiddle(middleParts, controlOpts);

  let workType: string | null = null;
  let topic: string | null = null;

  if (!wtHit) {
    const topicsLoose = topicsForGroupAndWorkTypePure(ctx.controls, groupForControls, '', []);
    if (middleParts.length && topicsLoose.length) {
      const topicHit = findLongestPrefixMatch(middleParts, topicsLoose);
      if (topicHit) {
        topic = topicHit.hit;
      } else {
        const jm = middleParts.join(' ');
        for (const t of topicsLoose) {
          if (normalizeForMatch(jm) === normalizeForMatch(t)) {
            topic = t;
            break;
          }
        }
      }
    }
    return {
      group: groupResolved,
      studentId,
      workType,
      topic,
      academicYear,
      workTitle: stem,
    };
  }

  workType = wtHit.hit;
  let typeK = wtHit.consumedTokens;
  const remainderParts = middleParts.slice(typeK);
  const topics = topicsForGroupAndWorkTypePure(
    ctx.controls,
    groupForControls,
    String(workType ?? '').trim(),
    []
  );

  if (remainderParts.length && topics.length) {
    const topicHit = findLongestPrefixMatch(remainderParts, topics);
    if (topicHit) {
      topic = topicHit.hit;
    } else {
      const joinedRem = remainderParts.join(' ');
      for (const t of topics) {
        if (normalizeForMatch(joinedRem) === normalizeForMatch(t)) {
          topic = t;
          break;
        }
      }
    }
  }

  return {
    group: groupResolved,
    studentId,
    workType,
    topic,
    academicYear,
    workTitle: stem,
  };
}
