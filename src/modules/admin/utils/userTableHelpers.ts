import type { TeacherDto } from '@/api/info';

export function displayName(t: TeacherDto): string {
  return (
    t.fio ||
    [t.lastName, t.firstName, t.patronymic].filter(Boolean).join(' ') ||
    t.lastName
  );
}

export function firstDiscs(t: TeacherDto, max: number): string[] {
  return (t.disciplines ?? []).slice(0, max);
}

const ROLE_ICO_MAP: Record<string, string> = {
  ADMIN: 'mdi-shield-account-outline',
  TEACHER: 'mdi-school-outline',
  HEAD: 'mdi-account-star-outline',
};

export function roleIco(v: string): string {
  return ROLE_ICO_MAP[v?.toUpperCase()] ?? 'mdi-account-outline';
}

const ROLE_NAME_MAP: Record<string, string> = {
  ADMIN: 'Админ',
  TEACHER: 'Преподаватель',
  HEAD: 'Завед',
};

export function roleName(v: string): string {
  return ROLE_NAME_MAP[v?.toUpperCase()] ?? v;
}

export function tdClass(key: string): string {
  const m: Record<string, string> = {
    fio: 'td--fio',
    position: 'td--pos',
    rank: 'td--pos',
    degree: 'td--pos',
    role: 'td--role',
    disciplines: 'td--disc',
  };
  return m[key] ?? '';
}

function splitPositionForRankDegree(v: string | undefined): string[] {
  const s = (v ?? '').toString().trim();
  if (!s) {
    return [];
  }
  return s
    .split(/\s*(?:\/|\||-|\u2014|—|\u2013|–|,|;)\s*/g)
    .map((x) => x.trim())
    .filter(Boolean);
}

export function teacherRank(t: TeacherDto): string {
  const rankAny =
    (t as Record<string, unknown>)?.rank ??
    (t as Record<string, unknown>)?.Rank;
  if (rankAny) {
    return String(rankAny);
  }
  const [rank] = splitPositionForRankDegree(
    (t as Record<string, unknown>)?.position as string | undefined
  );
  return rank ?? '';
}

export function teacherDegree(t: TeacherDto): string {
  const degreeAny =
    (t as Record<string, unknown>)?.degree ??
    (t as Record<string, unknown>)?.Degree;
  if (degreeAny) {
    return String(degreeAny);
  }
  const [, degree] = splitPositionForRankDegree(
    (t as Record<string, unknown>)?.position as string | undefined
  );
  return degree ?? '';
}
