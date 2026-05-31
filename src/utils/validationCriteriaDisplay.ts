import type { ValidationErrorItem, ValidationResult } from '@/api/types';

export function mergeValidationResultItems(
  r: ValidationResult | null | undefined
): ValidationErrorItem[] {
  if (!r) return [];
  const primary = r.criteria ?? [];
  const secondary = [...(r.errors ?? []), ...(r.warnings ?? [])];
  if (!primary.length) return secondary;
  const seenCodes = new Set<string>();
  for (const c of primary) {
    const code = (c.code ?? '').trim();
    if (code) seenCodes.add(code);
  }
  const out = [...primary];
  for (const c of secondary) {
    const code = (c.code ?? '').trim();
    if (code) {
      if (seenCodes.has(code)) continue;
      seenCodes.add(code);
    }
    out.push(c);
  }
  return out;
}

export function isHiddenValidationCriterion(item: {
  code?: string;
  message?: string;
  title?: string;
}): boolean {
  const code = (item.code ?? '').toUpperCase();
  if (code === 'LINE_SPACING' || code.includes('LINE_SPACING')) {
    return true;
  }
  const blob = `${item.message ?? ''} ${item.title ?? ''}`.toLowerCase();
  if (blob.includes('межстрочн')) {
    return true;
  }
  if (
    code === 'FILE_FORMAT' ||
    code.includes('FILE_FORMAT') ||
    code === 'FORMAT_FILE'
  ) {
    return true;
  }
  if (blob.includes('формат файла')) {
    return true;
  }
  return false;
}

export function filterDisplayedValidationCriteria<T extends { code?: string; message?: string; title?: string }>(
  items: T[]
): T[] {
  return items.filter((c) => !isHiddenValidationCriterion(c));
}

export function validationCriterionDisplayTitle(item: {
  code?: string;
  title?: string;
}): string {
  const code = (item.code ?? '').toUpperCase();
  if (code === 'FIGURE_POSITION' || code.includes('FIGURE_POSITION')) {
    return 'Выравнивание подписи к рисунку';
  }
  if (code.includes('TABLE_AFTER_TITLE')) {
    return 'Расположение названия таблицы (над таблицей)';
  }
  if (code.includes('TABLE_TITLE_BELOW')) {
    return 'Расположение названия таблицы (под таблицей)';
  }
  if (code.includes('TABLE_POSITION')) {
    return 'Позиция заголовка «Таблица …»';
  }
  if (code === 'TABLE_TITLE') {
    return 'Заголовок таблицы';
  }
  if (code.includes('FIGURE_CAPTION') && !code.includes('ABOVE')) {
    return 'Подпись рисунка';
  }
  if (code.includes('FIGURE_CAPTION_ABOVE')) {
    return 'Подпись рисунка (над рисунком)';
  }
  if (code.includes('ILL_NUMBERING')) {
    return 'Нумерация иллюстраций';
  }
  if (code.includes('PDF_LAYOUT')) {
    return 'Ограничения проверки PDF';
  }
  if (
    code.includes('TITLE_PAGE') ||
    code.includes('REQUIRED_STRING') ||
    code.includes('KEYWORD') ||
    code === 'HAS_TITLE_PAGE'
  ) {
    return 'Ключевые фразы';
  }
  const blob = `${item.title ?? ''} ${(item as { message?: string }).message ?? ''}`.toLowerCase();
  if (blob.includes('ключев') && blob.includes('фраз')) {
    return 'Ключевые фразы';
  }
  return (item.title ?? '').trim() || (item.code ?? '');
}

export function filterStructureIllustrationTableCriteria<
  T extends { code?: string },
>(items: T[]): T[] {
  return items.filter((c) => {
    const code = (c.code ?? '').toUpperCase();
    return (
      code.includes('TABLE') ||
      code.includes('FIGURE') ||
      code.includes('ILL_NUMBERING') ||
      code.includes('PDF_LAYOUT')
    );
  });
}

export function validationCriterionShowExpectedActualWhenPassed(item: {
  code?: string;
}): boolean {
  const code = (item.code ?? '').toUpperCase();
  return (
    code.includes('FIGURE_POSITION') ||
    code.includes('TABLE_POSITION') ||
    code.includes('TABLE_AFTER_TITLE') ||
    code.includes('TABLE_TITLE_BELOW') ||
    code.includes('TABLE_TITLE') ||
    code.includes('ILL_NUMBERING') ||
    code.includes('FIGURE_CAPTION')
  );
}

