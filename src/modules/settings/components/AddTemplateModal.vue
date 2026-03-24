<template>
  <v-dialog
    :model-value="modelValue"
    max-width="680"
    persistent
    scrollable
    transition="dialog-transition"
    content-class="add-template-dialog"
    @update:model-value="$emit('update:modelValue', $event)"
  >
    <v-card class="add-template-modal">
      <div class="modal-header">
        <div class="modal-header-inner">
          <h2 class="modal-title">
            {{ modalTitle }}
          </h2>
        </div>
        <v-btn
          icon
          variant="text"
          class="close-btn"
          @click="$emit('close')"
        >
          <v-icon>mdi-close</v-icon>
        </v-btn>
      </div>

      <v-card-text class="modal-body">
        <div class="form-block">
          <div class="field">
            <label class="label required">Название шаблона</label>
            <v-text-field
              v-model="form.name"
              placeholder="Например: Курсовая работа, Реферат"
              variant="outlined"
              density="comfortable"
              hide-details
              class="field-input"
            />
          </div>
          <div class="field">
            <label class="label">Описание</label>
            <v-textarea
              v-model="form.description"
              placeholder="Краткое описание шаблона..."
              variant="outlined"
              density="comfortable"
              hide-details
              rows="2"
              class="field-input"
            />
          </div>
        </div>

        <div class="section">
          <div class="section-head">
            <v-icon
              size="20"
              class="section-icon"
            >
              mdi-format-font
            </v-icon>
            <span>Форматирование</span>
          </div>
          <div class="section-content">
            <div class="criteria-row">
              <span class="criteria-label">Шрифт</span>
              <v-select
                v-model="form.font"
                :items="fontOptions"
                variant="outlined"
                density="compact"
                hide-details
                class="criteria-control"
              />
            </div>
            <div class="criteria-row">
              <span class="criteria-label">Размер шрифта</span>
              <v-select
                v-model="form.fontSize"
                :items="fontSizeOptions"
                variant="outlined"
                density="compact"
                hide-details
                class="criteria-control criteria-input-narrow"
              />
            </div>
            <div class="criteria-row">
              <span class="criteria-label">
                Межстрочный интервал
                <v-tooltip location="top">
                  <template #activator="{ props }">
                    <v-icon
                      v-bind="props"
                      size="14"
                      class="ml-1"
                    >
                      mdi-information-outline
                    </v-icon>
                  </template>
                  Не проверяется для PDF
                </v-tooltip>
              </span>
              <v-text-field
                v-model="form.lineSpacing"
                placeholder="1.5"
                variant="outlined"
                density="compact"
                hide-details
                class="criteria-control criteria-input-narrow"
              />
            </div>
          </div>
        </div>

        <div class="section">
          <div class="section-head">
            <v-icon
              size="20"
              class="section-icon"
            >
              mdi-file-document-outline
            </v-icon>
            <span>Объём и источники</span>
          </div>
          <div class="section-content criteria-grid">
            <div class="criteria-row">
              <span class="criteria-label">Мин. страниц</span>
              <v-text-field
                v-model="form.minPages"
                variant="outlined"
                density="compact"
                hide-details
                class="criteria-control criteria-input-narrow"
              />
            </div>
            <div class="criteria-row">
              <span class="criteria-label">Мин. источников</span>
              <v-text-field
                v-model="form.minSources"
                variant="outlined"
                density="compact"
                hide-details
                class="criteria-control criteria-input-narrow"
              />
            </div>
          </div>
        </div>

        <div class="section">
          <div class="section-head">
            <v-icon
              size="20"
              class="section-icon"
            >
              mdi-image-multiple-outline
            </v-icon>
            <span>Иллюстрации и таблицы</span>
            <v-tooltip location="top">
              <template #activator="{ props }">
                <v-icon
                  v-bind="props"
                  size="16"
                  class="ml-1"
                >
                  mdi-information-outline
                </v-icon>
              </template>
              Проверяются по триггерным словам (Рис., Рисунок, Таблица). При
              нарушении — предупреждение.
            </v-tooltip>
          </div>
          <div class="section-content">
            <div class="criteria-row">
              <span class="criteria-label">Нумерация иллюстраций</span>
              <v-select
                v-model="form.illNumbering"
                :items="illNumberingOptions"
                variant="outlined"
                density="compact"
                hide-details
                class="criteria-control"
              />
            </div>
            <div class="criteria-row">
              <span class="criteria-label">Позиция рисунка</span>
              <v-select
                v-model="form.figurePosition"
                :items="figurePositionOptions"
                variant="outlined"
                density="compact"
                hide-details
                class="criteria-control"
              />
            </div>
            <div class="criteria-row">
              <span class="criteria-label">Подпись рисунка</span>
              <v-select
                v-model="form.figureCaption"
                :items="figureCaptionOptions"
                variant="outlined"
                density="compact"
                hide-details
                class="criteria-control"
              />
            </div>
            <div class="criteria-row">
              <span class="criteria-label">Заголовок таблицы</span>
              <v-select
                v-model="form.tableTitle"
                :items="tableTitleOptions"
                variant="outlined"
                density="compact"
                hide-details
                class="criteria-control"
              />
            </div>
            <div class="criteria-row">
              <span class="criteria-label">Позиция таблицы</span>
              <v-select
                v-model="form.tablePosition"
                :items="tablePositionOptions"
                variant="outlined"
                density="compact"
                hide-details
                class="criteria-control"
              />
            </div>
          </div>
        </div>

        <div class="section">
          <div class="section-head">
            <v-icon
              size="20"
              class="section-icon"
            >
              mdi-format-list-bulleted
            </v-icon>
            <span>Структура документа</span>
          </div>
          <div class="structure-grid">
            <v-checkbox
              v-model="form.hasTitlePage"
              label="Титульный лист"
              hide-details
              density="compact"
              color="primary"
              class="structure-check"
            />
            <v-checkbox
              v-model="form.hasToc"
              label="Оглавление"
              hide-details
              density="compact"
              color="primary"
              class="structure-check"
            />
            <v-checkbox
              v-model="form.hasIntroduction"
              label="Введение"
              hide-details
              density="compact"
              color="primary"
              class="structure-check"
            />
            <v-checkbox
              v-model="form.hasMainPart"
              label="Основная часть"
              hide-details
              density="compact"
              color="primary"
              class="structure-check"
            />
            <v-checkbox
              v-model="form.hasConclusion"
              label="Заключение"
              hide-details
              density="compact"
              color="primary"
              class="structure-check"
            />
            <v-checkbox
              v-model="form.hasBibliography"
              label="Список литературы"
              hide-details
              density="compact"
              color="primary"
              class="structure-check"
            />
            <v-checkbox
              v-model="form.hasAppendices"
              label="Приложения"
              hide-details
              density="compact"
              color="primary"
              class="structure-check"
            />
          </div>

          <div
            v-if="form.hasTitlePage"
            class="title-page-block"
          >
            <div class="title-page-inner">
              <div class="title-page-head">
                <v-icon
                  size="22"
                  class="title-page-icon"
                >
                  mdi-file-document-outline
                </v-icon>
                <span class="title-page-label">Макет титульного листа</span>
                <span
                  v-if="form.titlePageRequiredStrings?.length"
                  class="title-page-badge"
                >
                  {{ form.titlePageRequiredStrings.length }} элементов
                </span>
              </div>
              <input
                ref="titlePageFileInput"
                type="file"
                accept=".doc,.docx,.pdf"
                class="d-none"
                @change="onTitlePageFileSelected"
              />
              <v-btn
                size="small"
                variant="outlined"
                color="primary"
                :disabled="!templateId"
                :loading="isUploadingTitlePage"
                prepend-icon="mdi-upload-outline"
                class="title-page-btn"
                @click="titlePageFileInput?.click()"
              >
                Загрузить макет
              </v-btn>
              <p class="title-page-hint">
                Загрузите DOC, DOCX или PDF — система извлечёт обязательные
                элементы для проверки титула
              </p>
            </div>
          </div>
        </div>
      </v-card-text>

      <v-card-actions class="modal-actions">
        <v-spacer />
        <v-btn
          variant="text"
          class="btn-cancel"
          @click="$emit('close')"
        >
          Отмена
        </v-btn>
        <v-btn
          color="primary"
          class="btn-submit"
          @click="submit"
        >
          {{ isEdit ? 'Сохранить' : 'Создать шаблон' }}
        </v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script setup lang="ts">
  import { ref, watch, computed } from 'vue';
  import type { AddTemplateForm } from '../modal';

  const props = defineProps<{
    modelValue: boolean;
    initialForm: AddTemplateForm | null;
    templateId?: string | number | null;
    apiBase?: string;
  }>();

  const emit = defineEmits<{
    'update:modelValue': [v: boolean];
    submit: [form: AddTemplateForm];
    close: [];
    'title-page-uploaded': [form: AddTemplateForm];
  }>();

  const titlePageFileInput = ref<HTMLInputElement | null>(null);
  const isUploadingTitlePage = ref(false);

  const isEdit = computed(() => !!props.initialForm);

  const modalTitle = computed(() =>
    isEdit.value ? 'Редактировать шаблон' : 'Новый шаблон проверки'
  );

  const fontOptions = [
    'Times New Roman',
    'Arial',
    'Calibri',
    'Georgia',
    'Verdana',
    'Garamond',
    'Cambria',
    'Palatino Linotype',
  ];

  const fontSizeOptions = [
    '9 пт',
    '10 пт',
    '11 пт',
    '12 пт',
    '14 пт',
    '16 пт',
    '18 пт',
    '20 пт',
    '22 пт',
    '24 пт',
  ];

  const illNumberingOptions = ['Сквозная', 'По разделам', 'В рамках раздела'];

  const figurePositionOptions = [
    'По центру страницы',
    'Слева',
    'Справа',
    'По ширине страницы',
  ];

  const figureCaptionOptions = [
    'Под рисунком',
    'Над рисунком',
    'Под рисунком по центру',
  ];

  const tableTitleOptions = [
    'Слово «Таблица» + номер + наименование',
    'Таблица N. — наименование',
    'Таблица с номером над таблицей',
    'Над таблицей по центру',
  ];

  const tablePositionOptions = [
    'По центру страницы',
    'Слева',
    'Справа',
    'По ширине страницы',
  ];

  const defaultForm: AddTemplateForm = {
    name: '',
    description: '',
    fileFormat: '.doc или .docx',
    font: 'Times New Roman',
    fontSize: '14 пт',
    lineSpacing: '1.5',
    minPages: '10',
    minSources: '7',
    illNumbering: 'Сквозная',
    figurePosition: 'По центру страницы',
    figureCaption: 'Под рисунком',
    tableTitle: 'Слово «Таблица» + номер + наименование',
    tablePosition: 'По центру страницы',
    submissionFormat: 'Электронный вид',
    hasTitlePage: true,
    hasToc: true,
    hasIntroduction: true,
    hasMainPart: true,
    hasConclusion: true,
    hasBibliography: true,
    hasAppendices: false,
  };

  const form = ref<AddTemplateForm>({ ...defaultForm });

  watch(
    () => props.initialForm,
    (val) => {
      if (val) {
        form.value = { ...val };
      } else {
        form.value = { ...defaultForm };
      }
    },
    { immediate: true }
  );

  watch(
    () => props.modelValue,
    (val) => {
      if (val && props.initialForm) {
        form.value = { ...props.initialForm };
      }
      if (val && !props.initialForm) {
        form.value = { ...defaultForm };
      }
    }
  );

  async function onTitlePageFileSelected(event: Event) {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];
    if (!file || !props.templateId) return;

    isUploadingTitlePage.value = true;
    try {
      const base = props.apiBase || import.meta.env.VITE_API_BASE || '';
      const fd = new FormData();
      fd.append('file', file);
      const res = await fetch(
        `${base}/api/templates/${props.templateId}/title-page-template`,
        {
          method: 'POST',
          body: fd,
        }
      );
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.message || 'Ошибка загрузки');
      }
      const updated = await res.json();
      if (updated.criteria) {
        form.value = { ...form.value, ...updated.criteria };
      }
      emit('title-page-uploaded', form.value);
    } catch (e) {
      console.error(e);
      alert(e instanceof Error ? e.message : 'Не удалось загрузить макет');
    } finally {
      isUploadingTitlePage.value = false;
      input.value = '';
    }
  }

  function submit() {
    emit('submit', { ...form.value });
  }
</script>

<style scoped>
  .add-template-modal {
    border-radius: 20px;
    overflow: hidden;
    box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.25);
  }

  .modal-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 24px 28px;
    border-bottom: 1px solid #e2e8f0;
  }

  .modal-header-inner {
    display: flex;
    align-items: center;
    gap: 12px;
  }

  .modal-icon {
    color: #6366f1;
  }

  .modal-title {
    margin: 0;
    font-size: 20px;
    font-weight: 700;
    color: #0f172a;
    letter-spacing: -0.02em;
  }

  .close-btn {
    color: #64748b;
  }

  .modal-body {
    padding: 24px 28px;
    max-height: 65vh;
    overflow-y: auto;
    background: #ffffff;
  }

  .form-block {
    margin-bottom: 8px;
  }

  .field {
    margin-bottom: 16px;
  }

  .label {
    display: block;
    font-size: 13px;
    font-weight: 600;
    color: #475569;
    margin-bottom: 8px;
  }

  .label.required::after {
    content: ' *';
    color: #dc2626;
  }

  .field-input :deep(.v-field) {
    border-radius: 12px;
    background: #f8fafc;
  }

  .section {
    margin-top: 24px;
    padding: 20px;
    background: #f8fafc;
    border-radius: 16px;
    border: 1px solid #e2e8f0;
  }

  .section-head {
    display: flex;
    align-items: center;
    gap: 10px;
    font-size: 15px;
    font-weight: 700;
    color: #0f172a;
    margin-bottom: 16px;
  }

  .section-icon {
    color: #6366f1;
  }

  .section-content {
    display: flex;
    flex-direction: column;
    gap: 12px;
  }

  .criteria-grid {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 12px 24px;
  }

  .criteria-row {
    display: flex;
    align-items: center;
    gap: 16px;
  }

  .criteria-label {
    flex: 0 0 180px;
    font-size: 13px;
    font-weight: 500;
    color: #475569;
  }

  .criteria-control {
    flex: 1;
    min-width: 0;
    max-width: 280px;
  }

  .criteria-control :deep(.v-field) {
    border-radius: 10px;
    background: #ffffff;
  }

  .criteria-input-narrow {
    max-width: 140px;
  }

  .structure-grid {
    display: grid;
    grid-template-columns: repeat(2, 1fr);
    gap: 8px 32px;
  }

  .structure-check {
    margin: 0;
  }

  .title-page-block {
    margin-top: 20px;
    padding: 16px;
    background: linear-gradient(135deg, #f0f4ff 0%, #eef2ff 100%);
    border: 1px solid rgba(99, 102, 241, 0.25);
    border-radius: 12px;
  }

  .title-page-inner {
    display: flex;
    flex-direction: column;
    gap: 12px;
  }

  .title-page-head {
    display: flex;
    align-items: center;
    gap: 10px;
    flex-wrap: wrap;
  }

  .title-page-icon {
    color: #6366f1;
  }

  .title-page-label {
    font-size: 14px;
    font-weight: 600;
    color: #334155;
  }

  .title-page-badge {
    padding: 4px 10px;
    background: #6366f1;
    color: white;
    font-size: 12px;
    font-weight: 600;
    border-radius: 999px;
  }

  .title-page-btn {
    text-transform: none;
    font-weight: 600;
    border-radius: 10px;
    align-self: flex-start;
  }

  .title-page-btn :deep(.v-btn__content) {
    gap: 8px;
  }

  .title-page-hint {
    margin: 0;
    font-size: 12px;
    color: #64748b;
    line-height: 1.45;
  }

  .modal-actions {
    padding: 20px 28px 24px;
    background: #f8fafc;
    border-top: 1px solid #e2e8f0;
  }

  .btn-cancel {
    text-transform: none;
    font-weight: 600;
    color: #64748b;
  }

  .btn-submit {
    text-transform: none;
    font-weight: 600;
    padding-inline: 24px;
    border-radius: 12px;
  }

  @media (max-width: 600px) {
    .criteria-grid {
      grid-template-columns: 1fr;
    }
    .criteria-row {
      flex-wrap: wrap;
    }
    .criteria-control {
      max-width: none;
    }
  }
</style>
