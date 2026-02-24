<template>
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
          <td colspan="9">
            Группа {{ group }} · {{ students.length }} студентов
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

            <td>{{ getStudentId(student) || '—' }}</td>
            <td>{{ getGradebook(student) || '—' }}</td>
            <td colspan="7"></td>
          </tr>

          <tr
            v-for="row in topicRowsByGroup[group] ?? []"
            :key="row.key"
            v-show="openedGroups[group]?.students?.[getStudentId(student)]"
            class="topic-row"
          >
            <td></td>
            <td></td>
            <td></td>
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
            <td class="action-cell">
              <v-btn
                v-if="reportForTopic(student, row.topic)"
                icon
                variant="text"
                @click="onDownload(student, row.topic)"
              >
                <v-icon>mdi-download</v-icon>
              </v-btn>
            </td>
          </tr>
        </template>
      </template>
    </tbody>
  </v-table>
</template>

<script setup lang="ts">
import { reactive, computed } from 'vue';
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
const props = defineProps<{
  studentsByGroup: Record<string, any[]>;
  reports: ReportDto[];
  controls: ControlScheduleDto[];
}>();

const emit = defineEmits<{
  (e: 'download', report: ReportDto): void;
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

    for (const c of controls) {
      const group = String(c.groupName ?? '').trim();
      if (group.length > 0) {
        const ws = Number(c.weekStart ?? 0);
        const we = Number(c.weekEnd ?? 0);
        const ct = String(c.controlText ?? '').trim();

        const topics = normalizeTopics(c.topics).flatMap((t) =>
          splitTopics(String(t))
        );

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
</script>

<style scoped>
  .table-icon {
    display: inline-block;
    vertical-align: middle;
    line-height: 1;
    transform: translateY(1px);
  }

  .students-table {
    width: 100%;
    border-collapse: collapse;
    font-size: 14px;
    table-layout: fixed;
  }

  .col-expand {
    width: 56px;
  }
  .col-id {
    width: 110px;
  }
  .col-gradebook {
    width: 130px;
  }
  .col-topic {
    width: 25%;
  }
  .col-control {
    width: 180px;
  }
  .col-date {
    width: 140px;
  }
  .col-version {
    width: 90px;
  }
  .col-check {
    width: 120px;
  }
  .col-status {
    width: 140px;
  }
  .col-action {
    width: 56px;
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

  .students-table {
    width: 100%;
    border-collapse: collapse;
    font-size: 14px;
  }
  .students-table th,
  .students-table td {
    padding: 8px 12px;
    border-bottom: 1px solid #e5e7eb;
    text-align: left;
  }

  .col-expand {
    width: 36px;
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
</style>
