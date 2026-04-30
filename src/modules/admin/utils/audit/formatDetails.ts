import {
  ACTION_INTRO,
  FIELD_LABELS,
  PAIR_RE,
  ROLE_LABELS,
  ROLLBACK_ACTION_RU,
} from './formatConstants';
import { normalizeAuditAction } from './normalize';
import type { AuditDetailsContext } from './model';

export type { AuditDetailsContext } from './model';

const DIGITS_ONLY = /^\d+$/;

function splitSegments(raw: string): string[] {
  const s = raw.trim();
  if (!s) {
    return [];
  }
  return s
    .split(/,\s*(?=[a-zA-Z_][\w]*\s*:)/)
    .map((x) => x.trim())
    .filter(Boolean);
}

function formatRolesPhrase(roleTokenString: string, capitalize = false): string {
  const parts = roleTokenString.split(/[\s,]+/).filter(Boolean);
  if (parts.length === 0) {
    return '';
  }
  const names = parts.map((p) => ROLE_LABELS[p.toUpperCase()] ?? p);
  const formatted = capitalize
    ? names
    : names.map((n) => n.charAt(0).toLowerCase() + n.slice(1));
  if (formatted.length === 1) {
    return formatted[0] ?? '';
  }
  if (formatted.length === 2) {
    return `${formatted[0] ?? ''} и ${formatted[1] ?? ''}`;
  }
  return `${formatted.slice(0, -1).join(', ')} и ${formatted[formatted.length - 1] ?? ''}`;
}

function labelField(key: string): string {
  return FIELD_LABELS[key.trim().toLowerCase()] ?? key;
}

function isRoleKey(key: string): boolean {
  const k = key.toLowerCase();
  return k === 'role' || k === 'roles';
}

function tryParseJsonObject(raw: string): Record<string, unknown> | null {
  const t = raw.trim();
  if (!t.startsWith('{')) {
    return null;
  }
  try {
    const o = JSON.parse(t) as unknown;
    if (o !== null && typeof o === 'object' && !Array.isArray(o)) {
      return o as Record<string, unknown>;
    }
  } catch {
    /* ignore */
  }
  return null;
}

function parseToStringMap(raw: string): Record<string, string> {
  const json = tryParseJsonObject(raw);
  if (json) {
    const out: Record<string, string> = {};
    for (const [k, v] of Object.entries(json)) {
      if (v === null || v === undefined) {
        continue;
      }
      if (typeof v === 'object') {
        out[k] = Array.isArray(v)
          ? (v as unknown[]).map((x) => String(x)).join(' ')
          : JSON.stringify(v);
      } else {
        out[k] = String(v);
      }
    }
    return out;
  }

  const segments = splitSegments(raw);
  const out: Record<string, string> = {};
  const list = segments.length > 0 ? segments : [raw];
  for (const seg of list) {
    const m = seg.match(PAIR_RE);
    if (m?.[1] != null && m[2] != null) {
      out[m[1]] = m[2].trim();
    }
  }
  return out;
}

function quoteIfNeeded(value: string): string {
  const v = value.trim();
  if (v.length <= 40 && !/[\n\r]/.test(v)) {
    return `«${v}»`;
  }
  return v;
}

function sentenceForField(key: string, value: string, action?: string): string {
  const k = key.toLowerCase();
  const label = labelField(key);

  if (isRoleKey(key)) {
    const phrase = formatRolesPhrase(value, true);
    if (!phrase) {
      return '';
    }
    if (action === 'ROLE_CHANGED') {
      return `Назначена роль «${phrase}».`;
    }
    return `Роли: ${phrase}.`;
  }

  if (k === 'email') {
    return `Указан адрес электронной почты: ${value}.`;
  }

  if (k.includes('topic') || k === 'topic') {
    return `Тема работы — ${quoteIfNeeded(value)}.`;
  }

  if (k.includes('discipline')) {
    return `Дисциплина — ${quoteIfNeeded(value)}.`;
  }

  if (k.includes('group')) {
    return `Группа — ${quoteIfNeeded(value)}.`;
  }

  if (k.includes('template')) {
    return `Шаблон — ${quoteIfNeeded(value)}.`;
  }

  if (k.includes('plan') && k.includes('row')) {
    return `Строка учебного плана — ${value}.`;
  }

  if (k.includes('report')) {
    return DIGITS_ONLY.test(value.trim()) ? '' : `Отчёт — ${value}.`;
  }

  if (k.includes('student')) {
    return DIGITS_ONLY.test(value.trim()) ? '' : `Студент — ${value}.`;
  }

  if (k === 'file' || k === 'filename' || k === 'file_name') {
    return `- «${value.trim()}».`;
  }

  if (k === 'status') {
    return `Статус — ${value}.`;
  }

  return `${label} — ${value}.`;
}

function pickFirstNonEmpty(
  map: Record<string, string>,
  keys: string[]
): string {
  for (const k of keys) {
    const v = (map[k] ?? '').trim();
    if (v) {
      return v;
    }
  }
  return '';
}

function teacherFioFromMapByPrefix(
  map: Record<string, string>,
  prefix: string
): string {
  const ln = pickFirstNonEmpty(map, [
    `${prefix}LastName`,
    `${prefix}_last_name`,
    `${prefix}TeacherLastName`,
    `${prefix}_teacher_last_name`,
  ]);
  const fn = pickFirstNonEmpty(map, [
    `${prefix}FirstName`,
    `${prefix}_first_name`,
    `${prefix}TeacherFirstName`,
    `${prefix}_teacher_first_name`,
  ]);
  const pt = pickFirstNonEmpty(map, [
    `${prefix}Patronymic`,
    `${prefix}_patronymic`,
    `${prefix}TeacherPatronymic`,
    `${prefix}_teacher_patronymic`,
  ]);
  const full = [ln, fn, pt].filter(Boolean).join(' ').trim();
  if (full) {
    return full;
  }
  return pickFirstNonEmpty(map, [
    `${prefix}TeacherFio`,
    `${prefix}_teacher_fio`,
    `${prefix}Fio`,
    `${prefix}_fio`,
    `${prefix}Teacher`,
    `${prefix}_teacher`,
  ]);
}

function formatDisciplineHead(discipline: string, planRowId: string): string {
  const d = discipline.trim();
  const id = planRowId.trim();
  if (d && id) {
    return `По дисциплине ${quoteIfNeeded(d)}, учебного плана № ${id}, `;
  }
  if (d) {
    return `По дисциплине ${quoteIfNeeded(d)}, `;
  }
  if (id) {
    return `По строке учебного плана № ${id}, `;
  }
  return '';
}

function buildNarrativeFromMap(
  map: Record<string, string>,
  action?: string,
  context?: AuditDetailsContext
): string {
  if (action === 'DISCIPLINE_TEACHER_SET') {
    const disciplineFromMap = pickFirstNonEmpty(map, [
      'disciplineName',
      'discipline_name',
      'discipline',
    ]);
    const planRowIdFromMap = pickFirstNonEmpty(map, ['planRowId', 'plan_row_id']);
    const fromEntityLabel = String(context?.entityLabel ?? '')
      .replace(/\s*—\s*«.*$/, '')
      .trim();
    const discipline =
      disciplineFromMap &&
      !/строка\s+рабочей\s+программы/i.test(disciplineFromMap)
        ? disciplineFromMap
        : '';
    const planRowId = planRowIdFromMap || String(context?.entityId ?? '').trim();
    const fromTeacher =
      teacherFioFromMapByPrefix(map, 'previous') ||
      teacherFioFromMapByPrefix(map, 'before') ||
      teacherFioFromMapByPrefix(map, 'old') ||
      teacherFioFromMapByPrefix(map, 'from');
    const toTeacher =
      teacherFioFromMapByPrefix(map, 'actual') ||
      teacherFioFromMapByPrefix(map, 'after') ||
      teacherFioFromMapByPrefix(map, 'new') ||
      teacherFioFromMapByPrefix(map, 'to');
    const head = formatDisciplineHead(discipline || fromEntityLabel, planRowId);

    if (fromTeacher && toTeacher) {
      return `${head}фактический преподаватель изменён с ${quoteIfNeeded(fromTeacher)} на ${quoteIfNeeded(toTeacher)}.`.trim();
    }
    if (toTeacher) {
      return `${head}назначен фактический преподаватель ${quoteIfNeeded(toTeacher)}.`.trim();
    }
    if (fromTeacher) {
      return `${head}изменение фактического преподавателя: ${quoteIfNeeded(fromTeacher)} -> (не указано).`.trim();
    }
    if (head) {
      return `${head}изменён фактический преподаватель.`.trim();
    }
    return 'Изменение фактического преподавателя.';
  }
  if (action === 'DISCIPLINE_TEACHER_RESET') {
    const disciplineFromMap = pickFirstNonEmpty(map, [
      'disciplineName',
      'discipline_name',
      'discipline',
    ]);
    const planRowIdFromMap = pickFirstNonEmpty(map, ['planRowId', 'plan_row_id']);
    const fromEntityLabel = String(context?.entityLabel ?? '')
      .replace(/\s*—\s*«.*$/, '')
      .trim();
    const discipline =
      disciplineFromMap &&
      !/строка\s+рабочей\s+программы/i.test(disciplineFromMap)
        ? disciplineFromMap
        : '';
    const planRowId = planRowIdFromMap || String(context?.entityId ?? '').trim();
    const fromTeacher =
      teacherFioFromMapByPrefix(map, 'actual') ||
      teacherFioFromMapByPrefix(map, 'before') ||
      teacherFioFromMapByPrefix(map, 'old') ||
      teacherFioFromMapByPrefix(map, 'from');
    const toTeacher =
      teacherFioFromMapByPrefix(map, 'plan') ||
      teacherFioFromMapByPrefix(map, 'after') ||
      teacherFioFromMapByPrefix(map, 'new') ||
      teacherFioFromMapByPrefix(map, 'to');
    const head = formatDisciplineHead(discipline || fromEntityLabel, planRowId);

    if (fromTeacher && toTeacher) {
      return `${head}Переопределение преподавателя снято: с ${quoteIfNeeded(fromTeacher)} на ${quoteIfNeeded(toTeacher)} согласно рабочей программе.`.trim();
    }
    if (head) {
      return `${head}Переопределение преподавателя снято; применяется преподаватель согласно рабочей программе.`.trim();
    }
    return 'Сброшено переопределение преподавателя; отображается нагрузка по плану.';
  }

  const keys = Object.keys(map);
  if (keys.length === 0) {
    return '';
  }

  const roleVal = map.role ?? map.roles ?? '';
  const email = map.email;

  if (keys.length === 1 && roleVal && keys[0] != null && isRoleKey(keys[0])) {
    const phrase = formatRolesPhrase(roleVal, true);
    if (action === 'ROLE_CHANGED') {
      return `Роль изменена на «${phrase}».`;
    }
    return `Роль в системе: ${phrase}.`;
  }

  const sentences: string[] = [];

  if (email) {
    sentences.push(`Указан адрес электронной почты: ${email}.`);
  }

  if (roleVal) {
    const phrase = formatRolesPhrase(roleVal, true);
    if (action === 'ROLE_CHANGED') {
      sentences.push(`Назначена роль «${phrase}».`);
    } else {
      sentences.push(`Роль: ${phrase}.`);
    }
  }

  for (const key of keys) {
    const lk = key.toLowerCase();
    if (lk === 'email' || lk === 'role' || lk === 'roles') {
      continue;
    }
    const s = sentenceForField(key, map[key] ?? '', action);
    if (s) {
      sentences.push(s);
    }
  }

  let text = sentences.join(' ').replace(/\s+/g, ' ').trim();
  const intro = action ? ACTION_INTRO[action] : '';
  if (intro && text) {
    text = `${intro} ${text}`;
  } else if (intro && !text) {
    text = intro;
  }

  return text;
}

function formatRolledBackText(s: string): string | null {
  const m = s.match(/^Отменено:\s*(.+?)(?:\s*\((.+)\))?$/i);
  if (!m?.[1]) {
    return null;
  }
  const actionPart = m[1].trim();
  return ROLLBACK_ACTION_RU[actionPart] ?? `Отменено: ${actionPart}.`;
}

function rephraseLegacyDisciplineTeacherText(
  raw: string,
  action?: string
): string | null {
  if (
    action !== 'DISCIPLINE_TEACHER_SET' &&
    action !== 'DISCIPLINE_TEACHER_RESET'
  ) {
    return null;
  }

  const s = raw.trim();
  if (!s) return null;

  const disciplineMatch = s.match(/Дисциплина:\s*([^.(]+?)(?:\s*\(|\.)/i);
  const planMatch = s.match(/planRowId\s*=\s*(\d+)/i);
  const fromToMatch = s.match(/["«]([^"»]+)["»]\s*(?:->|→)\s*["«]([^"»]+)["»]/);
  const toOnlyMatch = s.match(/(?:преподаватель[^:]*:)\s*["«]?([^"».]+)["»]?/i);

  const discipline = disciplineMatch?.[1]?.trim() ?? '';
  const planRowId = planMatch?.[1]?.trim() ?? '';
  const head = formatDisciplineHead(discipline, planRowId);

  if (fromToMatch?.[1] && fromToMatch?.[2]) {
    const from = fromToMatch[1].trim();
    const to = fromToMatch[2].trim();
    if (action === 'DISCIPLINE_TEACHER_RESET') {
      return `${head}переопределение преподавателя снято: с ${quoteIfNeeded(from)} на ${quoteIfNeeded(to)} согласно рабочей программе.`.trim();
    }
    return `${head}фактический преподаватель изменён с ${quoteIfNeeded(from)} на ${quoteIfNeeded(to)}.`.trim();
  }

  if (toOnlyMatch?.[1]) {
    const to = toOnlyMatch[1].trim();
    if (action === 'DISCIPLINE_TEACHER_RESET') {
      return `${head}переопределение преподавателя снято; применяется преподаватель согласно рабочей программе (${quoteIfNeeded(to)}).`.trim();
    }
    return `${head}назначен фактический преподаватель ${quoteIfNeeded(to)}.`.trim();
  }

  return null;
}

function tryFormatJsonArray(raw: string): string | null {
  const t = raw.trim();
  if (!t.startsWith('[')) {
    return null;
  }
  try {
    const parsed = JSON.parse(t) as unknown;
    if (!Array.isArray(parsed)) {
      return null;
    }
    return parsed
      .map((x) => {
        if (x === null || x === undefined) {
          return '';
        }
        if (typeof x === 'object') {
          return buildNarrativeFromMap(
            Object.fromEntries(
              Object.entries(x as Record<string, unknown>).map(([k, v]) => [
                k,
                String(v ?? ''),
              ])
            ),
            undefined
          );
        }
        return String(x);
      })
      .filter(Boolean)
      .join(' ');
  } catch {
    return null;
  }
}

/** `key=value, key2=value2` из бэкенда → формат с двоеточием для разбора */
function normalizeDetailEqualsSyntax(input: string): string {
  const t = input.trim();
  if (!t || !t.includes('=')) {
    return t;
  }
  if (/[a-zA-Z_][\w]*\s*:/.test(t)) {
    return t;
  }
  return t
    .split(',')
    .map((part) => {
      const p = part.trim();
      const m = p.match(/^([a-zA-Z_][\w]*)\s*=\s*(.+)$/);
      return m?.[1] && m?.[2] ? `${m[1]}: ${m[2].trim()}` : p;
    })
    .join(', ');
}

export function formatAuditDetails(
  raw: string | undefined | null,
  context?: AuditDetailsContext
): string {
  if (raw == null) {
    return '';
  }
  const s = normalizeDetailEqualsSyntax(String(raw).trim());
  if (!s) {
    return '';
  }

  const action = normalizeAuditAction(context?.action);

  const legacy = rephraseLegacyDisciplineTeacherText(s, action);
  if (legacy) {
    return legacy;
  }

  const rolledBack = formatRolledBackText(s);
  if (rolledBack) {
    return rolledBack;
  }

  const arrFmt = tryFormatJsonArray(s);
  if (arrFmt) {
    return arrFmt;
  }

  const map = parseToStringMap(s);
  if (Object.keys(map).length > 0) {
    const narrative = buildNarrativeFromMap(map, action, context);
    if (narrative) {
      return narrative;
    }
  }

  if (!PAIR_RE.test(s) && !s.startsWith('{')) {
    return s;
  }

  const fallback = splitSegments(s)
    .map((seg) => {
      const m = seg.match(PAIR_RE);
      if (!m) {
        return seg;
      }
      return m[1] != null && m[2] != null
        ? sentenceForField(m[1], m[2].trim(), action)
        : seg;
    })
    .filter(Boolean)
    .join(' ');

  return fallback || s;
}
