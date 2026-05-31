import { describe, expect, it, vi, beforeEach } from 'vitest';
import templatesModule from '@/api/info/templates';

describe('templatesModule.searchTemplateKeywords', () => {
  const post = vi.fn();

  beforeEach(() => {
    post.mockReset();
  });

  it('отправляет multipart и нормализует ответ', async () => {
    post.mockResolvedValue({
      data: {
        filename: 'titul.docx',
        query: 'кафедра',
        matches: [
          {
            text: 'кафедра',
            excerpt: '…кафедра информационных…',
            lineNumber: 5,
          },
        ],
      },
    });
    const api = { post } as never;
    const mod = templatesModule(api);
    const file = new File(['x'], 'sample.docx', {
      type: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    });

    const result = await mod.searchTemplateKeywords(file, 'кафедра', 40);

    expect(post).toHaveBeenCalledWith(
      '/templates/keyword-search',
      expect.any(FormData),
      expect.objectContaining({
        headers: { 'Content-Type': undefined },
      })
    );
    expect(result.filename).toBe('titul.docx');
    expect(result.query).toBe('кафедра');
    expect(result.matches).toHaveLength(1);
    expect(result.matches[0]?.lineNumber).toBe(5);
  });
});
