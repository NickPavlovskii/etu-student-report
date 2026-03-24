import type { Ref } from 'vue';
import { computed } from 'vue';
import type { ControlScheduleDto, ReportDto } from '../modal/reports';
import type { StudentInGroupRow } from '../modal/uploadWorkModal';

function normalizeTopics(topics: unknown): string[] {
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

function splitTopics(text: string): string[] {
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

export type DisciplineWorksStats = { uploaded: number; total: number };

export function useDisciplineWorksStats(
  studentsByGroup: Ref<Record<string, StudentInGroupRow[]>>,
  reports: Ref<ReportDto[]>,
  controls: Ref<ControlScheduleDto[]>,
  visibleControlTypes?: Ref<string[] | undefined>,
  displayedTopicsByControlType?: Ref<Record<string, string[] | undefined>>
) {
  const topicRowCountByGroup = computed<Record<string, number>>(() => {
    const map: Record<string, number> = {};
    const ctrls = [...(controls.value ?? [])];
    const visibleSet =
      visibleControlTypes?.value == null
        ? null
        : new Set(
            (visibleControlTypes.value ?? []).map((s) =>
              String(s).trim().toLowerCase()
            )
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

      let topics = normalizeTopics(c.topics).flatMap((t) =>
        splitTopics(String(t))
      );
      const allowedTopics = displayedTopicsByControlType?.value?.[ct];
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
  });

  const disciplineWorksStats = computed<DisciplineWorksStats>(() => {
    let total = 0;
    for (const [group, students] of Object.entries(studentsByGroup.value)) {
      const count = topicRowCountByGroup.value[group] ?? 0;
      total += (students?.length ?? 0) * count;
    }
    const uploadedSet = new Set<string>();
    for (const r of reports.value ?? []) {
      uploadedSet.add(`${r.studentId}_${r.topic ?? ''}`);
    }
    return { uploaded: uploadedSet.size, total };
  });

  return { disciplineWorksStats };
}
