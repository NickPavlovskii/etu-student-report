import { computed } from 'vue';
import type { User } from '@/types/user';
import { userStorageTick } from './userStorageTick';
import { userRoleTokens } from '@/composables/useUser';

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
  const isHead = computed(() => {
    const parts = userRoleTokens(user.value);
    return parts.includes('HEAD') || parts.includes('HEAD_DEPARTMENT');
  });
  const isAuth = computed(() => !!user.value);

  return {
    user,
    isAuth,
    isTeacher,
    isHead,
  };
}
