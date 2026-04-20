import { ref, computed, type Ref } from 'vue';
import {
  getDisciplineCards,
  getDisciplineGroups,
  getDisciplineReports,
  getDisciplineStudents,
  getDepartmentDisciplinesWithTeachers,
  type DisciplineWithTeacherRowDto,
  type TeacherDto,
} from '@/api/info';
import { useAcademicYear } from '@/composables/useAcademicYear';
import {
  pickLatestReports,
  type DisciplineReportRow,
} from '@/modules/disciplines/composables/useDisciplinesList';
import { getStudentRecordId } from '@/utils/studentRecordId';
import type { AdminDisciplineCardItem } from '../model';

const GROUPS_BATCH = 6;
const STATS_BATCH = 6;

function academicYearToDateRange(
  yearStr: string
): { dateFrom: string; dateTo: string } | undefined {
  if (!yearStr || typeof yearStr !== 'string') {
    return undefined;
  }

  const parts = yearStr
    .trim()
    .split('-')
    .map((s) => parseInt(s, 10));
  const y1 = parts[0];
  if (y1 === undefined || !Number.isFinite(y1)) {
    return undefined;
  }

  const y2 = parts.length > 1 && Number.isFinite(parts[1]) ? parts[1]! : y1 + 1;
  return { dateFrom: `${y1}-09-01`, dateTo: `${y2}-08-31` };
}

function parseGroupNames(raw: unknown): string[] {
  const arr = Array.isArray(raw) ? raw : [];
  const names = arr
    .map((g) => {
      if (typeof g === 'string') {
        return g.trim();
      }
      const o = g as Record<string, unknown>;
      return String(o?.groupName ?? o?.name ?? o?.title ?? '').trim();
    })
    .filter(Boolean);
  return [...new Set(names)].sort((a, b) => a.localeCompare(b, 'ru'));
}

function normalizeDisciplineCardsResponse(
  raw: unknown
): Record<string, unknown>[] {
  if (Array.isArray(raw)) {
    return raw.filter(Boolean) as Record<string, unknown>[];
  }
  if (raw && typeof raw === 'object') {
    const o = raw as Record<string, unknown>;
    for (const key of ['cards', 'data'] as const) {
      if (Array.isArray(o[key])) {
        return (o[key] as unknown[]).filter(Boolean) as Record<
          string,
          unknown
        >[];
      }
    }
  }
  return [];
}

function planRowIdFromRaw(value: string | number): number {
  const n = typeof value === 'number' ? value : Number(value);
  return Number.isFinite(n) && n > 0 ? n : 0;
}

function safeNumber(value: unknown, fallback = 0): number {
  const n = Number(value);
  return Number.isFinite(n) ? n : fallback;
}

function computeLoadedAndProgress(
  reportsRaw: unknown,
  studentsRaw: unknown
): { loaded: string; progress: number } {
  const reports = (
    Array.isArray(reportsRaw) ? reportsRaw : []
  ) as DisciplineReportRow[];
  const students = Array.isArray(studentsRaw) ? studentsRaw : [];

  const latestReports = pickLatestReports(reports);

  const uniqueStudents = new Map<number, unknown>();
  for (const s of students) {
    const sid = getStudentRecordId(s);
    if (sid > 0) {
      uniqueStudents.set(sid, s);
    }
  }

  const studentsWithReports = new Set(
    latestReports
      .map((r) => {
        const dto = r as { studentId?: unknown; student_id?: unknown };
        return safeNumber(dto.studentId ?? dto.student_id);
      })
      .filter((n) => n > 0)
  );

  const total = uniqueStudents.size;
  const progress =
    total === 0 ? 0 : Math.round((studentsWithReports.size / total) * 100);

  return { loaded: `${latestReports.length} / ${total}`, progress };
}
async function enrichCardsWithGroups(
  items: AdminDisciplineCardItem[],
  year: string,
  getLastName: (item: AdminDisciplineCardItem) => string
): Promise<AdminDisciplineCardItem[]> {
  const cache = new Map<string, string[]>();

  async function fetchGroups(
    lastName: string,
    planRowId: number
  ): Promise<string[]> {
    const ln = lastName.trim();
    if (!ln || planRowId <= 0) {
      return [];
    }

    const key = `${ln}__${planRowId}`;
    const cached = cache.get(key);
    if (cached) {
      return cached;
    }

    try {
      const res = await getDisciplineGroups(ln, planRowId, year);
      const groups = parseGroupNames(res);
      cache.set(key, groups);
      return groups;
    } catch {
      cache.set(key, []);
      return [];
    }
  }

  const out: AdminDisciplineCardItem[] = [];

  for (let i = 0; i < items.length; i += GROUPS_BATCH) {
    const batch = await Promise.all(
      items.slice(i, i + GROUPS_BATCH).map(async (item) => {
        const planRowId = planRowIdFromRaw(item.codeRow);
        const groups = await fetchGroups(getLastName(item), planRowId);
        return { ...item, groups };
      })
    );
    out.push(...batch);
  }

  return out;
}

async function loadStatsByPlanBatched(
  lastName: string,
  year: string,
  planIds: number[]
): Promise<Map<number, { loaded: string; progress: number }>> {
  const stats = new Map<number, { loaded: string; progress: number }>();

  for (let i = 0; i < planIds.length; i += STATS_BATCH) {
    await Promise.all(
      planIds.slice(i, i + STATS_BATCH).map(async (planRowId) => {
        try {
          const [reports, students] = await Promise.all([
            getDisciplineReports(lastName, planRowId, year),
            getDisciplineStudents(lastName, planRowId, year),
          ]);
          stats.set(planRowId, computeLoadedAndProgress(reports, students));
        } catch {
          stats.set(planRowId, { loaded: '0 / 0', progress: 0 });
        }
      })
    );
  }

  return stats;
}

function extractLastName(
  row: Record<string, unknown>,
  teacherFio: string
): string {
  const fromApi = String(
    row.teacherLastName ?? row.teacher_last_name ?? ''
  ).trim();
  if (fromApi) {
    return fromApi;
  }
  return teacherFio.trim().split(/\s+/)[0] ?? '';
}

function mapDepartmentRowToCard(
  row: DisciplineWithTeacherRowDto & Record<string, unknown>,
  index: number
): AdminDisciplineCardItem {
  const expected = safeNumber(row.expectedCount ?? row.expected_count);
  const uploaded = safeNumber(
    row.uploadedCount ?? row.uploaded_count ?? row.total_works ?? row.totalWorks
  );
  const teacherFio = String(row.teacherFio ?? '').trim();

  return {
    discipline: row.disciplineName || '—',
    codeRow:
      row.planRowId ?? `${row.disciplineName}-${row.teacherFio}-${index}`,
    course: row.course != null && row.course !== '' ? row.course : '—',
    semester: row.semester != null && row.semester !== '' ? row.semester : '—',
    educationLevel: row.educationLevel ?? '',
    educationForm: row.educationForm ?? '',
    loaded: `${uploaded} / ${expected}`,
    progress: expected > 0 ? Math.round((uploaded / expected) * 100) : 0,
    groupsCount: row.groupsCount ?? 0,
    groups: [],
    teacherFio,
    teacherLastName: extractLastName(
      row as Record<string, unknown>,
      teacherFio
    ),
  };
}

function mapTeacherCardToItem(
  c: Record<string, unknown>,
  teacherFio: string,
  teacherLastName: string,
  stats: Map<number, { loaded: string; progress: number }>
): AdminDisciplineCardItem {
  const discipline =
    String(c.disciplineName ?? c.discipline_name ?? '').trim() || '—';
  const planRowId = safeNumber(c.planRowId ?? c.plan_row_id);
  const stat = planRowId > 0 ? stats.get(planRowId) : undefined;

  return {
    discipline,
    codeRow: planRowId || discipline,
    course: String(c.course ?? c.Course ?? '—'),
    semester: String(c.semester ?? c.Semester ?? '—'),
    educationLevel: String(c.educationLevel ?? c.education_level ?? ''),
    educationForm: String(c.educationForm ?? c.education_form ?? ''),
    loaded: stat?.loaded ?? '0 / 0',
    progress: stat?.progress ?? 0,
    groupsCount: safeNumber(c.groupsCount ?? c.groups_count),
    groups: [],
    teacherFio,
    teacherLastName,
  };
}

export function useAdminDisciplines(teachers: Ref<TeacherDto[]>) {
  const { academicYear } = useAcademicYear();

  const disciplineTeacherFilter = ref<string | null>(null);
  const disciplinesByTeacher = ref<AdminDisciplineCardItem[]>([]);
  const disciplinesByTeacherLoading = ref(false);
  const disciplinesByAllTeachers = ref<AdminDisciplineCardItem[]>([]);
  const disciplinesByAllTeachersLoading = ref(false);
  const disciplinesError = ref<string | null>(null);

  const teacherFilterItems = computed(() =>
    teachers.value.map((t) => ({
      title:
        [t.lastName, t.firstName, t.patronymic].filter(Boolean).join(' ') ||
        t.fio ||
        t.lastName,
      value: t.lastName,
    }))
  );

  const disciplineCardItems = computed((): AdminDisciplineCardItem[] =>
    disciplineTeacherFilter.value
      ? disciplinesByTeacher.value
      : disciplinesByAllTeachers.value
  );

  let loadForAllSeq = 0;
  let loadByTeacherSeq = 0;

  function clearDisciplinesError() {
    disciplinesError.value = null;
  }

  function resolveTeacherLastName(item: AdminDisciplineCardItem): string {
    return (
      item.teacherLastName?.trim() ||
      (item.teacherFio ?? '').trim().split(/\s+/)[0] ||
      ''
    );
  }

  async function loadDisciplinesForAllTeachers() {
    const seq = ++loadForAllSeq;
    disciplinesByAllTeachersLoading.value = true;
    disciplinesByAllTeachers.value = [];
    disciplinesError.value = null;

    try {
      const range = academicYearToDateRange(academicYear.value);
      if (!range) {
        disciplinesByAllTeachers.value = [];
        return;
      }
      const rows = await getDepartmentDisciplinesWithTeachers({
        academicYear: academicYear.value,
      });

      const withTeacher = rows.filter(
        (row) => row.teacherFio != null && String(row.teacherFio).trim() !== ''
      );

      const base = withTeacher.map(mapDepartmentRowToCard);

      const enriched = await enrichCardsWithGroups(
        base,
        academicYear.value,
        resolveTeacherLastName
      );

      if (seq !== loadForAllSeq) {
        return;
      }
      disciplinesByAllTeachers.value = enriched;
    } catch {
      if (seq !== loadForAllSeq) {
        return;
      }
      disciplinesByAllTeachers.value = [];
      disciplinesError.value = 'Не удалось загрузить дисциплины кафедры';
    } finally {
      if (seq === loadForAllSeq) {
        disciplinesByAllTeachersLoading.value = false;
      }
    }
  }

  async function loadDisciplinesByTeacher(lastName: string) {
    const seq = ++loadByTeacherSeq;
    disciplinesByTeacherLoading.value = true;
    disciplinesByTeacher.value = [];
    disciplinesError.value = null;

    try {
      const raw = await getDisciplineCards(lastName, academicYear.value);

      const teacher = teachers.value.find((t) => t.lastName === lastName);
      const teacherFio =
        teacher?.fio ||
        [teacher?.lastName, teacher?.firstName, teacher?.patronymic]
          .filter(Boolean)
          .join(' ') ||
        lastName;

      const planIds = [
        ...new Set(
          normalizeDisciplineCardsResponse(raw)
            .map((c) => safeNumber(c.planRowId ?? c.plan_row_id))
            .filter((n) => n > 0)
        ),
      ];

      const stats = await loadStatsByPlanBatched(
        lastName,
        academicYear.value,
        planIds
      );

      const base = normalizeDisciplineCardsResponse(raw).map((c) =>
        mapTeacherCardToItem(c, teacherFio, lastName, stats)
      );

      const enriched = await enrichCardsWithGroups(
        base,
        academicYear.value,
        () => lastName
      );

      if (seq !== loadByTeacherSeq) {
        return;
      }
      disciplinesByTeacher.value = enriched;
    } catch {
      if (seq !== loadByTeacherSeq) {
        return;
      }
      disciplinesByTeacher.value = [];
      disciplinesError.value = 'Не удалось загрузить дисциплины преподавателя';
    } finally {
      if (seq === loadByTeacherSeq) {
        disciplinesByTeacherLoading.value = false;
      }
    }
  }

  function onDisciplineTeacherFilterChange() {
    if (disciplineTeacherFilter.value) {
      loadDisciplinesByTeacher(disciplineTeacherFilter.value);
    } else {
      disciplinesByTeacher.value = [];
      loadDisciplinesForAllTeachers();
    }
  }

  return {
    disciplineTeacherFilter,
    disciplinesByTeacher,
    disciplinesByTeacherLoading,
    disciplinesByAllTeachers,
    disciplinesByAllTeachersLoading,
    disciplinesError,
    clearDisciplinesError,
    teacherFilterItems,
    disciplineCardItems,
    loadDisciplinesByTeacher,
    loadDisciplinesForAllTeachers,
    onDisciplineTeacherFilterChange,
  };
}
