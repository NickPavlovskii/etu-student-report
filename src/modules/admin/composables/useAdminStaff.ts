import { ref } from 'vue';
import { getAdminTeachers, updateAdminTeacher, type TeacherDto } from '@/api/admin';
import { useUser } from '@/composables/useUser';
import { initials as getInitials } from '@/utils/initials';
import { ROLE_ITEMS } from '../constants';

export const roleItems = ROLE_ITEMS;

export function useAdminStaff() {
  const { user } = useUser();
  const teachers = ref<TeacherDto[]>([]);
  const staffSearch = ref('');
  const staffLoading = ref(false);
  let staffDebounce: ReturnType<typeof setTimeout> | null = null;

  function initials(str: string): string {
    return getInitials(str);
  }

  function avatarColorClass(t: TeacherDto): string {
    const n = (t.lastName || '').length + (t.fio || '').length;
    const i = n % 3;
    return ['avatar-blue', 'avatar-purple', 'avatar-green'][i];
  }

  function teacherRoles(t: TeacherDto): string[] {
    const r = (t.role ?? '').trim().toUpperCase();
    if (!r) return [];
    const parts = r.split(',').map((s) => s.trim().toUpperCase()).filter(Boolean);
    if (parts.includes('ADMIN')) return ['TEACHER', 'ADMIN'];
    if (parts.includes('TEACHER')) return ['TEACHER'];
    return parts;
  }

  async function loadTeachers() {
    staffLoading.value = true;
    try {
      teachers.value = await getAdminTeachers(staffSearch.value || undefined);
    } catch {
      teachers.value = [];
    } finally {
      staffLoading.value = false;
    }
  }

  function debouncedLoadTeachers() {
    if (staffDebounce) clearTimeout(staffDebounce);
    staffDebounce = setTimeout(loadTeachers, 300);
  }

  async function onRolesChange(t: TeacherDto, newRoles: string[]) {
    const arr = Array.isArray(newRoles) ? newRoles : [];
    const normalized = arr.map((x) => String(x).toUpperCase().trim());
    const hasAdmin = normalized.includes('ADMIN');
    const hasTeacher = normalized.includes('TEACHER');

    const sameAsCurrent =
      JSON.stringify([...teacherRoles(t)].sort()) === JSON.stringify([...normalized].sort());
    if (sameAsCurrent) return;

    let body: { role?: string; roles?: string[] };
    if (hasAdmin && hasTeacher) {
      body = { roles: ['Преподаватель', 'Администратор'] };
    } else if (hasAdmin) {
      body = { role: 'ADMIN' };
    } else {
      body = { role: 'TEACHER' };
    }

    try {
      const updated = await updateAdminTeacher(t.lastName, body, user.value?.lastName);
      t.role = updated.role ?? (hasAdmin ? 'ADMIN' : 'TEACHER');
    } catch (e) {
      console.error(e);
    }
  }

  function onChipClose(t: TeacherDto, roleToRemove: string) {
    const current = teacherRoles(t).filter((r) => r !== roleToRemove);
    onRolesChange(t, current);
  }

  return {
    teachers,
    staffSearch,
    staffLoading,
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
