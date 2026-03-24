import { USER_LIKE_TYPE_KEYS } from './formatConstants';

export function normalizeAuditAction(
  action?: string | null
): string | undefined {
  if (action == null || !String(action).trim()) {
    return undefined;
  }
  const a = String(action).trim();
  if (a === 'ROLLED_BACK' || a === 'AUDIT_ROLLED_BACK') {
    return 'ACTION_ROLLED_BACK';
  }
  return a;
}

export function normalizeTypeKey(type: string): string {
  return type.trim().toUpperCase().replace(/\s+/g, '_');
}

export function isUserLikeType(typeRaw: string): boolean {
  return USER_LIKE_TYPE_KEYS.has(normalizeTypeKey(typeRaw));
}
