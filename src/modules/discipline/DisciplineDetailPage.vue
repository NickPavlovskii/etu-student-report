<template>
  <etu-loading-page v-if="loading && !uiDiscipline" />
  <v-container
    v-else-if="uiDiscipline"
    fluid
    class="page"
  >
    <v-card
      class="block"
      elevation="0"
    >
      <div class="top-row">
        <div class="top-row-inner">
          <v-btn
            class="back-btn"
            variant="text"
            prepend-icon="mdi-chevron-left"
            @click="goBack"
          >
            Вернуться к дисциплинам
          </v-btn>
          <div class="actions">
            <etu-button
              title="Перейти в архив"
              width="auto"
              height="40"
              color="#111827"
              :prepend-icon="ARCHIVE_ICON"
              :border-color="'#E5E7EB'"
              :bg-color="'white'"
              :border="true"
              @click="goToArchive"
            />
            <etu-button
              v-if="hasStudents"
              title="Загрузить учебную работу"
              width="auto"
              height="40"
              color="white"
              :prepend-icon="PLUS_ICON"
              :bg-color="'#111827'"
              :border="false"
              @click="uploadWork"
            />
          </div>
        </div>
        <h2 class="title">{{ cleanTitle(uiDiscipline.Discipline) }}</h2>
        <discipline-meta :discipline="uiDiscipline" />
      </div>
    </v-card>

    <v-card
      class="block"
      elevation="0"
    >
      <h3 class="section-title">Статистика часов</h3>
      <div class="stats">
        <etu-stat-card
          icon="mdi-book-open-outline"
          title="Лекции"
          color="blue"
          :value="Number(uiDiscipline.LectureHours ?? 0)"
          unit="ч."
        />
        <etu-stat-card
          icon="mdi-flask-outline"
          title="Практика"
          color="green"
          :value="Number(uiDiscipline.PracticeHours ?? 0)"
          unit="ч."
        />
      </div>
    </v-card>

    <students-reports-table
      v-if="hasStudents"
      :students-by-group="studentsByGroup"
      :reports="reports"
      :controls="controls"
      @download="handleDownload"
    />
  </v-container>

  <upload-work-modal
    v-model="uploadDialog"
    :discipline="uiDiscipline"
    :groups="Object.keys(studentsByGroup)"
    :students-by-group="studentsByGroup"
    :topics="topics"
    :assessment="uiDiscipline?.Assessment ?? ''"
    :controls="controls"
    @close="uploadDialog = false"
    @submit="onUpload"
  />
</template>

<script setup lang="ts">
  import { ref, computed, onMounted, watch } from 'vue';
  import { useRoute, useRouter } from 'vue-router';
  import ARCHIVE_ICON from '@/assets/icons/archive.svg';
  import PLUS_ICON from '@/assets/icons/plus.svg';
  import UploadWorkModal from './components/UploadStudyWork.vue';
  import StudentsReportsTable from './components/StudentsReportsTable.vue';
  import DisciplineMeta from './components/DisciplineMeta.vue';
  import type { ReportDto } from '@/types/reports';
  import {
    getDisciplineCard,
    getDisciplineStudents,
    getDisciplineReports,
    uploadDisciplineReport,
    downloadReport as apiDownloadReport,
    getDisciplineControls,
  } from '@/api/disciplines';
  import { useAcademicYear } from '@/composables/useAcademicYear';
  import { useUser } from '@/composables/useUser';
  import { useDownload } from '@/composables/useDownload';

  const route = useRoute();
  const router = useRouter();
  const { academicYear } = useAcademicYear();
  const { lastName, uploadedBy } = useUser();
  const { downloadBlob } = useDownload();

  const loading = ref(false);
  const uploadDialog = ref(false);
  const controls = ref<any[]>([]);
  const discipline = ref<any | null>(null);
  const students = ref<any[]>([]);
  const reports = ref<ReportDto[]>([]);

  const planRowId = computed(() => Number(route.params.id));

  const uiDiscipline = computed(() => {
    const d = discipline.value;
    if (d) {
      return {
        CodeRow: d.planRowId,
        Discipline: d.disciplineName,
        Course: d.course,
        Semester: d.semester,
        GroupsCount: d.groupsCount,
        LectureHours: d.lectureHours,
        PracticeHours: d.practiceHours,
        Assessment: d.hasExam
          ? 'Экзамен'
          : d.hasPassMark
            ? 'Зачёт с оценкой'
            : d.hasPass
              ? 'Зачёт'
              : '—',
        EducationForm: d.educationForm ?? null,
        EducationLevel: d.educationLevel ?? null,
      };
    }
    return null;
  });

  const topics = computed<string[]>(() => {
    const all: string[] = [];
    for (const c of controls.value ?? []) {
      const t = c?.topics;
      if (Array.isArray(t)) {
        all.push(...t);
      } else if (typeof t === 'string') {
        try {
          const parsed = JSON.parse(t);
          if (Array.isArray(parsed)) {
            all.push(...parsed);
          }
        } catch {}
      }
    }
    return [...new Set(all.map((s) => String(s).trim()).filter(Boolean))];
  });

  const studentsByGroup = computed<Record<string, any[]>>(() => {
    const res: Record<string, any[]> = {};
    for (const s of students.value ?? []) {
      const group = String(s.groupName ?? s.group ?? '').trim();
      if (group) {
        (res[group] ??= []).push(s);
      }
    }
    return res;
  });

  const hasStudents = computed(
    () => Object.keys(studentsByGroup.value).length > 0
  );

  const cleanTitle = (v?: string) => (v ?? '').replace(/"/g, '');

  async function loadAll() {
    loading.value = true;
    try {
      const year = academicYear.value;
      const id = planRowId.value;
      const ln = lastName.value;

      [discipline.value, students.value, controls.value] = await Promise.all([
        getDisciplineCard(ln, id, year),
        getDisciplineStudents(ln, id, year),
        getDisciplineControls(ln, id, year),
      ]);

      try {
        reports.value = await getDisciplineReports(ln, id, year);
      } catch (e) {
        console.warn('Ошибка получения отчётов:', e);
        reports.value = [];
      }
    } finally {
      loading.value = false;
    }
  }

  onMounted(async () => {
    if (lastName.value) {
      await loadAll();
    } else {
      router.push('/auth');
    }
  });

  watch(academicYear, () => {
    if (lastName.value) {
      loadAll();
    }
  });

  const uploadWork = () => (uploadDialog.value = true);
  const goBack = () => router.push('/disciplines');
  const goToArchive = () => router.push('/archive');

  async function onUpload(payload: any) {
    const dto = await uploadDisciplineReport(lastName.value, planRowId.value, {
      studentId: payload.studentId,
      groupName: payload.groupName,
      topic: payload.topic ?? '',
      controlType: payload.controlType ?? '',
      workType: payload.workType,
      workTitle: payload.workTitle,
      academicYear: payload.academicYear,
      autoCheck: !!payload.autoCheck,
      check: payload.check ?? null,
      status: payload.status ?? 'Загружен',
      uploadedBy: uploadedBy.value,
      file: payload.file as File,
    });
    reports.value = [dto, ...reports.value];
    uploadDialog.value = false;
  }

  async function handleDownload(reportDto: ReportDto) {
    const blob = await apiDownloadReport(reportDto.id);
    downloadBlob(blob, reportDto.fileName || 'report');
  }
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
  .back-btn {
    padding-left: 0;
  }
  .title {
    font-size: 22px;
    font-weight: 600;
    margin: 6px 0;
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
    grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
    gap: 16px;
  }
  .top-row-inner {
    display: flex;
    justify-content: space-between;
    gap: 24px;
  }
</style>
