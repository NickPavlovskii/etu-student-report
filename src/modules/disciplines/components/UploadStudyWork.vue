<template>
  <v-dialog
    v-model="dialog"
    max-width="760"
    persistent
  >
    <v-card
      class="upload-card"
      elevation="1"
    >
      <div class="header">
        <h3>Загрузить учебную работу</h3>
        <v-btn
          icon
          variant="text"
          @click="close"
        >
          <v-icon>mdi-close</v-icon>
        </v-btn>
      </div>

      <v-card-text>
        <div
          :class="['file-dropzone', { 'is-dragover': isDragOver }]"
          @click="openFileDialog"
          @dragover.prevent="isDragOver = true"
          @dragleave.prevent="isDragOver = false"
          @drop.prevent="onDrop"
        >
          <v-icon size="36">mdi-upload</v-icon>
          <div class="drop-title">
            {{ dropzoneFileLabel }}
          </div>
          <div class="drop-sub">PDF, DOC, DOCX до 50 МБ</div>
          <div class="drop-hint">💡 ФамилияИО_Дисциплина_ТипРаботы</div>
          <input
            ref="fileInput"
            type="file"
            accept=".pdf,.doc,.docx"
            hidden
            @change="onFileChange"
          />
        </div>

        <v-row
          dense
          class="form-row"
        >
          <v-col cols="6">
            <v-select
              v-model="selectedGroup"
              class="upload-form-field"
              label="Учебная группа *"
              variant="outlined"
              density="compact"
              hide-details
              :items="groups"
            />
          </v-col>

          <v-col cols="6">
            <v-select
              v-model="selectedStudentId"
              class="upload-form-field"
              label="Студент *"
              item-title="name"
              item-value="id"
              variant="outlined"
              density="compact"
              hide-details
              :disabled="!selectedGroup"
              :items="studentsForSelect"
            />
          </v-col>

          <v-col cols="6">
            <v-text-field
              :model-value="disciplineTitle"
              class="upload-form-field upload-form-field--readonly"
              label="Дисциплина"
              readonly
              variant="outlined"
              density="compact"
              hide-details
              tabindex="-1"
            />
          </v-col>

          <v-col cols="6">
            <v-select
              v-model="workType"
              class="upload-form-field"
              label="Вид контроля *"
              variant="outlined"
              density="compact"
              hide-details
              :items="controlTypesOptions"
            />
          </v-col>

          <v-col cols="12">
            <v-text-field
              v-model="workTitle"
              class="upload-form-field"
              label="Название работы *"
              variant="outlined"
              density="compact"
              hide-details
            />
          </v-col>

          <v-col
            cols="12"
            v-if="filteredTopicsList.length"
          >
            <v-select
              v-model="topic"
              class="upload-form-field"
              label="Тема"
              variant="outlined"
              density="compact"
              hide-details
              :items="filteredTopicsList"
            />
          </v-col>

          <v-col cols="12">
            <v-select
              v-model="academicYear"
              class="upload-form-field"
              label="Учебный год"
              :items="ACADEMIC_YEAR_SELECT_ITEMS"
              item-title="title"
              item-value="value"
              variant="outlined"
              density="compact"
              hide-details
            />
          </v-col>
        </v-row>

        <div class="auto-check-block">
          <v-checkbox
            v-model="autoCheck"
            color="primary"
            density="comfortable"
            hide-details
          >
            <template #label>
              <span class="auto-check-label">Проверить оформление по шаблону перед загрузкой</span>
            </template>
          </v-checkbox>
        </div>
      </v-card-text>

      <v-card-actions class="actions">
        <v-btn
          class="upload-actions-cancel"
          variant="text"
          @click="close"
        >
          Отмена
        </v-btn>
        <v-spacer />
        <v-btn
          class="upload-actions-submit"
          color="#111827"
          :disabled="!isValid || validating"
          :loading="validating"
          @click="submitWork"
        >
          <v-icon start>mdi-upload</v-icon>
          {{ primaryUploadLabel }}
        </v-btn>
      </v-card-actions>

      <v-dialog
        v-model="showValidationResult"
        max-width="820"
        persistent
      >
        <v-card class="validation-result-card">
          <div class="validation-header">
            <v-icon
              :color="validationHeaderIconColor"
              size="28"
            >
              {{ validationHeaderIconName }}
            </v-icon>
            <div>
              <h3 class="validation-title">
                {{ validationResultTitleText }}
              </h3>
              <div
                v-if="displayCompliancePercent != null"
                class="validation-percent"
              >
                Соответствие: {{ displayCompliancePercent }}%
              </div>
            </div>
          </div>
          <v-card-text v-if="validationResult">
            <div class="validation-criteria-list">
              <div
                v-for="(c, idx) in visibleCriteria"
                :key="c.code + '-' + idx"
                :class="['validation-item', validationCriterionRowModifiers(c)]"
              >
                <v-icon
                  size="18"
                  :color="validationCriterionIconColor(c)"
                >
                  {{ validationCriterionIconName(c) }}
                </v-icon>
                <div class="criteria-content">
                  <span class="criteria-title">{{ validationCriterionDisplayTitle(c) }}:</span>
                  <span class="criteria-message">{{ c.message }}</span>
                  <div
                    v-if="
                      (c.expected || c.actual) &&
                      (!c.passed || validationCriterionShowExpectedActualWhenPassed(c))
                    "
                    class="criteria-details"
                  >
                    <span v-if="c.expected">Ожидалось: {{ c.expected }}</span>
                    <span v-if="c.actual">· Фактически: {{ c.actual }}</span>
                  </div>
                </div>
              </div>
            </div>
          </v-card-text>
          <v-card-actions class="validation-result-actions">
            <v-btn
              v-if="showAnnotatedFileButton"
              class="validation-download-btn"
              variant="tonal"
              prepend-icon="mdi-file-eye-outline"
              @click="openAnnotatedFile"
            >
              {{ annotatedFileButtonLabel }}
            </v-btn>
            <v-spacer class="validation-actions-spacer" />
            <div class="validation-actions-right">
              <v-btn
                variant="text"
                @click="showValidationResult = false"
              >
                Отмена
              </v-btn>
              <v-btn
                color="primary"
                @click="confirmUploadDespiteValidation"
              >
                {{ confirmUploadAfterValidationLabel }}
              </v-btn>
            </div>
          </v-card-actions>
        </v-card>
      </v-dialog>
    </v-card>
  </v-dialog>
</template>

<script setup lang="ts">
  import { ref, computed, watch } from 'vue';
  import { useAcademicYear } from '@/composables/useAcademicYear';
  import { useDownload } from '@/composables/useDownload';
  import { validateDocument, type ValidationResult } from '@/api/info';
  import { ACADEMIC_YEAR_SELECT_ITEMS } from '@/constants/academicYearSelectItems';
  import {
    filterDisplayedValidationCriteria,
    mergeValidationResultItems,
    validationCriterionDisplayTitle,
    validationCriterionShowExpectedActualWhenPassed,
  } from '@/utils/validationCriteriaDisplay';
  import {
    validationCriterionIconColor,
    validationCriterionIconName,
    validationCriterionRowModifiers,
  } from '@/utils/validationCriterionVisual';
  import type {
    StudentInGroupRow,
    UploadDisciplineModalProps,
    UploadWorkPayload,
  } from '../modal/uploadWorkModal';

  const { academicYear } = useAcademicYear();
  const { downloadAnnotatedFile } = useDownload();

  const props = defineProps<UploadDisciplineModalProps>();

  const emit = defineEmits<{
    (e: 'close'): void;
    (e: 'submit', payload: UploadWorkPayload): void;
  }>();

  const dialog = ref(true);

  const file = ref<File | null>(null);
  const fileInput = ref<HTMLInputElement | null>(null);
  const isDragOver = ref(false);
  const selectedGroup = ref('');

  const selectedStudentId = ref<number | string | null>(null);

  const workType = ref('');
  const topic = ref('');
  const workTitle = ref('');
  const autoCheck = ref(true);
  const validating = ref(false);
  const showValidationResult = ref(false);
  const validationResult = ref<ValidationResult | null>(null);
  const pendingSubmitPayload = ref<UploadWorkPayload | null>(null);

  const dropzoneFileLabel = computed(() =>
    file.value ? file.value.name : 'Нажмите для выбора файла'
  );

  const primaryUploadLabel = computed(() =>
    validating.value ? 'Проверка...' : 'Загрузить'
  );

  const validationHeaderIconColor = computed(() =>
    validationResult.value?.valid ? 'success' : 'warning'
  );

  const validationHeaderIconName = computed(() =>
    validationResult.value?.valid ? 'mdi-check-circle' : 'mdi-alert-circle'
  );

  const validationResultTitleText = computed(() =>
    validationResult.value?.valid ? 'Проверка пройдена' : 'Найдены замечания'
  );

  const confirmUploadAfterValidationLabel = computed(() =>
    validationResult.value?.valid
      ? 'Загрузить'
      : 'Загрузить несмотря на замечания'
  );

  const showAnnotatedFileButton = computed(() => {
    const r = validationResult.value;
    return !!(r?.annotatedFileBase64 && r?.annotatedFileName);
  });

  const isAnnotatedPdf = computed(() =>
    (validationResult.value?.annotatedFileName ?? '')
      .toLowerCase()
      .endsWith('.pdf')
  );

  const annotatedFileButtonLabel = computed(() =>
    isAnnotatedPdf.value
      ? 'Просмотреть файл с замечаниями'
      : 'Скачать файл с замечаниями'
  );

  const visibleCriteria = computed(() =>
    filterDisplayedValidationCriteria(
      mergeValidationResultItems(validationResult.value)
    )
  );

  const displayCompliancePercent = computed<number | null>(() => {
    const r = validationResult.value;
    if (!r) return null;
    const merged = mergeValidationResultItems(r);
    if (merged.length) {
      const vis = filterDisplayedValidationCriteria(merged);
      if (!vis.length) return r.percent ?? null;
      const passed = vis.filter((c) => c.passed).length;
      return Math.round((100 * passed) / vis.length);
    }
    return r.percent ?? null;
  });

  const disciplineTitle = computed(() => {
    const d = props.discipline;
    if (!d) return '';
    return d.Discipline ?? d.Name ?? '';
  });

  const topicsList = computed(() => props.topics ?? []);

  const controlTypesOptions = computed(() => {
    const group = String(selectedGroup.value ?? '').trim();
    const list: string[] = [];
    const seen = new Set<string>();
    for (const c of props.controls ?? []) {
      const controlGroup = String(c?.groupName ?? '').trim();
      const controlText = String(c?.controlText ?? '').trim();
      if (controlText && (group === '' || controlGroup === group)) {
        if (!seen.has(controlText)) {
          seen.add(controlText);
          list.push(controlText);
        }
      }
    }
    return list.sort();
  });

  watch(selectedGroup, () => {
    selectedStudentId.value = null;
    const opts = controlTypesOptions.value;
    const current = workType.value;
    if (opts.length > 0 && !opts.includes(current)) {
      workType.value = opts[0] ?? '';
    }
  });

  watch(
    controlTypesOptions,
    (opts) => {
      if (opts.length > 0 && !opts.includes(workType.value)) {
        workType.value = opts[0] ?? '';
      }
    },
    { immediate: true }
  );

  watch(topicsList, (val) => {
    if (!val?.length) {
      topic.value = '';
    }
  });

  const filteredTopicsList = computed(() => {
    const group = String(selectedGroup.value ?? '').trim();
    const ct = String(workType.value ?? '').trim();
    if (!ct) return topicsList.value;
    const set = new Set<string>();
    for (const c of props.controls ?? []) {
      const controlGroup = String(c?.groupName ?? '').trim();
      const controlText = String(c?.controlText ?? '').trim();
      if (controlText !== ct) continue;
      if (group && controlGroup && controlGroup !== group) continue;
      normalizeTopics(c?.topics).forEach((t) => set.add(t));
    }
    const arr = [...set].filter(Boolean).sort((a, b) => a.localeCompare(b));
    return arr.length ? arr : topicsList.value;
  });

  watch([filteredTopicsList, workType, selectedGroup], () => {
    if (!topic.value) return;
    const cur = String(topic.value).trim();
    if (cur && filteredTopicsList.value.length && !filteredTopicsList.value.includes(cur)) {
      topic.value = '';
    }
  });

  const openFileDialog = () => fileInput.value?.click();

  const onFileChange = (e: Event) => {
    const input = e.target as HTMLInputElement;
    const f = input.files?.[0];
    if (f) {
      file.value = f;
      maybeAutofillFromFilename(f.name);
    }
  };

  const onDrop = (e: DragEvent) => {
    isDragOver.value = false;
    const f = e.dataTransfer?.files?.[0];
    if (f) {
      file.value = f;
      maybeAutofillFromFilename(f.name);
    }
  };

  function getStudentIdRaw(s: StudentInGroupRow): number {
    const v = s.studentId ?? s.lkId ?? s.lk_id ?? s['ID ИОТ'];
    const n = Number(v);
    return Number.isFinite(n) ? n : 0;
  }

  const studentsForSelect = computed(() => {
    const group = selectedGroup.value;
    if (!group) {
      return [];
    }

    const seen = new Set<number>();

    return (props.studentsByGroup[group] ?? [])
      .map((s) => {
        const id = getStudentIdRaw(s);
        return {
          id,
          name: s.fio ?? s['ФИО'] ?? s['Фамилия И.О.'] ?? String(id || '—'),
        };
      })
      .filter((x) => {
        if (x.id === 0) return false;
        if (seen.has(x.id)) return false;
        seen.add(x.id);
        return true;
      });
  });

  const isValid = computed(() => {
    const hasFile = file.value instanceof File;
    const hasGroup = selectedGroup.value.trim().length > 0;
    const hasStudent = Number.isFinite(Number(selectedStudentId.value));
    const hasTitle = workTitle.value.trim().length > 0;
    const hasWorkType = workType.value.trim().length > 0;

    return hasFile && hasGroup && hasStudent && hasTitle && hasWorkType;
  });

  function normalizeAcademicYearForStorage(raw: string): string {
    return raw.replace(/\//g, '-').trim();
  }

  function bestMatchOption(input: string, options: string[]): string | null {
    const q = (input ?? '').toLowerCase().trim();
    if (!q) return null;
    const exact = options.find((o) => o.toLowerCase() === q);
    if (exact) return exact;
    const contains = options.find((o) => o.toLowerCase().includes(q) || q.includes(o.toLowerCase()));
    return contains ?? null;
  }

  function maybeAutofillFromFilename(fileName: string) {
    const base = String(fileName ?? '')
      .replace(/\.[^.]+$/, '')
      .trim();
    if (!base) return;

    const yearMatch = base.match(/\b(20\d{2})\s*[-/]\s*(20\d{2})\b/);
    if (yearMatch) {
      const y = `${yearMatch[1]}-${yearMatch[2]}`;
      academicYear.value = normalizeAcademicYearForStorage(y);
    }

    const parts = base.split('_').map((p) => p.trim()).filter(Boolean);
    if (parts.length >= 3) {
      const maybeWorkType = parts[2];
      if (maybeWorkType) {
        const opt = bestMatchOption(maybeWorkType, controlTypesOptions.value);
        if (opt && !workType.value) {
          workType.value = opt;
        }
      }
      // если есть 4-я часть — пробуем как название
      if (parts[3] && !workTitle.value.trim()) {
        workTitle.value = parts[3];
      }
    }

    const topicMatch = base.match(/тема\s*[:№#-]?\s*(.+)$/i);
    if (topicMatch && topicMatch[1]) {
      const t = topicMatch[1].trim();
      const opt = bestMatchOption(t, filteredTopicsList.value);
      if (opt && !topic.value) {
        topic.value = opt;
      }
    }
  }

  type StoredUserLite = { fioShort?: string; lastName?: string };

  function getUploadedBy(): string {
    const raw = localStorage.getItem('user');
    if (raw) {
      try {
        const u = JSON.parse(raw) as StoredUserLite;
        return u.fioShort ?? u.lastName ?? 'unknown';
      } catch {
        return 'unknown';
      }
    }
    return 'unknown';
  }

  function normalizeTopics(t: unknown): string[] {
    if (Array.isArray(t)) {
      return t.map((x) => String(x).trim());
    }

    if (typeof t === 'string') {
      try {
        const parsed = JSON.parse(t);
        if (Array.isArray(parsed)) {
          return parsed.map((x) => String(x).trim());
        }
      } catch {}

      return t
        .split(',')
        .map((x) => x.trim())
        .filter(Boolean);
    }

    return [];
  }

  const resolvedControlType = computed(() => {
    const group = String(selectedGroup.value ?? '').trim();
    const chosenTopic = String(topic.value ?? '').trim();

    if (group && chosenTopic) {
      for (const c of props.controls ?? []) {
        const controlGroup = String(c?.groupName ?? '').trim();
        const controlText = String(c?.controlText ?? '').trim();
        const topicsArr = normalizeTopics(c?.topics);

        const groupMatch = controlGroup === group;
        const topicMatch = topicsArr.includes(chosenTopic);

        if (groupMatch && topicMatch) {
          return controlText;
        }
      }
    }
    return '';
  });

  function buildUploadPayload(): UploadWorkPayload | null {
    const sid = Number(selectedStudentId.value);
    const f = file.value;
    if (!isValid.value || !Number.isFinite(sid) || !(f instanceof File)) return null;
    return {
      studentId: sid,
      groupName: selectedGroup.value,
      topic: filteredTopicsList.value.length ? topic.value || '' : '',
      controlType: resolvedControlType.value,
      workType: workType.value,
      workTitle: workTitle.value,
      academicYear: academicYear.value,
      autoCheck: autoCheck.value,
      check: autoCheck.value ? Math.floor(85 + Math.random() * 15) : null,
      status: 'Загружен',
      uploadedBy: getUploadedBy(),
      file: f,
    };
  }

  const resolvedTemplateId = computed(
    () =>
      props.templateId ??
      (resolvedControlType.value
        ? props.templateIdByWorkType?.[resolvedControlType.value]
        : undefined) ??
      null
  );

  async function submitWork() {
    const payload = buildUploadPayload();
    if (!payload) return;

    if (!autoCheck.value) {
      emit('submit', { ...payload, check: null });
      close();
      return;
    }

    validating.value = true;
    try {
      const f = payload.file;
      const tid = resolvedTemplateId.value;
      const result = await validateDocument(
        f,
        tid != null && tid !== ''
          ? { templateId: tid, annotate: true }
          : { annotate: true }
      );
      validationResult.value = result;
      pendingSubmitPayload.value = payload;
      showValidationResult.value = true;
    } catch (err) {
      console.warn('Сервис проверки недоступен, загрузка без проверки:', err);
      emit('submit', payload);
      close();
    } finally {
      validating.value = false;
    }
  }

  function openAnnotatedFile() {
    const r = validationResult.value;
    const b64 = r?.annotatedFileBase64;
    const name = r?.annotatedFileName ?? 'document_замечания.docx';
    if (!b64) return;
    try {
      downloadAnnotatedFile(b64, name);
    } catch (e) {
      console.error('Ошибка открытия файла:', e);
    }
  }

  function confirmUploadDespiteValidation() {
    const p = pendingSubmitPayload.value;
    const result = validationResult.value;
    showValidationResult.value = false;
    validationResult.value = null;
    pendingSubmitPayload.value = null;
    if (p) {
      if (result?.percent != null && p.autoCheck) {
        p.check = result.percent;
      }
      emit('submit', p);
      close();
    }
  }

  const close = () => {
    dialog.value = false;
    emit('close');
  };
</script>

<style scoped lang="scss">
  .file-dropzone {
    border: 2px dashed #d1d5db;
    border-radius: 16px;
    background: #fafafa;
    padding: 28px 16px;
    text-align: center;
    cursor: pointer;
    transition: all 0.3s ease;
    margin-bottom: 20px;
    color: #6b7280;

    &:hover {
      background: #f3f4f6;
      border-color: #2563eb;
      color: #1e40af;
    }

    &.is-dragover {
      border-color: #2563eb;
      background: #eef2ff;
      color: #1e40af;
      transform: scale(1.02);
    }

    v-icon {
      transition: transform 0.3s ease;
    }

    &:hover v-icon {
      transform: scale(1.2);
    }
  }

  .drop-title {
    font-size: 14px;
    font-weight: 600;
    margin-top: 8px;
  }

  .drop-sub {
    font-size: 12px;
    margin-top: 4px;
  }

  .drop-hint {
    font-size: 11px;
    margin-top: 8px;
    color: #9ca3af;
  }

  .upload-card {
    border-radius: 16px;
    overflow: hidden;
    background-color: #ffffff;
    box-shadow: 0 8px 24px rgba(0, 0, 0, 0.08);
    transition: box-shadow 0.3s ease;

    &:hover {
      box-shadow: 0 12px 28px rgba(0, 0, 0, 0.12);
    }
  }

  .header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 24px 24px 16px;

    h3 {
      margin: 0;
      font-weight: 600;
      font-size: 1.25rem;
      color: #111827;
    }

    .v-btn {
      color: #6b7280;
      transition: background-color 0.2s ease;

      &:hover {
        background-color: rgba(37, 99, 235, 0.08);
        color: #2563eb;
      }
    }
  }

  .v-card-text {
    padding: 16px 24px;

    .form-row {
      margin-bottom: 8px;
    }

    .upload-form-field {
      margin-bottom: 8px;
    }

    .upload-form-field :deep(.v-field) {
      border-radius: 10px;
      background: #f8fafc;
    }

    .upload-form-field.upload-form-field--readonly :deep(.v-field) {
      opacity: 1;
    }

    .upload-form-field.upload-form-field--readonly :deep(.v-field__input) {
      cursor: default;
    }

    .v-file-input,
    .upload-form-field {
      input {
        transition:
          border-color 0.2s ease,
          box-shadow 0.2s ease;
      }

      &:focus-within :deep(.v-field) {
        box-shadow: 0 0 0 2px rgba(37, 99, 235, 0.15);
      }
    }

    .auto-check-block {
      margin-top: 8px;
      padding: 12px 14px;
      background: #f8fafc;
      border-radius: 12px;
      border: 1px solid #e2e8f0;
    }

    .auto-check-label {
      font-size: 14px;
      color: #0f172a;
    }

    .auto-check-hint {
      margin: 8px 0 0;
      padding-left: 32px;
      font-size: 12px;
      line-height: 1.45;
      color: #64748b;
    }
  }

  .actions {
    flex-wrap: wrap;
    justify-content: flex-end;
    align-items: center;
    padding: 16px 24px;
    gap: 10px 12px;

    .upload-actions-cancel {
      min-width: auto;
      color: #374151 !important;
    }

    .upload-actions-submit {
      min-width: 160px;
      border-radius: 10px;
      font-weight: 600;
      text-transform: none;
      transition:
        background-color 0.2s ease,
        transform 0.15s ease;

      &:hover:not(:disabled) {
        transform: translateY(-1px);
        background-color: #1f2937 !important;
      }
    }
  }

  .validation-result-card {
    border-radius: 16px;
    padding: 8px 0;
  }
  .validation-result-card .validation-header {
    display: flex;
    align-items: center;
    gap: 12px;
    padding: 16px 24px 8px;
  }
  .validation-result-card .validation-title {
    margin: 0;
    font-size: 18px;
    font-weight: 600;
    color: #111827;
  }
  .validation-result-card .validation-percent {
    font-size: 13px;
    color: #6b7280;
    margin-top: 4px;
  }
  .validation-result-card .validation-errors {
    padding: 0 24px 16px;
    max-height: 280px;
    overflow-y: auto;
  }
  .validation-result-card .validation-item {
    display: flex;
    align-items: flex-start;
    gap: 10px;
    padding: 8px 0;
    font-size: 14px;
    color: #374151;
  }
  .validation-result-card .validation-item.error {
    color: #dc2626;
  }
  .validation-result-card .validation-item.warning {
    color: #d97706;
  }
  .validation-result-card .validation-criteria-list {
    padding: 0 24px 16px;
    max-height: 360px;
    overflow-y: auto;
  }
  .validation-result-card .validation-item {
    display: flex;
    align-items: flex-start;
    gap: 10px;
    padding: 10px 0;
    font-size: 14px;
    border-bottom: 1px solid #f3f4f6;
  }
  .validation-result-card .validation-item:last-child {
    border-bottom: none;
  }
  .validation-result-card .validation-item.passed {
    color: #15803d;
  }
  .validation-result-card .validation-item.error {
    color: #dc2626;
  }
  .validation-result-card .validation-item.warning {
    color: #d97706;
  }
  .validation-result-card .criteria-content {
    flex: 1;
    min-width: 0;
  }
  .validation-result-card .criteria-title {
    font-weight: 600;
    display: block;
    margin-bottom: 2px;
  }
  .validation-result-card .criteria-message {
    display: block;
  }
  .validation-result-card .criteria-details {
    font-size: 12px;
    color: #6b7280;
    margin-top: 4px;
  }

  .validation-result-actions {
    flex-wrap: wrap !important;
    align-items: center !important;
    gap: 10px 12px;
    padding: 12px 16px 20px !important;
  }

  .validation-download-btn {
    flex: 1 1 auto;
    min-width: min(100%, 280px);
    white-space: normal;
    height: auto !important;
    padding-block: 10px !important;
  }

  .validation-actions-spacer {
    flex: 1 1 40px;
    min-width: 8px;
  }

  .validation-actions-right {
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    justify-content: flex-end;
    gap: 8px;
    margin-left: auto;
  }

  @media (max-width: 600px) {
    .validation-actions-spacer {
      display: none;
    }

    .validation-actions-right {
      width: 100%;
      justify-content: stretch;
    }

    .validation-actions-right .v-btn {
      flex: 1;
    }
  }
</style>
