<template>
  <div class="control-types-tab">
    <v-card class="discipline-card" elevation="0">
      <div class="discipline-card-inner">
        <div class="discipline-icon">
          <v-icon size="32" color="#7c3aed">mdi-folder-cog-outline</v-icon>
        </div>
        <div class="discipline-text">
          <h2 class="discipline-title">Настройка для дисциплины</h2>
          <p class="discipline-desc">
            {{ disciplines.length ? 'Выберите дисциплину. Отмеченные виды контроля будут отображаться в таблице со студентами' : 'Загрузка дисциплин...' }}
          </p>
          <v-menu
            location="bottom start"
            content-class="disc-dropdown"
            :close-on-content-click="true"
            :disabled="loading || !disciplines.length"
          >
            <template #activator="{ props: menuProps, isActive }">
              <div
                v-bind="menuProps"
                class="disc-trigger"
                :class="{ open: isActive, loading: loading }"
              >
                <span class="disc-trigger-icon">
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"/><path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"/></svg>
                </span>
                <span class="disc-trigger-value" :class="{ placeholder: !selectedDiscipline }">
                  {{ loading ? 'Загрузка…' : (selectedDiscipline ? selectedDiscipline.name : 'Выберите дисциплину…') }}
                </span>
                <span class="disc-trigger-arrow" :class="{ rotated: isActive }">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="6 9 12 15 18 9"/></svg>
                </span>
              </div>
            </template>
            <div class="disc-list-wrap">
              <div class="disc-search-row">
                <span class="disc-search-icon">
                  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
                </span>
                <input
                  v-model="discSearch"
                  class="disc-search-input"
                  placeholder="Поиск…"
                  @click.stop
                />
              </div>
              <div class="disc-list">
                <button
                  v-for="d in filteredDisciplines"
                  :key="d.id"
                  class="disc-item"
                  :class="{ selected: disciplineId === d.id }"
                  type="button"
                  @click="$emit('update:disciplineId', d.id); discSearch = ''"
                >
                  <span class="disc-item-label">{{ d.name }}</span>
                </button>
                <div v-if="!filteredDisciplines.length" class="disc-empty">Не найдено</div>
              </div>
            </div>
          </v-menu>
        </div>
      </div>
    </v-card>

    <div class="section-row">
      <div class="section-title-wrap">
        <h2 class="section-title">Доступные виды контроля</h2>
        <span v-if="controlTypes.length" class="section-count">{{ controlTypes.length }}</span>
      </div>
      <button
        v-if="canEdit"
        type="button"
        class="save-btn"
        @click="$emit('save')"
      >
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"/><polyline points="17 21 17 13 7 13 7 21"/><polyline points="7 3 7 8 15 8"/></svg>
        Сохранить изменения
      </button>
    </div>

    <p v-if="controlTypes.length === 0 && !loading" class="section-hint">
      Виды контроля загружаются из учебного плана. Выберите дисциплину — появятся виды контроля из базы данных.
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
import { computed, ref } from 'vue';
import ControlTypeCard from './ControlTypeCard.vue';
import type { TemplateItem, ControlTypeItem } from '../types';

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

const discSearch = ref('');

const selectedDiscipline = computed(() =>
  props.disciplines.find(d => d.id === props.disciplineId) ?? null
);

const filteredDisciplines = computed(() => {
  const q = discSearch.value.trim().toLowerCase();
  return q ? props.disciplines.filter(d => d.name.toLowerCase().includes(q)) : props.disciplines;
});

function onUpdateActive(ct: ControlTypeItem, active: boolean) {
  const item = props.controlTypes.find((x) => x.id === ct.id);
  if (item) { item.active = active; item.showInTable = active; }
}
function onUpdateTemplateId(ct: ControlTypeItem, templateId: string | null) {
  const item = props.controlTypes.find((x) => x.id === ct.id);
  if (item) item.templateId = templateId;
}
function onUpdateDisplayedTopics(ct: ControlTypeItem, displayedTopics: string[] | undefined) {
  const item = props.controlTypes.find((x) => x.id === ct.id);
  if (item) item.displayedTopics = displayedTopics;
}
</script>

<style scoped>
/* ── Palette ── */
/* primary: rgb(30,55,153) */

.control-types-tab {
  padding: 0 0 28px;
}

/* ════════════════════════════════════════
   Discipline card (как было)
════════════════════════════════════════ */
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

/* ── Discipline custom trigger ── */
.disc-trigger {
  display: flex;
  align-items: center;
  gap: 10px;
  height: 46px;
  max-width: 440px;
  padding: 0 14px;
  border-radius: 13px;
  border: 1.5px solid #e2e8f0;
  background: #f8f9fb;
  cursor: pointer;
  user-select: none;
  transition: border-color .18s, box-shadow .18s, background .18s;
}
.disc-trigger:hover:not(.loading) { border-color: #c7d2e2; background: #fff; }
.disc-trigger.open {
  border-color: rgb(30,55,153);
  background: #fff;
  box-shadow: 0 0 0 3px rgba(30,55,153,.1);
}
.disc-trigger.loading { opacity:.6; cursor:default; pointer-events:none; }

.disc-trigger-icon { color: rgb(30,55,153); opacity:.6; flex-shrink:0; display:flex; align-items:center; }

.disc-trigger-value {
  flex:1; min-width:0;
  font-size: 14px; font-weight: 500; color: #0f172a;
  white-space: nowrap; overflow: hidden; text-overflow: ellipsis;
}
.disc-trigger-value.placeholder { color: #94a3b8; font-weight: 400; }

.disc-trigger-arrow {
  flex-shrink:0; color: #94a3b8;
  display:flex; align-items:center;
  transition: transform .2s ease;
}
.disc-trigger-arrow.rotated { transform: rotate(180deg); }

/* ── Discipline dropdown ── */
:deep(.disc-dropdown) {
  border-radius: 16px !important;
  box-shadow: 0 10px 36px rgba(0,0,0,.12), 0 2px 8px rgba(0,0,0,.06) !important;
  border: 1.5px solid #e8eaf0;
  overflow: hidden;
  min-width: 320px;
  max-width: 480px;
}

.disc-list-wrap { background:#fff; border-radius:16px; overflow:hidden; }

.disc-search-row {
  display:flex; align-items:center; gap:8px;
  padding: 10px 12px 8px;
  border-bottom: 1px solid #f1f3f8;
}
.disc-search-icon { color:#94a3b8; flex-shrink:0; display:flex; }
.disc-search-input {
  flex:1; border:none; outline:none;
  font-size:13px; color:#1e293b;
  background:transparent; font-family:inherit;
}
.disc-search-input::placeholder { color:#c4c9d4; }

.disc-list { max-height:260px; overflow-y:auto; padding:6px; }

.disc-item {
  display:flex; align-items:center; gap:9px;
  width:100%; padding:8px 10px;
  border:none; background:transparent;
  border-radius:9px;
  cursor:pointer; text-align:left; font-family:inherit;
  transition: background .13s;
}
.disc-item:hover { background: rgba(30,55,153,.04); }
.disc-item.selected { background: rgba(30,55,153,.07); }

.disc-item-label {
  font-size:13.5px; color:#0f172a; font-weight:500;
  white-space:nowrap; overflow:hidden; text-overflow:ellipsis;
}
.disc-item.selected .disc-item-label { color:rgb(20,40,120); font-weight:600; }

.disc-empty { padding:12px 10px; font-size:13px; color:#94a3b8; text-align:center; }

/* ════════════════════════════════════════
   Section header
════════════════════════════════════════ */
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
  letter-spacing: -.02em;
}

.section-count {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-width: 24px;
  height: 22px;
  padding: 0 7px;
  border-radius: 11px;
  background: rgba(30,55,153,.1);
  color: rgb(30,55,153);
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

/* ════════════════════════════════════════
   Save button
════════════════════════════════════════ */
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
  transition: background .18s ease, box-shadow .18s ease, transform .1s ease;
  letter-spacing: -.01em;
}
.save-btn:hover {
  background: #1f2937;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
}
.save-btn:active {
  transform: scale(.98);
  box-shadow: none;
}
</style>