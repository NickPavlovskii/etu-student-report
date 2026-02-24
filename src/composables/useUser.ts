import { computed } from 'vue';

const ADMIN_POSITIONS = new Set([
  'администратор',
  'заведущий',
  'заведующий',
  'зам заведующего',
]);

export function useUser() {
  const user = computed(() => {
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

  const canSeeAll = computed(() => ADMIN_POSITIONS.has(position.value));

  const uploadedBy = computed(() =>
    user.value?.fioShort ?? user.value?.lastName ?? 'unknown'
  );

  return { user, lastName, fioKey, position, canSeeAll, uploadedBy };
}
