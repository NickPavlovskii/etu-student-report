<template>
  <div class="students-table-wrap students-reports-panel">
    <etu-data-table
      scrollable
      shadow
      table-min-width="1320px"
      table-class="students-table"
      wrap-class="students-etu-wrap"
      :columns="etuColumns"
      :rows="[]"
      :show-skeleton="false"
    >
      <template #colgroup>
        <colgroup>
          <col
            v-for="col in STUDENTS_TABLE_COLUMNS"
            :key="col.key"
            :class="col.class"
          />
        </colgroup>
      </template>

      <template #tbody>
        <template
          v-for="(students, group) in studentsByGroup"
          :key="group"
        >
          <tr
            class="group-row"
            @click="toggleGroup(group)"
          >
            <td class="col-expand">
              <v-icon size="18">
                {{
                  openedGroups[group]?.opened
                    ? 'mdi-chevron-down'
                    : 'mdi-chevron-right'
                }}
              </v-icon>
            </td>
            <td colspan="7">
              Группа {{ group }} · {{ students.length }} студентов
            </td>
            <td class="group-stats-cell">
              <span
                :class="[
                  'upload-stat',
                  groupUploadStatsByGroup[group]?.isFull ? 'stat-full' : '',
                ]"
              >
                {{ groupUploadStatsByGroup[group]?.uploaded ?? 0 }} /
                {{ groupUploadStatsByGroup[group]?.total ?? 0 }}
              </span>
            </td>
          </tr>

          <template
            v-for="(student, studentIndex) in students"
            :key="getStudentKey(group, student, studentIndex)"
          >
            <tr
              v-show="openedGroups[group]?.opened"
              class="student-row"
            >
              <td class="col-expand td-expand-indent">
                <v-icon
                  class="expand-icon"
                  size="18"
                  @click.stop="toggleStudent(group, getStudentId(student))"
                >
                  {{ studentRowExpandIcon(group, student) }}
                </v-icon>
              </td>

              <td class="col-id">
                <div>{{ getStudentDisplayName(student) }}</div>
                <div
                  v-if="getGradebook(student)"
                  class="student-gradebook"
                >
                  Зачётка: {{ getGradebook(student) }}
                </div>
              </td>
              <td colspan="6" />
              <td class="student-stats-cell">
                <span
                  :class="[
                    'upload-stat',
                    getStudentUploadStat(group, student, studentIndex)?.isFull
                      ? 'stat-full'
                      : 'stat-partial',
                  ]"
                >
                  {{
                    getStudentUploadStat(group, student, studentIndex)
                      ?.uploaded ?? 0
                  }}
                  /
                  {{
                    getStudentUploadStat(group, student, studentIndex)?.total ??
                    0
                  }}
                </span>
              </td>
            </tr>

            <TopicRowItem
              v-for="row in topicRowsByGroup[group] ?? []"
              :key="row.key"
              v-show="isStudentExpanded(group, student)"
              :row="row"
              :report="reportForTopic(student, row.topic)"
              @download="emit('download', $event)"
              @viewReport="emit('viewReport', $event)"
            />
          </template>
        </template>
      </template>
    </etu-data-table>
  </div>
</template>

<script setup lang="ts">
  import { reactive, computed } from 'vue';
  import type {
    ReportDto,
    ControlScheduleDto,
    TopicRow,
  } from '../modal/reports';
  import { STUDENTS_TABLE_COLUMNS } from '../constants/columns';
  import type { TableColumn } from '@/components/global/etu-data-table/types';
  import TopicRowItem from './TopicRowItem.vue';
  import type { StudentDto } from '../modal/student';

  const etuColumns = computed<TableColumn[]>(() =>
    STUDENTS_TABLE_COLUMNS.map((c) => ({
      key: c.key,
      header: c.header,
      headerClass: c.headerClass,
      cellClass: c.class,
    }))
  );

  /**
   * Таблица студентов и отчётов по дисциплине.
   * Группы раскрываются по клику; для каждого студента показываются темы из controls,
   * статус загрузки отчёта, проверка и кнопка скачивания.
   */
  const props = withDefaults(
    defineProps<{
      studentsByGroup: Record<string, StudentDto[]>;
      reports: ReportDto[];
      controls: ControlScheduleDto[];
      visibleControlTypes?: string[];
      displayedTopicsByControlType?: Record<string, string[] | undefined>;
    }>(),
    { visibleControlTypes: undefined, displayedTopicsByControlType: () => ({}) }
  );

  const emit = defineEmits<{
    download: [report: ReportDto];
    viewReport: [report: ReportDto];
  }>();

  const openedGroups = reactive<
    Record<string, { opened: boolean; students: Record<number, boolean> }>
  >({});

  function toggleGroup(group: string) {
    const state = openedGroups[group];
    if (state) {
      state.opened = !state.opened;
      if (state.opened === false) {
        state.students = {};
      }
    } else {
      openedGroups[group] = { opened: true, students: {} };
    }
  }

  function toggleStudent(group: string, studentId: number) {
    if (openedGroups[group] === undefined) {
      openedGroups[group] = { opened: true, students: {} };
    }

    const students = openedGroups[group].students;
    const isOpen = students[studentId];
    if (isOpen === undefined || isOpen === false) {
      students[studentId] = true;
    } else {
      students[studentId] = false;
    }
  }

  const reportIndex = computed(() => {
    const map = new Map<string, ReportDto>();
    for (const r of props.reports ?? []) {
      const key = `${r.studentId}__${r.topic ?? ''}`;
      const existing = map.get(key);
      if (!existing || r.version > existing.version) {
        map.set(key, r);
      }
    }
    return map;
  });

  function getStudentId(student: StudentDto): number {
    const raw =
      student?.studentId ??
      student?.student_id ??
      student?.iotId ??
      student?.iot_id ??
      student?.lkId ??
      student?.lk_id;

    const n = Number(raw);
    return Number.isFinite(n) ? n : 0;
  }

  function isStudentExpanded(group: string, student: StudentDto): boolean {
    const id = getStudentId(student);
    return !!openedGroups[group]?.students?.[id];
  }

  function studentRowExpandIcon(group: string, student: StudentDto): string {
    return isStudentExpanded(group, student)
      ? 'mdi-chevron-down'
      : 'mdi-chevron-right';
  }

  function getStudentDisplayName(student: StudentDto): string {
    const fio = (student?.fio ?? student?.Fio ?? '').toString().trim();
    if (fio) return fio;
    const id = getStudentId(student);
    return id ? String(id) : '—';
  }

  function getStudentKey(
    group: string,
    student: StudentDto,
    index: number
  ): string {
    const id = getStudentId(student);
    return id > 0 ? `${group}-s-${id}` : `${group}-s-i${index}`;
  }

  function studentStatsLookupKey(
    group: string,
    student: StudentDto,
    index: number
  ): string {
    const id = getStudentId(student);
    return id > 0 ? `${group}::${id}` : `${group}::i${index}`;
  }

  function getGradebook(student: StudentDto): string {
    return String(
      student?.recordBook ??
        student?.record_book ??
        student?.gradebook ??
        student?.['Зачетка'] ??
        ''
    );
  }

  function reportForTopic(
    student: StudentDto,
    topic: string
  ): ReportDto | null {
    const sid = getStudentId(student);
    if (!sid) return null;
    return reportIndex.value.get(`${sid}__${topic ?? ''}`) ?? null;
  }

  function normalizeTopics(topics: any): string[] {
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

  const topicRowsByGroup = computed<Record<string, TopicRow[]>>(() => {
    const map: Record<string, TopicRow[]> = {};

    const controls = [...(props.controls ?? [])].sort((a, b) => {
      const g = String(a.groupName ?? '').localeCompare(
        String(b.groupName ?? '')
      );
      if (g !== 0) return g;

      const as = Number(a.weekStart ?? 0);
      const bs = Number(b.weekStart ?? 0);
      if (as !== bs) return as - bs;

      const ae = Number(a.weekEnd ?? 0);
      const be = Number(b.weekEnd ?? 0);
      if (ae !== be) return ae - be;

      return String(a.controlText ?? '').localeCompare(
        String(b.controlText ?? '')
      );
    });

    const visibleSet =
      props.visibleControlTypes === undefined
        ? null
        : new Set(
            props.visibleControlTypes.map((s) => String(s).trim().toLowerCase())
          );

    for (const c of controls) {
      const group = String(c.groupName ?? '').trim();
      if (group.length > 0) {
        const ws = Number(c.weekStart ?? 0);
        const we = Number(c.weekEnd ?? 0);
        const ct = String(c.controlText ?? '').trim();

        if (visibleSet !== null && !visibleSet.has(ct.toLowerCase())) {
          continue;
        }

        let topics = normalizeTopics(c.topics).flatMap((t) =>
          splitTopics(String(t))
        );

        const allowedTopics = props.displayedTopicsByControlType?.[ct];
        if (allowedTopics !== undefined) {
          if (allowedTopics.length > 0) {
            const allowedSet = new Set(allowedTopics.map((s) => s.trim()));
            topics = topics.filter((t) => allowedSet.has(String(t).trim()));
          } else {
            topics = [];
          }
        }

        if (topics.length > 0) {
          const rows = (map[group] ??= []);

          for (const topic of topics) {
            rows.push({
              key: `${group}__${ws}-${we}__${ct}__${topic}`,
              topic,
              controlText: ct,
              weekStart: ws,
              weekEnd: we,
              showControl: true,
              controlRowSpan: 1,
            });
          }
        }
      }
    }

    for (const group of Object.keys(map)) {
      const rows = map[group];
      if (!rows?.length) continue;

      for (let i = 0; i < rows.length; ) {
        const current = rows[i]!;
        const signature =
          current.controlText +
          '__' +
          current.weekStart +
          '__' +
          current.weekEnd;

        let span = 1;

        for (let j = i + 1; j < rows.length; j++) {
          const next =
            rows[j]!.controlText +
            '__' +
            rows[j]!.weekStart +
            '__' +
            rows[j]!.weekEnd;

          if (next === signature) {
            span += 1;
          } else {
            break;
          }
        }

        rows[i]!.showControl = true;
        rows[i]!.controlRowSpan = span;

        for (let k = i + 1; k < i + span; k++) {
          rows[k]!.showControl = false;
          rows[k]!.controlRowSpan = 0;
        }

        i += span;
      }
    }

    return map;
  });

  type UploadStat = { uploaded: number; total: number; isFull: boolean };

  const groupUploadStatsByGroup = computed<Record<string, UploadStat>>(() => {
    const topics = topicRowsByGroup.value;
    const idx = reportIndex.value;
    const out: Record<string, UploadStat> = {};
    for (const [group, students] of Object.entries(
      props.studentsByGroup ?? {}
    )) {
      const rows = topics[group] ?? [];
      const total = rows.length * students.length;
      let uploaded = 0;
      for (const student of students) {
        const sid = getStudentId(student);
        if (!sid) continue;
        for (const row of rows) {
          if (idx.get(`${sid}__${row.topic ?? ''}`)) uploaded++;
        }
      }
      out[group] = {
        uploaded,
        total,
        isFull: uploaded === total && total > 0,
      };
    }
    return out;
  });

  const studentUploadStatsByKey = computed<Record<string, UploadStat>>(() => {
    const topics = topicRowsByGroup.value;
    const idx = reportIndex.value;
    const out: Record<string, UploadStat> = {};
    for (const [group, students] of Object.entries(
      props.studentsByGroup ?? {}
    )) {
      const rows = topics[group] ?? [];
      const total = rows.length;
      students.forEach((student, index) => {
        const sid = getStudentId(student);
        const key = studentStatsLookupKey(group, student, index);
        let uploaded = 0;
        if (sid) {
          for (const row of rows) {
            if (idx.get(`${sid}__${row.topic ?? ''}`)) uploaded++;
          }
        }
        out[key] = {
          uploaded,
          total,
          isFull: uploaded === total && total > 0,
        };
      });
    }
    return out;
  });

  function getStudentUploadStat(
    group: string,
    student: StudentDto,
    index: number
  ): UploadStat | undefined {
    const key = studentStatsLookupKey(group, student, index);
    return studentUploadStatsByKey.value[key];
  }
</script>

<style scoped>
  .students-reports-panel {
    overflow-x: visible;
    width: 100%;
    font-family: 'DM Sans', 'Nunito Sans', system-ui, sans-serif;
  }

  .students-reports-panel :deep(.students-etu-wrap.etu-dt-wrap) {
    --etu-dt-cell-pad-x: 12px;
    --etu-dt-cell-pad-y: 10px;
  }

  .students-reports-panel :deep(.etu-dt-table.students-table) {
    table-layout: fixed;
    width: 100%;
  }

  .students-reports-panel :deep(.etu-dt-table.students-table thead th),
  .students-reports-panel
    :deep(.etu-dt-table.students-table thead th.th-filled) {
    background: #f9fafb !important;
    background-color: #f9fafb !important;
    color: #9ca3af !important;
    font-size: 11px !important;
    font-weight: 700 !important;
    letter-spacing: 0.07em !important;
    text-transform: uppercase !important;
    vertical-align: bottom;
    border-bottom: 1px solid #e5e7eb !important;
    position: sticky;
    top: 0;
    z-index: 10;
  }

  .students-reports-panel
    :deep(.etu-dt-table.students-table thead th:first-child) {
    padding-left: 10px;
  }

  .students-reports-panel
    :deep(.etu-dt-table.students-table thead th:last-child) {
    padding-right: 10px;
  }

  .table-icon {
    display: inline-block;
    vertical-align: middle;
    line-height: 1;
    transform: translateY(1px);
  }

  .students-table {
    width: 100%;
    min-width: 1320px;
    border-collapse: collapse;
    font-size: 14px;
    table-layout: fixed;
  }
  .upload-stat {
    font-size: 12px;
    font-weight: 600;
    padding: 2px 8px;
    border-radius: 999px;
    background: #f3f4f6;
    color: #6b7280;
  }
  .upload-stat.stat-full {
    background: #dcfce7;
    color: #15803d;
  }
  .upload-stat.stat-partial {
    background: #fef3c7;
    color: #b45309;
  }
  .group-stats-cell,
  .student-stats-cell {
    text-align: right;
    white-space: nowrap;
  }
  .col-expand {
    width: 36px;
    min-width: 36px;
  }
  .col-id {
    width: 220px;
    min-width: 220px;
  }
  .student-gradebook,
  .control-sub {
    font-size: 12px;
    color: #6b7280;
    margin-top: 2px;
  }

  .col-control {
    width: 220px;
    min-width: 200px;
  }
  .col-topic {
    width: 280px;
    min-width: 220px;
  }
  .col-date {
    width: 130px;
    min-width: 120px;
  }
  .col-version {
    width: 140px;
    min-width: 120px;
  }
  .col-check {
    width: 110px;
    min-width: 100px;
  }
  .col-status {
    width: 130px;
    min-width: 110px;
  }
  .col-action {
    width: 90px;
    min-width: 90px;
  }

  .students-table th,
  .students-table td {
    padding: 10px 12px;
    border-bottom: 1px solid #e5e7eb;
    text-align: left;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  .students-table td.col-id {
    white-space: normal;
  }

  .students-table td.col-topic,
  .students-table th.col-topic,
  .students-table td.col-control,
  .students-table td.col-version,
  .students-table td.col-status {
    white-space: normal;
    overflow: visible;
    text-overflow: clip;
    word-break: break-word;
  }

  .students-table th.col-topic {
    white-space: normal;
    line-height: 1.25;
  }

  .students-reports-panel :deep(.etu-dt-table.students-table thead th.th-sep) {
    position: sticky;
    overflow: visible;
  }

  .students-reports-panel
    :deep(.etu-dt-table.students-table thead th.th-sep::after) {
    content: '';
    position: absolute;
    right: 0;
    top: 50%;
    transform: translateY(-50%);
    height: 60%;
    width: 1px;
    background: #e5e7eb;
    z-index: 11;
  }

  .group-row {
    background-color: #f9fafb;
    font-weight: 600;
    cursor: pointer;
  }
  .group-row:hover {
    background-color: #f3f4f6;
  }

  .student-row {
    background-color: #ffffff;
    font-weight: 500;
    cursor: pointer;
  }
  .student-row:hover {
    background-color: #eff6ff;
  }

  .topic-row {
    transition: background 0.15s cubic-bezier(0.4, 0, 0.2, 1);
  }

  .topic-row:hover {
    background-color: #eff6ff;
  }

  .topic-cell {
    font-weight: 500;
  }

  .check-cell {
    display: inline-flex;
    align-items: center;
    gap: 6px;
    font-weight: 600;
  }
  .check-ok {
    color: #16a34a;
  }
  .check-error {
    color: #dc2626;
  }

  .action-cell {
    text-align: right;
    vertical-align: middle;
    overflow: visible;
    white-space: nowrap;
  }

  .action-cell-inner {
    display: inline-flex;
    gap: 4px;
    align-items: center;
    justify-content: flex-end;
  }

  .no-report {
    color: #9ca3af;
    font-style: italic;
  }

  .date-cell {
    display: flex;
    align-items: center;
    gap: 4px;
  }

  .td-expand-indent {
    padding-left: 16px;
  }

  .expand-icon {
    cursor: pointer;
    padding-left: 8px;
  }

  .header-icon {
    vertical-align: middle;
  }

  .mr-2 {
    margin-right: 8px;
  }
</style>
