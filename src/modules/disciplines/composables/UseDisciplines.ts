import { ref, computed } from 'vue';
import {
  getDisciplineCards,
  getDisciplineGroups,
  getDisciplineReports,
  getDisciplineStudents,
  getTeacherGroups,
} from '@/api/disciplinesCard';
import { useAcademicYear } from '@/composables/useAcademicYear';
import { sanitizeTitle } from '@/utils/sanitizeTitle';

export { sanitizeTitle };

function toArray(res) {
  const raw = Array.isArray(res) ? res : (res?.data ?? res?.cards ?? []);
  return Array.isArray(raw) ? raw.filter(Boolean) : [];
}

function makeReportKey(r) {
  return [
    Number(r?.studentId) || 0,
    String(r?.groupName ?? '').trim(),
    String(r?.academicYear ?? '').trim(),
    String(r?.workType ?? '').trim(),
    String(r?.controlType ?? '').trim(),
    String(r?.topic ?? '').trim(),
  ].join('__');
}

export function pickLatestReports(reports) {
  const map = new Map();
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

export function useDisciplines(filteredDisciplines) {
  const { academicYear } = useAcademicYear();
  const loading = ref(false);
  const cards = ref([]);
  const groups = ref([]);
  const reportsByPlanRowId = ref({});
  const groupsByPlanRowId = ref({});
  const studentsByPlanRowId = ref({});

  async function loadData(user) {
    if (user?.lastName) {
      loading.value = true;
      try {
        const year = academicYear.value;
        const [cardsRes, groupsRes] = await Promise.all([
          getDisciplineCards(user.lastName, year),
          getTeacherGroups(user.lastName, year),
        ]);

        cards.value = toArray(cardsRes);
        groups.value = toArray(groupsRes);

        const planIds = [
          ...new Set(
            cards.value
              .map((c) => Number(c?.planRowId))
              .filter((n) => Number.isFinite(n) && n > 0)
          ),
        ];

        const pairs = await Promise.all(
          planIds.map(async (id) => {
            const [reports, students, groupsRes] = await Promise.all([
              getDisciplineReports(user.lastName, id, year).catch(() => []),
              getDisciplineStudents(user.lastName, id, year).catch(() => []),
              getDisciplineGroups(user.lastName, id, year).catch(() => []),
            ]);
            const rawGroups = toArray(groupsRes);
            const groupNames = rawGroups.map((g) =>
              typeof g === 'string' ? g : (g?.groupName ?? g?.name ?? g?.title ?? String(g ?? '')).trim()
            ).filter(Boolean);
            return [
              id,
              {
                reports: toArray(reports),
                students: toArray(students),
                groups: groupNames,
              },
            ];
          })
        );

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

  const uniqueDisciplines = computed(() => {
    const map = new Map();

    for (const c of cards.value) {
      const discipline = String(
        c?.disciplineName ?? c?.discipline_name ?? ''
      ).trim();
      if (discipline) {
        const course = c?.course ?? null;
        const sem = c?.semester ?? null;
        const key = `${discipline}__${course}__${sem}`;

        if (map.has(key)) {
          const item = map.get(key);
          item.groupsCount = Math.max(
            item.groupsCount,
            Number(c.groupsCount ?? c.groups_count ?? 0)
          );
          item.hasExam ||= !!c.hasExam;
          item.hasPassMark ||= !!c.hasPassMark;
          item.hasPass ||= !!c.hasPass;
          if (c?.educationForm && item.educationForm === undefined) {
            item.educationForm = c.educationForm;
          }
          if (c?.educationLevel && item.educationLevel === undefined) {
            item.educationLevel = c.educationLevel;
          }
        } else {
          map.set(key, {
          CodeRow: Number(c.planRowId ?? c.plan_row_id ?? 0),
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

    return [...map.values()].map((x) => {
      const planId = Number(x.CodeRow);
      const reportsAll = reportsByPlanRowId.value?.[planId] ?? [];
      const students = studentsByPlanRowId.value?.[planId] ?? [];
      const totalStudents = students.length;
      const latestReports = pickLatestReports(reportsAll);
      const loadedCount = latestReports.length;
      const studentsWithReports = new Set(
        latestReports
          .map((r) => Number(r?.studentId))
          .filter((n) => Number.isFinite(n) && n > 0)
      );
      const progress =
        totalStudents === 0
          ? 0
          : Math.round((studentsWithReports.size / totalStudents) * 100);
      const groupsList = groupsByPlanRowId.value?.[planId] ?? [];

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
        groups: groupsList,
        groupsCount: x.groupsCount,
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
    let uploaded = 0;
    let total = 0;
    for (const d of filteredDisciplines.value ?? []) {
      uploaded += d.loadedCount ?? 0;
      total += d.totalStudents ?? 0;
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
