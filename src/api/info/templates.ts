/**
 * API шаблонов проверки документов.
 * GET, POST, PUT, DELETE /api/templates
 */
import type { AxiosInstance } from 'axios';
import type { TemplateDto, TemplatesModule } from '../types';
import { normalizeTemplateFromApi } from './templateDtoNormalize';

export default function templatesModule(api: AxiosInstance): TemplatesModule {
  return {
    async getTemplates(): Promise<TemplateDto[]> {
      const { data } = await api.get<unknown>('/templates');
      const arr = Array.isArray(data) ? data : [];
      return arr.map((row) => normalizeTemplateFromApi(row));
    },
    async getTemplate(id: string | number): Promise<TemplateDto | null> {
      const { data } = await api.get<unknown>(`/templates/${id}`);
      return data != null ? normalizeTemplateFromApi(data) : null;
    },
    async createTemplate(body: TemplateDto): Promise<TemplateDto> {
      const { data } = await api.post<unknown>('/templates', body);
      return normalizeTemplateFromApi(data ?? {});
    },
    async updateTemplate(
      id: string | number,
      body: TemplateDto
    ): Promise<TemplateDto> {
      const { data } = await api.put<unknown>(`/templates/${id}`, body);
      return normalizeTemplateFromApi(data ?? {});
    },
    async deleteTemplate(id: string | number): Promise<void> {
      await api.delete(`/templates/${id}`);
    },
    async uploadTitlePageTemplate(
      id: string | number,
      file: File
    ): Promise<TemplateDto> {
      const form = new FormData();
      form.append('file', file);
      const { data } = await api.post<unknown>(
        `/templates/${id}/title-page-template`,
        form,
        { headers: { 'Content-Type': undefined } as any }
      );
      return normalizeTemplateFromApi(data ?? {});
    },
  };
}
