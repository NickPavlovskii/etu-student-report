<template>
  <v-container
    v-if="discipline"
    fluid
    class="page"
  >
    <!-- ШАПКА -->
    <v-card
      class="block"
      elevation="0"
    >
      <div class="top-row">
        <div>
          <v-btn
            variant="text"
            class="back-btn"
            prepend-icon="mdi-chevron-left"
            @click="goBack"
          >
            Вернуться к дисциплинам
          </v-btn>
          <h2 class="title">{{ discipline.Discipline.replace(/"/g, '') }}</h2>
          <div class="meta">
            <span>
              <v-icon size="16">mdi-calendar-outline</v-icon>
              Курс: {{ discipline.Course }}, Семестр: {{ discipline.Semester }}
            </span>
            <span>
              <v-icon size="16">mdi-file-document-outline</v-icon>
              Оценивание: {{ discipline.Assessment }}
            </span>
          </div>
          <div
            class="types"
            v-if="topics.length"
          >
            <v-chip
              v-for="(topic, idx) in topics"
              :key="idx"
              size="small"
              variant="tonal"
              color="primary"
            >
              {{ topic }}
            </v-chip>
          </div>
        </div>

        <div class="actions">
          <etu-button
            title="Перейти в архив"
            :prepend-icon="ARCHIVE_ICON"
            color="#111827"
            :border-color="'#E5E7EB'"
            :bg-color="'white'"
            :border="true"
            width="auto"
            @click="goToArchive"
          />
          <etu-button
            title="Загрузить работу"
            :prepend-icon="PLUS_ICON"
            color="white"
            :bg-color="'#111827'"
            :border="false"
            width="auto"
            @click="uploadWork"
          />
        </div>
      </div>
    </v-card>

    <!-- СТАТИСТИКА -->
    <v-card
      class="block"
      elevation="0"
    >
      <h3 class="section-title">Статистика часов</h3>
      <div class="stats">
        <v-card
          class="stat-card"
          elevation="0"
        >
          <div class="stat-title">Лекции</div>
          <div class="stat-row">{{ Number(discipline.LectureHours) }} ч.</div>
        </v-card>
        <v-card
          class="stat-card"
          elevation="0"
        >
          <div class="stat-title">Практика</div>
          <div class="stat-row">{{ Number(discipline.PracticeHours) }} ч.</div>
        </v-card>
      </div>
    </v-card>

    <students-reports-table
      :students-by-group="studentsByGroup"
      :opened-groups="openedGroups"
      :topics="topics"
      @toggle-group="toggleGroup"
      @download="downloadReport"
    />
  </v-container>

  <upload-work-modal
    v-model="uploadDialog"
    :discipline="discipline"
    :groups="Object.keys(studentsByGroup)"
    :students-by-group="studentsByGroup"
    :topics="topics"
    :assessment="discipline.Assessment"
    @close="uploadDialog = false"
    @submit="onUpload"
  />
</template>

<script setup>
  import { ref, computed, watchEffect } from 'vue';
  import { useRoute, useRouter } from 'vue-router';
  import disciplinesDB from '../db/db.json';
  import ARCHIVE_ICON from '../assets/icons/archive.svg';
  import PLUS_ICON from '../assets/icons/plus.svg';
  import UploadWorkModal from '../components/UploadStudyWork.vue';
  import StudentsReportsTable from '../components/StudentsReportsTable.vue';
  import { useReportsStorage } from '../composables/useReportsStorage';

  const { addReport, getByStudentId } = useReportsStorage();

  const onUpload = (payload) => {
    addReport(payload);
  };

  const route = useRoute();
  const router = useRouter();
  const uploadDialog = ref(false);
  const openedGroups = ref({});

  const discipline = computed(() =>
    disciplinesDB.find((d) => d.CodeRow === Number(route.params.id))
  );
  const statusClass = (status) => {
    switch (status) {
      case 'Загружен':
        return 'status-success';
      case 'Ошибка в оформлении':
        return 'status-error';
      default:
        return 'status-neutral';
    }
  };

  const topics = computed(() => {
    if (!discipline.value?.Topics) return [];
    try {
      return Array.isArray(discipline.value.Topics)
        ? discipline.value.Topics
        : JSON.parse(discipline.value.Topics);
    } catch {
      return [];
    }
  });

  const studentsByGroup = computed(() => {
    if (!discipline.value) return {};

    const result = {};

    const related = disciplinesDB.filter(
      (d) =>
        d.Discipline === discipline.value.Discipline &&
        d.Course === discipline.value.Course &&
        d.Semester === discipline.value.Semester
    );

    related.forEach((d) => {
      (d.Students || []).forEach((student) => {
        if (student['Статус.1'] === 'Отчислен') return;

        const group = student['Группа'] ?? student.Group;
        if (!group) return;

        if (!result[group]) result[group] = [];

        if (!result[group].some((s) => s['ID ИОТ'] === student['ID ИОТ'])) {
          result[group].push({
            ...student,
            UploadDate: student.UploadDate ?? null,
            Version: student.Version ?? null,
            Check: student.Check ?? null,
          });
        }
      });
    });

    return result;
  });

  const toggleGroup = (group) => {
    openedGroups.value[group] = !openedGroups.value[group];
  };
  const uploadWork = () => {
    uploadDialog.value = true;
  };
  const goBack = () => router.push('/uploadWork');
  const goToArchive = () => router.push('/archive');

  const viewReport = (student) =>
    console.log('Просмотр отчета студента', student);

  const downloadReport = (student) => {
    if (!student) {
      console.warn('Студент не передан');
      return;
    }

    const studentId = student.studentId;
    console.log('ID студента:', studentId);

    const report = getByStudentId(studentId);
    if (!report?.url) {
      console.warn('Отчёт не найден для студента', studentId);
      return;
    }

    const link = document.createElement('a');
    link.href = report.url;
    link.download = report.name || report.fileName || 'report.pdf';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  function getGroupsByDiscipline(disciplineObj) {
    if (!disciplineObj) return [];
    return Object.keys(studentsByGroup.value);
  }

  watchEffect(() => {
    console.log('Студенты по группам:', studentsByGroup.value);
  });
</script>

<style scoped>
  .page {
    height: 100%;
    background: #f5f6f8;
    padding: 16px;
  }
  .block {
    border-radius: 16px;
    padding: 20px;
    margin-bottom: 16px;
  }

  .students-table {
    width: 100%;
    border-collapse: collapse;
  }

  .students-table th {
    text-align: left;
    font-size: 13px;
    color: #6b7280;
    font-weight: 500;
    padding: 12px;
    border-bottom: 1px solid #e5e7eb;
  }

  .students-table td {
    padding: 14px 12px;
    font-size: 14px;
    border-bottom: 1px solid #f1f5f9;
  }

  .col-expand {
    width: 36px;
  }

  .group-row {
    background: #f9fafb;
    font-weight: 500;
    cursor: pointer;
  }

  .group-row:hover {
    background: #f3f4f6;
  }

  .student-row:hover {
    background: #fafafa;
  }

  /* Дата */
  .date-cell {
    display: flex;
    align-items: center;
    gap: 6px;
    color: #111827;
  }

  .date-icon {
    color: #9ca3af;
  }

  /* Версия */
  .version-chip {
    background: #f3f4f6;
    padding: 2px 8px;
    border-radius: 999px;
    font-size: 12px;
    font-weight: 500;
  }

  /* Проверка */
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

  /* Статусы */
  .status-chip {
    padding: 4px 10px;
    border-radius: 999px;
    font-size: 12px;
    font-weight: 500;
  }

  .status-success {
    background: #dcfce7;
    color: #15803d;
  }

  .status-error {
    background: #fee2e2;
    color: #b91c1c;
  }

  .status-neutral {
    background: #f3f4f6;
    color: #374151;
  }

  /* Действие */
  .action-cell {
    text-align: right;
  }

  .top-row {
    display: flex;
    justify-content: space-between;
    gap: 24px;
  }
  .back-btn {
    padding-left: 0;
  }
  .title {
    font-size: 22px;
    font-weight: 600;
    margin: 6px 0;
  }
  .meta {
    display: flex;
    gap: 16px;
    font-size: 13px;
    color: #6b7280;
  }
  .types {
    display: flex;
    gap: 8px;
    margin-top: 8px;
  }
  .actions {
    display: flex;
    gap: 12px;
  }
  .section-title {
    font-size: 16px;
    font-weight: 600;
    margin-bottom: 12px;
  }
  .stats {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(260px, 1fr));
    gap: 16px;
  }
  .stat-card {
    background: #fafafa;
    border-radius: 14px;
    padding: 16px;
  }
  .stat-title {
    font-weight: 500;
    color: #374151;
    margin-bottom: 6px;
  }
  .stat-row {
    font-size: 18px;
    color: #111827;
  }

  .students-table {
    width: 100%;
    border-collapse: separate;
    border-spacing: 0;
  }
  .students-table th,
  .students-table td {
    padding: 12px;
    text-align: left;
    font-size: 14px;
  }
  .students-table th {
    background: #f3f4f6;
    font-weight: 600;
    color: #111827;
    border-bottom: 2px solid #e5e7eb;
  }
  .students-table tr:hover {
    background: #f9fafb;
  }
  .group-row td {
    font-weight: 500;
    background: #f9fafb;
    cursor: pointer;
  }
  .report-cell {
    display: flex;
    align-items: center;
    gap: 6px;
  }
  .no-report {
    color: #888;
    font-size: 0.85rem;
  }
  .success {
    color: #16a34a;
    font-weight: 600;
  }
  .error {
    color: #dc2626;
    font-weight: 600;
  }
  .empty {
    padding: 24px;
    text-align: center;
    color: #6b7280;
  }
</style>
