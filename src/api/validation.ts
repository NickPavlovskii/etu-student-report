/**
 * API проверки документов по шаблону.
 * Использует Java Spring backend: POST /api/validate
 */
import { http } from './http';
import type { AddTemplateForm } from '@/modules/settings/modal';

export type ValidationErrorItem = {
  code: string;
  title?: string;
  message: string;
  passed: boolean;
  expected?: string;
  actual?: string;
  level?: string;
  location?: string;
  category?: string;
};

export type ValidationResult = {
  valid: boolean;
  percent?: number;
  errorMessage?: string | null;
  criteria?: ValidationErrorItem[];
  errors: ValidationErrorItem[];
  warnings: ValidationErrorItem[];
  annotatedFileBase64?: string;
  annotatedFileName?: string;
};

function toTemplateCriteriaDto(
  form: Partial<AddTemplateForm>
): Record<string, unknown> {
  return {
    fileFormat: form.fileFormat ?? '.doc или .docx',
    font: form.font ?? 'Times New Roman',
    fontSize: form.fontSize ?? '14 пт',
    lineSpacing: form.lineSpacing ?? '1.5',
    minPages: form.minPages ?? '10',
    minSources: form.minSources ?? '7',
    illNumbering: form.illNumbering ?? undefined,
    figurePosition: form.figurePosition ?? undefined,
    figureCaption: form.figureCaption ?? undefined,
    tableTitle: form.tableTitle ?? undefined,
    tablePosition: form.tablePosition ?? undefined,
    hasTitlePage: form.hasTitlePage ?? true,
    hasToc: form.hasToc ?? true,
    hasIntroduction: form.hasIntroduction ?? true,
    hasMainPart: form.hasMainPart ?? true,
    hasConclusion: form.hasConclusion ?? true,
    hasBibliography: form.hasBibliography ?? true,
    hasAppendices: form.hasAppendices ?? false,
  };
}
const defaultTemplate: Partial<AddTemplateForm> = {
  fileFormat: '.doc или .docx',
  font: 'Times New Roman',
  fontSize: '14 пт',
  lineSpacing: '1.5',
  minPages: '10',
  minSources: '7',
  hasTitlePage: true,
  hasToc: true,
  hasIntroduction: true,
  hasMainPart: true,
  hasConclusion: true,
  hasBibliography: true,
  hasAppendices: false,
};

export type ValidateOptions = {
  templateId?: string | number | null;
  template?: Partial<AddTemplateForm> | null;
  annotate?: boolean;
};

/**
 * Валидация документа.
 * @example
 * // С опциями
 * validateDocument(file, { templateId: 1, annotate: true });
 * // Упрощённый вызов: (file, templateId, annotate)
 * validateDocument(file, 1, true);
 */
export async function validateDocument(
  file: File,
  optionsOrTemplateId?:
    | ValidateOptions
    | Partial<AddTemplateForm>
    | string
    | number
    | null,
  annotateFlag?: boolean
): Promise<ValidationResult> {
  let opts: ValidateOptions | Partial<AddTemplateForm> | null = null;
  if (optionsOrTemplateId != null) {
    if (
      typeof optionsOrTemplateId === 'object' &&
      !(optionsOrTemplateId instanceof File) &&
      !Array.isArray(optionsOrTemplateId)
    ) {
      opts = { ...(optionsOrTemplateId as ValidateOptions) };
    } else if (
      typeof optionsOrTemplateId === 'string' ||
      typeof optionsOrTemplateId === 'number'
    ) {
      opts = {
        templateId: optionsOrTemplateId,
        annotate: annotateFlag ?? false,
      };
    }
  }
  if (opts && typeof annotateFlag === 'boolean') {
    opts = { ...opts, annotate: annotateFlag };
  }

  const templateId = opts && 'templateId' in opts ? opts.templateId : null;
  const template =
    opts && 'template' in opts
      ? opts.template
      : (opts as Partial<AddTemplateForm> | undefined);
  const annotate =
    opts && 'annotate' in opts ? opts.annotate : (annotateFlag ?? false);

  const form = new FormData();
  form.append('file', file);

  const params: Record<string, string | boolean> = {};
  if (annotate) {
    params.annotate = true;
  }
  if (templateId != null && templateId !== '') {
    form.append('templateId', String(templateId));
    params.templateId = String(templateId);
  } else {
    const criteria = toTemplateCriteriaDto({ ...defaultTemplate, ...template });
    const templateBlob = new Blob([JSON.stringify(criteria)], {
      type: 'application/json',
    });
    form.append('template', templateBlob, 'template.json');
  }

  const { data } = await http.post<ValidationResult>('/validate', form, {
    timeout: 60000,
    params: Object.keys(params).length ? params : undefined,
    headers: { 'Content-Type': undefined } as Record<string, unknown>,
  });

  const percent =
    data.percent != null
      ? Math.min(100, Math.max(0, Math.round(Number(data.percent))))
      : undefined;

  if (data.errorMessage && (!data.errors || data.errors.length === 0)) {
    return {
      ...data,
      percent,
      valid: false,
      errors: [
        {
          code: 'ERROR',
          message: data.errorMessage,
          passed: false,
        },
      ],
      warnings: data.warnings ?? [],
    };
  }

  return {
    ...data,
    percent,
    errors: data.errors ?? [],
    warnings: data.warnings ?? [],
  };
}
