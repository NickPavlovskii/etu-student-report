import { loginByLastName } from '@/api/info';
import { bumpUserStorageTick } from '@/composables/userStorageTick';
import {
  unwrapAuthProfile,
  buildRoleFieldsFromProfile,
  copyProfileHeadFlagsInto,
} from '@/composables/authProfileMerge';
import { formatRoleDisplayLabels, parseRoleTokensFromField } from '@/composables/useUser';

/** Обновляет `role` / `roleDisplay` в сессии, если в админке поменяли роли у текущего пользователя. */
export function patchStoredUserRoleIfMatchesLastName(
  lastName: string,
  roleString: string
): void {
  try {
    const rawStored = localStorage.getItem('user');
    if (!rawStored) return;
    const stored = JSON.parse(rawStored) as Record<string, unknown>;
    if (String(stored.lastName ?? '').trim() !== String(lastName).trim()) {
      return;
    }
    const parts = parseRoleTokensFromField(roleString);
    if (!parts.length) return;
    stored.role = parts.join(',');
    stored.roleDisplay = formatRoleDisplayLabels(parts);
    localStorage.setItem('user', JSON.stringify(stored));
    bumpUserStorageTick();
  } catch {
    /* */
  }
}

/**
 * Подтягивает актуальные роли с `/auth/login` и обновляет `localStorage.user`.
 * Нужно после смены ролей в админке: иначе в сессии остаётся старая строка `role` / «только админ».
 */
export async function refreshStoredUserRolesFromAuth(): Promise<void> {
  try {
    const rawStored = localStorage.getItem('user');
    if (!rawStored) return;
    const existing = JSON.parse(rawStored) as Record<string, unknown>;
    const ln = String(existing.lastName ?? '').trim();
    if (!ln) return;

    const raw = await loginByLastName(ln);
    const profile = unwrapAuthProfile(raw);
    if (!profile) return;

    const { role, roleDisplay } = buildRoleFieldsFromProfile(profile);
    const next: Record<string, unknown> = { ...existing, role, roleDisplay };
    copyProfileHeadFlagsInto(next, profile);

    localStorage.setItem('user', JSON.stringify(next));
    bumpUserStorageTick();
  } catch {
    /* сеть / нет профиля — оставляем как есть */
  }
}
