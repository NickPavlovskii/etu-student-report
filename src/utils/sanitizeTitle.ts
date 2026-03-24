export function sanitizeTitle(v: unknown): string {
  return (
    String(v ?? '')
      .replace(/"/g, '')
      .trim() || '—'
  );
}
