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
            <label
              :class="['label', 'required', { 'label--error': nameIsInvalid }]"
            >
              Название шаблона
            </label>
            <v-text-field
              v-model="form.name"
              placeholder="Например: Курсовая работа, Реферат"
              variant="outlined"
              density="comfortable"
              class="field-input"
              :error-messages="nameIsInvalid ? ['Укажите название шаблона'] : []"
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
              <span class="criteria-label">
                Позиция рисунка
                <v-tooltip location="top" max-width="300">
                  <template #activator="{ props }">
                    <v-icon
                      v-bind="props"
                      size="14"
                      class="ml-1"
                    >
                      mdi-information-outline
                    </v-icon>
                  </template>
                  Выравнивание строки подписи «Рис.…» в DOCX. В ответе /validate
                  критерий про выравнивание подписей смотрит только это поле
                  (figurePosition), не «Позицию таблицы» ниже. После смены значения
                  нажмите «Сохранить» и при сомнениях проверьте GET шаблона:
                  criteria.figurePosition.
                </v-tooltip>
              </span>
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
              <span class="criteria-label">
                Подпись рисунка
                <v-tooltip location="top" max-width="300">
                  <template #activator="{ props }">
                    <v-icon
                      v-bind="props"
                      size="14"
                      class="ml-1"
                    >
                      mdi-information-outline
                    </v-icon>
                  </template>
                  Над или под рисунком (отдельно от выравнивания строки). Значения
                  как в шаблоне — Java ищет подстроки «под рисунк…» / «над рисунк…».
                </v-tooltip>
              </span>
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
              <span class="criteria-label">Расположение названия таблицы</span>
              <v-select
                v-model="form.tableTitlePlacement"
                :items="tableTitlePlacementOptions"
                variant="outlined"
                density="compact"
                hide-details
                class="criteria-control"
              />
            </div>
            <div class="criteria-row">
              <span class="criteria-label">
                Позиция таблицы
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
                  Выравнивание строки «Таблица …» (tablePosition). На подписи
                  «Рис.…» не влияет — для них поле «Позиция рисунка» выше.
                </v-tooltip>
              </span>
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
          :disabled="!canSubmitTemplate"
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
  import { JAVA_TEMPLATE_CRITERIA_DEFAULTS as J } from '@/api/info';
  import type { AddTemplateForm } from '../modal';
  import {
    ADD_TEMPLATE_FONT_OPTIONS as fontOptions,
    ADD_TEMPLATE_FONT_SIZE_OPTIONS as fontSizeOptions,
    ADD_TEMPLATE_ILL_NUMBERING_OPTIONS as illNumberingOptions,
    ADD_TEMPLATE_FIGURE_POSITION_OPTIONS as figurePositionOptions,
    ADD_TEMPLATE_FIGURE_CAPTION_OPTIONS as figureCaptionOptions,
    ADD_TEMPLATE_TABLE_TITLE_OPTIONS as tableTitleOptions,
    ADD_TEMPLATE_TABLE_TITLE_PLACEMENT_OPTIONS as tableTitlePlacementOptions,
    ADD_TEMPLATE_TABLE_POSITION_OPTIONS as tablePositionOptions,
  } from '../constants/addTemplateModalOptions';

  const props = defineProps<{
    modelValue: boolean;
    initialForm: AddTemplateForm | null;
  }>();

  const emit = defineEmits<{
    'update:modelValue': [v: boolean];
    submit: [form: AddTemplateForm];
    close: [];
  }>();

  const isEdit = computed(() => !!props.initialForm);

  const canSubmitTemplate = computed(() =>
    Boolean(form.value.name?.trim())
  );

  const nameIsInvalid = computed(
    () => !form.value.name?.trim()
  );

  const modalTitle = computed(() =>
    isEdit.value ? 'Редактировать шаблон' : 'Новый шаблон проверки'
  );

  const defaultForm: AddTemplateForm = {
    ...J,
    name: '',
    description: '',
    submissionFormat: 'Электронный вид',
  };

  const form = ref<AddTemplateForm>({ ...defaultForm });

  watch(
    () => props.initialForm,
    (val) => {
      if (val) {
        form.value = { ...defaultForm, ...val };
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
        form.value = { ...defaultForm, ...props.initialForm };
      }
      if (val && !props.initialForm) {
        form.value = { ...defaultForm };
      }
    }
  );

  function submit() {
    if (!canSubmitTemplate.value) {
      return;
    }
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

  .label--error {
    color: #b91c1c;
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
