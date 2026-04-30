<template>
  <etu-loading-page v-if="loading && !uiDiscipline" />
  <v-container
    v-else-if="uiDiscipline"
    fluid
    class="page"
  >
    <div
      v-if="showPlanTeacherNotice"
      class="plan-teacher-notice"
      role="status"
    >
      <div class="plan-teacher-notice__accent" aria-hidden="true" />
      <div class="plan-teacher-notice__icon-wrap">
        <v-icon
          class="plan-teacher-notice__icon"
          icon="mdi-book-account-outline"
          size="22"
        />
      </div>
      <div class="plan-teacher-notice__content">
        <div class="plan-teacher-notice__title">
          Нагрузка по рабочей программе
        </div>
        <p class="plan-teacher-notice__text">
          По плану эта дисциплина закреплена за преподавателем
          <span class="plan-teacher-notice__fio">{{ planTeacherFioLabel }}</span>.
          Студенты, группы и отчёты загружаются из нагрузки этого преподавателя;
          вы ведёте дисциплину как фактический ответственный.
        </p>
      </div>
    </div>

    <div
      v-if="viewingAsAdmin"
      class="admin-mode-banner"
      role="status"
    >
      <div class="admin-mode-banner__accent" aria-hidden="true" />
      <div class="admin-mode-banner__icon-wrap">
        <v-icon
          class="admin-mode-banner__icon"
          icon="mdi-shield-account"
          size="22"
        />
      </div>
      <div class="admin-mode-banner__content">
        <div class="admin-mode-banner__title">
          Просмотр от имени администратора
        </div>
        <p class="admin-mode-banner__text">
          Вы просматриваете дисциплину преподавателя:
          <span class="admin-mode-banner__fio">{{ viewingAsAdminTeacherFio }}</span>.
          Это не ваша дисциплина — действия выполняются в режиме администрирования.
        </p>
      </div>
    </div>
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
            <etu-button
              v-if="hasStudents"
              title="Мультизагрузка"
              width="auto"
              height="40"
              color="#bb8d54"
              :prepend-icon="MULTI_UPLOAD_ACCENT_ICON"
              :border-color="'#bb8d54'"
              :bg-color="'white'"
              :border="true"
              @click="openBatchUpload"
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
          title="Загружено учебных работ"
          icon="mdi-file-upload-outline"
          color="green"
          :value="`${disciplineWorksStats.uploaded} / ${disciplineWorksStats.total}`"
        />
      </div>
    </v-card>

    <students-reports-table
      v-if="hasStudents"
      :loading="loading"
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
    :template-id-by-work-type="templateIdByWorkType"
    @close="uploadDialog = false"
    @submit="onUpload"
  />

  <batch-upload-work-modal
    v-model="batchUploadDialog"
    :plan-row-id="planRowId"
    :teacher-last-name="uploadUrlLastName"
    :discipline="uiDiscipline"
    :groups="Object.keys(studentsByGroup)"
    :students-by-group="studentsByGroup"
    :topics="topics"
    :assessment="uiDiscipline?.Assessment ?? ''"
    :controls="controls"
    :template-id-by-work-type="templateIdByWorkType"
    @uploaded="refreshAfterBatchUpload"
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
  import MULTI_UPLOAD_ACCENT_ICON from '@/assets/icons/multi-upload-accent.svg';
  import UploadWorkModal from './components/UploadStudyWork.vue';
  import BatchUploadWorkModal from './components/BatchUploadWorkModal.vue';
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
    validateDocument,
  } from '@/api/info';
  import { useAcademicYear } from '@/composables/useAcademicYear';
  import { useUser } from '@/composables/useUser';
  import { useDownload } from '@/composables/useDownload';
  import {
    getVisibleControlTitles,
    getDisplayedTopicsByControlType,
    getTemplateIdByControlType,
  } from '@/modules/settings/composables/useDisciplineControlTypes';
  import { useDisciplineWorksStats } from './composables/useDisciplineWorksStats';
  import type { StudentDto } from './modal/student';
  import { normTeacherLast } from '@/modules/disciplines/utils/disciplineTeacherAssignments';

  const route = useRoute();
  const router = useRouter();
  const { academicYear } = useAcademicYear();
  const { lastName, uploadedBy } = useUser();
  const { downloadBlob } = useDownload();

  const loading = ref(false);
  const uploadDialog = ref(false);
  const batchUploadDialog = ref(false);
  const validationReportVisible = ref(false);
  const validationReportResult = ref<any>(null);
  const validationReportBreadcrumb = ref('');
  const controls = ref<any[]>([]);
  const discipline = ref<any | null>(null);
  const students = ref<any[]>([]);
  const reports = ref<ReportDto[]>([]);

  const planRowId = computed(() => Number(route.params.id));
  const planTeacherLastNameQuery = computed(() =>
    String(route.query.planTeacherLastName ?? '').trim()
  );
  const planTeacherFioQuery = computed(() =>
    String(route.query.planTeacherFio ?? '').trim()
  );
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

  /** Фамилия в URL для GET дисциплины / групп / отчётов (нагрузка из плана). */
  const apiPathLastName = computed(() => {
    const fromQ = planTeacherLastNameQuery.value;
    if (fromQ) {
      return fromQ;
    }
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

  /** Для загрузки работ — фактический преподаватель (вы), не план. */
  const uploadUrlLastName = computed(() => {
    if (viewingAsAdmin.value) {
      return effectiveLastName.value;
    }
    return lastName.value ?? '';
  });

  const showPlanTeacherNotice = computed(() => {
    if (viewingAsAdmin.value) {
      return false;
    }
    const me = (lastName.value ?? '').trim();
    const path = planTeacherLastNameQuery.value;
    if (!me || !path) {
      return false;
    }
    return normTeacherLast(path) !== normTeacherLast(me);
  });

  const planTeacherFioLabel = computed(() => {
    const f = planTeacherFioQuery.value;
    if (f) {
      return f;
    }
    return planTeacherLastNameQuery.value || 'другим преподавателем';
  });

  const visibleControlTypes = computed(() =>
    getVisibleControlTitles(String(planRowId.value))
  );

  const displayedTopicsByControlType = computed(() =>
    getDisplayedTopicsByControlType(String(planRowId.value))
  );

  const templateIdByWorkType = computed<Record<string, string | number>>(() =>
    getTemplateIdByControlType(String(planRowId.value))
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
      const ln = apiPathLastName.value;

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
    if (apiPathLastName.value) {
      await loadAll();
    } else {
      router.push('/auth');
    }
  });

  watch(academicYear, () => {
    if (apiPathLastName.value) {
      loadAll();
    }
  });

  watch(
    () => [
      route.params.id,
      route.query.teacherFio,
      route.query.planTeacherLastName,
      route.query.planTeacherFio,
    ],
    () => {
      if (apiPathLastName.value) {
        loadAll();
      }
    }
  );

  const uploadWork = () => (uploadDialog.value = true);
  const openBatchUpload = () => (batchUploadDialog.value = true);

  async function refreshAfterBatchUpload() {
    await loadAll();
  }
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
      uploadUrlLastName.value,
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

  .plan-teacher-notice {
    position: relative;
    display: flex;
    align-items: flex-start;
    gap: 14px;
    margin-bottom: 16px;
    padding: 16px 18px 16px 20px;
    border-radius: 14px;
    background: linear-gradient(145deg, #fffbeb 0%, #fef9c3 45%, #fff7ed 100%);
    border: 1px solid rgba(245, 158, 11, 0.35);
    box-shadow:
      0 1px 2px rgba(15, 23, 42, 0.04),
      0 8px 20px rgba(245, 158, 11, 0.12);
    overflow: hidden;
  }

  .plan-teacher-notice__accent {
    position: absolute;
    left: 0;
    top: 0;
    bottom: 0;
    width: 4px;
    background: linear-gradient(180deg, #f59e0b, #d97706);
    border-radius: 14px 0 0 14px;
  }

  .plan-teacher-notice__icon-wrap {
    flex-shrink: 0;
    width: 44px;
    height: 44px;
    border-radius: 12px;
    background: rgba(255, 255, 255, 0.85);
    display: grid;
    place-items: center;
    border: 1px solid rgba(251, 191, 36, 0.45);
  }

  .plan-teacher-notice__icon {
    color: #b45309 !important;
  }

  .plan-teacher-notice__content {
    min-width: 0;
    flex: 1;
  }

  .plan-teacher-notice__title {
    font-weight: 700;
    font-size: 15px;
    color: #92400e;
    margin-bottom: 6px;
  }

  .plan-teacher-notice__text {
    margin: 0;
    font-size: 13.5px;
    line-height: 1.5;
    color: #57534e;
  }

  .plan-teacher-notice__fio {
    font-weight: 700;
    color: #1c1917;
  }

  .admin-mode-banner {
    position: relative;
    display: flex;
    align-items: flex-start;
    gap: 14px;
    margin-bottom: 16px;
    padding: 16px 18px 16px 20px;
    border-radius: 14px;
    background: linear-gradient(145deg, #f8fafc 0%, #f1f5f9 55%, #eef2ff 100%);
    border: 1px solid rgba(148, 163, 184, 0.35);
    box-shadow:
      0 1px 2px rgba(15, 23, 42, 0.04),
      0 8px 24px rgba(37, 99, 235, 0.07);
    overflow: hidden;
  }
  .admin-mode-banner__accent {
    position: absolute;
    left: 0;
    top: 0;
    bottom: 0;
    width: 4px;
    background: linear-gradient(180deg, #2563eb 0%, #1d4ed8 100%);
    border-radius: 14px 0 0 14px;
  }
  .admin-mode-banner__icon-wrap {
    flex-shrink: 0;
    display: flex;
    align-items: center;
    justify-content: center;
    width: 44px;
    height: 44px;
    border-radius: 12px;
    background: rgba(255, 255, 255, 0.85);
    border: 1px solid rgba(226, 232, 240, 0.9);
    box-shadow: 0 1px 2px rgba(15, 23, 42, 0.05);
  }
  .admin-mode-banner__icon {
    color: #2563eb !important;
    opacity: 0.95;
  }
  .admin-mode-banner__content {
    min-width: 0;
    padding-top: 1px;
  }
  .admin-mode-banner__title {
    font-size: 0.9375rem;
    font-weight: 600;
    letter-spacing: -0.02em;
    color: #0f172a;
    line-height: 1.35;
    margin-bottom: 6px;
  }
  .admin-mode-banner__text {
    margin: 0;
    font-size: 0.875rem;
    line-height: 1.55;
    color: #475569;
    max-width: 72ch;
  }
  .admin-mode-banner__fio {
    font-weight: 600;
    color: #1e293b;
    white-space: normal;
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

  @media (max-width: 599px) {
    .page {
      padding: 12px;
    }

    .block {
      padding: 14px;
    }

    .top-row-inner {
      flex-direction: column;
      align-items: stretch;
      gap: 12px;
    }

    .actions {
      flex-direction: column;
      width: 100%;
      gap: 10px;
    }

    .actions :deep(.etu-btn) {
      width: 100% !important;
      max-width: none;
    }

    .title {
      font-size: 1.125rem;
    }

    .stats {
      grid-template-columns: 1fr;
      gap: 12px;
    }
  }
</style>
