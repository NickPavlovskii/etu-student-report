import { ref, computed, unref, type Ref } from 'vue';
import {
  getDisciplineCards,
  getDisciplineGroups,
  getDisciplineReports,
  getDisciplineStudents,
  getTeacherGroups,
} from '@/api/disciplinesCard';
import { useAcademicYear } from '@/composables/useAcademicYear';
import type { ReportDto } from '../modal/reports';
import { sanitizeTitle } from '@/utils/sanitizeTitle';
import { getStudentRecordId } from '@/utils/studentRecordId';

export { sanitizeTitle };
export type DisciplineReportRow = ReportDto & {
  controlType?: string | null;
};

export interface DisciplineCardDto {
  planRowId?: number;
  plan_row_id?: number;
  disciplineName?: string;
  discipline_name?: string;
  course?: string | null;
  semester?: string | null;
  hasExam?: boolean;
  has_exam?: boolean;
  hasPassMark?: boolean;
  has_pass_mark?: boolean;
  hasPass?: boolean;
  has_pass?: boolean;
  groupsCount?: number;
  groups_count?: number;
  educationForm?: string | null;
  education_form?: string | null;
  educationLevel?: string | null;
  education_level?: string | null;
}

interface DisciplineAggregate {
  CodeRow: number;
  planRowIds: number[];
  Discipline: string;
  Course: string | null;
  Semester: string | null;
  hasExam: boolean;
  hasPassMark: boolean;
  hasPass: boolean;
  groupsCount: number;
  educationForm: string | null;
  educationLevel: string | null;
}

function toArray(res: unknown): unknown[] {
  if (Array.isArray(res)) return res.filter(Boolean);
  if (res && typeof res === 'object') {
    const o = res as Record<string, unknown>;
    const keys = [
      'data',
      'items',
      'students',
      'reports',
      'cards',
      'groups',
    ] as const;
    for (const k of keys) {
      const v = o[k];
      if (Array.isArray(v)) {
        return v.filter(Boolean);
      }
    }
    const dataVal = o.data;
    if (dataVal && typeof dataVal === 'object' && !Array.isArray(dataVal)) {
      const nested = toArray(dataVal);
      if (nested.length > 0) {
        return nested;
      }
    }
  }
  return [];
}

function normalizeGroupLabel(g: unknown): string | null {
  if (typeof g === 'string') {
    const t = g.trim();
    return t || null;
  }
  if (g && typeof g === 'object') {
    const o = g as { groupName?: unknown; name?: unknown; title?: unknown };
    for (const k of ['groupName', 'name', 'title'] as const) {
      const v = o[k];
      if (typeof v === 'string') {
        const t = v.trim();
        if (t) return t;
      }
    }
  }
  return null;
}

function makeReportKey(r: DisciplineReportRow | null | undefined): string {
  const sid = Number(
    (r as { studentId?: unknown; student_id?: unknown })?.studentId ??
      (r as { student_id?: unknown })?.student_id
  );
  return JSON.stringify([
    Number.isFinite(sid) && sid > 0 ? sid : 0,
    (r?.groupName ?? '').trim(),
    (r?.academicYear ?? '').trim(),
    (r?.workType ?? '').trim(),
    (r?.controlType ?? '').trim(),
    (r?.topic ?? '').trim(),
  ]);
}

export function pickLatestReports(
  reports: Iterable<DisciplineReportRow | null | undefined>
) {
  const map = new Map<string, DisciplineReportRow>();
  for (const r of reports ?? []) {
    if (r) {
      const key = makeReportKey(r);
      const prev = map.get(key);
      const isNewer =
        prev === undefined ||
        (Number(r?.version) || 0) > (Number(prev?.version) || 0);
      if (isNewer) {
        map.set(key, r);
      }
    }
  }
  return [...map.values()];
}

export function useDisciplines(
  filteredDisciplines?: Ref<unknown[]> | unknown[]
) {
  const { academicYear } = useAcademicYear();
  const loading = ref(false);
  const cards = ref<DisciplineCardDto[]>([]);
  const groups = ref<unknown[]>([]);
  const reportsByPlanRowId = ref<Record<number, DisciplineReportRow[]>>({});
  const groupsByPlanRowId = ref<Record<number, string[]>>({});
  const studentsByPlanRowId = ref<Record<number, unknown[]>>({});

  async function loadData(user: { lastName?: string }) {
    if (user?.lastName) {
      loading.value = true;
      try {
        const year = academicYear.value;
        const cardsRes = await getDisciplineCards(user.lastName, year);
        cards.value = toArray(cardsRes) as DisciplineCardDto[];

        const planIds = [
          ...new Set(
            cards.value
              .map((c) => Number(c?.planRowId ?? c?.plan_row_id))
              .filter((n) => Number.isFinite(n) && n > 0)
          ),
        ];

        const [groupsRes, pairs] = await Promise.all([
          getTeacherGroups(user.lastName, year),
          Promise.all(
            planIds.map(async (id) => {
              const [reports, students, groupsLocal] = await Promise.all([
                getDisciplineReports(user.lastName, id, year).catch(() => []),
                getDisciplineStudents(user.lastName, id, year).catch(() => []),
                getDisciplineGroups(user.lastName, id, year).catch(() => []),
              ]);
              const rawGroups = toArray(groupsLocal);
              const groupNames = rawGroups
                .map((g) => normalizeGroupLabel(g))
                .filter((s): s is string => Boolean(s));
              return [
                id,
                {
                  reports: toArray(reports) as DisciplineReportRow[],
                  students: toArray(students),
                  groups: groupNames,
                },
              ] as const;
            })
          ),
        ]);

        groups.value = toArray(groupsRes);

        reportsByPlanRowId.value = Object.fromEntries(
          pairs.map(([id, v]) => [id, v.reports])
        );
        studentsByPlanRowId.value = Object.fromEntries(
          pairs.map(([id, v]) => [id, v.students])
        );
        groupsByPlanRowId.value = Object.fromEntries(
          pairs.map(([id, v]) => [id, v.groups])
        );
      } catch (e) {
        console.error('[useDisciplines] loadData error:', e);
      } finally {
        loading.value = false;
      }
    }
  }

  const latestReportsByPlanRowId = computed(() => {
    const result: Record<number, DisciplineReportRow[]> = {};
    for (const [id, reports] of Object.entries(reportsByPlanRowId.value)) {
      result[Number(id)] = pickLatestReports(reports ?? []);
    }
    return result;
  });

  const uniqueDisciplines = computed(() => {
    const map = new Map<string, DisciplineAggregate>();

    for (const c of cards.value) {
      const discipline = String(
        c?.disciplineName ?? c?.discipline_name ?? ''
      ).trim();
      if (discipline) {
        const course = c?.course ?? null;
        const sem = c?.semester ?? null;
        const key = `${discipline}__${course}__${sem}`;

        const planId = Number(c.planRowId ?? c.plan_row_id ?? 0);

        if (map.has(key)) {
          const item = map.get(key)!;
          if (!Array.isArray(item.planRowIds)) {
            const first = Number(item.CodeRow);
            item.planRowIds = first > 0 ? [first] : [];
          }
          item.groupsCount = Math.max(
            item.groupsCount,
            Number(c.groupsCount ?? c.groups_count ?? 0)
          );
          if (planId > 0 && !item.planRowIds.includes(planId)) {
            item.planRowIds.push(planId);
          }
          item.hasExam = item.hasExam || !!c.hasExam;
          item.hasPassMark = item.hasPassMark || !!c.hasPassMark;
          item.hasPass = item.hasPass || !!c.hasPass;
          if (c?.educationForm && item.educationForm === undefined) {
            item.educationForm = c.educationForm;
          }
          if (c?.educationLevel && item.educationLevel === undefined) {
            item.educationLevel = c.educationLevel;
          }
        } else {
          map.set(key, {
            CodeRow: planId,
            planRowIds: planId > 0 ? [planId] : [],
            Discipline: discipline,
            Course: course,
            Semester: sem,
            hasExam: !!(c.hasExam ?? c.has_exam),
            hasPassMark: !!(c.hasPassMark ?? c.has_pass_mark),
            hasPass: !!(c.hasPass ?? c.has_pass),
            groupsCount: Number(c.groupsCount ?? c.groups_count ?? 0),
            educationForm: c?.educationForm ?? c?.education_form ?? null,
            educationLevel: c?.educationLevel ?? c?.education_level ?? null,
          });
        }
      }
    }

    const byPlan = latestReportsByPlanRowId.value;

    return [...map.values()].map((x) => {
      const planId = Number(x.CodeRow);
      const ids: number[] =
        Array.isArray(x.planRowIds) && x.planRowIds.length
          ? x.planRowIds
          : planId > 0
            ? [planId]
            : [];

      const reportsMerged = ids.flatMap((id) => byPlan[id] ?? []);
      const latestReports = pickLatestReports(reportsMerged);
      const loadedCount = latestReports.length;

      const studentsNested = ids.map(
        (id) => studentsByPlanRowId.value?.[id] ?? []
      );
      const studentsUnique = new Map<number, unknown>();
      for (const list of studentsNested) {
        for (const s of list) {
          const sid = getStudentRecordId(s);
          if (sid > 0 && !studentsUnique.has(sid)) {
            studentsUnique.set(sid, s);
          }
        }
      }
      const totalStudents = studentsUnique.size;

      const studentsWithReports = new Set(
        latestReports
          .map((r) =>
            Number(
              (r as { studentId?: unknown; student_id?: unknown })?.studentId ??
                (r as { student_id?: unknown })?.student_id
            )
          )
          .filter((n) => Number.isFinite(n) && n > 0)
      );
      const progress =
        totalStudents === 0
          ? 0
          : Math.round((studentsWithReports.size / totalStudents) * 100);

      const groupsMerged = [
        ...new Set(ids.flatMap((id) => groupsByPlanRowId.value?.[id] ?? [])),
      ].sort((a, b) => String(a).localeCompare(String(b), 'ru'));

      return {
        CodeRow: x.CodeRow,
        _key: `${x.Discipline}__${x.Course}__${x.Semester}`,
        Discipline: x.Discipline,
        Course: x.Course,
        Semester: x.Semester,
        Assessment: x.hasExam
          ? 'Экзамен'
          : x.hasPassMark
            ? 'Зачёт с оценкой'
            : x.hasPass
              ? 'Зачёт'
              : '—',
        groupsCount: x.groupsCount,
        groups: groupsMerged,
        loadedCount,
        totalStudents,
        loaded: `${loadedCount} / ${totalStudents}`,
        progress,
        educationForm: x.educationForm ?? null,
        educationLevel: x.educationLevel ?? null,
      };
    });
  });

  const uniqueSemesters = computed(() => [
    ...new Set(uniqueDisciplines.value.map((d) => d.Semester).filter(Boolean)),
  ]);

  const totalGroups = computed(() =>
    Array.isArray(groups.value) ? groups.value.length : 0
  );

  const totalWorksStats = computed(() => {
    const list = unref(filteredDisciplines);
    const rows = Array.isArray(list) ? list : [];
    let uploaded = 0;
    let total = 0;
    for (const d of rows) {
      const row = d as { loadedCount?: number; totalStudents?: number };
      uploaded += row.loadedCount ?? 0;
      total += row.totalStudents ?? 0;
    }
    return { uploaded, total };
  });

  return {
    loading,
    loadData,
    uniqueDisciplines,
    uniqueSemesters,
    totalGroups,
    totalWorksStats,
  };
}
