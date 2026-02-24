import { computed } from 'vue';
import type { User } from '@/types/user';

export function useAuth() {
  const user = computed<User | null>(() => {
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

  const isTeacher = computed(() => user.value?.position === null);
  const isHead = computed(() => {
    const positions = new Set(['администратор', 'заведущий', 'заведующий', 'зам заведующего']);
    return positions.has(user.value?.position);
  });
  const isAuth = computed(() => !!user.value);

  return {
    user,
    isAuth,
    isTeacher,
    isHead,
  };
}
