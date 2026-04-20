import { ref, shallowRef } from 'vue';
import {
  getAdminTeachers,
  updateAdminTeacher,
  getTeacherDisciplines,
  type TeacherDto,
} from '@/api/info';
import { useUser } from '@/composables/useUser';
import { initials as getInitials } from '@/utils/initials';
import { ROLE_ITEMS } from '../constants';

export const roleItems = ROLE_ITEMS;

const AVATAR_CLASSES = [
  'avatar-blue',
  'avatar-purple',
  'avatar-green',
] as const;

function djb2(str: string): number {
  let h = 5381;
  for (let i = 0; i < str.length; i++) {
    h = ((h << 5) + h + str.charCodeAt(i)) | 0;
  }
  return Math.abs(h);
}

function buildRoleUpdateBody(normalized: string[]): {
  role?: string;
  roles?: string[];
} {
  const hasAdmin = normalized.includes('ADMIN');
  const hasTeacher = normalized.includes('TEACHER');
  if (hasAdmin && hasTeacher) {
    return { roles: ['Преподаватель', 'Администратор'] };
  }
  if (hasAdmin) {
    return { role: 'ADMIN' };
  }
  if (hasTeacher) {
    return { role: 'TEACHER' };
  }
  return { role: 'TEACHER' };
}

function roleFieldFromNormalized(normalized: string[]): string {
  const hasAdmin = normalized.includes('ADMIN');
  const hasTeacher = normalized.includes('TEACHER');
  if (hasAdmin && hasTeacher) {
    return 'ADMIN,TEACHER';
  }
  if (hasAdmin) {
    return 'ADMIN';
  }
  return 'TEACHER';
}

export function useAdminUsers() {
  const { user } = useUser();
  const teachers = shallowRef<TeacherDto[]>([]);
  const usersSearch = ref('');
  const usersLoading = ref(false);

  let debounceTimer: ReturnType<typeof setTimeout> | null = null;
  let abort: AbortController | null = null;

  function initials(str: string): string {
    return getInitials(str);
  }

  function avatarColorClass(t: TeacherDto): string {
    const seed = `${t.lastName ?? ''}|${t.firstName ?? ''}|${t.email ?? ''}`;
    const cls =
      AVATAR_CLASSES[djb2(seed) % AVATAR_CLASSES.length] ?? AVATAR_CLASSES[0];
    return cls;
  }

  function teacherRoles(t: TeacherDto): string[] {
    const raw = (t.role ?? '').trim().toUpperCase();
    if (!raw) {
      return [];
    }
    const parts = raw
      .split(',')
      .map((s) => s.trim().toUpperCase())
      .filter(Boolean);
    if (parts.includes('ADMIN')) {
      return ['TEACHER', 'ADMIN'];
    }
    if (parts.includes('TEACHER')) {
      return ['TEACHER'];
    }
    return parts;
  }

  async function loadTeachers() {
    abort?.abort();
    abort = new AbortController();
    const signal = abort.signal;

    usersLoading.value = true;
    try {
      const base = await getAdminTeachers(usersSearch.value || undefined);

      const BATCH = 6;
      const enriched: TeacherDto[] = [];

      for (let i = 0; i < base.length; i += BATCH) {
        if (signal.aborted) {
          return;
        }
        const chunk = base.slice(i, i + BATCH);
        const results = await Promise.allSettled(
          chunk.map(async (t) => {
            const ds = await getTeacherDisciplines(t.lastName);
            return { ...t, disciplines: Array.isArray(ds) ? ds : [] };
          })
        );
        for (let j = 0; j < results.length; j++) {
          const r = results[j];
          const teacher = chunk[j];
          if (!r || !teacher) {
            continue;
          }
          enriched.push(
            r.status === 'fulfilled'
              ? r.value
              : { ...teacher, disciplines: [] }
          );
        }
      }

      if (!signal.aborted) {
        teachers.value = enriched;
      }
    } catch {
      if (!signal.aborted) {
        teachers.value = [];
      }
    } finally {
      usersLoading.value = false;
    }
  }

  function debouncedLoadTeachers() {
    if (debounceTimer) {
      clearTimeout(debounceTimer);
    }
    debounceTimer = setTimeout(loadTeachers, 300);
  }

  async function onRolesChange(t: TeacherDto, incoming: string[]) {
    const normalized = (Array.isArray(incoming) ? incoming : [])
      .map((v) => String(v).toUpperCase().trim())
      .filter(Boolean);

    if ([...teacherRoles(t)].sort().join() === [...normalized].sort().join()) {
      return;
    }

    const body = buildRoleUpdateBody(normalized);

    try {
      const updated = await updateAdminTeacher(
        t.lastName,
        body,
        user.value?.lastName
      );
      const newRole =
        (updated.role && String(updated.role).trim()) ||
        roleFieldFromNormalized(normalized);
      const ln = String(t.lastName).trim();
      teachers.value = teachers.value.map((x) =>
        String(x.lastName).trim() === ln ? { ...x, role: newRole } : x
      );
    } catch (e) {
      console.error('[useAdminUsers] role update failed', e);
    }
  }

  function onChipClose(t: TeacherDto, roleToRemove: string) {
    const remaining = teacherRoles(t).filter((r) => r !== roleToRemove);
    onRolesChange(t, remaining.length ? remaining : ['TEACHER']);
  }

  return {
    teachers,
    usersSearch,
    usersLoading,
    roleItems,
    loadTeachers,
    debouncedLoadTeachers,
    initials,
    avatarColorClass,
    teacherRoles,
    onRolesChange,
    onChipClose,
  };
}
