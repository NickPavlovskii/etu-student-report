import { ref, computed, unref, type Ref } from 'vue';
import {
  getDisciplineCards,
  getDisciplineControls,
  getDisciplineGroups,
  getDisciplineMoodleLinks,
  getDisciplineReports,
  getDisciplineStudents,
  getDisciplineTeacherAssignments,
} from '@/api/info';
import type {
  DisciplineTeacherAssignmentDto,
  MoodleDisciplineLinkDto,
} from '@/api/types';
import {
  assignmentByPlanRowId,
  effectiveActualLastName,
  normTeacherLast,
  planTeacherFioFromAssignment,
  reportApiLastNameForPlanRow,
} from '../utils/disciplineTeacherAssignments';
import { useAcademicYear } from '@/composables/useAcademicYear';
import type { DisciplineAggregate, DisciplineCardDto } from '../modal/disciplineCard';
import type { ControlScheduleDto, ReportDto } from '../modal/reports';
import {
  buildTopicRowCountByGroup,
  computeExpectedWorksTotal,
  computeUploadedMoodleWorkSlots,
  computeUploadedWorkSlots,
  mergeControlSchedules,
  mergeStudentsByGroupDedupe,
} from '../utils/disciplineWorksPlan';
import { sanitizeTitle } from '@/utils/sanitizeTitle';
import { getStudentRecordId } from '@/utils/studentRecordId';

export { sanitizeTitle };
export type DisciplineReportRow = ReportDto & {
  controlType?: string | null;
};

export type { DisciplineCardDto };

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

function normalizeAcademicYear(raw: string): string {
  return String(raw ?? '').trim().replace(/\//g, '-');
}

function mergeReportsWithMoodleLinks(
  apiReports: DisciplineReportRow[],
  moodleLinks: MoodleDisciplineLinkDto[],
  studentsList: unknown[],
  planRowId: number,
  teacherLastName: string,
  currentAcademicYear: string
): DisciplineReportRow[] {
  const base = [...(apiReports ?? [])];
  if (!moodleLinks?.length || !studentsList?.length) return base;

  const normalizedCurrentYear = normalizeAcademicYear(currentAcademicYear);
  const studentsByGroupMap = new Map<string, number[]>();
  for (const s of studentsList ?? []) {
    const o = s as Record<string, unknown>;
    const group = String(o.groupName ?? o.group ?? '').trim();
    const sid = getStudentRecordId(s);
    if (!group || sid <= 0) continue;
    const list = studentsByGroupMap.get(group) ?? [];
    list.push(sid);
    studentsByGroupMap.set(group, list);
  }

  let virtualId = -1;
  for (const link of moodleLinks) {
    const linkYear = normalizeAcademicYear(link.academicYear);
    if (normalizedCurrentYear && linkYear && linkYear !== normalizedCurrentYear) {
      continue;
    }
    const groupName = String(link.groupName ?? '').trim();
    const topic = String(link.topic ?? '').trim();
    const moodleUrl = String(link.moodleUrl ?? '').trim();
    if (!groupName || !topic || !moodleUrl) continue;

    const studentIds = studentsByGroupMap.get(groupName) ?? [];
    for (const studentId of studentIds) {
      base.push({
        id: virtualId--,
        planRowId,
        studentId,
        groupName,
        teacherLastName,
        topic,
        workType: String(link.controlType ?? '').trim() || 'Moodle',
        controlType: String(link.controlType ?? '').trim() || 'Moodle',
        workTitle: String(link.controlType ?? '').trim() || topic,
        academicYear: currentAcademicYear,
        uploadDate: null,
        version: 0,
        check: null,
        status: 'В Moodle',
        uploadedBy: String(link.updatedBy ?? '').trim() || 'moodle-link',
        fileName: '',
        moodleUrl,
        storageType: 'moodle',
      } as DisciplineReportRow);
    }
  }

  return base;
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
  const reportsByPlanRowId = ref<Record<number, DisciplineReportRow[]>>({});
  const groupsByPlanRowId = ref<Record<number, string[]>>({});
  const studentsByPlanRowId = ref<Record<number, unknown[]>>({});
  const controlsByPlanRowId = ref<Record<number, ControlScheduleDto[]>>({});
  /** Фамилия в URL /teachers/{ln}/discipline/{id}/… для каждой строки плана */
  const planRowApiPathLastName = ref<Record<number, string>>({});
  /** ФИО по плану — для подсказки при переданной нагрузке другого преподавателя */
  const planRowPlanTeacherFio = ref<Record<number, string>>({});
  const listViewerLastName = ref('');

  async function loadData(user: { lastName?: string }) {
    const ln = (user?.lastName ?? '').trim();
    if (ln) {
      loading.value = true;
      try {
        const year = academicYear.value;

        let assignments: DisciplineTeacherAssignmentDto[] | null = null;
        try {
          assignments = await getDisciplineTeacherAssignments();
        } catch {
          assignments = null;
        }
        const byPlan = assignmentByPlanRowId(assignments);
        const normMe = normTeacherLast(ln);

        const cardsRes = await getDisciplineCards(ln, year);
        let mergedCards = toArray(cardsRes) as DisciplineCardDto[];

        if (assignments?.length) {
          mergedCards = mergedCards.filter((c) => {
            const pid = Number(c?.planRowId ?? c?.plan_row_id);
            if (!Number.isFinite(pid) || pid <= 0) {
              return true;
            }
            const a = byPlan.get(pid);
            if (!a) {
              return true;
            }
            return normTeacherLast(effectiveActualLastName(a)) === normMe;
          });

          const extraByPlanLn = new Map<string, Set<number>>();
          for (const a of assignments) {
            if (normTeacherLast(effectiveActualLastName(a)) !== normMe) {
              continue;
            }
            const planLn = (a.planLastName ?? '').trim();
            if (!planLn || normTeacherLast(planLn) === normMe) {
              continue;
            }
            const pid = Number(a.planRowId);
            if (!Number.isFinite(pid) || pid <= 0) {
              continue;
            }
            if (!extraByPlanLn.has(planLn)) {
              extraByPlanLn.set(planLn, new Set());
            }
            extraByPlanLn.get(planLn)!.add(pid);
          }

          const existingIds = new Set(
            mergedCards
              .map((c) => Number(c?.planRowId ?? c?.plan_row_id))
              .filter((n) => Number.isFinite(n) && n > 0)
          );

          for (const [planLn, idSet] of extraByPlanLn) {
            try {
              const otherRes = await getDisciplineCards(planLn, year);
              const other = toArray(otherRes) as DisciplineCardDto[];
              for (const c of other) {
                const pid = Number(c?.planRowId ?? c?.plan_row_id);
                if (idSet.has(pid) && !existingIds.has(pid)) {
                  mergedCards.push(c);
                  existingIds.add(pid);
                }
              }
            } catch {
              /* плановый преподаватель недоступен — пропускаем */
            }
          }
        }

        cards.value = mergedCards;

        listViewerLastName.value = ln;
        const pathMap: Record<number, string> = {};
        const fioMap: Record<number, string> = {};
        for (const c of cards.value) {
          const pid = Number(c.planRowId ?? c.plan_row_id);
          if (!Number.isFinite(pid) || pid <= 0) {
            continue;
          }
          const a = byPlan.get(pid);
          const apiL = (reportApiLastNameForPlanRow(a, ln).trim() || ln);
          pathMap[pid] = apiL;
          if (
            a &&
            normTeacherLast(apiL) !== normTeacherLast(ln)
          ) {
            const hint = planTeacherFioFromAssignment(a);
            if (hint) {
              fioMap[pid] = hint;
            }
          }
        }
        planRowApiPathLastName.value = pathMap;
        planRowPlanTeacherFio.value = fioMap;

        const planIds = [
          ...new Set(
            cards.value
              .map((c) => Number(c?.planRowId ?? c?.plan_row_id))
              .filter((n) => Number.isFinite(n) && n > 0)
          ),
        ];

        const pairs = await Promise.all(
          planIds.map(async (id) => {
            const reportLn = reportApiLastNameForPlanRow(
              byPlan.get(id),
              ln
            ).trim();
            const apiLn = reportLn || ln;
            const [reports, students, groupsLocal, controlsRaw, moodleLinks] =
              await Promise.all([
                getDisciplineReports(apiLn, id, year).catch(() => []),
                getDisciplineStudents(apiLn, id, year).catch(() => []),
                getDisciplineGroups(apiLn, id, year).catch(() => []),
                getDisciplineControls(apiLn, id, year).catch(() => []),
                getDisciplineMoodleLinks(apiLn, id, year).catch(
                  () => [] as MoodleDisciplineLinkDto[]
                ),
              ]);
            const studentsArr = toArray(students);
            const reportsArr = toArray(reports) as DisciplineReportRow[];
            const mergedReports = mergeReportsWithMoodleLinks(
              reportsArr,
              moodleLinks,
              studentsArr,
              id,
              apiLn,
              year
            );
            const rawGroups = toArray(groupsLocal);
            const groupNames = rawGroups
              .map((g) => normalizeGroupLabel(g))
              .filter((s): s is string => Boolean(s));
            return [
              id,
              {
                reports: mergedReports,
                students: studentsArr,
                groups: groupNames,
                controls: toArray(controlsRaw) as ControlScheduleDto[],
              },
            ] as const;
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
        controlsByPlanRowId.value = Object.fromEntries(
          pairs.map(([id, v]) => [id, v.controls])
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
      const card = c as DisciplineCardDto & {
        Course?: string | number | null;
        Semester?: string | number | null;
        EducationForm?: string | null;
        EducationLevel?: string | null;
      };
      const discipline = String(
        card?.disciplineName ?? card?.discipline_name ?? ''
      ).trim();
      if (discipline) {
        const courseRaw = card?.course ?? card?.Course ?? null;
        const semesterRaw = card?.semester ?? card?.Semester ?? null;
        const course =
          courseRaw === null || courseRaw === undefined
            ? null
            : String(courseRaw).trim() || null;
        const sem =
          semesterRaw === null || semesterRaw === undefined
            ? null
            : String(semesterRaw).trim() || null;
        const key = `${discipline}__${course}__${sem}`;

        const planId = Number(card.planRowId ?? card.plan_row_id ?? 0);

        if (map.has(key)) {
          const item = map.get(key)!;
          if (!Array.isArray(item.planRowIds)) {
            const first = Number(item.CodeRow);
            item.planRowIds = first > 0 ? [first] : [];
          }
          item.groupsCount = Math.max(
            item.groupsCount,
            Number(card.groupsCount ?? card.groups_count ?? 0)
          );
          if (planId > 0 && !item.planRowIds.includes(planId)) {
            item.planRowIds.push(planId);
          }
          item.hasExam = item.hasExam || !!(card.hasExam ?? card.has_exam);
          item.hasPassMark =
            item.hasPassMark || !!(card.hasPassMark ?? card.has_pass_mark);
          item.hasPass = item.hasPass || !!(card.hasPass ?? card.has_pass);
          if (
            (card?.educationForm ?? card?.education_form ?? card?.EducationForm) &&
            item.educationForm === undefined
          ) {
            item.educationForm =
              card.educationForm ?? card.education_form ?? card.EducationForm ?? null;
          }
          if (
            (card?.educationLevel ??
              card?.education_level ??
              card?.EducationLevel) &&
            item.educationLevel === undefined
          ) {
            item.educationLevel =
              card.educationLevel ??
              card.education_level ??
              card.EducationLevel ??
              null;
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
            groupsCount: Number(card.groupsCount ?? card.groups_count ?? 0),
            educationForm:
              card?.educationForm ??
              card?.education_form ??
              card?.EducationForm ??
              null,
            educationLevel:
              card?.educationLevel ??
              card?.education_level ??
              card?.EducationLevel ??
              null,
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

      const studentsByGroupMerged = mergeStudentsByGroupDedupe(studentsNested);
      const controlLists = ids.map(
        (id) => controlsByPlanRowId.value?.[id] ?? []
      );
      const controlsMerged = mergeControlSchedules(controlLists);
      const topicByGroup = buildTopicRowCountByGroup(
        controlsMerged,
        undefined,
        undefined
      );
      const expectedWorksTotal = computeExpectedWorksTotal(
        studentsByGroupMerged,
        topicByGroup
      );
      const uploadedWorks = computeUploadedWorkSlots(
        latestReports as unknown as ReportDto[]
      );
      const uploadedMoodleWorks = computeUploadedMoodleWorkSlots(
        latestReports as unknown as ReportDto[]
      );

      const progress =
        expectedWorksTotal > 0
          ? Math.round(
              Math.min(100, (uploadedWorks / expectedWorksTotal) * 100)
            )
          : totalStudents === 0
            ? 0
            : Math.round((studentsWithReports.size / totalStudents) * 100);

      const loadedDisplay =
        expectedWorksTotal > 0
          ? `${uploadedWorks} / ${expectedWorksTotal}`
          : `${loadedCount} / ${totalStudents}`;

      const groupsMerged = [
        ...new Set(ids.flatMap((id) => groupsByPlanRowId.value?.[id] ?? [])),
      ].sort((a, b) => String(a).localeCompare(String(b), 'ru'));

      const repPid =
        ids.length > 0 ? ids[0]! : planId > 0 ? planId : 0;
      const apiLn =
        repPid > 0
          ? planRowApiPathLastName.value[repPid] ?? listViewerLastName.value
          : listViewerLastName.value;
      const planFioHint =
        repPid > 0 ? planRowPlanTeacherFio.value[repPid] ?? '' : '';

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
        uploadedWorks,
        uploadedMoodleWorks,
        expectedWorksTotal,
        loaded: loadedDisplay,
        progress,
        educationForm: x.educationForm ?? null,
        educationLevel: x.educationLevel ?? null,
        planTeacherLastNameForApi: apiLn,
        planTeacherFromPlanFio: planFioHint,
      };
    });
  });

  const uniqueSemesters = computed(() => [
    ...new Set(uniqueDisciplines.value.map((d) => d.Semester).filter(Boolean)),
  ]);

  /** По выбранному семестру / курсам / поиску — сумма `groupsCount` по видимым дисциплинам (как на карточках). */
  const totalGroups = computed(() => {
    const list = unref(filteredDisciplines);
    const rows = Array.isArray(list) ? list : [];
    let n = 0;
    for (const d of rows) {
      const gc = Number((d as { groupsCount?: number }).groupsCount ?? 0);
      if (gc > 0) n += gc;
    }
    return n;
  });

  const totalWorksStats = computed(() => {
    const list = unref(filteredDisciplines);
    const rows = Array.isArray(list) ? list : [];
    let uploaded = 0;
    let total = 0;
    for (const d of rows) {
      const row = d as {
        uploadedWorks?: number;
        expectedWorksTotal?: number;
        loadedCount?: number;
        totalStudents?: number;
      };
      if ((row.expectedWorksTotal ?? 0) > 0) {
        uploaded += row.uploadedWorks ?? 0;
        total += row.expectedWorksTotal ?? 0;
      } else {
        uploaded += row.loadedCount ?? 0;
        total += row.totalStudents ?? 0;
      }
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
