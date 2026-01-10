import { computed } from 'vue';
import type { User } from '@/types/user';

export function useAuth() {
  const user = computed<User | null>(() => {
    const raw = localStorage.getItem('user');
    return raw ? JSON.parse(raw) : null;
  });

  const isTeacher = computed(() => user.value?.role === 'teacher');
  const isHead = computed(() => user.value?.role === 'head');

  return {
    user,
    isTeacher,
    isHead,
  };
}
