<template>
  <v-dialog
    :model-value="modelValue"
    :max-width="isCompactScreen ? undefined : 980"
    :fullscreen="isCompactScreen"
    persistent
    scrollable
    @update:model-value="$emit('update:modelValue', $event)"
  >
    <v-card class="batch-card">
      <div class="header">
        <div>
          <h3>Массовая загрузка</h3>
          <div class="sub">
            Выберите источник (файлы или Moodle), укажите группу/вид контроля.
          </div>
        </div>
        <v-btn
          icon
          variant="text"
          @click="$emit('update:modelValue', false)"
        >
          <v-icon>mdi-close</v-icon>
        </v-btn>
      </div>

      <v-card-text class="body">
        <div class="top-grid">
          <v-select
            v-model="selectedGroup"
            class="field"
            label="Учебная группа *"
            variant="outlined"
            density="compact"
            hide-details
            :items="groups"
          />
          <v-select
            v-model="workType"
            class="field"
            label="Вид контроля *"
            variant="outlined"
            density="compact"
            hide-details
            :items="controlTypesOptions"
          />
          <v-select
            v-model="topic"
            class="field"
            label="Тема"
            variant="outlined"
            density="compact"
            hide-details
            :items="filteredTopicsList"
            :disabled="filteredTopicsList.length === 0"
          />
          <v-select
            v-model="academicYear"
            class="field"
            label="Учебный год"
            :items="ACADEMIC_YEAR_SELECT_ITEMS"
            item-title="title"
            item-value="value"
            variant="outlined"
            density="compact"
            hide-details
          />
        </div>
        <div class="source-mode-switch">
          <v-btn-toggle
            v-model="sourceMode"
            density="comfortable"
            mandatory
            divided
          >
            <v-btn value="file">
              Файлы
            </v-btn>
            <v-btn value="moodle">
              Moodle
            </v-btn>
          </v-btn-toggle>
        </div>

        <div
          v-if="sourceMode === 'file'"
          class="files-block"
        >
          <div class="files-head">
            <div class="files-title">Файлы</div>
            <div class="files-actions">
              <v-btn
                variant="outlined"
                color="primary"
                @click="openFileDialog"
              >
                Добавить файлы
              </v-btn>
              <v-btn
                variant="text"
                :disabled="!rows.length || busy"
                @click="clearAll"
              >
                Очистить
              </v-btn>
            </div>
          </div>

          <input
            v-if="sourceMode === 'file'"
            ref="fileInput"
            type="file"
            accept=".pdf,.doc,.docx"
            multiple
            hidden
            @change="onFilesPicked"
          />

          <div
            v-if="!rows.length"
            class="empty"
          >
            <template v-if="sourceMode === 'file'">
              <p class="empty-file-hint">
                Добавьте файлы работ студентов. Поля заполнятся автоматически, если имя файла собрано по схеме:
                <br />
                <code>группа_номер_видКонтроля_тема_годУчебный.docx</code>
                <br />
                Например:
                <code>2372_374285_Практическая_работа_Задача_классификации_Линейные_классификаторы_2024-2025.docx</code>
                <br />
              </p>
            </template>
            <template v-else>
              Добавьте строки студентов и оставьте ссылку Moodle.
            </template>
          </div>

          <div
            v-else
            class="table"
          >
            <div class="thead">
              <div>Файл</div>
              <div>Студент *</div>
              <div>Название работы *</div>
              <div>Проверка</div>
              <div></div>
            </div>

            <div
              v-for="r in rows"
              :key="r.id"
              class="trow"
            >
              <div class="file-cell">
                <template v-if="r.file">
                  <div class="file-name">{{ r.file.name }}</div>
                  <div class="file-meta">
                    {{ formatBytes(r.file.size) }}
                  </div>
                </template>
              </div>

              <div>
                <v-select
                  v-model="r.studentId"
                  class="field"
                  label="Студент"
                  item-title="name"
                  item-value="id"
                  variant="outlined"
                  density="compact"
                  hide-details
                  :items="getStudentSelectItemsForRow(r)"
                  :disabled="!selectedGroup"
                />
              </div>

              <div>
                <v-textarea
                  :key="`wt-${r.id}-${r.file?.name ?? ''}`"
                  v-model="r.workTitle"
                  class="field work-title-field"
                  label="Название"
                  variant="outlined"
                  density="compact"
                  hide-details
                  rows="1"
                  auto-grow
                  row-height="22"
                />
              </div>

              <div class="status">
                <template v-if="sourceMode === 'file' && r.validation">
                  <span
                    :class="['pill', r.validation.valid ? 'ok' : 'warn']"
                  >
                    {{ r.validation.valid ? 'OK' : 'Есть замечания' }}
                  </span>
                  <span class="muted">{{ r.validation.percent ?? '—' }}%</span>
                </template>
                <template v-else>
                  <span class="muted">—</span>
                </template>
              </div>

              <div class="row-actions">
                <v-btn
                  icon
                  variant="text"
                  :disabled="busy"
                  @click="removeRow(r.id)"
                >
                  <v-icon>mdi-close</v-icon>
                </v-btn>
              </div>

              <div
                v-if="sourceMode === 'file' && r.validation?.annotatedFileBase64"
                class="annotated"
              >
                <v-btn
                  size="small"
                  variant="tonal"
                  prepend-icon="mdi-file-eye-outline"
                  @click="downloadAnnotated(r)"
                >
                  Файл с замечаниями
                </v-btn>
              </div>
            </div>
          </div>
        </div>

        <div
          v-else
          class="moodle-single-link"
        >
          <v-text-field
            v-model="moodleCourseUrl"
            class="field moodle-link-input"
            label="Ссылка Moodle для выбранной темы *"
            variant="outlined"
            density="compact"
            hide-details
          />
          <div class="empty">
            Ссылка будет назначена всем студентам выбранной группы по выбранной теме.
          </div>
        </div>

        <div
          v-if="sourceMode === 'file'"
          class="options"
        >
          <v-checkbox
            v-model="autoCheck"
            color="primary"
            density="comfortable"
            hide-details
          >
            <template #label>
              <span>Проверять оформление по шаблону перед загрузкой</span>
            </template>
          </v-checkbox>
        </div>

        <div
          v-if="errorText"
          class="error"
        >
          {{ errorText }}
        </div>
      </v-card-text>

      <v-card-actions class="actions">
        <v-btn
          variant="text"
          @click="$emit('update:modelValue', false)"
        >
          Отмена
        </v-btn>
        <v-spacer />
        <v-btn
          color="#111827"
          :disabled="!canSubmit || busy"
          :loading="busy"
          @click="validateAndUpload"
        >
          <v-icon start>mdi-upload</v-icon>
          {{
            busy && phase === 'validate'
              ? 'Проверка…'
              : sourceMode === 'file'
                ? 'Загрузить все'
                : 'Moodle'
          }}
        </v-btn>
      </v-card-actions>

      <v-dialog
        v-model="showBatchReviewDialog"
        max-width="720"
        persistent
      >
        <v-card class="batch-review-card">
          <div class="batch-review-header">
            <div>
              <h3 class="batch-review-title">Проверка по шаблону</h3>
              <p class="batch-review-sub">
                Файлов: {{ rows.length }}. Откройте подробный отчёт по строке или загрузите все на сервер.
              </p>
            </div>
            <v-btn
              icon
              variant="text"
              @click="closeBatchReviewDialog"
            >
              <v-icon>mdi-close</v-icon>
            </v-btn>
          </div>
          <v-card-text class="batch-review-body">
            <div
              v-for="r in rows"
              :key="'rev-' + r.id"
              class="batch-review-row"
            >
              <div class="batch-review-row-main">
                <span class="batch-review-fname">{{ r.file?.name ?? '—' }}</span>
                <template v-if="r.validation">
                  <span
                    :class="['pill', r.validation.valid ? 'ok' : 'warn']"
                  >
                    {{ r.validation.valid ? 'OK' : 'Замечания' }}
                  </span>
                  <span class="muted">{{ r.validation.percent ?? '—' }}%</span>
                </template>
                <span
                  v-else
                  class="muted"
                >Нет результата</span>
              </div>
              <v-btn
                size="small"
                variant="tonal"
                color="primary"
                :disabled="!r.validation"
                @click="openValidationDetail(r)"
              >
                Подробнее
              </v-btn>
            </div>
          </v-card-text>
          <v-card-actions class="batch-review-actions">
            <v-btn
              variant="text"
              @click="closeBatchReviewDialog"
            >
              Назад к списку
            </v-btn>
            <v-spacer />
            <v-btn
              color="primary"
              :loading="busy && phase === 'upload'"
              @click="confirmBatchUploadAfterReview"
            >
              Загрузить все
            </v-btn>
          </v-card-actions>
        </v-card>
      </v-dialog>

      <validation-report-modal
        v-model="showValidationDetailDialog"
        :result="validationDetailResult"
        :breadcrumb="validationDetailBreadcrumb"
      />
    </v-card>
  </v-dialog>
</template>

<script setup lang="ts">
  import { computed, ref, watch } from 'vue';
  import { useDisplay } from 'vuetify';
  import { useAcademicYear } from '@/composables/useAcademicYear';
  import { useDownload } from '@/composables/useDownload';
  import { useUser } from '@/composables/useUser';
  import { ACADEMIC_YEAR_SELECT_ITEMS } from '@/constants/academicYearSelectItems';
  import {
    putDisciplineMoodleLink,
    uploadDisciplineReport,
    validateBatch,
    type ValidationResult,
  } from '@/api/info';
  import { applyBatchValidationToRowsMutable } from '../utils/batchValidationMap';
  import ValidationReportModal from './ValidationReportModal.vue';
  import {
    type AutofillContext,
    controlTextsForGroup,
    extractFullStemTitle,
    parseFilename,
    topicsForGroupAndWorkTypePure,
  } from './filenameAutofill';
  import type { StudentInGroupRow, UploadDisciplineModalProps, UploadWorkPayload } from '../modal/uploadWorkModal';

  const props = defineProps<
    {
      modelValue: boolean;
      planRowId: number;
      teacherLastName: string;
    } & UploadDisciplineModalProps
  >();

  const emit = defineEmits<{
    (e: 'update:modelValue', v: boolean): void;
    (e: 'uploaded'): void;
  }>();

  const { academicYear } = useAcademicYear();
  const { uploadedBy } = useUser();
  const { downloadAnnotatedFile } = useDownload();
  const { mdAndDown } = useDisplay();
  const isCompactScreen = computed(() => mdAndDown.value);

  const selectedGroup = ref('');
  const workType = ref('');
  const topic = ref('');
  const sourceMode = ref<'file' | 'moodle'>('file');
  const moodleCourseUrl = ref('');
  const autoCheck = ref(true);
  const annotate = ref(false);
  const errorText = ref<string>('');
  const busy = ref(false);
  const phase = ref<'idle' | 'validate' | 'upload'>('idle');
  const fileInput = ref<HTMLInputElement | null>(null);
  const showBatchReviewDialog = ref(false);
  const showValidationDetailDialog = ref(false);
  const validationDetailResult = ref<ValidationResult | null>(null);
  const validationDetailBreadcrumb = ref('');

  type Row = {
    id: string;
    file: File | null;
    studentId: number | string | null;
    workTitle: string;
    validation?: ValidationResult | null;
  };

  const rows = ref<Row[]>([]);

  // значение года в модели должно быть как в запросах (через дефис)
  watch(
    academicYear,
    (v) => {
      if (typeof v === 'string' && v.includes('/')) {
        academicYear.value = v.replace(/\//g, '-');
      }
    },
    { immediate: true }
  );

  const groups = computed(() => props.groups ?? []);

  const controlTypesOptions = computed(() =>
    controlTextsForGroup(props.controls ?? [], String(selectedGroup.value ?? '').trim())
  );

  const academicYearWhitelist = computed(
    () => new Set(ACADEMIC_YEAR_SELECT_ITEMS.map((i) => String(i.value)))
  );

  const autofillContext = computed<AutofillContext>(() => ({
    groups: groups.value,
    controls: props.controls ?? [],
    studentsByGroup: props.studentsByGroup ?? {},
    academicYearWhitelist: academicYearWhitelist.value,
  }));

  const filteredTopicsList = computed(() =>
    topicsForGroupAndWorkTypePure(
      props.controls ?? [],
      String(selectedGroup.value ?? '').trim(),
      String(workType.value ?? '').trim(),
      props.topics ?? []
    )
  );

  watch([selectedGroup, workType], () => {
    if (!selectedGroup.value) return;
    if (workType.value && !controlTypesOptions.value.includes(workType.value)) {
      workType.value = '';
    }
    if (topic.value && filteredTopicsList.value.length && !filteredTopicsList.value.includes(topic.value)) {
      topic.value = '';
    }
  });

  function getStudentIdRaw(s: StudentInGroupRow): number {
    const v = s.studentId ?? s.lkId ?? s.lk_id ?? s['ID ИОТ'];
    const n = Number(v);
    return Number.isFinite(n) ? n : 0;
  }

  function studentSelectName(s: StudentInGroupRow, id: number): string {
    const label = s.fio ?? s['ФИО'] ?? s['Фамилия И.О.'];
    const text = label != null ? String(label).trim() : '';
    return text || String(id || '—');
  }

  const studentsForSelect = computed(() => {
    const group = selectedGroup.value;
    if (!group) return [];
    const seen = new Set<number>();
    return (props.studentsByGroup[group] ?? [])
      .map((s) => {
        const id = getStudentIdRaw(s);
        return { id, name: studentSelectName(s, id) };
      })
      .filter((x) => x.id !== 0 && !seen.has(x.id) && (seen.add(x.id), true));
  });

  /** Иначе Vuetify v-select сбрасывает model, если id нет в items. */
  function getStudentSelectItemsForRow(row: Row): { id: number; name: string }[] {
    const items = studentsForSelect.value;
    const nid = Number(row.studentId);
    if (!Number.isFinite(nid) || nid <= 0) return items;
    if (items.some((x) => x.id === nid)) return items;
    return [...items, { id: nid, name: `ID ${nid} (нет в списке группы)` }];
  }

  const canSubmit = computed(() => {
    const g = selectedGroup.value.trim();
    const wt = workType.value.trim();
    if (!g || !wt) return false;
    if (sourceMode.value === 'moodle') {
      return moodleCourseUrl.value.trim().length > 0 && studentsForSelect.value.length > 0;
    }
    if (!rows.value.length) return false;
    const commonFilled = rows.value.every((r) => Number.isFinite(Number(r.studentId)) && r.workTitle.trim().length > 0);
    if (!commonFilled) return false;
    return rows.value.every((r) => r.file instanceof File);
  });

  function openFileDialog() {
    if (sourceMode.value !== 'file') return;
    fileInput.value?.click();
  }

  function onFilesPicked(e: Event) {
    const input = e.target as HTMLInputElement;
    const fs = [...(input.files ?? [])].filter((f) => f instanceof File);
    if (!fs.length) return;
    addFiles(fs);
    input.value = '';
  }

  function buildRowFromFile(file: File): Row {
    const parsed = parseFilename(file.name, autofillContext.value);
    return {
      id: `${Date.now()}_${Math.random().toString(16).slice(2)}`,
      file,
      studentId: parsed.studentId ?? null,
      workTitle: parsed.workTitle || extractFullStemTitle(file.name),
      validation: null,
    };
  }

  /**
   * Общие поля (группа / вид / тема / год) из первого файла пачки.
   * Группа из имени перезаписывает выбранную, если отличается (как при поочерёдном автозаполнении).
   */
  function applyShared(newRows: Row[]) {
    const first = newRows[0]?.file;
    if (!first) return;
    const firstParsed = parseFilename(first.name, autofillContext.value);

    if (firstParsed.group) {
      const nextG = String(firstParsed.group).trim();
      const curG = String(selectedGroup.value ?? '').trim();
      if (!curG || curG !== nextG) {
        selectedGroup.value = firstParsed.group;
      }
    }

    const sg = String(selectedGroup.value ?? '').trim() || String(firstParsed.group ?? '').trim();

    if (!workType.value.trim() && firstParsed.workType) {
      const allowed = controlTextsForGroup(props.controls ?? [], sg);
      if (!allowed.length || allowed.includes(firstParsed.workType)) {
        workType.value = firstParsed.workType;
      }
    }

    if (!topic.value.trim() && firstParsed.topic) {
      const topicsAllowed = topicsForGroupAndWorkTypePure(
        props.controls ?? [],
        sg,
        String(workType.value ?? '').trim(),
        props.topics ?? []
      );
      if (!topicsAllowed.length || topicsAllowed.includes(firstParsed.topic)) {
        topic.value = firstParsed.topic;
      }
    }

    if (
      firstParsed.academicYear &&
      academicYearWhitelist.value.has(firstParsed.academicYear)
    ) {
      academicYear.value = firstParsed.academicYear;
    }
  }

  /** Добавление строк синхронно — без await/nextTick между строками (нет гонки с workTitle). */
  function addFiles(fs: File[]) {
    const newRows = fs.map((f) => buildRowFromFile(f));
    rows.value.push(...newRows);
    applyShared(newRows);
  }

  function clearAll() {
    rows.value = [];
    errorText.value = '';
  }

  function removeRow(id: string) {
    rows.value = rows.value.filter((r) => r.id !== id);
  }

  function formatBytes(n: number): string {
    const v = Number(n);
    if (!Number.isFinite(v) || v <= 0) return '—';
    const kb = 1024;
    const mb = kb * 1024;
    if (v >= mb) return `${(v / mb).toFixed(1)} МБ`;
    if (v >= kb) return `${Math.round(v / kb)} КБ`;
    return `${v} Б`;
  }

  function downloadAnnotated(r: Row) {
    const b64 = r.validation?.annotatedFileBase64;
    const fallbackName = r.file?.name ?? 'отчет';
    const name = r.validation?.annotatedFileName ?? `${fallbackName}_замечания.docx`;
    if (!b64) return;
    downloadAnnotatedFile(b64, name);
  }

  function buildUploadPayload(r: Row): UploadWorkPayload {
    return {
      studentId: Number(r.studentId),
      groupName: selectedGroup.value,
      topic: filteredTopicsList.value.length ? (topic.value || '') : '',
      controlType: '', // будет заполнено на сервере/в отчётах как есть; сейчас не вводим отдельно
      workType: workType.value,
      workTitle: r.workTitle,
      academicYear: academicYear.value,
      autoCheck: autoCheck.value,
      check: autoCheck.value ? (r.validation?.percent ?? null) : null,
      status: 'Загружен',
      uploadedBy: uploadedBy.value ?? 'unknown',
      file: r.file ?? undefined,
      moodleUrl: '',
      storageType: 'file',
    };
  }

  async function executeBatchValidation(): Promise<void> {
    const fileRows = rows.value.filter((r) => r.file instanceof File);
    if (!fileRows.length) return;
    const resolved = workType.value.trim();
    const tid =
      props.templateId ??
      (resolved ? props.templateIdByWorkType?.[resolved] : undefined) ??
      null;
    const res = await validateBatch(
      fileRows.map((r) => r.file as File),
      { templateId: tid, annotate: annotate.value }
    );
    applyBatchValidationToRowsMutable(res, fileRows);
  }

  async function uploadAllRows(): Promise<void> {
    phase.value = 'upload';
    if (sourceMode.value === 'moodle') {
      await putDisciplineMoodleLink(
        props.teacherLastName,
        props.planRowId,
        {
          groupName: selectedGroup.value,
          controlType: workType.value,
          topic: String(topic.value || '').trim(),
          academicYear: String(academicYear.value || '').trim(),
          moodleUrl: String(moodleCourseUrl.value).trim(),
          updatedBy: uploadedBy.value ?? 'unknown',
        }
      );
      errorText.value = '';
      emit('update:modelValue', false);
      emit('uploaded');
      return;
    }
    for (const r of rows.value) {
      const payload = buildUploadPayload(r);
      await uploadDisciplineReport(
        props.teacherLastName,
        props.planRowId,
        payload
      );
    }
    rows.value = [];
    errorText.value = '';
    emit('update:modelValue', false);
    emit('uploaded');
  }

  function closeBatchReviewDialog() {
    showBatchReviewDialog.value = false;
  }

  function openValidationDetail(r: Row) {
    if (!r.validation) return;
    validationDetailResult.value = r.validation;
    validationDetailBreadcrumb.value = r.file?.name ?? 'Работа';
    showValidationDetailDialog.value = true;
  }

  async function confirmBatchUploadAfterReview() {
    showBatchReviewDialog.value = false;
    busy.value = true;
    try {
      await uploadAllRows();
    } catch (e: unknown) {
      errorText.value =
        e instanceof Error ? e.message : 'Ошибка загрузки';
    } finally {
      phase.value = 'idle';
      busy.value = false;
    }
  }

  async function validateAndUpload() {
    errorText.value = '';
    if (!canSubmit.value) {
      errorText.value = sourceMode.value === 'moodle'
        ? 'Заполните группу, вид контроля и ссылку Moodle.'
        : 'Заполните группу, вид контроля, студента и название работы для каждого файла.';
      return;
    }
    busy.value = true;
    try {
      if (autoCheck.value && sourceMode.value === 'file') {
        phase.value = 'validate';
        await executeBatchValidation();
        showBatchReviewDialog.value = true;
        return;
      }
      await uploadAllRows();
    } catch (e: unknown) {
      errorText.value =
        e instanceof Error ? e.message : 'Ошибка загрузки';
    } finally {
      phase.value = 'idle';
      busy.value = false;
    }
  }

  watch(
    () => props.modelValue,
    (open) => {
      if (!open) {
        showBatchReviewDialog.value = false;
        showValidationDetailDialog.value = false;
        validationDetailResult.value = null;
        validationDetailBreadcrumb.value = '';
      }
    }
  );

  watch(sourceMode, (mode) => {
    if (mode === 'file') {
      rows.value = [];
    }
    errorText.value = '';
    if (mode === 'moodle') {
      autoCheck.value = false;
    }
  });
</script>

<style scoped>
  .batch-card {
    border-radius: 16px;
    overflow: hidden;
    max-height: min(92vh, 920px);
    display: flex;
    flex-direction: column;
  }
  .header {
    display: flex;
    align-items: flex-start;
    justify-content: space-between;
    gap: 12px;
    padding: 20px 24px 12px;
  }
  .header h3 {
    margin: 0;
    font-size: 20px;
    font-weight: 700;
    color: #0f172a;
  }
  .sub {
    margin-top: 6px;
    font-size: 13px;
    color: #64748b;
  }
  .body {
    padding: 12px 24px 16px;
    overflow-y: auto;
    overflow-x: hidden;
  }
  .top-grid {
    display: grid;
    grid-template-columns: 1.2fr 1.2fr 1.6fr 0.8fr;
    gap: 12px;
    margin-bottom: 16px;
  }
  .source-mode-switch {
    margin-bottom: 12px;
  }
  .field :deep(.v-field) {
    border-radius: 10px;
    background: #f8fafc;
  }
  .work-title-field :deep(.v-field__input),
  .work-title-field :deep(textarea) {
    min-height: 40px;
    line-height: 1.35;
    overflow-wrap: anywhere;
    word-break: break-word;
    white-space: pre-wrap;
  }
  .files-block {
    border: 1px solid #e2e8f0;
    border-radius: 14px;
    background: #ffffff;
    padding: 12px 14px;
  }
  .files-head {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 10px;
    margin-bottom: 10px;
  }
  .files-title {
    font-size: 14px;
    font-weight: 700;
    color: #0f172a;
  }
  .files-actions {
    display: flex;
    align-items: center;
    gap: 8px;
  }
  .moodle-link-input {
    margin-bottom: 10px;
  }
  .moodle-single-link {
    margin-top: 6px;
  }
  .empty {
    padding: 14px;
    color: #64748b;
    font-size: 13px;
    line-height: 1.5;
    background: #f8fafc;
    border-radius: 12px;
  }
  .empty-lead {
    margin: 0 0 8px;
  }
  .empty-lead:last-child {
    margin-bottom: 0;
  }
  .empty code {
    font-size: 12px;
    padding: 1px 5px;
    border-radius: 6px;
    background: #e2e8f0;
    color: #0f172a;
    word-break: break-all;
  }
  .empty-file-hint {
    margin: 0;
    font-size: 13px;
    line-height: 1.5;
    color: #475569;
  }
  .table {
    display: flex;
    flex-direction: column;
    gap: 8px;
  }
  .thead {
    display: grid;
    grid-template-columns: 2fr 1.4fr 1.6fr 0.9fr 44px;
    gap: 10px;
    padding: 8px 10px;
    font-size: 12px;
    font-weight: 700;
    color: #475569;
  }
  .trow {
    display: grid;
    grid-template-columns: 2fr 1.4fr 1.6fr 0.9fr 44px;
    gap: 10px;
    padding: 10px;
    border: 1px solid #e2e8f0;
    border-radius: 12px;
    background: #f8fafc;
    align-items: start;
  }
  .trow > div {
    min-width: 0;
  }
  .file-name {
    font-weight: 600;
    color: #0f172a;
    word-break: break-word;
  }
  .file-meta {
    margin-top: 4px;
    font-size: 12px;
    color: #64748b;
  }
  .status {
    display: flex;
    align-items: center;
    gap: 8px;
    padding-top: 8px;
  }
  .pill {
    font-size: 12px;
    font-weight: 700;
    padding: 2px 8px;
    border-radius: 999px;
  }
  .pill.ok {
    background: #dcfce7;
    color: #166534;
  }
  .pill.warn {
    background: #fef3c7;
    color: #92400e;
  }
  .muted {
    font-size: 12px;
    color: #64748b;
  }
  .row-actions {
    display: flex;
    justify-content: flex-end;
    padding-top: 4px;
  }
  .annotated {
    grid-column: 1 / -1;
    margin-top: 6px;
  }
  .options {
    display: flex;
    flex-wrap: wrap;
    gap: 6px 18px;
    margin-top: 14px;
  }
  .error {
    margin-top: 12px;
    padding: 10px 12px;
    border-radius: 10px;
    background: #fef2f2;
    border: 1px solid #fecaca;
    color: #991b1b;
    font-size: 13px;
  }
  .actions {
    padding: 16px 24px 20px;
    gap: 10px;
    flex-wrap: wrap;
    border-top: 1px solid #e5e7eb;
  }

  .batch-review-card {
    border-radius: 16px;
    overflow: hidden;
  }
  .batch-review-header {
    display: flex;
    align-items: flex-start;
    justify-content: space-between;
    gap: 12px;
    padding: 18px 20px 8px;
  }
  .batch-review-title {
    margin: 0;
    font-size: 18px;
    font-weight: 700;
    color: #0f172a;
  }
  .batch-review-sub {
    margin: 6px 0 0;
    font-size: 13px;
    color: #64748b;
    line-height: 1.4;
  }
  .batch-review-body {
    padding-top: 8px;
    max-height: min(52vh, 420px);
    overflow-y: auto;
  }
  .batch-review-row {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 12px;
    padding: 10px 12px;
    margin-bottom: 8px;
    border: 1px solid #e2e8f0;
    border-radius: 10px;
    background: #f8fafc;
  }
  .batch-review-row-main {
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    gap: 8px;
    min-width: 0;
    flex: 1;
  }
  .batch-review-fname {
    font-size: 13px;
    font-weight: 600;
    color: #0f172a;
    word-break: break-word;
    flex: 1 1 160px;
    min-width: 0;
  }
  .batch-review-actions {
    padding: 12px 20px 18px;
    flex-wrap: wrap;
  }

  @media (max-width: 960px) {
    .top-grid {
      grid-template-columns: 1fr;
    }
    .header {
      padding: 16px 16px 10px;
    }
    .body {
      padding: 10px 16px 14px;
    }
    .actions {
      padding: 12px 16px 14px;
    }
    .files-head {
      flex-direction: column;
      align-items: stretch;
    }
    .files-actions {
      width: 100%;
      justify-content: space-between;
    }
    .thead,
    .trow {
      grid-template-columns: 1fr;
    }
    .row-actions {
      justify-content: flex-start;
    }
  }

  @media (max-width: 600px) {
    .batch-card {
      border-radius: 0;
      max-height: 100dvh;
      height: 100dvh;
    }
    .source-mode-switch :deep(.v-btn-toggle) {
      width: 100%;
    }
    .source-mode-switch :deep(.v-btn) {
      flex: 1 1 0;
    }
    .files-actions {
      flex-direction: column;
      align-items: stretch;
    }
    .files-actions > .v-btn {
      width: 100%;
    }
    .actions {
      position: sticky;
      bottom: 0;
      background: #fff;
      z-index: 2;
    }
    .actions :deep(.v-btn) {
      width: 100%;
    }
    .actions :deep(.v-spacer) {
      display: none;
    }
  }
</style>

