export type TemplateItem = {
  id: string;
  name: string;
  description: string;
  criteriaCount: number;
  sectionsCount: number;
  font: string;
  minPages: string;
  minSources: string;
  raw?: Record<string, unknown>;
};

export type ControlTypeItem = {
  id: string;
  title: string;
  description: string;
  active: boolean;
  showInTable: boolean;
  templateId: string | null;
  displayedTopics?: string[];
};

export type AddTemplateForm = {
  name: string;
  description: string;
  fileFormat: string;
  font: string;
  fontSize: string;
  lineSpacing: string;
  minPages: string;
  minSources: string;
  illNumbering: string;
  figurePosition: string;
  figureCaption: string;
  tableTitle: string;
  tableTitlePlacement: string;
  tablePosition?: string;
  submissionFormat: string;
  titlePageRequiredStrings?: string[];
  hasTitlePage: boolean;
  hasToc: boolean;
  hasIntroduction: boolean;
  hasMainPart: boolean;
  hasConclusion: boolean;
  hasBibliography: boolean;
  hasAppendices: boolean;
};
