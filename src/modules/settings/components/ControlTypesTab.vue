<template>
  <div class="control-types-tab">
    <v-card
      class="discipline-card"
      elevation="0"
    >
      <div class="discipline-card-inner">
        <div class="discipline-icon">
          <v-icon
            size="32"
            color="#7c3aed"
          >
            mdi-folder-cog-outline
          </v-icon>
        </div>
        <div class="discipline-text">
          <h2 class="discipline-title">Настройка для дисциплины</h2>
          <p class="discipline-desc">
            {{ disciplineCardDescription }}
          </p>
          <div class="discipline-select-wrap">
            <etu-pill-search-select
              placeholder="Выберите дисциплину…"
              loading-text="Загрузка…"
              prepend-icon="mdi-book-open-page-variant"
              search-placeholder="Поиск…"
              empty-text="Не найдено"
              :clearable="false"
              :show-null-option="false"
              :model-value="disciplineId"
              :items="disciplineSelectItems"
              :loading="loading"
              :disabled="loading || !disciplines.length"
              :max-list-height="260"
              :menu-width="400"
              @update:model-value="onDisciplineSelect"
            />
          </div>
        </div>
      </div>
    </v-card>

    <div class="section-row">
      <div class="section-title-wrap">
        <h2 class="section-title">Доступные виды контроля</h2>
        <span
          v-if="controlTypes.length"
          class="section-count"
        >
          {{ controlTypes.length }}
        </span>
      </div>
      <button
        v-if="canEdit"
        type="button"
        class="save-btn"
        @click="$emit('save')"
      >
        <svg
          width="16"
          height="16"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          stroke-width="2.2"
          stroke-linecap="round"
          stroke-linejoin="round"
        >
          <path
            d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"
          />
          <polyline points="17 21 17 13 7 13 7 21" />
          <polyline points="7 3 7 8 15 8" />
        </svg>
        Сохранить изменения
      </button>
    </div>

    <p
      v-if="controlTypes.length === 0 && !loading"
      class="section-hint"
    >
      Виды контроля загружаются из учебного плана. Выберите дисциплину —
      появятся виды контроля из базы данных.
    </p>

    <v-row dense>
      <v-col
        v-for="ct in controlTypes"
        :key="ct.id"
        cols="12"
        md="6"
      >
        <control-type-card
          :control-type="ct"
          :templates="templates"
          :available-topics="topicsByControlType[ct.title] ?? []"
          :can-edit="canEdit"
          @update:active="onUpdateActive(ct, $event)"
          @update:template-id="onUpdateTemplateId(ct, $event)"
          @update:displayed-topics="onUpdateDisplayedTopics(ct, $event)"
        />
      </v-col>
    </v-row>
  </div>
</template>

<script setup lang="ts">
  import { computed } from 'vue';
  import ControlTypeCard from './ControlTypeCard.vue';
  import type { TemplateItem, ControlTypeItem } from '../modal';

  const props = withDefaults(
    defineProps<{
      disciplineId: string;
      disciplines: { id: string; name: string }[];
      controlTypes: ControlTypeItem[];
      templates: TemplateItem[];
      topicsByControlType: Record<string, string[]>;
      loading?: boolean;
      canEdit?: boolean;
    }>(),
    { canEdit: false, loading: false, topicsByControlType: () => ({}) }
  );

  const emit = defineEmits<{
    'update:disciplineId': [id: string];
    save: [];
  }>();

  const disciplineSelectItems = computed(() =>
    props.disciplines.map((d) => ({ title: d.name, value: d.id }))
  );

  const disciplineCardDescription = computed(() =>
    props.disciplines.length
      ? 'Выберите дисциплину. Отмеченные виды контроля будут отображаться в таблице со студентами'
      : 'Загрузка дисциплин...'
  );

  function onDisciplineSelect(v: string | number | null) {
    if (v != null) {
      emit('update:disciplineId', String(v));
    }
  }

  function onUpdateActive(ct: ControlTypeItem, active: boolean) {
    const item = props.controlTypes.find((x) => x.id === ct.id);
    if (item) {
      item.active = active;
      item.showInTable = active;
    }
  }
  function onUpdateTemplateId(ct: ControlTypeItem, templateId: string | null) {
    const item = props.controlTypes.find((x) => x.id === ct.id);
    if (item) item.templateId = templateId;
  }
  function onUpdateDisplayedTopics(
    ct: ControlTypeItem,
    displayedTopics: string[] | undefined
  ) {
    const item = props.controlTypes.find((x) => x.id === ct.id);
    if (item) {
      item.displayedTopics = displayedTopics;
    }
  }
</script>

<style scoped>
  .control-types-tab {
    padding: 0 0 28px;
  }

  .discipline-card {
    border-radius: 16px;
    padding: 0;
    border: 1px solid #e5e7eb;
    box-shadow: 0 1px 3px rgba(0, 0, 0, 0.06);
    margin-bottom: 24px;
    overflow: hidden;
  }

  .discipline-card-inner {
    display: flex;
    align-items: flex-start;
    gap: 16px;
    padding: 20px 24px;
  }

  .discipline-icon {
    flex-shrink: 0;
    width: 48px;
    height: 48px;
    border-radius: 12px;
    background: #f5f3ff;
    color: #7c3aed;
    display: flex;
    align-items: center;
    justify-content: center;
  }

  .discipline-text {
    flex: 1;
    min-width: 0;
    display: flex;
    flex-direction: column;
    gap: 12px;
  }

  .discipline-title {
    margin: 0;
    font-size: 16px;
    font-weight: 600;
    color: #111827;
  }

  .discipline-desc {
    margin: 0;
    font-size: 14px;
    color: #6b7280;
    line-height: 1.4;
  }

  .discipline-select-wrap {
    max-width: 440px;
    width: 100%;
  }

  .section-row {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 16px;
    margin-bottom: 16px;
    flex-wrap: wrap;
  }

  .section-title-wrap {
    display: flex;
    align-items: center;
    gap: 10px;
  }

  .section-title {
    margin: 0;
    font-size: 18px;
    font-weight: 700;
    color: #0f172a;
    letter-spacing: -0.02em;
  }

  .section-count {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    min-width: 24px;
    height: 22px;
    padding: 0 7px;
    border-radius: 11px;
    background: rgba(30, 55, 153, 0.1);
    color: rgb(30, 55, 153);
    font-size: 12px;
    font-weight: 700;
  }

  .section-hint {
    display: flex;
    align-items: center;
    gap: 6px;
    margin: 0 0 16px;
    font-size: 13px;
    color: #94a3b8;
  }

  .save-btn {
    display: inline-flex;
    align-items: center;
    gap: 8px;
    padding: 9px 18px;
    background: #111827;
    color: #fff;
    border: none;
    border-radius: 11px;
    font-size: 13.5px;
    font-weight: 600;
    cursor: pointer;
    flex-shrink: 0;
    transition:
      background 0.18s ease,
      box-shadow 0.18s ease,
      transform 0.1s ease;
    letter-spacing: -0.01em;
  }
  .save-btn:hover {
    background: #1f2937;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
  }
  .save-btn:active {
    transform: scale(0.98);
    box-shadow: none;
  }
</style>
