import { getStudentRecordId } from '@/utils/studentRecordId';
import type { ControlScheduleDto, ReportDto } from '../modal/reports';
import { isMoodleReport } from './reportSource';

export function normalizeTopics(topics: unknown): string[] {
  if (Array.isArray(topics)) {
    return topics.map(String);
  }
  if (typeof topics === 'string') {
    try {
      const parsed = JSON.parse(topics);
      if (Array.isArray(parsed)) {
        return parsed.map(String);
      }
    } catch {
      return [topics];
    }
  }
  return [];
}

export function splitTopics(text: string): string[] {
  const s = (text ?? '').trim();
  if (s) {
    const parts = s
      .split(/,\s*(?=Тема\s*\d+\.)/g)
      .map((x) => x.trim())
      .filter(Boolean);
    return parts.length > 0 ? parts : [s];
  }
  return [];
}

/**
 * Число «ячеек» работ по графику для каждой группы (как на странице дисциплины).
 */
export function buildTopicRowCountByGroup(
  controls: ControlScheduleDto[],
  visibleControlTypes: string[] | null | undefined,
  displayedTopicsByControlType: Record<string, string[] | undefined> | undefined
): Record<string, number> {
  const map: Record<string, number> = {};
  const ctrls = [...(controls ?? [])];
  const visibleSet =
    visibleControlTypes == null
      ? null
      : new Set(
          (visibleControlTypes ?? []).map((s) => String(s).trim().toLowerCase())
        );

  for (const c of ctrls) {
    const group = String(c.groupName ?? '').trim();
    if (group.length === 0) {
      continue;
    }

    const ct = String(c.controlText ?? '').trim();
    if (visibleSet !== null && !visibleSet.has(ct.toLowerCase())) {
      continue;
    }

    let topics = normalizeTopics(c.topics).flatMap((t) => splitTopics(String(t)));
    const allowedTopics = displayedTopicsByControlType?.[ct];
    if (allowedTopics !== undefined) {
      if (allowedTopics.length > 0) {
        const allowedSet = new Set(allowedTopics.map((s) => s.trim()));
        topics = topics.filter((t) => allowedSet.has(String(t).trim()));
      } else {
        topics = [];
      }
    }

    if (topics.length > 0) {
      map[group] = (map[group] ?? 0) + topics.length;
    }
  }
  return map;
}

export function computeExpectedWorksTotal(
  studentsByGroup: Record<string, unknown[]>,
  topicRowCountByGroup: Record<string, number>
): number {
  let total = 0;
  for (const [group, students] of Object.entries(studentsByGroup)) {
    const count = topicRowCountByGroup[group] ?? 0;
    total += (students?.length ?? 0) * count;
  }
  return total;
}

export function computeUploadedWorkSlots(reports: ReportDto[]): number {
  const uploadedSet = new Set<string>();
  for (const r of reports ?? []) {
    uploadedSet.add(`${r.studentId}_${r.topic ?? ''}`);
  }
  return uploadedSet.size;
}

/** Уникальные «ячейки» работ, отмеченные как Moodle (тот же ключ, что у computeUploadedWorkSlots). */
export function computeUploadedMoodleWorkSlots(reports: ReportDto[]): number {
  const set = new Set<string>();
  for (const r of reports ?? []) {
    if (!isMoodleReport(r)) continue;
    set.add(`${r.studentId}_${r.topic ?? ''}`);
  }
  return set.size;
}

export function mergeStudentsByGroupDedupe(lists: unknown[][]): Record<string, unknown[]> {
  const byGroup = new Map<string, Map<number, unknown>>();
  for (const list of lists) {
    for (const s of list ?? []) {
      const o = s as Record<string, unknown>;
      const group = String(o.groupName ?? o.group ?? '').trim();
      if (!group) {
        continue;
      }
      const id = getStudentRecordId(s);
      if (!byGroup.has(group)) {
        byGroup.set(group, new Map());
      }
      if (id > 0) {
        byGroup.get(group)!.set(id, s);
      }
    }
  }
  const out: Record<string, unknown[]> = {};
  for (const [g, m] of byGroup) {
    out[g] = [...m.values()];
  }
  return out;
}

export function mergeControlSchedules(lists: ControlScheduleDto[][]): ControlScheduleDto[] {
  const seen = new Set<string>();
  const out: ControlScheduleDto[] = [];
  for (const list of lists) {
    for (const c of list ?? []) {
      const key = `${String(c.groupName ?? '').trim()}|${String(c.controlText ?? '').trim()}|${JSON.stringify(c.topics ?? '')}`;
      if (!seen.has(key)) {
        seen.add(key);
        out.push(c);
      }
    }
  }
  return out;
}
