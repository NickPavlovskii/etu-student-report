<template>
  <div class="students-table-wrap">
    <v-table class="students-table">
    <colgroup>
      <col
        v-for="col in STUDENTS_TABLE_COLUMNS"
        :key="col.key"
        :class="col.class"
      />
    </colgroup>
    <thead>
      <tr>
        <th
          v-for="col in STUDENTS_TABLE_COLUMNS"
          :key="col.key"
          :class="col.headerClass"
        >
          {{ col.header }}
        </th>
      </tr>
    </thead>

    <tbody>
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
              class="upload-stat"
              :class="
                groupUploadStats(group).uploaded === groupUploadStats(group).total
                  && groupUploadStats(group).total > 0
                  ? 'stat-full'
                  : ''
              "
            >
              {{ groupUploadStats(group).uploaded }} / {{ groupUploadStats(group).total }}
            </span>
          </td>
        </tr>

        <template
          v-for="student in students"
          :key="getStudentKey(student)"
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
                {{
                  openedGroups[group]?.students?.[getStudentId(student)]
                    ? 'mdi-chevron-down'
                    : 'mdi-chevron-right'
                }}
              </v-icon>
            </td>

            <td class="col-id">
              <div>{{ getStudentDisplayName(student) }}</div>
              <div v-if="getGradebook(student)" class="student-gradebook">
                Зачётка: {{ getGradebook(student) }}
              </div>
            </td>
            <td colspan="6" />
            <td class="student-stats-cell">
              <span
                class="upload-stat"
                :class="
                  studentUploadStats(group, student).uploaded
                    === studentUploadStats(group, student).total
                    && studentUploadStats(group, student).total > 0
                    ? 'stat-full'
                    : 'stat-partial'
                "
              >
                {{ studentUploadStats(group, student).uploaded }}
                / {{ studentUploadStats(group, student).total }}
              </span>
            </td>
          </tr>

          <tr
            v-for="row in topicRowsByGroup[group] ?? []"
            :key="row.key"
            v-show="openedGroups[group]?.students?.[getStudentId(student)]"
            class="topic-row"
          >
            <td />
            <td />
            <td
              v-if="row.showControl"
              :rowspan="row.controlRowSpan"
            >
              <div class="control-wrap">
                <v-icon
                  size="16"
                  class="mr-2"
                >
                  mdi-clipboard-text-outline
                </v-icon>
                <span class="control-chip">{{ row.controlText || '—' }}</span>
              </div>
              <div class="control-sub">
                Недели: {{ row.weekStart }}–{{ row.weekEnd }}
              </div>
            </td>
            <td class="topic-cell col-topic">
              <!-- <v-icon
                size="16"
                class="mr-2"
              >
                mdi-file-document-outline
              </v-icon> -->
              <div class="topic-highlight">
                <span>{{ row.topic }}</span>
              </div>
            </td>

            <td>
              <div class="date-cell">
                <v-icon
                  size="16"
                  class="table-icon"
                >
                  mdi-clock-outline
                </v-icon>
                <span>
                  {{ reportForTopic(student, row.topic)?.uploadDate || '—' }}
                </span>
              </div>
            </td>

            <td>
              <span
                v-if="reportForTopic(student, row.topic)"
                class="version-chip"
              >
                v{{ reportForTopic(student, row.topic)!.version }}
              </span>
              <span
                v-else
                class="no-report"
              >
                Отчёт не подгружен
              </span>
            </td>
            <td>
              <template v-if="reportForTopic(student, row.topic)">
                <div
                  v-if="reportForTopic(student, row.topic)!.check != null"
                  class="check-cell"
                  :class="(reportForTopic(student, row.topic)!.check ?? 0) >= 90 ? 'check-ok' : 'check-error'"
                >
                  <v-icon size="16">
                    {{
                      (reportForTopic(student, row.topic)!.check ?? 0) >= 90
                        ? 'mdi-check-circle'
                        : 'mdi-close-circle'
                    }}
                  </v-icon>
                  {{ reportForTopic(student, row.topic)!.check }}%
                </div>
                <span
                  v-else
                  class="no-report"
                >
                  —
                </span>
              </template>
              <span
                v-else
                class="no-report"
              >
                —
              </span>
            </td>
            <td>
              <span
                v-if="reportForTopic(student, row.topic)"
                class="status-chip status-green"
              >
                {{ reportForTopic(student, row.topic)!.status || 'Загружен' }}
              </span>
              <span
                v-else
                class="status-chip status-gray"
              >
                Не загружен
              </span>
            </td>
            <td class="col-action action-cell">
              <div class="action-cell-inner">
                <template v-if="reportForTopic(student, row.topic)">
                  <v-btn
                    icon
                    variant="text"
                    size="small"
                    class="action-icon-btn"
                    title="Скачать"
                    @click.stop="onDownload(student, row.topic)"
                  >
                    <img
                      :src="downloadIcon"
                      alt="Скачать"
                      class="action-icon-img"
                    >
                  </v-btn>
                  <v-btn
                    v-if="reportForTopic(student, row.topic)!.check != null"
                    icon
                    variant="text"
                    size="small"
                    class="action-icon-btn"
                    title="Отчет о проверке оформления"
                    @click.stop="onViewReport(student, row.topic)"
                  >
                    <img
                      :src="eyeIcon"
                      alt="Просмотр отчёта"
                      class="action-icon-img"
                    >
                  </v-btn>
                </template>
              </div>
            </td>
          </tr>
        </template>
      </template>
    </tbody>
    </v-table>
  </div>
</template>

<script setup lang="ts">
import { reactive, computed } from 'vue';
import downloadIcon from '@/assets/icons/download.svg';
import eyeIcon from '@/assets/icons/eye.svg';
import type {
  ReportDto,
  ControlScheduleDto,
  TopicRow,
} from '@/types/reports';
import { STUDENTS_TABLE_COLUMNS } from './studentsTableColumns';

/**
 * Таблица студентов и отчётов по дисциплине.
 * Группы раскрываются по клику; для каждого студента показываются темы из controls,
 * статус загрузки отчёта, проверка и кнопка скачивания.
 */
const props = withDefaults(
  defineProps<{
    studentsByGroup: Record<string, any[]>;
    reports: ReportDto[];
    controls: ControlScheduleDto[];
    /** Виды контроля для отображения в таблице (по названию). Если пусто — показывать все */
    visibleControlTypes?: string[];
    /** Темы для отображения по видам контроля (название вида -> массив тем). undefined/пусто = все темы */
    displayedTopicsByControlType?: Record<string, string[] | undefined>;
  }>(),
  { visibleControlTypes: undefined, displayedTopicsByControlType: () => ({}) }
);

const emit = defineEmits<{
  (e: 'download', report: ReportDto): void;
  (e: 'viewReport', report: ReportDto): void;
}>();

/** Состояние раскрытия групп и студентов: opened — группа раскрыта, students — список раскрытых studentId */
const openedGroups = reactive<Record<string, { opened: boolean; students: Record<number, boolean> }>>({});

/** Переключает видимость списка студентов в группе */
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

/** Переключает видимость строк тем для конкретного студента */
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

/** Извлекает ID студента из объекта (поддерживает разные имена полей API) */
function getStudentId(student: any): number {
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

/** Отображаемое значение в колонке «ID лк»: ФИО, если есть, иначе ID */
function getStudentDisplayName(student: any): string {
  const fio = (student?.fio ?? student?.Fio ?? '').toString().trim();
  if (fio) return fio;
  const id = getStudentId(student);
  return id ? String(id) : '—';
}

/** Уникальный ключ студента для v-for */
function getStudentKey(student: any): string {
  return String(getStudentId(student) || Math.random());
}

/** Извлекает номер зачётки студента */
function getGradebook(student: any): string {
  return String(
    student?.recordBook ??
    student?.record_book ??
    student?.gradebook ??
    student?.['Зачетка'] ??
    ''
  );
}

/** Находит последний отчёт студента по теме (с максимальной версией) */
function reportForTopic(student: any, topic: string): ReportDto | null {
  const sid = getStudentId(student);
  if (sid) {
    const list = (props.reports ?? []).filter(
      (r) => r.studentId === sid && (r.topic ?? '') === (topic ?? '')
    );

    if (list.length > 0) {
      return list.reduce((best, cur) =>
        cur.version > best.version ? cur : best
      );
    }
  }
  return null;
}

/** Обработчик скачивания отчёта по студенту и теме */
function onDownload(student: any, topic: string) {
  const r = reportForTopic(student, topic);
  if (r) {
    emit('download', r);
  }
}

/** Открыть отчёт о проверке оформления */
function onViewReport(student: any, topic: string) {
  const r = reportForTopic(student, topic);
  if (r && r.check != null) {
    emit('viewReport', r);
  }
}

/** Преобразует topics из API (массив/JSON-строка) в массив строк */
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

/** Разбивает строку тем по шаблону "Тема N." на отдельные темы */
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

/**
 * Строит карту «группа → строки тем» для таблицы.
 * Для каждой группы из controls создаёт TopicRow с объединением одинаковых видов контроля (rowspan).
 */
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
        : new Set(props.visibleControlTypes.map((s) => String(s).trim().toLowerCase()));

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

    /** Объединяет строки с одинаковым видом контроля (controlText + недели) в rowspan */
    for (const group of Object.keys(map)) {
      const rows = map[group];

      for (let i = 0; i < rows.length; ) {
        const current = rows[i];
        const signature =
          current.controlText +
          '__' +
          current.weekStart +
          '__' +
          current.weekEnd;

        let span = 1;

        for (let j = i + 1; j < rows.length; j++) {
          const next =
            rows[j].controlText +
            '__' +
            rows[j].weekStart +
            '__' +
            rows[j].weekEnd;

          if (next === signature) {
            span += 1;
          } else {
            break;
          }
        }

        rows[i].showControl = true;
        rows[i].controlRowSpan = span;

        for (let k = i + 1; k < i + span; k++) {
          rows[k].showControl = false;
          rows[k].controlRowSpan = 0;
        }

        i += span;
      }
    }

    return map;
  });

  /** Кол-во загруженных отчётов для группы: уникальных (studentId + topic) */
function groupUploadStats(group: string): { uploaded: number; total: number } {
  const rows = topicRowsByGroup.value[group] ?? [];
  const students = props.studentsByGroup[group] ?? [];
  const total = rows.length * students.length;
  let uploaded = 0;
  for (const student of students) {
    for (const row of rows) {
      if (reportForTopic(student, row.topic)) uploaded++;
    }
  }
  return { uploaded, total };
}

/** Кол-во загруженных отчётов для конкретного студента */
function studentUploadStats(
  group: string,
  student: any
): { uploaded: number; total: number } {
  const rows = topicRowsByGroup.value[group] ?? [];
  const total = rows.length;
  let uploaded = 0;
  for (const row of rows) {
    if (reportForTopic(student, row.topic)) uploaded++;
  }
  return { uploaded, total };
}
</script>

<style scoped>
  .students-table-wrap {
    overflow-x: auto;
    width: 100%;
  }

  .table-icon {
    display: inline-block;
    vertical-align: middle;
    line-height: 1;
    transform: translateY(1px);
  }

  .students-table {
    width: 100%;
    min-width: 1266px;
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
    width: 180px;
    min-width: 180px;
  }
  .col-topic {
    width: 240px;
    min-width: 240px;
  }
  .col-date {
    width: 140px;
    min-width: 140px;
  }
  .col-version {
    width: 90px;
    min-width: 90px;
  }
  .col-check {
    width: 120px;
    min-width: 120px;
  }
  .col-status {
    width: 140px;
    min-width: 140px;
  }
  .col-action {
    width: 90px;
    min-width: 90px;
  }

  .students-table th,
  .students-table td {
    padding: 8px 12px;
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
  .topic-cell {
    white-space: normal;
    overflow: visible;
    text-overflow: clip;
    word-break: break-word;
  }

  .students-table thead th {
    position: sticky;
    top: 0;
    background: #ffffff;
    z-index: 10;
  }
  .students-table thead th.th-filled:has(+ th.th-filled)::after {
    content: '';
    position: absolute;
    right: 0;
    top: 50%;
    transform: translateY(-50%);
    height: 60%;
    width: 1px;
    background: #e5e7eb;
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
    background-color: #f9fafb;
  }

  .topic-cell {
    font-weight: 500;
  }

  .status-chip {
    display: inline-flex;
    align-items: center;
    padding: 2px 8px;
    border-radius: 999px;
    font-size: 12px;
    font-weight: 500;
  }

  .status-green {
    background: #dcfce7;
    color: #15803d;
  }

  .status-gray {
    background: #f3f4f6;
    color: #6b7280;
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

  .version-chip {
    background: #f3f4f6;
    padding: 2px 8px;
    border-radius: 999px;
    font-size: 12px;
  }

  .td-expand-indent {
    padding-left: 16px;
  }

  .expand-icon {
    cursor: pointer;
    padding-left: 36px;
  }

  .topic-highlight {
    background-color: #eff6ff;
    margin: 10px;
    padding: 10px;
    border-radius: 14px;
    color: #1d4ed8;
  }

  .header-icon {
    vertical-align: middle;
  }

  .mr-2 {
    margin-right: 8px;
  }

  .action-icon-btn {
    min-width: 32px;
    width: 32px;
    height: 32px;
  }

  .action-icon-img {
    width: 16px;
    height: 16px;
    display: block;
  }
</style>
