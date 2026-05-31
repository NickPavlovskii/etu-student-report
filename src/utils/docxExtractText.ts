import JSZip from 'jszip';

function decodeXmlEntities(text: string): string {
  return text
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&amp;/g, '&')
    .replace(/&quot;/g, '"')
    .replace(/&apos;/g, "'");
}

/** Извлекает plain-text из DOCX (word/document.xml). */
export async function extractTextFromDocx(file: File): Promise<string> {
  const buf = await file.arrayBuffer();
  const zip = await JSZip.loadAsync(buf);
  const entry =
    zip.file('word/document.xml') ??
    zip.file(/word\/document\.xml/i)?.[0];
  if (!entry) {
    throw new Error('В файле не найден word/document.xml');
  }
  const xml = await entry.async('string');
  const parts: string[] = [];
  const re = /<w:t[^>]*>([^<]*)<\/w:t>/g;
  let m = re.exec(xml);
  while (m) {
    const chunk = decodeXmlEntities(m[1] ?? '').trim();
    if (chunk) parts.push(chunk);
    m = re.exec(xml);
  }
  return parts.join(' ').replace(/\s+/g, ' ').trim();
}

export type KeywordMatchLine = {
  lineNumber: number;
  text: string;
  excerpt: string;
};

/** Поиск ключевого слова по строкам текста (без учёта регистра). */
export function findKeywordMatches(
  fullText: string,
  keyword: string,
  maxResults = 40
): KeywordMatchLine[] {
  const q = keyword.trim();
  if (!q || !fullText.trim()) return [];

  const lowQ = q.toLowerCase();
  const lowText = fullText.toLowerCase();
  const out: KeywordMatchLine[] = [];
  let from = 0;

  while (out.length < maxResults) {
    const idx = lowText.indexOf(lowQ, from);
    if (idx < 0) break;
    const start = Math.max(0, idx - 56);
    const end = Math.min(fullText.length, idx + q.length + 56);
    const snippet = fullText.slice(start, end).trim();
    const excerpt =
      (start > 0 ? '…' : '') +
      snippet +
      (end < fullText.length ? '…' : '');
    out.push({
      lineNumber: out.length + 1,
      text: snippet,
      excerpt,
    });
    from = idx + q.length;
  }

  if (out.length) return out;

  const lines = fullText.split(/\r?\n/).map((s) => s.trim()).filter(Boolean);
  for (let i = 0; i < lines.length; i += 1) {
    const line = lines[i] ?? '';
    if (!line.toLowerCase().includes(lowQ)) continue;
    const lineIdx = line.toLowerCase().indexOf(lowQ);
    const start = Math.max(0, lineIdx - 48);
    const end = Math.min(line.length, lineIdx + q.length + 48);
    out.push({
      lineNumber: i + 1,
      text: line,
      excerpt:
        (start > 0 ? '…' : '') +
        line.slice(start, end) +
        (end < line.length ? '…' : ''),
    });
    if (out.length >= maxResults) break;
  }

  return out;
}

export function isDocxFile(file: File): boolean {
  const name = file.name.toLowerCase();
  return (
    name.endsWith('.docx') ||
    file.type ===
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
  );
}
