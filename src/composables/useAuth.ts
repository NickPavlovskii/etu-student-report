import { computed } from 'vue';
import type { User } from '@/types/user';
import { userStorageTick } from './userStorageTick';

function hasAdminRole(role: string | undefined): boolean {
  if (!role) return false;
  return role.toUpperCase().split(',').map((r) => r.trim()).includes('ADMIN');
}

export function useAuth() {
  const user = computed<User | null>(() => {
    void userStorageTick.value;
    const raw = localStorage.getItem('user');
    if (raw) {
      try {
        return JSON.parse(raw) as User;
      } catch {
        return null;
      }
    }
    return null;
  });

  const isTeacher = computed(() => {
    const r = user.value?.role ?? '';
    return r.toUpperCase().split(',').map((x: string) => x.trim()).includes('TEACHER');
  });
  const isHead = computed(() => hasAdminRole(user.value?.role));
  const isAuth = computed(() => !!user.value);

  return {
    user,
    isAuth,
    isTeacher,
    isHead,
  };
}
