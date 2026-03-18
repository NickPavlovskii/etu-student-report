import { ref, computed, type Ref } from 'vue';
import { getAdminDisciplines } from '@/api/admin';
import { getDisciplineCards } from '@/api/disciplinesCard';
import { getDepartmentDisciplinesWithTeachers } from '@/api/analytics';
import { useAcademicYear } from '@/composables/useAcademicYear';
import type { TeacherDto } from '@/api/admin';

export type AdminDisciplineCardItem = {
  Discipline: string;
  CodeRow: string | number;
  Course: string | number;
  Semester: string | number;
  educationLevel?: string;
  educationForm?: string;
  loaded: number | string;
  progress: number;
  groupsCount: number;
  groups: string[];
  teacherFio?: string;
};

/** Преобразует учебный год "2024-2025" в dateFrom/dateTo (сентябрь — август). Если не удалось распарсить — возвращает undefined (бэкенд возьмёт свой диапазон). */
function academicYearToDateRange(yearStr: string): { dateFrom?: string; dateTo?: string } | undefined {
  if (!yearStr || typeof yearStr !== 'string') return undefined;
  const parts = yearStr.trim().split('-').map((s) => parseInt(s, 10));
  const y1 = parts[0];
  const y2 = parts.length > 1 ? parts[1] : y1;
  if (!Number.isFinite(y1)) return undefined;
  const dateFrom = `${y1}-09-01`;
  const dateTo = `${Number.isFinite(y2) ? y2 : y1 + 1}-08-31`;
  return { dateFrom, dateTo };
}

export function useAdminDisciplines(teachers: Ref<TeacherDto[]>) {
  const { academicYear } = useAcademicYear();
  const disciplines = ref<string[]>([]);
  const disciplinesLoading = ref(false);
  const disciplineTeacherFilter = ref<string | null>(null);
  const disciplinesByTeacher = ref<AdminDisciplineCardItem[]>([]);
  const disciplinesByTeacherLoading = ref(false);
  const disciplinesByAllTeachers = ref<AdminDisciplineCardItem[]>([]);
  const disciplinesByAllTeachersLoading = ref(false);

  const teacherFilterItems = computed(() =>
    teachers.value.map((t) => ({
      title: t.fio || [t.lastName, t.firstName, t.patronymic].filter(Boolean).join(' ') || t.lastName,
      value: t.lastName,
    }))
  );

  const disciplineCardItems = computed((): AdminDisciplineCardItem[] => {
    if (disciplineTeacherFilter.value) {
      return disciplinesByTeacher.value;
    }
    return disciplinesByAllTeachers.value;
  });

  async function loadDisciplines() {
    disciplinesLoading.value = true;
    try {
      disciplines.value = await getAdminDisciplines();
    } catch {
      disciplines.value = [];
    } finally {
      disciplinesLoading.value = false;
    }
  }

  /** Загрузить дисциплины кафедры с ФИО преподавателя через API аналитики (одна карточка на пару дисциплина+преподаватель) */
  async function loadDisciplinesForAllTeachers() {
    disciplinesByAllTeachersLoading.value = true;
    disciplinesByAllTeachers.value = [];
    try {
      const params = academicYearToDateRange(academicYear.value);
      const rows = await getDepartmentDisciplinesWithTeachers(params);
      const withTeacher = rows.filter(
        (row) => row.teacherFio != null && String(row.teacherFio).trim() !== ''
      );
      disciplinesByAllTeachers.value = withTeacher.map((row, index) => {
        const expected = Number(row.expectedCount) || 0;
        const uploaded = Number(row.uploadedCount) || 0;
        const progress = expected > 0 ? Math.round((uploaded / expected) * 100) : 0;
        return {
          Discipline: row.disciplineName || '—',
          CodeRow: row.planRowId ?? `${row.disciplineName}-${row.teacherFio}-${index}`,
          Course: row.course != null && row.course !== '' ? row.course : '—',
          Semester: row.semester != null && row.semester !== '' ? row.semester : '—',
          educationLevel: row.educationLevel ?? '',
          educationForm: row.educationForm ?? '',
          loaded: `${uploaded} / ${expected}`,
          progress,
          groupsCount: row.groupsCount ?? 0,
          groups: [] as string[],
          teacherFio: row.teacherFio,
        } as AdminDisciplineCardItem;
      });
    } catch {
      disciplinesByAllTeachers.value = [];
    } finally {
      disciplinesByAllTeachersLoading.value = false;
    }
  }

  async function loadDisciplinesByTeacher(lastName: string) {
    disciplinesByTeacherLoading.value = true;
    disciplinesByTeacher.value = [];
    try {
      const raw = await getDisciplineCards(lastName, academicYear.value);
      const list = Array.isArray(raw) ? raw : raw?.data ?? raw?.cards ?? [];
      const teacher = teachers.value.find((t) => t.lastName === lastName);
      const teacherFio =
        teacher?.fio ||
        [teacher?.lastName, teacher?.firstName, teacher?.patronymic].filter(Boolean).join(' ') ||
        lastName;
      disciplinesByTeacher.value = list.map((c: Record<string, unknown>) => {
        const discipline = String(c?.disciplineName ?? c?.discipline_name ?? '').trim() || '—';
        const course = c?.course ?? c?.Course ?? '—';
        const semester = c?.semester ?? c?.Semester ?? '—';
        const planRowId = c?.planRowId ?? c?.plan_row_id ?? 0;
        const groupsCount = Number(c?.groupsCount ?? c?.groups_count ?? 0);
        return {
          Discipline: discipline,
          CodeRow: planRowId || discipline,
          Course: course,
          Semester: semester,
          educationLevel: (c?.educationLevel ?? c?.education_level ?? '') as string,
          educationForm: (c?.educationForm ?? c?.education_form ?? '') as string,
          loaded: 0,
          progress: 0,
          groupsCount,
          groups: [] as string[],
          teacherFio,
        } as AdminDisciplineCardItem;
      });
    } catch {
      disciplinesByTeacher.value = [];
    } finally {
      disciplinesByTeacherLoading.value = false;
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
    disciplines,
    disciplinesLoading,
    disciplineTeacherFilter,
    disciplinesByTeacher,
    disciplinesByTeacherLoading,
    disciplinesByAllTeachers,
    disciplinesByAllTeachersLoading,
    teacherFilterItems,
    disciplineCardItems,
    loadDisciplines,
    loadDisciplinesByTeacher,
    loadDisciplinesForAllTeachers,
    onDisciplineTeacherFilterChange,
  };
}
