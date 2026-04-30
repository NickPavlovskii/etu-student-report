import { ref } from 'vue';
import type { DisciplineTeacherAssignmentDto, TeacherDto } from '@/api/types';
import {
  deleteDisciplineTeacherAssignment,
  getAdminTeachers,
  getDisciplineTeacherAssignments,
  putDisciplineTeacherAssignment,
} from '@/api/info';

function messageFromError(e: unknown): string {
  if (e && typeof e === 'object' && 'response' in e) {
    const r = (e as { response?: { data?: unknown } }).response;
    const d = r?.data;
    if (typeof d === 'string') {
      return d;
    }
    if (d && typeof d === 'object' && 'message' in d) {
      const m = (d as { message?: unknown }).message;
      if (typeof m === 'string') {
        return m;
      }
    }
  }
  if (e instanceof Error) {
    return e.message;
  }
  return 'Не удалось выполнить запрос';
}

export function useAdminDisciplineAssignments() {
  const assignments = ref<DisciplineTeacherAssignmentDto[]>([]);
  const teachers = ref<TeacherDto[]>([]);
  const assignmentsLoading = ref(false);
  const teachersLoading = ref(false);
  const assignmentsSearch = ref('');
  const error = ref<string | null>(null);
  const rowSaving = ref<Record<number, boolean>>({});

  let searchDebounce: ReturnType<typeof setTimeout> | null = null;

  async function loadTeachers() {
    teachersLoading.value = true;
    try {
      teachers.value = await getAdminTeachers();
    } finally {
      teachersLoading.value = false;
    }
  }

  async function loadAssignments() {
    assignmentsLoading.value = true;
    error.value = null;
    try {
      assignments.value = await getDisciplineTeacherAssignments(
        assignmentsSearch.value.trim() || undefined
      );
    } catch (e: unknown) {
      error.value = messageFromError(e);
      assignments.value = [];
    } finally {
      assignmentsLoading.value = false;
    }
  }

  function debouncedLoadAssignments() {
    if (searchDebounce) {
      clearTimeout(searchDebounce);
    }
    searchDebounce = setTimeout(() => {
      void loadAssignments();
    }, 350);
  }

  async function loadTab() {
    await Promise.all([loadTeachers(), loadAssignments()]);
  }

  async function saveAssignment(
    planRowId: number,
    teacher: TeacherDto,
    updatedBy: string
  ) {
    rowSaving.value = { ...rowSaving.value, [planRowId]: true };
    try {
      await putDisciplineTeacherAssignment(planRowId, {
        actualLastName: teacher.lastName,
        actualFirstName: teacher.firstName,
        actualPatronymic: teacher.patronymic,
        updatedBy,
      });
      await loadAssignments();
    } finally {
      const { [planRowId]: _r, ...rest } = rowSaving.value;
      rowSaving.value = rest;
    }
  }

  async function resetAssignment(planRowId: number, actor?: string) {
    rowSaving.value = { ...rowSaving.value, [planRowId]: true };
    try {
      await deleteDisciplineTeacherAssignment(planRowId, actor);
      await loadAssignments();
    } finally {
      const { [planRowId]: _r, ...rest } = rowSaving.value;
      rowSaving.value = rest;
    }
  }

  function isRowSaving(planRowId: number) {
    return Boolean(rowSaving.value[planRowId]);
  }

  return {
    assignments,
    teachers,
    assignmentsLoading,
    teachersLoading,
    assignmentsSearch,
    error,
    loadTab,
    loadAssignments,
    loadTeachers,
    debouncedLoadAssignments,
    saveAssignment,
    resetAssignment,
    isRowSaving,
  };
}
