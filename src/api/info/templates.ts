/**
 * API шаблонов проверки документов.
 * GET, POST, PUT, DELETE /api/templates
 */
import type { AxiosInstance } from 'axios';
import type { TemplateDto, TemplatesModule } from '../types';

export default function templatesModule(api: AxiosInstance): TemplatesModule {
  return {
    async getTemplates(): Promise<TemplateDto[]> {
      const { data } = await api.get<TemplateDto[]>('/templates');
      return Array.isArray(data) ? data : [];
    },
    async getTemplate(id: string | number): Promise<TemplateDto | null> {
      const { data } = await api.get<TemplateDto>(`/templates/${id}`);
      return data ?? null;
    },
    async createTemplate(body: TemplateDto): Promise<TemplateDto> {
      const { data } = await api.post<TemplateDto>('/templates', body);
      return data;
    },
    async updateTemplate(
      id: string | number,
      body: TemplateDto
    ): Promise<TemplateDto> {
      const { data } = await api.put<TemplateDto>(`/templates/${id}`, body);
      return data;
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
      const { data } = await api.post<TemplateDto>(
        `/templates/${id}/title-page-template`,
        form,
        { headers: { 'Content-Type': undefined } as any }
      );
      return data as TemplateDto;
    },
  };
}
