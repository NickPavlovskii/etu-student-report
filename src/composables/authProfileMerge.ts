import {
  parseRoleTokensFromField,
  profileRecordImpliesDepartmentHead,
  formatRoleDisplayLabels,
  PROFILE_DEPARTMENT_HEAD_FLAG_KEYS,
} from '@/composables/useUser';

export function unwrapAuthProfile(raw: unknown): Record<string, unknown> | null {
  if (raw == null || typeof raw !== 'object' || Array.isArray(raw)) {
    return null;
  }
  let o = raw as Record<string, unknown>;
  if (
    'data' in o &&
    o.data != null &&
    typeof o.data === 'object' &&
    !Array.isArray(o.data)
  ) {
    o = o.data as Record<string, unknown>;
  }
  if (o.ok === false || o.success === false || o.found === false) {
    return null;
  }
  return o;
}

export function buildRoleFieldsFromProfile(profile: Record<string, unknown>): {
  role: string;
  roleDisplay: string;
} {
  const p = profile;
  const fromString = parseRoleTokensFromField(p.role ?? p.Role ?? 'TEACHER');
  const fromArray = [
    ...(Array.isArray(p.roles) ? (p.roles as unknown[]) : []),
    ...(Array.isArray(p.Roles) ? (p.Roles as unknown[]) : []),
  ].flatMap((x) => parseRoleTokensFromField(x));
  const roleParts = [...new Set([...fromString, ...fromArray])];
  if (profileRecordImpliesDepartmentHead(p)) {
    const hasHead =
      roleParts.includes('HEAD') || roleParts.includes('HEAD_DEPARTMENT');
    if (!hasHead) roleParts.push('HEAD');
  }
  const role = roleParts.length ? roleParts.join(',') : 'TEACHER';
  const roleDisplay =
    roleParts.length > 0
      ? formatRoleDisplayLabels(roleParts)
      : String(p.roleDisplay ?? '').trim() || 'Преподаватель';
  return { role, roleDisplay };
}

export function copyProfileHeadFlagsInto(
  target: Record<string, unknown>,
  profile: Record<string, unknown>
): void {
  for (const k of PROFILE_DEPARTMENT_HEAD_FLAG_KEYS) {
    if (k in profile) {
      target[k] = profile[k];
    }
  }
}
