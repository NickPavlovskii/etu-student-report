/**
 * API шаблонов проверки документов.
 * GET, POST, PUT, DELETE /api/templates
 */
import { http } from './http';

export type TemplateDto = {
  id?: string | number;
  name: string;
  description?: string;
  fileFormat?: string;
  font?: string;
  fontSize?: string;
  lineSpacing?: string;
  minPages?: string;
  minSources?: string;
  illNumbering?: string;
  figurePosition?: string;
  figureCaption?: string;
  tableTitle?: string;
  tablePosition?: string;
  submissionFormat?: string;
  hasTitlePage?: boolean;
  hasToc?: boolean;
  hasIntroduction?: boolean;
  hasMainPart?: boolean;
  hasConclusion?: boolean;
  hasBibliography?: boolean;
  hasAppendices?: boolean;
  /** Обязательные строки на титульном листе (из макета) */
  titlePageRequiredStrings?: string[];
  createdAt?: string;
  updatedAt?: string;
  [key: string]: unknown;
};

export async function getTemplates(): Promise<TemplateDto[]> {
  const { data } = await http.get<TemplateDto[]>('/templates');
  return Array.isArray(data) ? data : [];
}

export async function getTemplate(id: string | number): Promise<TemplateDto | null> {
  const { data } = await http.get<TemplateDto>(`/templates/${id}`);
  return data ?? null;
}

export async function createTemplate(body: TemplateDto): Promise<TemplateDto> {
  const { data } = await http.post<TemplateDto>('/templates', body);
  return data;
}

export async function updateTemplate(
  id: string | number,
  body: TemplateDto
): Promise<TemplateDto> {
  const { data } = await http.put<TemplateDto>(`/templates/${id}`, body);
  return data;
}

export async function deleteTemplate(id: string | number): Promise<void> {
  await http.delete(`/templates/${id}`);
}

/**
 * Загрузить макет титульного листа (DOC, DOCX, PDF).
 * Бэкенд извлекает обязательные элементы и сохраняет в criteria.titlePageRequiredStrings.
 * @returns обновлённый шаблон
 */
export async function uploadTitlePageTemplate(
  id: string | number,
  file: File
): Promise<TemplateDto> {
  const form = new FormData();
  form.append('file', file);
  const { data } = await http.post<TemplateDto>(
    `/templates/${id}/title-page-template`,
    form,
    { headers: { 'Content-Type': undefined } as Record<string, unknown> }
  );
  return data;
}
