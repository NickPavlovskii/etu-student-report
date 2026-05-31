import type { Ref } from 'vue';
import { ref, computed, watch } from 'vue';
import {
  fetchArchiveReportsForTeacher,
  fetchArchiveReportsAll,
} from '@/api/info';
import { useAcademicYear } from '@/composables/useAcademicYear';
import { useUser } from '@/composables/useUser';
import type { ArchiveReportRow } from '@/modules/archive/model/reports';
import {
  ARCHIVE_TABLE_COLUMNS,
  ARCHIVE_COLUMN_TEACHER,
  ARCHIVE_COLUMN_ACTIONS,
} from '../columns';

function norm(v: unknown) {
  return String(v ?? '')
    .trim()
    .toLowerCase();
}

function inRange(uploadDate: string | null, from: string, to: string): boolean {
  const hasDateFilter = from || to;
  if (hasDateFilter) {
    if (uploadDate) {
      const d = new Date(
        uploadDate.length >= 10 ? uploadDate.slice(0, 10) : uploadDate
      );
      if (Number.isNaN(d.getTime())) {
        return false;
      }
      const fromD = from ? new Date(`${from}T00:00:00`) : null;
      const toD = to ? new Date(`${to}T23:59:59`) : null;
      return (!fromD || d >= fromD) && (!toD || d <= toD);
    }
    return false;
  }
  return true;
}

function normalizeStatus(check: number | null): ArchiveReportRow['status'] {
  return check == null ? 'pending' : check >= 60 ? 'checked' : 'error';
}

function mapReport(r: Record<string, unknown>): ArchiveReportRow {
  const check = (r.check ?? r.checkPercent ?? null) as number | null;
  const topic = String(r.topic ?? '').trim() || '—';
  const workControl = String(r.controlType ?? '').trim();
  return {
    id: Number(r.id),
    studentName: String(r.studentName ?? '—'),
    groupName: String(r.groupName ?? '—'),
    disciplineName: String(r.disciplineName ?? '—'),
    workControl,
    topic,
    uploadDate: (r.uploadDate as string) ?? null,
    uploadedBy: String(r.uploadedBy ?? r.teacherLastName ?? '—'),
    check,
    status: normalizeStatus(check),
    fileName: String(r.fileName ?? 'report'),
  };
}

function uniqSorted(arr: string[]) {
  return Array.from(new Set(arr.filter(Boolean))).sort();
}

function hasWorkType(r: Record<string, unknown>): boolean {
  return String(r.controlType ?? '').trim().length > 0;
}

export function useArchive(filters: {
  search: Ref<string>;
  filterDiscipline: Ref<string>;
  filterGroup: Ref<string>;
  filterWorkType: Ref<string>;
  filterTeacher: Ref<string>;
  dateFrom: Ref<string>;
  dateTo: Ref<string>;
}) {
  const { academicYear } = useAcademicYear();
  const { lastName, fioKey, canSeeAll } = useUser();

  const loading = ref(false);
  const rows = ref<ArchiveReportRow[]>([]);

  async function loadAll() {
    const canLoad = lastName.value || canSeeAll.value;
    if (canLoad) {
      loading.value = true;
      try {
        const year = academicYear.value;
        const data = canSeeAll.value
          ? await fetchArchiveReportsAll(undefined, year)
          : await fetchArchiveReportsForTeacher(lastName.value, year);
        if (import.meta.env.DEV) {
          console.log('[archive/reports] ответ сервера', {
            academicYear: year,
            mode: canSeeAll.value ? 'all' : 'teacher',
            teacherLastName: canSeeAll.value ? undefined : lastName.value,
            raw: data,
          });
        }
        const raw = Array.isArray(data) ? data : [];
        rows.value = raw
          .filter((r) => hasWorkType(r as Record<string, unknown>))
          .map((r) => mapReport(r as Record<string, unknown>));
      } finally {
        loading.value = false;
      }
    }
  }

  watch(academicYear, loadAll);

  const disciplines = computed(() =>
    uniqSorted(rows.value.map((r) => String(r.disciplineName ?? '').trim()))
  );
  const groups = computed(() =>
    uniqSorted(rows.value.map((r) => String(r.groupName ?? '').trim()))
  );
  const teachers = computed(() =>
    uniqSorted(rows.value.map((r) => String(r.uploadedBy ?? '').trim()))
  );
  const workTypes = computed(() =>
    uniqSorted(rows.value.map((r) => String(r.workControl ?? '').trim()))
  );

  const roleFiltered = computed(() => {
    if (canSeeAll.value) {
      return rows.value;
    }
    const mine = fioKey.value;
    return rows.value.filter((r) => String(r.uploadedBy ?? '').trim() === mine);
  });

  const filteredRows = computed(() => {
    const q = filters.search.value.trim().toLowerCase();
    const fd = filters.filterDiscipline.value;
    const fg = filters.filterGroup.value;
    const fwt = filters.filterWorkType.value;
    const ft = filters.filterTeacher.value;
    const df = filters.dateFrom.value;
    const dt = filters.dateTo.value;

    return roleFiltered.value.filter((r) => {
      const matchesSearch =
        !q || norm(r.studentName).includes(q) || norm(r.topic).includes(q);
      if (matchesSearch) {
        if (fd && r.disciplineName !== fd) return false;
        if (fg && r.groupName !== fg) return false;
        if (fwt && r.workControl !== fwt) return false;
        if (canSeeAll.value && ft && r.uploadedBy !== ft) return false;
        return inRange(r.uploadDate, df, dt);
      }
      return false;
    });
  });

  const columns = computed(() => {
    const base = canSeeAll.value
      ? [ARCHIVE_COLUMN_TEACHER, ...ARCHIVE_TABLE_COLUMNS]
      : [...ARCHIVE_TABLE_COLUMNS];
    return [...base, ARCHIVE_COLUMN_ACTIONS];
  });

  return {
    loading,
    rows,
    loadAll,
    disciplines,
    groups,
    workTypes,
    teachers,
    filteredRows,
    columns,
    canSeeAll,
  };
}
