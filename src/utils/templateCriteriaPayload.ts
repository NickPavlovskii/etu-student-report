import type { AddTemplateForm } from '@/modules/settings/modal';
import type { TemplateCriteriaDto } from '@/api/types';
import { JAVA_TEMPLATE_CRITERIA_DEFAULTS as J } from '@/api/info/javaTemplateCriteriaDefaults';

export type TemplateCriteriaBuildOptions = {
  omitDisabled?: boolean;
};

function enabled(form: Partial<AddTemplateForm>, key: keyof AddTemplateForm): boolean {
  const v = form[key];
  if (typeof v === 'boolean') return v;
  return true;
}

export function buildTemplateCriteriaFromForm(
  form: Partial<AddTemplateForm>,
  options: TemplateCriteriaBuildOptions = {}
): TemplateCriteriaDto {
  const omit = options.omitDisabled !== false;
  const d = J;
  const out: TemplateCriteriaDto = {};

  const set = <K extends keyof TemplateCriteriaDto>(
    key: K,
    value: TemplateCriteriaDto[K]
  ) => {
    out[key] = value;
  };

  const use = (flag: keyof AddTemplateForm) => !omit || enabled(form, flag);

  if (use('checkFont')) {
    set('fileFormat', form.fileFormat ?? d.fileFormat);
    set('font', form.font ?? d.font);
  }
  if (use('checkFontSize')) {
    set('fontSize', form.fontSize ?? d.fontSize);
    if (!out.fileFormat) set('fileFormat', form.fileFormat ?? d.fileFormat);
  }
  if (form.lineSpacing && use('checkFont')) {
    set('lineSpacing', form.lineSpacing);
  }

  if (use('checkMinPages')) {
    set('minPages', form.minPages ?? d.minPages);
  }
  if (use('checkMinSources')) {
    set('minSources', form.minSources ?? d.minSources);
  }

  if (use('checkIllNumbering')) {
    set('illNumbering', form.illNumbering ?? d.illNumbering);
  }
  if (use('checkFigurePosition')) {
    set('figurePosition', form.figurePosition ?? d.figurePosition);
  }
  if (use('checkFigureCaption')) {
    set('figureCaption', form.figureCaption ?? d.figureCaption);
  }
  if (use('checkTableTitle')) {
    set('tableTitle', form.tableTitle ?? d.tableTitle);
  }
  if (use('checkTableTitlePlacement')) {
    set('tableTitlePlacement', form.tableTitlePlacement ?? d.tableTitlePlacement);
  }
  if (use('checkTablePosition')) {
    set('tablePosition', form.tablePosition ?? d.tablePosition);
  }

  set('submissionFormat', form.submissionFormat ?? 'Электронный вид');

  const phrases = form.titlePageRequiredStrings ?? [];
  if (phrases.length) {
    set('titlePageRequiredStrings', [...phrases]);
    set('hasTitlePage', true);
  }

  if (use('checkHasToc')) {
    set('hasToc', true);
  }
  if (use('checkHasIntroduction')) {
    set('hasIntroduction', true);
  }
  if (use('checkHasMainPart')) {
    set('hasMainPart', true);
  }
  if (use('checkHasConclusion')) {
    set('hasConclusion', true);
  }
  if (use('checkHasBibliography')) {
    set('hasBibliography', true);
  }
  if (use('checkHasAppendices')) {
    set('hasAppendices', true);
  }

  return out;
}

export function normalizeTitlePageRequiredStrings(val: unknown): string[] {
  if (Array.isArray(val)) {
    return [...new Set(val.map((x) => String(x).trim()).filter(Boolean))];
  }
  if (typeof val === 'string') {
    const t = val.trim();
    if (!t) return [];
    if (t.startsWith('[')) {
      try {
        return normalizeTitlePageRequiredStrings(JSON.parse(t));
      } catch {
        /* fall through */
      }
    }
    return [...new Set(t.split(/[,;\n]/).map((s) => s.trim()).filter(Boolean))];
  }
  return [];
}

export function ensureTitlePageKeywordsInCriteria(
  criteria: Record<string, unknown>
): Record<string, unknown> {
  const next = { ...criteria };
  const phrases = normalizeTitlePageRequiredStrings(
    next.titlePageRequiredStrings ?? next.title_page_required_strings
  );
  if (phrases.length) {
    next.titlePageRequiredStrings = phrases;
    next.hasTitlePage = true;
  }
  return next;
}
export function defaultTemplateCriterionFlags(): Pick<
  AddTemplateForm,
  | 'checkFont'
  | 'checkFontSize'
  | 'checkMinPages'
  | 'checkMinSources'
  | 'checkIllNumbering'
  | 'checkFigurePosition'
  | 'checkFigureCaption'
  | 'checkTableTitle'
  | 'checkTableTitlePlacement'
  | 'checkTablePosition'
  | 'checkHasTitlePage'
  | 'checkTitlePagePhrases'
  | 'checkHasToc'
  | 'checkHasIntroduction'
  | 'checkHasMainPart'
  | 'checkHasConclusion'
  | 'checkHasBibliography'
  | 'checkHasAppendices'
> {
  return {
    checkFont: true,
    checkFontSize: true,
    checkMinPages: true,
    checkMinSources: true,
    checkIllNumbering: true,
    checkFigurePosition: true,
    checkFigureCaption: true,
    checkTableTitle: true,
    checkTableTitlePlacement: true,
    checkTablePosition: true,
    checkHasTitlePage: false,
    checkTitlePagePhrases: false,
    checkHasToc: true,
    checkHasIntroduction: true,
    checkHasMainPart: true,
    checkHasConclusion: true,
    checkHasBibliography: true,
    checkHasAppendices: false,
  };
}
