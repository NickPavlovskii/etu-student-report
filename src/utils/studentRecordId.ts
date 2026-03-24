export function getStudentRecordId(s: unknown): number {
  if (!s || typeof s !== 'object') {
    return 0;
  }
  const o = s as Record<string, unknown>;
  const raw =
    o.studentId ??
    o.student_id ??
    o.iotId ??
    o.iot_id ??
    o.lkId ??
    o.lk_id;
  const n = Number(raw);
  return Number.isFinite(n) && n > 0 ? n : 0;
}
