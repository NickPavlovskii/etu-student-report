import type { ValidationErrorItem } from '@/api/types';

export function validationCriterionIconName(item: ValidationErrorItem): string {
  if (item.passed) return 'mdi-check-circle';
  if (item.level === 'error') return 'mdi-close-circle';
  return 'mdi-alert';
}

export function validationCriterionIconColor(
  item: ValidationErrorItem
): 'success' | 'error' | 'warning' {
  if (item.passed) return 'success';
  if (item.level === 'error') return 'error';
  return 'warning';
}

export function validationCriterionRowModifiers(
  item: ValidationErrorItem
): Record<string, boolean> {
  return {
    error: !item.passed && item.level === 'error',
    warning: !item.passed && item.level !== 'error',
    passed: !!item.passed,
  };
}
