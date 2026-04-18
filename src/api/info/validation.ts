import type { AxiosInstance } from 'axios';
import type { AddTemplateForm } from '@/modules/settings/modal';
import type {
  ValidateOptions,
  ValidationModule,
  BatchValidationResult,
  ValidationResult,
} from '../types';
import {
  JAVA_ILLUSTRATION_TABLE_CRITERIA_KEYS,
  JAVA_TEMPLATE_CRITERIA_DEFAULTS,
} from './javaTemplateCriteriaDefaults';
import { normalizeTemplateFromApi } from './templateDtoNormalize';

const TEMPLATE_ENTITY_ROOT_KEYS = new Set([
  'id',
  'name',
  'description',
  'createdAt',
  'updatedAt',
  'criteria',
]);

function flatCriteriaFromTemplateResponse(data: unknown): Record<string, unknown> {
  const merged = normalizeTemplateFromApi(data) as Record<string, unknown>;
  const out: Record<string, unknown> = {};
  for (const [k, v] of Object.entries(merged)) {
    if (TEMPLATE_ENTITY_ROOT_KEYS.has(k)) continue;
    if (v !== undefined) out[k] = v;
  }
  return out;
}

function criteriaPayloadFromTemplateResponse(data: unknown): Record<string, unknown> {
  return ensureIllustrationTableCriteria(flatCriteriaFromTemplateResponse(data));
}

function isIllustrationCriterionEmpty(value: unknown): boolean {
  if (value === null || value === undefined) {
    return true;
  }
  if (typeof value === 'string' && !value.trim()) {
    return true;
  }
  return false;
}

function ensureIllustrationTableCriteria(
  criteria: Record<string, unknown>
): Record<string, unknown> {
  const keys = JAVA_ILLUSTRATION_TABLE_CRITERIA_KEYS;
  const next = { ...criteria };
  const allEmpty = keys.every((k) => isIllustrationCriterionEmpty(next[k]));
  if (allEmpty) {
    return { ...next, ...pickIllustrationTableDefaults() };
  }
  for (const k of keys) {
    if (isIllustrationCriterionEmpty(next[k])) {
      const v = JAVA_TEMPLATE_CRITERIA_DEFAULTS[k];
      if (v !== undefined) next[k] = v;
    }
  }
  return next;
}

function pickIllustrationTableDefaults(): Record<string, string> {
  const out: Record<string, string> = {};
  for (const k of JAVA_ILLUSTRATION_TABLE_CRITERIA_KEYS) {
    const v = JAVA_TEMPLATE_CRITERIA_DEFAULTS[k];
    if (typeof v === 'string' && v) out[k] = v;
  }
  return out;
}

function toTemplateCriteriaDto(
  form: Partial<AddTemplateForm>
): Record<string, unknown> {
  const d = JAVA_TEMPLATE_CRITERIA_DEFAULTS;
  return {
    fileFormat: form.fileFormat ?? d.fileFormat,
    font: form.font ?? d.font,
    fontSize: form.fontSize ?? d.fontSize,
    lineSpacing: form.lineSpacing ?? d.lineSpacing,
    minPages: form.minPages ?? d.minPages,
    minSources: form.minSources ?? d.minSources,
    illNumbering: form.illNumbering ?? d.illNumbering,
    figurePosition: form.figurePosition ?? d.figurePosition,
    figureCaption: form.figureCaption ?? d.figureCaption,
    tableTitle: form.tableTitle ?? d.tableTitle,
    tableTitlePlacement: form.tableTitlePlacement ?? d.tableTitlePlacement,
    tablePosition: form.tablePosition ?? d.tablePosition,
    submissionFormat: form.submissionFormat ?? 'Электронный вид',
    titlePageRequiredStrings: form.titlePageRequiredStrings,
    hasTitlePage: false,
    hasToc: form.hasToc ?? d.hasToc,
    hasIntroduction: form.hasIntroduction ?? d.hasIntroduction,
    hasMainPart: form.hasMainPart ?? d.hasMainPart,
    hasConclusion: form.hasConclusion ?? d.hasConclusion,
    hasBibliography: form.hasBibliography ?? d.hasBibliography,
    hasAppendices: form.hasAppendices ?? d.hasAppendices,
  };
}

const defaultTemplate: Partial<AddTemplateForm> = {
  fileFormat: JAVA_TEMPLATE_CRITERIA_DEFAULTS.fileFormat,
  font: JAVA_TEMPLATE_CRITERIA_DEFAULTS.font,
  fontSize: JAVA_TEMPLATE_CRITERIA_DEFAULTS.fontSize,
  lineSpacing: JAVA_TEMPLATE_CRITERIA_DEFAULTS.lineSpacing,
  minPages: JAVA_TEMPLATE_CRITERIA_DEFAULTS.minPages,
  minSources: JAVA_TEMPLATE_CRITERIA_DEFAULTS.minSources,
  illNumbering: JAVA_TEMPLATE_CRITERIA_DEFAULTS.illNumbering,
  figurePosition: JAVA_TEMPLATE_CRITERIA_DEFAULTS.figurePosition,
  figureCaption: JAVA_TEMPLATE_CRITERIA_DEFAULTS.figureCaption,
  tableTitle: JAVA_TEMPLATE_CRITERIA_DEFAULTS.tableTitle,
  tableTitlePlacement: JAVA_TEMPLATE_CRITERIA_DEFAULTS.tableTitlePlacement,
  tablePosition: JAVA_TEMPLATE_CRITERIA_DEFAULTS.tablePosition,
  submissionFormat: 'Электронный вид',
  hasTitlePage: JAVA_TEMPLATE_CRITERIA_DEFAULTS.hasTitlePage,
  hasToc: JAVA_TEMPLATE_CRITERIA_DEFAULTS.hasToc,
  hasIntroduction: JAVA_TEMPLATE_CRITERIA_DEFAULTS.hasIntroduction,
  hasMainPart: JAVA_TEMPLATE_CRITERIA_DEFAULTS.hasMainPart,
  hasConclusion: JAVA_TEMPLATE_CRITERIA_DEFAULTS.hasConclusion,
  hasBibliography: JAVA_TEMPLATE_CRITERIA_DEFAULTS.hasBibliography,
  hasAppendices: JAVA_TEMPLATE_CRITERIA_DEFAULTS.hasAppendices,
};

export default function validationModule(api: AxiosInstance): ValidationModule {
  return {
    async validateDocument(
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
        try {
          const tplRes = await api.get<unknown>(`/templates/${templateId}`);
          const beforeEnsure = flatCriteriaFromTemplateResponse(tplRes.data);
          const payload = ensureIllustrationTableCriteria(beforeEnsure);
          form.append(
            'template',
            new Blob([JSON.stringify(payload)], { type: 'application/json' }),
            'template.json'
          );
        } catch {
          /* без template.json — сервер подставит дефолты */
        }
      } else {
        const raw = toTemplateCriteriaDto({ ...defaultTemplate, ...template });
        const criteria = ensureIllustrationTableCriteria(raw);
        const templateBlob = new Blob([JSON.stringify(criteria)], {
          type: 'application/json',
        });
        form.append('template', templateBlob, 'template.json');
      }

      const { data } = await api.post<ValidationResult>('/validate', form, {
        timeout: 60000,
        params: Object.keys(params).length ? params : undefined,
        headers: { 'Content-Type': undefined } as any,
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
    },

    async validateBatch(
      files: File[],
      options?: ValidateOptions | null
    ): Promise<BatchValidationResult> {
      const annotate = options?.annotate ?? false;
      const templateId = options?.templateId ?? null;
      const template =
        options && 'template' in options ? options.template : options?.template;

      const form = new FormData();
      for (const f of files ?? []) {
        if (f instanceof File) {
          form.append('files', f);
        }
      }

      const params: Record<string, string | boolean> = {};
      if (annotate) params.annotate = true;

      if (templateId != null && templateId !== '') {
        form.append('templateId', String(templateId));
        params.templateId = String(templateId);
        try {
          const tplRes = await api.get<unknown>(`/templates/${templateId}`);
          const payload = criteriaPayloadFromTemplateResponse(tplRes.data);
          form.append(
            'template',
            new Blob([JSON.stringify(payload)], { type: 'application/json' }),
            'template.json'
          );
        } catch {
          /* без template.json */
        }
      } else {
        const raw = toTemplateCriteriaDto({ ...defaultTemplate, ...(template ?? {}) });
        const criteria = ensureIllustrationTableCriteria(raw);
        form.append(
          'template',
          new Blob([JSON.stringify(criteria)], { type: 'application/json' }),
          'template.json'
        );
      }

      const { data } = await api.post<BatchValidationResult>(
        '/validate/batch',
        form,
        {
          timeout: 120000,
          params: Object.keys(params).length ? params : undefined,
          headers: { 'Content-Type': undefined } as any,
        }
      );

      const raw = Array.isArray((data as any)?.results) ? (data as any).results : [];
      const results = raw.map((entry: unknown, i: number) => {
        const file = files?.[i];
        const fallbackName = file instanceof File ? file.name : '';
        if (entry && typeof entry === 'object' && 'result' in (entry as object)) {
          const e = entry as {
            filename?: string;
            fileName?: string;
            name?: string;
            result: ValidationResult;
          };
          const filename = String(
            e.filename ?? e.fileName ?? e.name ?? fallbackName
          ).trim();
          return { filename: filename || fallbackName, result: e.result };
        }
        return {
          filename: fallbackName,
          result: entry as ValidationResult,
        };
      });

      return { results };
    },
  };
}
