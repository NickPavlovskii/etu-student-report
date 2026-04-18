import type { TemplateCriteriaDto } from '../types';

export const JAVA_TEMPLATE_CRITERIA_DEFAULTS: TemplateCriteriaDto = {
  fileFormat: '.doc или .docx',
  font: 'Times New Roman',
  fontSize: '14 пт',
  lineSpacing: '1.5',
  minPages: '10',
  minSources: '7',
  illNumbering: 'Сквозная',
  figurePosition: 'По центру страницы',
  figureCaption: 'Под рисунком',
  tableTitle: 'Слово «Таблица» + номер + наименование',
  tableTitlePlacement: 'Над таблицей',
  tablePosition: 'Справа',
  hasTitlePage: false,
  hasToc: true,
  hasIntroduction: true,
  hasMainPart: true,
  hasConclusion: true,
  hasBibliography: true,
  hasAppendices: false,
};

export const JAVA_ILLUSTRATION_TABLE_CRITERIA_KEYS = [
  'illNumbering',
  'figurePosition',
  'figureCaption',
  'tableTitle',
  'tableTitlePlacement',
  'tablePosition',
] as const;
