<template>
  <v-dialog
    :model-value="modelValue"
    max-width="820"
    persistent
    @update:model-value="$emit('update:modelValue', $event)"
  >
    <v-card class="validation-report-card">
      <div class="modal-header">
        <div class="modal-title-row">
          <v-icon size="24">mdi-file-document-outline</v-icon>
          <h3 class="modal-title">Проверка учебной работы</h3>
        </div>
        <div
          v-if="breadcrumb"
          class="breadcrumb"
        >
          {{ breadcrumb }}
        </div>
        <v-btn
          icon
          variant="text"
          class="close-btn"
          @click="$emit('update:modelValue', false)"
        >
          <v-icon>mdi-close</v-icon>
        </v-btn>
      </div>

      <v-card-text class="modal-body">
        <div class="compliance-row">
          <div class="compliance-section">
            <div class="compliance-label">Соответствие шаблону</div>
            <div class="progress-wrap">
              <v-progress-linear
                :model-value="percent ?? 0"
                color="#16a34a"
                height="10"
                rounded
              />
            </div>
          </div>
          <div class="errors-count">
            Критериев: {{ allCriteriaItems.length }} · замечаний:
            {{ failedCriteriaCount }}
          </div>
        </div>

        <div
          v-if="!allCriteriaItems.length"
          class="validation-empty"
        >
          Нет данных по критериям проверки
        </div>
        <div
          v-for="(item, idx) in allCriteriaItems"
          :key="(item.code || 'c') + '-' + idx"
          :class="[
            'error-card',
            item.passed ? 'error-card--passed' : cardClass(item),
          ]"
        >
          <v-icon
            size="24"
            class="error-icon"
            :color="validationCriterionIconColor(item)"
          >
            {{ validationCriterionIconName(item) }}
          </v-icon>
          <div class="error-content">
            <div class="error-title-row">
              <span class="error-title">{{
                validationCriterionDisplayTitle(item) || item.message
              }}</span>
              <span
                v-if="categoryLabel(item)"
                class="category-chip"
              >{{ categoryLabel(item) }}</span>
            </div>
            <div
              v-if="item.location"
              class="error-location"
            >
              Расположение: {{ item.location }}
            </div>
            <div
              v-if="(item.expected || item.actual) && !item.passed"
              class="expected-found"
            >
              <div class="ef-row">
                <span class="ef-label">ОЖИДАЛОСЬ</span>
                <v-icon
                  size="18"
                  color="success"
                >mdi-check-circle</v-icon>
                <span class="ef-value">{{ item.expected || '—' }}</span>
              </div>
              <div class="ef-row">
                <span class="ef-label">НАЙДЕНО</span>
                <v-icon
                  size="18"
                  color="error"
                >mdi-close-circle</v-icon>
                <span class="ef-value">{{ item.actual || '—' }}</span>
              </div>
            </div>
          </div>
          <span
            :class="['level-chip', item.passed ? 'level-chip--passed' : levelChipClass(item)]"
          >
            {{ item.passed ? 'Выполнено' : levelLabel(item) }}
          </span>
        </div>
      </v-card-text>

      <v-card-actions class="modal-actions modal-actions--wrap">
        <v-btn
          v-if="hasAnnotatedFile"
          class="modal-download-btn"
          variant="tonal"
          prepend-icon="mdi-file-eye-outline"
          @click="openAnnotatedFile"
        >
          {{ annotatedButtonLabel }}
        </v-btn>
        <v-spacer class="modal-actions-spacer" />
        <v-btn
          variant="text"
          @click="$emit('update:modelValue', false)"
        >
          Закрыть
        </v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import type { ValidationResult, ValidationErrorItem } from '@/api/info';
import { useDownload } from '@/composables/useDownload';
import {
  mergeValidationResultItems,
  validationCriterionDisplayTitle,
} from '@/utils/validationCriteriaDisplay';
import {
  validationCriterionIconColor,
  validationCriterionIconName,
} from '@/utils/validationCriterionVisual';

const props = defineProps<{
  modelValue: boolean;
  result: ValidationResult | null;
  breadcrumb?: string;
}>();

defineEmits<{
  (e: 'update:modelValue', v: boolean): void;
}>();

const { downloadAnnotatedFileWithRemarks } = useDownload();

const allCriteriaItems = computed<ValidationErrorItem[]>(() =>
  mergeValidationResultItems(props.result)
);

const failedCriteriaCount = computed(
  () => allCriteriaItems.value.filter((c) => !c.passed).length
);

const percent = computed(() => {
  const r = props.result;
  if (!r) return 0;
  const items = allCriteriaItems.value;
  if (items.length) {
    const passed = items.filter((c) => c.passed).length;
    return Math.round((100 * passed) / items.length);
  }
  return r.percent ?? 0;
});

const hasAnnotatedFile = computed(
  () => Boolean(props.result?.annotatedFileBase64 && props.result?.annotatedFileName)
);

const isPdf = computed(() =>
  (props.result?.annotatedFileName ?? '').toLowerCase().endsWith('.pdf')
);

const annotatedButtonLabel = computed(() =>
  isPdf.value ? 'Просмотреть файл с замечаниями' : 'Скачать файл с замечаниями'
);

function openAnnotatedFile() {
  const b64 = props.result?.annotatedFileBase64;
  const name = props.result?.annotatedFileName ?? 'document_замечания.docx';
  if (!b64) return;
  try {
    downloadAnnotatedFileWithRemarks(b64, name, props.result ?? undefined, name);
  } catch (e) {
    console.error('Ошибка открытия файла:', e);
  }
}

function categoryLabel(item: ValidationErrorItem): string {
  if (item.category) return item.category;
  const code = (item.code ?? '').toLowerCase();
  if (code.includes('font') || code.includes('шрифт')) return 'Шрифт';
  if (code.includes('spacing') || code.includes('интервал')) return 'Интервалы';
  if (code.includes('number') || code.includes('нумерац')) return 'Нумерация';
  return '';
}

function levelLabel(item: ValidationErrorItem): string {
  const l = (item.level ?? '').toLowerCase();
  if (l === 'warning' || l === 'предупреждение') return 'Предупреждение';
  return 'Информация';
}

function levelChipClass(item: ValidationErrorItem): string {
  return (item.level ?? '').toLowerCase() === 'warning' ? 'level-warning' : 'level-info';
}

function cardClass(item: ValidationErrorItem): string {
  return (item.level ?? '').toLowerCase() === 'warning' ? 'card-warning' : 'card-info';
}
</script>

<style scoped>
.validation-report-card {
  border-radius: 16px;
  overflow: hidden;
}

.modal-header {
  padding: 20px 24px 12px;
  position: relative;
}

.modal-title-row {
  display: flex;
  align-items: center;
  gap: 10px;
}

.modal-title {
  font-size: 20px;
  font-weight: 600;
  margin: 0;
}

.breadcrumb {
  font-size: 13px;
  color: #6b7280;
  margin-top: 6px;
}

.close-btn {
  position: absolute;
  top: 16px;
  right: 16px;
}

.modal-body {
  padding: 0 24px 16px;
}

.compliance-row {
  display: flex;
  align-items: center;
  gap: 24px;
  margin-bottom: 20px;
}

.compliance-section {
  flex: 1;
}

.compliance-label {
  font-size: 14px;
  color: #374151;
  margin-bottom: 8px;
}

.progress-wrap {
  max-width: 300px;
}

.errors-count {
  font-size: 14px;
  font-weight: 600;
  color: #374151;
  white-space: nowrap;
}

.backend-structure-block {
  margin-bottom: 20px;
}

.backend-structure-title {
  font-size: 14px;
  font-weight: 700;
  color: #0f172a;
  margin-bottom: 10px;
}

.structure-criterion-card {
  display: flex;
  gap: 12px;
  align-items: flex-start;
  padding: 12px 14px;
  border-radius: 12px;
  margin-bottom: 10px;
  border: 1px solid #e2e8f0;
}

.structure-criterion-card.structure-passed {
  background: #f0fdf4;
  border-color: #bbf7d0;
}

.structure-criterion-card.structure-failed {
  background: #fffbeb;
  border-color: #fde68a;
}

.structure-criterion-body {
  flex: 1;
  min-width: 0;
}

.structure-criterion-title-row {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 8px;
  margin-bottom: 4px;
}

.structure-criterion-title {
  font-weight: 600;
  font-size: 14px;
  color: #111827;
}

.structure-code-chip {
  font-size: 11px;
  font-family: ui-monospace, monospace;
  color: #64748b;
  background: #e2e8f0;
  padding: 2px 8px;
  border-radius: 6px;
}

.structure-criterion-message {
  font-size: 13px;
  color: #4b5563;
  line-height: 1.45;
}

.structure-criterion-details {
  font-size: 12px;
  color: #64748b;
  margin-top: 6px;
}

.other-errors-heading {
  font-size: 14px;
  font-weight: 700;
  color: #0f172a;
  margin: 8px 0 12px;
}

.validation-empty {
  font-size: 14px;
  color: #64748b;
  padding: 12px 0;
}

.error-card {
  display: flex;
  align-items: flex-start;
  gap: 12px;
  padding: 16px;
  border-radius: 12px;
  border: 1px solid #e5e7eb;
  margin-bottom: 12px;
  background: #fafafa;
}

.error-card--passed {
  border-color: #bbf7d0;
  background: #f0fdf4;
}

.card-warning {
  border-color: #fbbf24;
  background: #fffbeb;
}

.card-info {
  border-color: #93c5fd;
  background: #eff6ff;
}

.error-icon {
  flex-shrink: 0;
}

.error-content {
  flex: 1;
  min-width: 0;
}

.error-title-row {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 6px;
}

.error-title {
  font-weight: 600;
  font-size: 15px;
}

.category-chip {
  font-size: 12px;
  color: #6b7280;
  background: #e5e7eb;
  padding: 2px 8px;
  border-radius: 6px;
}

.error-location {
  font-size: 13px;
  color: #6b7280;
  margin-bottom: 10px;
}

.expected-found {
  background: #f3f4f6;
  border-radius: 8px;
  padding: 10px 12px;
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.ef-row {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 13px;
}

.ef-label {
  font-weight: 600;
  font-size: 11px;
  text-transform: uppercase;
  color: #6b7280;
  min-width: 80px;
}

.ef-value {
  color: #374151;
}

.level-chip {
  flex-shrink: 0;
  font-size: 12px;
  font-weight: 500;
  padding: 4px 10px;
  border-radius: 8px;
}

.level-warning {
  background: #fef3c7;
  color: #b45309;
}

.level-info {
  background: #dbeafe;
  color: #1d4ed8;
}

.level-chip--passed {
  background: #dcfce7;
  color: #166534;
}

.modal-actions {
  padding: 16px 24px 20px;
}

.modal-actions--wrap {
  flex-wrap: wrap;
  gap: 10px 12px;
  align-items: center;
}

.modal-download-btn {
  flex: 1 1 auto;
  min-width: min(100%, 280px);
  white-space: normal;
  height: auto !important;
  padding-block: 10px !important;
}

.modal-actions-spacer {
  flex: 1 1 32px;
  min-width: 8px;
}

@media (max-width: 600px) {
  .modal-actions-spacer {
    display: none;
  }
}
</style>
