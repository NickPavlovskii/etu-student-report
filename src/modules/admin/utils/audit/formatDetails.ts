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
    return formatted[0];
  }
  if (formatted.length === 2) {
    return `${formatted[0]} и ${formatted[1]}`;
  }
  return `${formatted.slice(0, -1).join(', ')} и ${formatted[formatted.length - 1]}`;
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
    if (m) {
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

function buildNarrativeFromMap(
  map: Record<string, string>,
  action?: string
): string {
  const keys = Object.keys(map);
  if (keys.length === 0) {
    return '';
  }

  const roleVal = map.role ?? map.roles ?? '';
  const email = map.email;

  if (keys.length === 1 && roleVal && isRoleKey(keys[0])) {
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
    const s = sentenceForField(key, map[key], action);
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
  if (!m) {
    return null;
  }
  const actionPart = m[1].trim();
  return ROLLBACK_ACTION_RU[actionPart] ?? `Отменено: ${actionPart}.`;
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

export function formatAuditDetails(
  raw: string | undefined | null,
  context?: AuditDetailsContext
): string {
  if (raw == null) {
    return '';
  }
  const s = String(raw).trim();
  if (!s) {
    return '';
  }

  const action = normalizeAuditAction(context?.action);

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
    const narrative = buildNarrativeFromMap(map, action);
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
      return sentenceForField(m[1], m[2].trim(), action);
    })
    .filter(Boolean)
    .join(' ');

  return fallback || s;
}
