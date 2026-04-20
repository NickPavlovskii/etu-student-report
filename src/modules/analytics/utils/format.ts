/**
 * Обрезает строку до `max` символов, добавляя «…» в конце.
 * Используется для подписей на графиках и чипов.
 */
export function clip(s: string, max = 22): string {
  const t = (s ?? '').trim();
  if (t.length <= max) return t;
  return `${t.slice(0, max - 1)}…`;
}

/**
 * Инициалы из полного имени: «Иванов Пётр» → «ИП».
 * Используется для аватарок преподавателей.
 */
export function initials(name: string): string {
  if (!name) return '—';
  const parts = name.trim().split(/\s+/);
  if (parts.length >= 2 && parts[0] && parts[1]) {
    const c0 = parts[0][0];
    const c1 = parts[1][0];
    if (c0 && c1) return (c0 + c1).toUpperCase();
  }
  return name.slice(0, 2).toUpperCase() || '—';
}

const AVATAR_COLORS = ['#6366f1', '#8b5cf6', '#ec4899', '#0ea5e9'] as const;

/**
 * Детерминированный цвет аватарки по имени.
 * Один и тот же человек всегда получает один цвет.
 */
export function avatarColor(name: string): string {
  let h = 0;
  for (let i = 0; i < (name ?? '').length; i++) {
    h += (name ?? '').charCodeAt(i);
  }
  return (
    AVATAR_COLORS[Math.abs(h) % AVATAR_COLORS.length] ?? AVATAR_COLORS[0]
  );
}

/**
 * Разбивает строку с группами по разделителям «,» и «;».
 */
export function splitGroups(raw: unknown): string[] {
  if (raw == null) return [];
  if (Array.isArray(raw)) {
    return raw.flatMap((item) => splitGroups(item));
  }
  const s = String(raw).trim();
  if (!s) return [];
  return s.split(/[,;]/).map((x) => x.trim()).filter(Boolean);
}

/**
 * Нормализует поле groups из API: может быть строкой, массивом,
 * JSON-строкой вида "[1234, 5678]" или числом.
 */
export function formatGroupsForDisplay(raw: unknown): string[] {
  if (raw == null) return [];
  if (Array.isArray(raw)) {
    return raw.flatMap((item) => formatGroupsForDisplay(item));
  }
  if (typeof raw === 'number') return [String(raw)];
  const s = String(raw).trim();
  if (!s) return [];
  if (s.startsWith('[')) {
    try {
      const parsed = JSON.parse(s) as unknown;
      if (Array.isArray(parsed)) {
        return parsed
          .map((x) => (x == null ? '' : String(x).trim()))
          .filter(Boolean);
      }
    } catch {
      /* как обычная строка */
    }
  }
  return splitGroups(s);
}

/**
 * «1234» → «1234» (4 цифры — без изменений).
 * «12» → «0012» (дополнение до 4 цифр нулями).
 */
export function normalizeGroupDigits(raw: string): string {
  const t = raw.trim();
  if (!/^\d+$/.test(t)) return t;
  return t.padStart(4, '0');
}

/**
 * Красивая подпись для группы: число → «Гр. 1234»,
 * текст → как есть.
 */
export function planRowGroupChipLabel(g: string): string {
  const t = g.trim();
  if (!/^\d+$/.test(t)) return t;
  return `Гр. ${normalizeGroupDigits(t)}`;
}
