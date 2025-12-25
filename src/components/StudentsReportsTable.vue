<template>
  <v-table class="students-table">
    <thead>
      <tr>
        <th class="col-expand"></th>
        <th>ID ИОТ</th>
        <th>Зачётка</th>
        <th>Тема</th>
        <th>Дата загрузки</th>
        <th>Версия</th>
        <th>Проверка</th>
        <th>Статус</th>
        <th></th>
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
          <td colspan="8">
            Группа {{ group }} · {{ students.length }} студентов
          </td>
        </tr>
        <template
          v-for="student in students"
          :key="student['ID ИОТ']"
        >
          <tr
            v-show="openedGroups[group]?.opened"
            class="student-row"
          >
            <td
              class="col-expand"
              style="padding-left: 16px"
            >
              <v-icon
                size="18"
                @click.stop="toggleStudent(group, student['ID ИОТ'])"
                style="cursor: pointer; padding-left: 36px"
              >
                {{
                  openedGroups[group]?.students?.[student['ID ИОТ']]
                    ? 'mdi-chevron-down'
                    : 'mdi-chevron-right'
                }}
              </v-icon>
            </td>
            <td>{{ student['ID ИОТ'] }}</td>
            <td>{{ student['Зачетка'] }}</td>
            <td colspan="6"></td>
          </tr>
          <tr
            v-for="topic in topics"
            :key="topic"
            v-show="openedGroups[group]?.students?.[student['ID ИОТ']]"
            class="topic-row"
          >
            <td></td>
            <td></td>
            <td></td>
            <td
              class="topic-cell"
              style="padding-left: 48px"
            >
              {{ topic }}
            </td>

            <td class="date-cell">
              <v-icon size="16">mdi-clock-outline</v-icon>
              {{ reportForTopic(student, topic)?.uploadDate || '—' }}
            </td>

            <td>
              <span
                v-if="reportForTopic(student, topic)"
                class="version-chip"
              >
                v{{ reportForTopic(student, topic)!.version }}
              </span>
              <span
                v-else
                class="no-report"
              >
                Отчёт не подгружен
              </span>
            </td>
            <td>
              <template v-if="reportForTopic(student, topic)">
                <div
                  v-if="reportForTopic(student, topic)!.check !== null"
                  class="check-cell"
                  :class="reportForTopic(student, topic)!.check >= 90 ? 'check-ok' : 'check-error'"
                >
                  <v-icon size="16">
                    {{
                      reportForTopic(student, topic)!.check >= 90
                        ? 'mdi-check-circle'
                        : 'mdi-close-circle'
                    }}
                  </v-icon>
                  {{ reportForTopic(student, topic)!.check }}%
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
                v-if="reportForTopic(student, topic)"
                class="status-chip status-green"
              >
                Загружен
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
                v-if="reportForTopic(student, topic)"
                icon
                variant="text"
                @click="$emit('download', reportForTopic(student, topic))"
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
  import { reactive } from 'vue';
  import { useReportsStorage } from '../composables/useReportsStorage';

  defineProps<{
    studentsByGroup: Record<string, any[]>;
    topics: string[];
  }>();
  const emit = defineEmits(['download']);

  const { getReport } = useReportsStorage();

  const openedGroups = reactive<Record<string, any>>({});

  const toggleGroup = (group: string) => {
    if (!openedGroups[group]) {
      openedGroups[group] = { opened: true, students: {} };
    } else {
      openedGroups[group].opened = !openedGroups[group].opened;
      if (!openedGroups[group].opened) {
        openedGroups[group].students = {};
      }
    }
  };

  const toggleStudent = (group: string, studentId: number) => {
    if (!openedGroups[group].students[studentId])
      openedGroups[group].students[studentId] = true;
    else
      openedGroups[group].students[studentId] =
        !openedGroups[group].students[studentId];
  };

  const reportForTopic = (student: any, topic: string) => {
    return getReport(student['ID ИОТ'], topic) || null;
  };
</script>
<style scoped>
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

  .students-table thead th {
    position: sticky;
    top: 0;
    background: #ffffff;
    z-index: 10;
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
  
</style>
