<template>
  <etu-loading-page v-if="loading && !uiDiscipline" />
  <v-container
    v-else-if="uiDiscipline"
    fluid
    class="page"
  >
    <v-alert
      v-if="viewingAsAdmin"
      type="warning"
      variant="tonal"
      class="admin-view-alert"
      density="comfortable"
      border="start"
    >
      <template #prepend>
        <v-icon
          icon="mdi-shield-account-outline"
          size="24"
        />
      </template>
      <strong>Просмотр от имени администратора.</strong>
      Вы просматриваете дисциплину преподавателя:
      {{ viewingAsAdminTeacherFio }}. Это не ваша дисциплина — действия
      выполняются в режиме администрирования.
    </v-alert>
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
            {{ backNavLabel }}
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
        <p
          v-if="viewingAsAdmin && viewingAsAdminTeacherFio"
          class="discipline-teacher-line"
        >
          <v-icon size="18">mdi-account-outline</v-icon>
          Преподаватель: {{ viewingAsAdminTeacherFio }}
        </p>
        <discipline-meta :discipline="uiDiscipline" />
      </div>
    </v-card>

    <v-card
      class="block"
      elevation="0"
    >
      <h3 class="section-title">Статистика</h3>
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
          unit="ч."
          :value="Number(uiDiscipline.PracticeHours ?? 0)"
        />
        <etu-info-card
          title="Загружено отчётов"
          icon="mdi-file-upload-outline"
          color="green"
          :value="`${disciplineWorksStats.uploaded} / ${disciplineWorksStats.total}`"
        />
      </div>
    </v-card>

    <students-reports-table
      v-if="hasStudents"
      :students-by-group="studentsByGroup"
      :reports="reports"
      :controls="controls"
      :visible-control-types="visibleControlTypes"
      :displayed-topics-by-control-type="displayedTopicsByControlType"
      @download="handleDownload"
      @view-report="handleViewReport"
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

  <validation-report-modal
    v-model="validationReportVisible"
    :result="validationReportResult"
    :breadcrumb="validationReportBreadcrumb"
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
  import ValidationReportModal from './components/ValidationReportModal.vue';
  import type { ReportDto } from './modal/reports';
  import {
    getDisciplineCard,
    getDisciplineStudents,
    getDisciplineReports,
    uploadDisciplineReport,
    downloadReport as apiDownloadReport,
    getDisciplineControls,
  } from '@/api/disciplines';
  import { validateDocument } from '@/api/validation';
  import { useAcademicYear } from '@/composables/useAcademicYear';
  import { useUser } from '@/composables/useUser';
  import { useDownload } from '@/composables/useDownload';
  import {
    getVisibleControlTitles,
    getDisplayedTopicsByControlType,
  } from '@/modules/settings/composables/useDisciplineControlTypes';
  import { useDisciplineWorksStats } from './composables/useDisciplineWorksStats';
  import type { StudentDto } from './modal/student';

  const route = useRoute();
  const router = useRouter();
  const { academicYear } = useAcademicYear();
  const { lastName, uploadedBy } = useUser();
  const { downloadBlob } = useDownload();

  const loading = ref(false);
  const uploadDialog = ref(false);
  const validationReportVisible = ref(false);
  const validationReportResult = ref<any>(null);
  const validationReportBreadcrumb = ref('');
  const controls = ref<any[]>([]);
  const discipline = ref<any | null>(null);
  const students = ref<any[]>([]);
  const reports = ref<ReportDto[]>([]);

  const planRowId = computed(() => Number(route.params.id));
  const viewingAsAdmin = computed(
    () => route.query.fromAdmin === '1' || route.query.fromAdmin === 'true'
  );
  const backNavLabel = computed(() =>
    viewingAsAdmin.value
      ? 'Вернуться в администрирование'
      : 'Вернуться к дисциплинам'
  );
  const viewingAsAdminTeacherFio = computed(
    () => (route.query.teacherFio as string) || '—'
  );
  const effectiveLastName = computed(() => {
    if (
      viewingAsAdmin.value &&
      viewingAsAdminTeacherFio.value &&
      viewingAsAdminTeacherFio.value !== '—'
    ) {
      const firstWord = String(viewingAsAdminTeacherFio.value)
        .trim()
        .split(/\s+/)[0];
      if (firstWord) {
        return firstWord;
      }
    }
    return lastName.value ?? '';
  });

  const visibleControlTypes = computed(() =>
    getVisibleControlTitles(String(planRowId.value))
  );

  const displayedTopicsByControlType = computed(() =>
    getDisplayedTopicsByControlType(String(planRowId.value))
  );

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

  const studentsByGroup = computed((): Record<string, StudentDto[]> => {
    const res: Record<string, StudentDto[]> = {};
    for (const s of students.value ?? []) {
      const group = String(s.groupName ?? s.group ?? '').trim();
      if (group) {
        (res[group] ??= []).push(s as StudentDto);
      }
    }
    return res;
  });

  const { disciplineWorksStats } = useDisciplineWorksStats(
    studentsByGroup,
    reports,
    controls,
    visibleControlTypes,
    displayedTopicsByControlType
  );

  const hasStudents = computed(
    () => Object.keys(studentsByGroup.value).length > 0
  );

  const cleanTitle = (v?: string) => (v ?? '').replace(/"/g, '');

  async function loadAll() {
    loading.value = true;
    try {
      const year = academicYear.value;
      const id = planRowId.value;
      const ln = effectiveLastName.value;

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
    if (effectiveLastName.value) {
      await loadAll();
    } else {
      router.push('/auth');
    }
  });

  watch(academicYear, () => {
    if (effectiveLastName.value) {
      loadAll();
    }
  });

  watch(
    () => [route.params.id, route.query.teacherFio],
    () => {
      if (effectiveLastName.value) {
        loadAll();
      }
    }
  );

  const uploadWork = () => (uploadDialog.value = true);
  const goBack = () => {
    if (viewingAsAdmin.value) {
      router.push({ name: 'admin', query: { tab: 'disciplines' } });
    } else {
      router.push('/disciplines');
    }
  };
  const goToArchive = () => router.push('/archive');

  async function onUpload(payload: any) {
    const dto = await uploadDisciplineReport(
      effectiveLastName.value,
      planRowId.value,
      {
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
      }
    );
    reports.value = [dto, ...reports.value];
    uploadDialog.value = false;
  }

  async function handleDownload(reportDto: ReportDto) {
    const blob = await apiDownloadReport(reportDto.id);
    downloadBlob(blob, reportDto.fileName || 'report');
  }

  async function handleViewReport(report: ReportDto) {
    try {
      const blob = await apiDownloadReport(report.id);
      const fileName = report.fileName || 'report.docx';
      const file = new File([blob], fileName, {
        type:
          blob.type ||
          'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      });
      const result = await validateDocument(file, { annotate: true });
      validationReportResult.value = result;
      const workTitle = (report.workTitle || report.topic || '')
        .toString()
        .slice(0, 60);
      validationReportBreadcrumb.value = `${report.workType || 'Работа'} > ${workTitle}${workTitle.length >= 60 ? '...' : ''}`;
      validationReportVisible.value = true;
    } catch (e) {
      console.error('Ошибка проверки отчёта:', e);
      validationReportResult.value = {
        valid: false,
        percent: report.check ?? 0,
        errors: [
          {
            code: 'ERROR',
            message: 'Не удалось выполнить проверку',
            passed: false,
          },
        ],
        warnings: [],
      };
      validationReportBreadcrumb.value = `${report.workType || ''} > ${(report.workTitle || report.topic || '').toString().slice(0, 50)}`;
      validationReportVisible.value = true;
    }
  }
</script>

<style scoped>
  .page {
    height: 100%;
    background: #f5f6f8;
    padding: 16px;
  }
  .admin-view-alert {
    margin-bottom: 16px;
  }
  .discipline-teacher-line {
    display: flex;
    align-items: center;
    gap: 8px;
    margin: 8px 0 0;
    font-size: 14px;
    color: #374151;
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
