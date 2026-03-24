import {
  AUDIT_ACTION_LABELS,
  AUDIT_ACTION_CHIP_CLASSES,
  AUDIT_ACTION_ICONS,
} from './uiConstants';

export function normalizeAuditActionCode(action: string): string {
  const a = (action ?? '').trim();
  if (a === 'ROLLED_BACK' || a === 'AUDIT_ROLLED_BACK') {
    return 'ACTION_ROLLED_BACK';
  }
  return a;
}

export function auditActionLabel(action: string): string {
  const key = normalizeAuditActionCode(action);
  return AUDIT_ACTION_LABELS[key] || AUDIT_ACTION_LABELS[action] || action;
}

export function auditActionChipClass(action: string): string {
  const key = normalizeAuditActionCode(action);
  return (
    AUDIT_ACTION_CHIP_CLASSES[key] ||
    AUDIT_ACTION_CHIP_CLASSES[action] ||
    'chip-gray'
  );
}

const DEFAULT_ICON = 'mdi-information-outline';
const ALL_ACTIONS_ICON = 'mdi-filter-variant';

export function auditActionIcon(action: string): string {
  if ((action ?? '').trim()) {
    const key = normalizeAuditActionCode(action);
    return (
      AUDIT_ACTION_ICONS[key] || AUDIT_ACTION_ICONS[action] || DEFAULT_ICON
    );
  }
  return ALL_ACTIONS_ICON;
}

export type AuditActionPreset =
  | 'blue'
  | 'green'
  | 'orange'
  | 'red'
  | 'purple'
  | 'gray';

export function auditActionPreset(action: string): AuditActionPreset {
  const cls = auditActionChipClass(action);
  const name = cls.replace(/^chip-/, '');
  const allowed: AuditActionPreset[] = [
    'blue',
    'green',
    'orange',
    'red',
    'purple',
    'gray',
  ];
  return (
    allowed.includes(name as AuditActionPreset) ? name : 'gray'
  ) as AuditActionPreset;
}
