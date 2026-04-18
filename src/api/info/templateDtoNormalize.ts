import type { TemplateDto } from '../types';
import { JAVA_ILLUSTRATION_TABLE_CRITERIA_KEYS } from './javaTemplateCriteriaDefaults';

const NESTED_CRITERIA_KEYS = [
  'criteria',
  'templateCriteria',
  'criteriaDto',
  'templateCriteriaDto',
  'criteriaJson',
  'criteria_json',
  'templateCriteriaJson',
] as const;

const SNAKE_TO_CAMEL: Record<string, string> = {
  file_format: 'fileFormat',
  font_size: 'fontSize',
  line_spacing: 'lineSpacing',
  min_pages: 'minPages',
  min_sources: 'minSources',
  ill_numbering: 'illNumbering',
  figure_position: 'figurePosition',
  figure_caption: 'figureCaption',
  table_title: 'tableTitle',
  table_title_placement: 'tableTitlePlacement',
  table_position: 'tablePosition',
  submission_format: 'submissionFormat',
  has_title_page: 'hasTitlePage',
  has_toc: 'hasToc',
  has_introduction: 'hasIntroduction',
  has_main_part: 'hasMainPart',
  has_conclusion: 'hasConclusion',
  has_bibliography: 'hasBibliography',
  has_appendices: 'hasAppendices',
  title_page_required_strings: 'titlePageRequiredStrings',
};

const ILLUSTRATION_FIELD_ALIASES: Record<string, readonly string[]> = {
  illNumbering: ['illNumbering', 'ill_numbering'],
  figurePosition: ['figurePosition', 'figure_position'],
  figureCaption: ['figureCaption', 'figure_caption'],
  tableTitle: ['tableTitle', 'table_title'],
  tableTitlePlacement: ['tableTitlePlacement', 'table_title_placement'],
  tablePosition: ['tablePosition', 'table_position'],
};

function isPlainObject(v: unknown): v is Record<string, unknown> {
  return v !== null && typeof v === 'object' && !Array.isArray(v);
}

function isBlankCriteriaValue(v: unknown): boolean {
  if (v === null || v === undefined) return true;
  if (typeof v === 'string' && !v.trim()) return true;
  return false;
}

function unwrapTemplateEnvelope(data: unknown): unknown {
  if (!isPlainObject(data)) return data;
  const d = data;
  if (isPlainObject(d.data)) return d.data;
  if (isPlainObject(d.result)) return d.result;
  if (isPlainObject(d.payload)) return d.payload;
  return data;
}

export function extractIllustrationTableFieldsDeep(root: unknown): Record<string, unknown> {
  const acc: Record<string, unknown> = {};

  function considerNode(node: Record<string, unknown>): void {
    for (const canonical of JAVA_ILLUSTRATION_TABLE_CRITERIA_KEYS) {
      if (!isBlankCriteriaValue(acc[canonical])) continue;
      const names = ILLUSTRATION_FIELD_ALIASES[canonical];
      if (!names) continue;
      for (const name of names) {
        const v = node[name];
        if (!isBlankCriteriaValue(v)) {
          acc[canonical] = v;
          break;
        }
      }
    }
  }

  function visit(node: unknown, depth: number): void {
    if (depth > 14) return;
    if (node == null) return;
    if (typeof node === 'string') {
      const t = node.trim();
      if (t.startsWith('{') || t.startsWith('[')) {
        try {
          visit(JSON.parse(t), depth + 1);
        } catch {
          /* не JSON */
        }
      }
      return;
    }
    if (Array.isArray(node)) {
      for (const x of node) visit(x, depth + 1);
      return;
    }
    if (!isPlainObject(node)) return;
    considerNode(node);
    for (const v of Object.values(node)) {
      visit(v, depth + 1);
    }
  }

  visit(root, 0);
  return acc;
}

export function normalizeTemplateFromApi(data: unknown): TemplateDto {
  const unwrapped = unwrapTemplateEnvelope(data);
  if (!isPlainObject(unwrapped)) {
    return {} as TemplateDto;
  }
  const merged: Record<string, unknown> = { ...unwrapped };
  for (const key of NESTED_CRITERIA_KEYS) {
    let inner: unknown = unwrapped[key];
    if (typeof inner === 'string') {
      const s = inner.trim();
      if (s.startsWith('{') || s.startsWith('[')) {
        try {
          const parsed: unknown = JSON.parse(s);
          inner = parsed;
        } catch {
          continue;
        }
      } else {
        continue;
      }
    }
    if (!isPlainObject(inner)) continue;
    for (const [ik, iv] of Object.entries(inner)) {
      if (
        (ik === 'name' || ik === 'description') &&
        (iv == null || (typeof iv === 'string' && iv.trim() === ''))
      ) {
        continue;
      }
      merged[ik] = iv;
    }
  }
  for (const [snake, camel] of Object.entries(SNAKE_TO_CAMEL)) {
    if (merged[camel] == null && merged[snake] != null) {
      merged[camel as string] = merged[snake];
    }
  }
  const deep = extractIllustrationTableFieldsDeep(data);
  for (const k of JAVA_ILLUSTRATION_TABLE_CRITERIA_KEYS) {
    if (isBlankCriteriaValue(merged[k]) && !isBlankCriteriaValue(deep[k])) {
      merged[k] = deep[k];
    }
  }
  return merged as TemplateDto;
}
