import type { ValidationErrorItem, ValidationResult } from '@/api/types';
import {
  mergeValidationResultItems,
  validationCriterionDisplayTitle,
} from '@/utils/validationCriteriaDisplay';

function levelRu(level: string | undefined): string {
  const l = (level ?? '').toLowerCase();
  if (l === 'warning' || l === 'предупреждение') {
    return 'Предупреждение';
  }
  if (l === 'error' || l === 'ошибка') {
    return 'Ошибка';
  }
  return 'Замечание';
}

function formatRemarkItem(item: ValidationErrorItem, index: number): string {
  let title = validationCriterionDisplayTitle(item);
  if (!title) {
    title = item.message ?? item.code ?? '';
  }
  const lines = [
    `${index}. [${levelRu(item.level)}] ${title}`,
    `   ${item.message}`,
  ];
  if (item.location) {
    lines.push(`   Расположение: ${item.location}`);
  }
  if (item.expected) {
    lines.push(`   Ожидалось: ${item.expected}`);
  }
  if (item.actual) {
    lines.push(`   Найдено: ${item.actual}`);
  }
  return lines.join('\n');
}

export function buildValidationRemarksSummary(
  result: ValidationResult | null | undefined,
  sourceFileName?: string
): string {
  if (!result) {
    return '';
  }

  const merged = mergeValidationResultItems(result);
  const failed = merged.filter((c) => !c.passed);

  const headerLines: string[] = [
    'ЗАКРЕПЛЁННЫЕ КОММЕНТАРИИ К ЗАМЕЧАНИЯМ',
    '================================',
  ];
  if (sourceFileName) {
    headerLines.push(`Документ: ${sourceFileName}`);
  }
  headerLines.push(`Дата: ${new Date().toLocaleString('ru-RU')}`);
  if (failed.length) {
    headerLines.push(`Всего замечаний: ${failed.length}`);
  } else {
    headerLines.push('Замечаний не обнаружено.');
  }
  headerLines.push('');

  const header = headerLines.join('\n');

  if (!failed.length) {
    return `${header}\nПроверка пройдена без замечаний.\n`;
  }

  const body = failed
    .map((item, i) => formatRemarkItem(item, i + 1))
    .join('\n\n');

  return `${header}\n${body}\n`;
}

export function remarksSummaryFileName(annotatedFileName: string): string {
  const base = annotatedFileName.replace(/\.[^.]+$/, '');
  return `${base}_комментарии_к_замечаниям.txt`;
}
