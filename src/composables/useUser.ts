import { computed } from 'vue';
import { userStorageTick } from './userStorageTick';

/**
 * Нормализует поле роли из API: строка через `,` `;` `|`, через пробелы (`TEACHER ADMIN HEAD`),
 * либо массив кодов.
 */
export function parseRoleTokensFromField(role: unknown): string[] {
  if (role == null) return [];
  if (Array.isArray(role)) {
    const out: string[] = [];
    for (const x of role) {
      out.push(...parseRoleTokensFromField(x));
    }
    return [...new Set(out.map((s) => s.toUpperCase().trim()).filter(Boolean))];
  }
  const s = String(role).trim();
  if (!s) return [];
  const u = s.toUpperCase();
  const pieces = u
    .replace(/\s+/g, ',')
    .split(/[,;|]+/)
    .map((p) => p.trim())
    .filter(Boolean);
  return [...new Set(pieces)];
}

/** Поля профиля/пользователя: признак завкафедры без кода HEAD в строке `role`. */
export const PROFILE_DEPARTMENT_HEAD_FLAG_KEYS = [
  'isDepartmentHead',
  'isHeadOfDepartment',
  'departmentHead',
  'headOfDepartment',
  'isHead',
  'isHod',
  'is_hod',
  'hod',
] as const;

function truthyFlag(v: unknown): boolean {
  return v === true || v === 'true' || v === 1 || v === '1';
}

/** Бэкенд иногда отдаёт признак завкафедры отдельным boolean, без кода HEAD в строке `role`. */
export function profileRecordImpliesDepartmentHead(
  p: Record<string, unknown>
): boolean {
  for (const k of PROFILE_DEPARTMENT_HEAD_FLAG_KEYS) {
    if (truthyFlag(p[k])) return true;
  }
  return false;
}

function partsHaveHead(parts: string[]): boolean {
  return parts.some((x) => x === 'HEAD' || x === 'HEAD_DEPARTMENT');
}

/** Если в `role` нет кода завкафедры, но бэкенд прислал человекочитаемую подпись — не теряем доступ к кафедре. */
function roleDisplayIndicatesHead(display: string | undefined): boolean {
  if (!display) return false;
  const d = display.normalize('NFKC').trim().toLowerCase();
  if (d.includes('head_department')) return true;
  if (/\bhead\s+of\s+department\b/i.test(display)) return true;
  const headRuMarker =
    d.includes('завед') || d.includes('зав.') || d.includes('зав кафед');
  if (headRuMarker && d.includes('кафед')) return true;

  for (const rawPart of display.split(/[/|,]+/)) {
    const p = rawPart.normalize('NFKC').trim().toLowerCase();
    if (!p) continue;
    if (p === 'head' || p === 'head_department') return true;
    if (p.includes('head') && p.includes('depart')) return true;
    if ((p.includes('завед') || p.includes('зав.')) && p.includes('кафед')) return true;
  }
  return false;
}

/** Все коды ролей из `role` (строка через запятую) и опционально `roles[]` в объекте пользователя. */
export function userRoleTokens(user: unknown): string[] {
  if (!user || typeof user !== 'object') return [];
  const o = user as Record<string, unknown>;
  const parts = [...parseRoleTokensFromField(o.role ?? o.Role)];
  const ra = o.roles ?? o.Roles;
  if (Array.isArray(ra)) {
    for (const x of ra) {
      parts.push(...parseRoleTokensFromField(x));
    }
  }
  if (profileRecordImpliesDepartmentHead(o) && !partsHaveHead(parts)) {
    parts.push('HEAD');
  }
  return [...new Set(parts.map((t) => t.toUpperCase().trim()).filter(Boolean))];
}

function hasRole(parts: string[], target: string): boolean {
  if (!parts.length) return false;
  if (target === 'HEAD_DEPARTMENT') {
    return parts.includes('HEAD_DEPARTMENT') || parts.includes('HEAD');
  }
  return parts.includes(target);
}

/** Подпись ролей в UI: порядок как в админке — преподаватель, администратор, зав. кафедры. */
export function formatRoleDisplayLabels(parts: string[]): string {
  const u = parts.map((x) => x.toUpperCase().trim()).filter(Boolean);
  const hasHead = hasRole(u, 'HEAD_DEPARTMENT');
  const hasAdmin = u.includes('ADMIN');
  const hasTeacher = u.includes('TEACHER');
  const labels: string[] = [];
  if (hasTeacher) labels.push('Преподаватель');
  if (hasAdmin) labels.push('Администратор');
  if (hasHead) labels.push('Зав. кафедры');
  if (labels.length) return labels.join(' / ');
  return 'Преподаватель';
}

export function useUser() {
  const user = computed(() => {
    void userStorageTick.value;
    const raw = localStorage.getItem('user');
    return raw ? JSON.parse(raw) : null;
  });

  const lastName = computed(() =>
    String(user.value?.lastName ?? '').trim()
  );

  const fioKey = computed(() =>
    String(user.value?.fioShort ?? user.value?.lastName ?? '').trim()
  );

  const position = computed(() =>
    String(user.value?.position ?? '').trim().toLowerCase()
  );

  const roleParts = computed(() => userRoleTokens(user.value));
  const role = computed(() =>
    roleParts.value.length ? roleParts.value.join(',') : 'TEACHER'
  );
  const roleDisplay = computed(() => {
    const parts = roleParts.value;
    if (parts.length) return formatRoleDisplayLabels(parts);
    const api =
      user.value?.roleDisplay != null
        ? String(user.value.roleDisplay).trim()
        : '';
    return api || 'Преподаватель';
  });

  /** Кафедральная аналитика и архив «все» — только у зав. кафедры (не у админа без этой роли). */
  const canSeeAll = computed(() => {
    if (hasRole(roleParts.value, 'HEAD_DEPARTMENT')) return true;
    return roleDisplayIndicatesHead(
      user.value?.roleDisplay != null
        ? String(user.value.roleDisplay)
        : undefined
    );
  });

  const uploadedBy = computed(() =>
    user.value?.fioShort ?? user.value?.lastName ?? 'unknown'
  );

  return { user, lastName, fioKey, position, role, roleDisplay, canSeeAll, uploadedBy };
}
