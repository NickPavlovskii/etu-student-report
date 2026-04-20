import { computed } from 'vue';
import { userStorageTick } from './userStorageTick';

/** Проверка, что в роли есть ADMIN (role приходит как TEACHER | ADMIN или "TEACHER,ADMIN") */
function hasAdminRole(role: string | undefined): boolean {
  if (!role) return false;
  return role
    .toUpperCase()
    .split(',')
    .map((r) => r.trim())
    .includes('ADMIN');
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

  const role = computed(() => String(user.value?.role ?? 'TEACHER').trim().toUpperCase());
  const roleDisplay = computed(() =>
    String(user.value?.roleDisplay ?? (hasAdminRole(user.value?.role) ? 'Администратор' : 'Преподаватель')).trim()
  );

  const canSeeAll = computed(() => hasAdminRole(user.value?.role));

  const uploadedBy = computed(() =>
    user.value?.fioShort ?? user.value?.lastName ?? 'unknown'
  );

  return { user, lastName, fioKey, position, role, roleDisplay, canSeeAll, uploadedBy };
}
