export type SingleUploadAutofillFields = {
  academicYear: string;
  workType: string;
  workTitle: string;
  topic: string;
};

export function normalizeAcademicYearForStorage(raw: string): string {
  return raw.replace(/\//g, '-').trim();
}

function bestMatchOption(input: string, options: string[]): string | null {
  const q = (input ?? '').toLowerCase().trim();
  if (!q) return null;
  const exact = options.find((o) => o.toLowerCase() === q);
  if (exact) return exact;
  const contains = options.find((o) => o.toLowerCase().includes(q) || q.includes(o.toLowerCase()));
  return contains ?? null;
}

export function computeSingleUploadAutofillPatch(
  fileName: string,
  controlTypesOptions: string[],
  filteredTopics: string[],
  current: SingleUploadAutofillFields
): Partial<SingleUploadAutofillFields> {
  const patch: Partial<SingleUploadAutofillFields> = {};
  const base = String(fileName ?? '')
    .replace(/\.[^.]+$/, '')
    .trim();
  if (!base) return patch;

  const yearMatch = base.match(/(?<![0-9])(20\d{2})\s*[-/]\s*(20\d{2})\b/);
  if (yearMatch) {
    const y = `${yearMatch[1]}-${yearMatch[2]}`;
    patch.academicYear = normalizeAcademicYearForStorage(y);
  }

  const parts = base.split('_').map((p) => p.trim()).filter(Boolean);
  if (parts.length >= 3) {
    const maybeWorkType = parts[2];
    if (maybeWorkType && !current.workType.trim()) {
      const opt = bestMatchOption(maybeWorkType, controlTypesOptions);
      if (opt) patch.workType = opt;
    }
    if (parts[3] && !current.workTitle.trim()) {
      patch.workTitle = parts[3];
    }
  }

  const topicMatch = base.match(/тема\s*[:№#-]?\s*(.+)$/i);
  if (topicMatch && topicMatch[1]) {
    const t = topicMatch[1].trim();
    const opt = bestMatchOption(t, filteredTopics);
    if (opt && !current.topic.trim()) {
      patch.topic = opt;
    }
  }

  return patch;
}
