import { ENTITY_TYPE_LABELS } from './formatConstants';
import {
  isUserLikeType,
  normalizeAuditAction,
  normalizeTypeKey,
} from './normalize';
import type { AuditEntityInput } from './model';

export type { AuditEntityInput } from './model';

const CYRILLIC_RE = /[а-яёА-ЯЁ]/;

function formatIdFragment(id: string): string {
  const t = id.trim();
  if (!t) {
    return '';
  }
  if (/^\d+$/.test(t)) {
    return `№ ${t}`;
  }
  if (t.length > 36) {
    return `идентификатор ${t.slice(0, 10)}…`;
  }
  return `«${t}»`;
}

function entityIdMatchesActor(
  entityId: string,
  actor: string,
  actorFio?: string
): boolean {
  const e = entityId.trim().toLowerCase();
  const a = actor.trim().toLowerCase();
  if (!e || !a) {
    return false;
  }
  if (e === a) {
    return true;
  }
  if (actorFio) {
    const first = actorFio.trim().split(/\s+/)[0]?.toLowerCase();
    if (first && e === first) {
      return true;
    }
  }
  return false;
}

function labelForType(typeRaw: string): string {
  if (!typeRaw.trim()) {
    return '';
  }
  const key = normalizeTypeKey(typeRaw);
  if (ENTITY_TYPE_LABELS[key]) {
    return ENTITY_TYPE_LABELS[key];
  }
  if (ENTITY_TYPE_LABELS[typeRaw]) {
    return ENTITY_TYPE_LABELS[typeRaw];
  }
  if (CYRILLIC_RE.test(typeRaw)) {
    return typeRaw.trim();
  }
  return typeRaw
    .replace(/_/g, ' ')
    .toLowerCase()
    .replace(/^\w/, (c) => c.toUpperCase());
}

function fallbackLabelFromAction(
  action: string | undefined,
  id: string,
  actor?: string,
  actorFio?: string,
  entityFioResolved?: string
): string {
  const idPart = formatIdFragment(id);
  switch (action) {
    case 'REPORT_UPLOADED':
    case 'WORK_CHECKED':
      return 'Работа студента';
    case 'TEMPLATE_CREATED':
    case 'TEMPLATE_UPDATED':
    case 'TEMPLATE_DELETED':
      return 'Шаблон документа';
    case 'ROLE_CHANGED':
      if (entityFioResolved) {
        return `Учётная запись — ${entityFioResolved}`;
      }
      if (actor && actorFio && entityIdMatchesActor(id, actor, actorFio)) {
        return `Учётная запись — ${actorFio}`;
      }
      return idPart
        ? `Учётная запись (${idPart})`
        : 'Учётная запись пользователя';
    case 'ACTION_ROLLED_BACK':
      return 'Запись в журнале';
    default:
      return idPart ? `Запись в системе (${idPart})` : 'Запись в системе';
  }
}

export function formatAuditEntityLabel(entry: AuditEntityInput): string {
  const typeRaw =
    entry.entityType != null ? String(entry.entityType).trim() : '';
  const idRaw = entry.entityId != null ? String(entry.entityId).trim() : '';
  const action = normalizeAuditAction(entry.action);
  const actor = entry.actor != null ? String(entry.actor).trim() : '';
  const actorFio =
    entry.actorFio != null ? String(entry.actorFio).trim() : '';
  const entityFioResolved =
    entry.entityFioResolved != null
      ? String(entry.entityFioResolved).trim()
      : '';

  if (!typeRaw && !idRaw) {
    return '';
  }

  const typeLabel = typeRaw ? labelForType(typeRaw) : '';

  if (typeLabel && idRaw) {
    if (entityFioResolved && isUserLikeType(typeRaw)) {
      const prefix = action === 'ROLE_CHANGED' ? 'Учётная запись' : typeLabel;
      return `${prefix} — ${entityFioResolved}`;
    }
    if (
      actorFio &&
      actor &&
      isUserLikeType(typeRaw) &&
      entityIdMatchesActor(idRaw, actor, actorFio)
    ) {
      const prefix = action === 'ROLE_CHANGED' ? 'Учётная запись' : typeLabel;
      return `${prefix} — ${actorFio}`;
    }
    const idFrag = formatIdFragment(idRaw);
    if (idFrag.startsWith('«')) {
      return `${typeLabel} — ${idFrag}`;
    }
    return typeLabel;
  }

  if (typeLabel && !idRaw) {
    return typeLabel;
  }

  if (!typeLabel && idRaw) {
    return fallbackLabelFromAction(
      action,
      idRaw,
      actor,
      actorFio,
      entityFioResolved
    );
  }

  return typeRaw || idRaw;
}
