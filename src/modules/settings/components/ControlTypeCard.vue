<template>
  <div
    class="control-type-card"
    :class="{ 'card-active': controlType.active, 'card-inactive': !controlType.active }"
  >
    <!-- ── Header ── -->
    <div class="card-header">
      <div class="card-header-left">
        <!-- Custom toggle switch -->
        <button
          class="toggle-btn"
          :class="{ 'toggle-on': controlType.active }"
          :disabled="!canEdit"
          type="button"
          :aria-pressed="controlType.active"
          @click="$emit('update:active', !controlType.active)"
        >
          <span class="toggle-thumb" />
        </button>

        <div class="card-title-block">
          <h3 class="card-title">{{ controlType.title }}</h3>
          <p class="card-desc">{{ controlType.description }}</p>
        </div>
      </div>

      <transition name="badge-pop">
        <div v-if="controlType.active" key="on" class="active-badge">
          <span class="active-dot" />
          Активно
        </div>
        <div v-else key="off" class="inactive-badge">
          Отключено
        </div>
      </transition>
    </div>

    <!-- ── Options (active only) ── -->
    <transition name="slide-down">
      <div v-if="controlType.active" class="card-options">
        <div class="divider" />

        <!-- Template select -->
        <div class="option-row">
          <label class="option-label">
            <span class="option-label-icon">
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/></svg>
            </span>
            Шаблон проверки
          </label>
          <v-menu
            :disabled="!canEdit"
            location="bottom start"
            content-class="tpl-dropdown"
            :close-on-content-click="true"
          >
            <template #activator="{ props: menuProps, isActive }">
              <div
                v-bind="menuProps"
                class="tpl-trigger"
                :class="{ disabled: !canEdit, open: isActive }"
              >
                <span class="tpl-trigger-icon">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/></svg>
                </span>
                <span class="tpl-trigger-value" :class="{ placeholder: !selectedTemplate }">
                  {{ selectedTemplate ? selectedTemplate.name : 'Выберите шаблон…' }}
                </span>
                <span class="tpl-trigger-arrow" :class="{ rotated: isActive }">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="6 9 12 15 18 9"/></svg>
                </span>
              </div>
            </template>
            <div class="tpl-list-wrap">
              <button
                v-for="t in templateOptions"
                :key="t.id"
                class="tpl-item"
                :class="{ selected: controlType.templateId === t.id }"
                type="button"
                @click="$emit('update:templateId', t.id)"
              >
                <span class="tpl-item-check">
                  <svg v-if="controlType.templateId === t.id" width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3.2" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
                </span>
                <span class="tpl-item-label">{{ t.name }}</span>
              </button>
              <div v-if="!templateOptions.length" class="tpl-empty">Шаблоны не найдены</div>
            </div>
          </v-menu>
        </div>
        <!-- Topics picker -->
        <div class="option-row">
          <label class="option-label">
            <span class="option-label-icon">
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M20.59 13.41l-7.17 7.17a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82z"/><line x1="7" y1="7" x2="7.01" y2="7"/></svg>
            </span>
            Отображаемые темы
          </label>

          <template v-if="availableTopics.length">
            <v-menu
              :disabled="!canEdit"
              location="bottom start"
              :max-height="340"
              content-class="topics-dropdown"
              :close-on-content-click="false"
            >
              <template #activator="{ props: menuProps, isActive }">
                <div
                  v-bind="menuProps"
                  class="topics-trigger"
                  :class="{ disabled: !canEdit, open: isActive }"
                >
                  <span class="topics-trigger-icon">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><line x1="8" y1="6" x2="21" y2="6"/><line x1="8" y1="12" x2="21" y2="12"/><line x1="8" y1="18" x2="21" y2="18"/><line x1="3" y1="6" x2="3.01" y2="6"/><line x1="3" y1="12" x2="3.01" y2="12"/><line x1="3" y1="18" x2="3.01" y2="18"/></svg>
                  </span>

                  <span class="topics-trigger-label" :class="{ muted: isAllTopicsSelected, empty: isNoTopicsSelected }">
                    <template v-if="isNoTopicsSelected">Нет тем</template>
                    <template v-else-if="isAllTopicsSelected">Все темы</template>
                    <template v-else>Выбрано тем</template>
                  </span>

                  <span v-if="!isNoTopicsSelected" class="topics-count-pill" :class="{ all: isAllTopicsSelected }">
                    {{ isAllTopicsSelected ? availableTopics.length : displayedTopicsValue.length }}
                  </span>

                  <span class="topics-trigger-arrow" :class="{ rotated: isActive }">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="6 9 12 15 18 9"/></svg>
                  </span>
                </div>
              </template>

              <div class="topics-list-wrap">
                <div class="topics-search-row">
                  <span class="topics-search-icon">
                    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
                  </span>
                  <input
                    v-model="topicSearch"
                    class="topics-search-input"
                    placeholder="Поиск темы…"
                    @click.stop
                  />
                </div>
                <div class="topics-list">
                  <button
                    v-for="topic in filteredTopics"
                    :key="topic"
                    class="topics-item"
                    :class="{ selected: displayedTopicsValue.includes(topic) }"
                    type="button"
                    @click="toggleTopic(topic)"
                  >
                    <span class="topics-item-check">
                      <svg v-if="displayedTopicsValue.includes(topic)" width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3.2" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
                    </span>
                    <span class="topics-item-label">{{ topic }}</span>
                  </button>
                  <div v-if="!filteredTopics.length" class="topics-no-results">Не найдено</div>
                </div>
                <div class="topics-footer">
                  <button class="topics-footer-btn" type="button" @click="selectAll">Выбрать все</button>
                  <button class="topics-footer-btn topics-footer-btn-ghost" type="button" @click="clearAll">Сбросить</button>
                </div>
              </div>
            </v-menu>
          </template>

          <p v-else class="topics-empty-hint">
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="flex-shrink:0;opacity:.5"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
            Выберите дисциплину выше — появятся темы из плана
          </p>
        </div>
      </div>
    </transition>
  </div>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue';
import type { TemplateItem, ControlTypeItem } from '../types';

const props = withDefaults(
  defineProps<{
    controlType: ControlTypeItem;
    templates: TemplateItem[];
    availableTopics: string[];
    canEdit?: boolean;
  }>(),
  { canEdit: false, availableTopics: () => [] }
);

const emit = defineEmits<{
  'update:active': [value: boolean];
  'update:templateId': [id: string | null];
  'update:displayedTopics': [value: string[] | undefined];
}>();

const topicSearch = ref('');

const templateOptions = computed(() =>
  props.templates.map((t) => ({ id: t.id, name: t.name }))
);

const displayedTopicsValue = computed(() => {
  const saved = props.controlType.displayedTopics;
  if (saved === undefined) return props.availableTopics.length ? [...props.availableTopics] : [];
  return saved;
});

const isAllTopicsSelected = computed(() =>
  displayedTopicsValue.value.length === props.availableTopics.length && props.availableTopics.length > 0
);
const isNoTopicsSelected = computed(() =>
  props.availableTopics.length > 0 && displayedTopicsValue.value.length === 0
);

const selectedTemplate = computed(() =>
  templateOptions.value.find(t => t.id === props.controlType.templateId) ?? null
);

const filteredTopics = computed(() => {
  const q = topicSearch.value.trim().toLowerCase();
  return q ? props.availableTopics.filter(t => t.toLowerCase().includes(q)) : props.availableTopics;
});

function toggleTopic(topic: string) {
  const set = new Set(displayedTopicsValue.value);
  set.has(topic) ? set.delete(topic) : set.add(topic);
  const next = [...set];
  if (next.length === props.availableTopics.length) emit('update:displayedTopics', undefined);
  else if (next.length === 0) emit('update:displayedTopics', []);
  else emit('update:displayedTopics', next);
}

function selectAll() { emit('update:displayedTopics', undefined); }
function clearAll()  { emit('update:displayedTopics', []); }
</script>

<style scoped>
/* ════════════════════════════════════════
   Card shell
════════════════════════════════════════ */
.control-type-card {
  border-radius: 18px;
  padding: 16px 18px;
  border: 1.5px solid #e8eaf0;
  background: #ffffff;
  position: relative;
  overflow: hidden;
  transition: border-color .25s ease, box-shadow .25s ease, background .25s ease;
}

/* ── Inactive state: greyed out, no shadow, dashed border ── */
.card-inactive {
  background: #f8f9fb;
  border-color: #e4e6ed;
  border-style: dashed;
  box-shadow: none;
}
.card-inactive .card-title { color: #9ca3af; }
.card-inactive .card-desc  { color: #c4c9d4; }

/* ── Active state: subtle indigo accent ── */
.card-active {
  background: #ffffff;
  border-style: solid;
  border-color: rgba(30,55,153,0.28);
  box-shadow:
    0 1px 6px rgba(0,0,0,.06),
    0 0 0 3px rgba(30,55,153,0.04);
}
.card-active::before {
  content: '';
  position: absolute;
  top: 0; left: 0; right: 0;
  height: 2px;
  background: linear-gradient(90deg, rgb(74,97,185) 0%, rgb(180,193,230) 100%);
  border-radius: 18px 18px 0 0;
  opacity: 0.7;
}

/* ════════════════════════════════════════
   Header
════════════════════════════════════════ */
.card-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
}
.card-header-left {
  display: flex;
  align-items: center;
  gap: 12px;
  min-width: 0;
  flex: 1;
}

/* ── Toggle switch ── */
.toggle-btn {
  flex-shrink: 0;
  width: 40px; height: 23px;
  border-radius: 12px;
  border: none;
  background: #d1d5db;
  cursor: pointer;
  padding: 0;
  position: relative;
  transition: background .22s ease, box-shadow .22s ease;
  outline: none;
}
.toggle-btn:focus-visible { box-shadow: 0 0 0 3px rgba(30,55,153,0.25); }
.toggle-btn:disabled { cursor: default; opacity: .45; }
.toggle-btn.toggle-on {
  background: rgb(30,55,153);
  box-shadow: 0 2px 8px rgba(30,55,153,0.35);
}
.toggle-thumb {
  position: absolute;
  top: 3px; left: 3px;
  width: 17px; height: 17px;
  border-radius: 50%;
  background: #fff;
  box-shadow: 0 1px 4px rgba(0,0,0,.18);
  transition: transform .22s cubic-bezier(.34,1.56,.64,1);
}
.toggle-on .toggle-thumb { transform: translateX(17px); }

/* ── Titles ── */
.card-title-block { min-width: 0; flex: 1; }
.card-title {
  margin: 0 0 2px;
  font-size: 14px;
  font-weight: 650;
  color: #0f172a;
  letter-spacing: -.01em;
  line-height: 1.3;
  transition: color .25s;
}
.card-desc {
  margin: 0;
  font-size: 12.5px;
  color: #94a3b8;
  line-height: 1.4;
  transition: color .25s;
}

/* ── Badges ── */
.active-badge, .inactive-badge {
  flex-shrink: 0;
  display: inline-flex;
  align-items: center;
  gap: 5px;
  padding: 3px 10px 3px 8px;
  border-radius: 20px;
  font-size: 11.5px;
  font-weight: 600;
  letter-spacing: .01em;
  white-space: nowrap;
}
.active-badge {
  background: rgba(30,55,153,0.08);
  color: rgb(30,55,153);
  border: 1px solid rgba(30,55,153,0.18);
}
.inactive-badge {
  background: #f1f2f5;
  color: #b0b7c3;
  border: 1px solid #e4e6ed;
}
.active-dot {
  width: 6px; height: 6px;
  border-radius: 50%;
  background: rgb(30,55,153);
  animation: blink 2.4s ease-in-out infinite;
}
@keyframes blink {
  0%,100% { opacity:1; transform:scale(1); }
  50%      { opacity:.35; transform:scale(.65); }
}
.badge-pop-enter-active, .badge-pop-leave-active { transition: opacity .18s ease, transform .18s ease; }
.badge-pop-enter-from, .badge-pop-leave-to { opacity:0; transform:scale(.8); }

/* ════════════════════════════════════════
   Options block
════════════════════════════════════════ */
.divider {
  height: 1px;
  background: linear-gradient(90deg, transparent, #e8eaf0 20%, #e8eaf0 80%, transparent);
  margin: 14px 0;
}
.card-options { overflow: hidden; }
.slide-down-enter-active { transition: opacity .24s ease, max-height .32s ease; max-height: 600px; }
.slide-down-leave-active { transition: opacity .18s ease, max-height .24s ease; }
.slide-down-enter-from, .slide-down-leave-to { opacity:0; max-height:0; }

.option-row { display:flex; flex-direction:column; gap:7px; margin-bottom:14px; }
.option-row:last-child { margin-bottom:0; }

.option-label {
  display: inline-flex;
  align-items: center;
  gap: 5px;
  font-size: 10.5px;
  font-weight: 700;
  color: #94a3b8;
  text-transform: uppercase;
  letter-spacing: .08em;
}
.option-label-icon { display:flex; align-items:center; color:#94a3b8; }

/* ════════════════════════════════════════
   Template custom dropdown (same style as topics trigger)
════════════════════════════════════════ */
.tpl-trigger {
  display: flex;
  align-items: center;
  gap: 9px;
  height: 44px;
  padding: 0 13px;
  border-radius: 12px;
  border: 1.5px solid #e2e8f0;
  background: #f8f9fb;
  cursor: pointer;
  user-select: none;
  width: 100%;
  transition: border-color .18s, box-shadow .18s, background .18s;
}
.tpl-trigger:hover:not(.disabled) { border-color: #c7d2e2; background: #fff; }
.tpl-trigger.open {
  border-color: rgb(30,55,153);
  background: #fff;
  box-shadow: 0 0 0 3px rgba(30,55,153,0.1);
}
.tpl-trigger.disabled { opacity:.5; cursor:default; pointer-events:none; }

.tpl-trigger-icon { color:#94a3b8; flex-shrink:0; display:flex; align-items:center; }

.tpl-trigger-value {
  flex: 1; min-width: 0;
  font-size: 13.5px; font-weight: 500; color: #1e293b;
  white-space: nowrap; overflow: hidden; text-overflow: ellipsis;
}
.tpl-trigger-value.placeholder { color: #94a3b8; font-weight: 400; }

.tpl-trigger-arrow {
  flex-shrink:0; color:#94a3b8;
  display:flex; align-items:center;
  transition: transform .2s ease;
}
.tpl-trigger-arrow.rotated { transform: rotate(180deg); }

/* dropdown panel */
:deep(.tpl-dropdown) {
  border-radius: 14px !important;
  box-shadow: 0 8px 28px rgba(0,0,0,.1), 0 2px 6px rgba(0,0,0,.06) !important;
  border: 1.5px solid #e8eaf0;
  overflow: hidden;
  min-width: 220px;
}

.tpl-list-wrap {
  background: #fff;
  border-radius: 14px;
  padding: 6px;
  overflow: hidden;
}

.tpl-item {
  display: flex;
  align-items: center;
  gap: 9px;
  width: 100%;
  padding: 8px 10px;
  border: none; background: transparent;
  border-radius: 9px;
  cursor: pointer; text-align: left;
  font-family: inherit;
  transition: background .13s;
}
.tpl-item:hover { background: rgba(30,55,153,0.04); }
.tpl-item.selected { background: rgba(30,55,153,0.07); }

.tpl-item-check {
  width: 18px; height: 18px;
  border-radius: 5px;
  border: 1.5px solid #d1d5db;
  background: #fff;
  flex-shrink: 0;
  display: flex; align-items: center; justify-content: center;
  transition: border-color .15s, background .15s;
  color: #fff;
}
.tpl-item.selected .tpl-item-check { background: rgb(30,55,153); border-color: rgb(30,55,153); }

.tpl-item-label {
  font-size: 13.5px; color: #1e293b; font-weight: 500;
  white-space: nowrap; overflow: hidden; text-overflow: ellipsis;
}
.tpl-item.selected .tpl-item-label { color: rgb(20,40,120); font-weight: 600; }

.tpl-empty {
  padding: 10px; font-size: 13px; color: #94a3b8; text-align: center;
}

/* ════════════════════════════════════════
   Topics trigger button
════════════════════════════════════════ */
.topics-trigger {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  height: 44px;
  padding: 0 13px;
  border-radius: 12px;
  border: 1.5px solid #e2e8f0;
  background: #f8f9fb;
  cursor: pointer;
  user-select: none;
  min-width: 210px;
  max-width: 340px;
  transition: border-color .18s, box-shadow .18s, background .18s;
}
.topics-trigger:hover:not(.disabled) { border-color: #c7d2e2; background: #fff; }
.topics-trigger.open {
  border-color: rgb(30,55,153);
  background: #fff;
  box-shadow: 0 0 0 3px rgba(30,55,153,0.12);
}
.topics-trigger.disabled { opacity:.5; cursor:default; }

.topics-trigger-icon { color:#94a3b8; flex-shrink:0; display:flex; align-items:center; }

.topics-trigger-label {
  flex:1; min-width:0;
  font-size: 13.5px;
  font-weight: 500;
  color: #1e293b;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
.topics-trigger-label.muted { color:#64748b; font-weight:400; }
.topics-trigger-label.empty { color:#94a3b8; font-style:italic; }

.topics-count-pill {
  flex-shrink:0;
  height: 20px; min-width: 22px;
  padding: 0 6px;
  border-radius: 10px;
  background: rgb(30,55,153);
  color: #fff;
  font-size: 11px; font-weight: 700;
  display: flex; align-items: center; justify-content: center;
}
.topics-count-pill.all {
  background: rgba(30,55,153,0.1);
  color: rgb(30,55,153);
}

.topics-trigger-arrow {
  flex-shrink:0; color:#94a3b8;
  display:flex; align-items:center;
  transition: transform .2s ease;
}
.topics-trigger-arrow.rotated { transform: rotate(180deg); }

/* ════════════════════════════════════════
   Topics dropdown
════════════════════════════════════════ */
:deep(.topics-dropdown) {
  border-radius: 16px !important;
  box-shadow: 0 10px 36px rgba(0,0,0,.13), 0 2px 8px rgba(0,0,0,.06) !important;
  border: 1.5px solid #e8eaf0;
  overflow: hidden;
  min-width: 230px;
}

.topics-list-wrap { background:#fff; border-radius:16px; overflow:hidden; }

/* search bar */
.topics-search-row {
  display:flex; align-items:center; gap:8px;
  padding: 10px 12px 8px;
  border-bottom: 1px solid #f1f3f8;
}
.topics-search-icon { color:#94a3b8; flex-shrink:0; display:flex; }
.topics-search-input {
  flex:1; border:none; outline:none;
  font-size: 13px; color: #1e293b;
  background: transparent; font-family: inherit;
}
.topics-search-input::placeholder { color:#c4c9d4; }

/* list */
.topics-list { max-height:224px; overflow-y:auto; padding:6px; }

.topics-item {
  display:flex; align-items:center; gap:9px;
  width:100%;
  padding: 7px 10px;
  border:none; background:transparent;
  border-radius:9px;
  cursor:pointer; text-align:left;
  font-family:inherit;
  transition: background .13s;
}
.topics-item:hover { background:rgba(30,55,153,0.04); }
.topics-item.selected { background:rgba(30,55,153,0.07); }

.topics-item-check {
  width:18px; height:18px;
  border-radius:5px;
  border: 1.5px solid #d1d5db;
  background:#fff;
  flex-shrink:0;
  display:flex; align-items:center; justify-content:center;
  transition: border-color .15s, background .15s;
  color:#fff;
}
.topics-item.selected .topics-item-check {
  background:rgb(30,55,153); border-color:rgb(30,55,153);
}

.topics-item-label {
  font-size:13px; color:#1e293b; font-weight:500;
  white-space:nowrap; overflow:hidden; text-overflow:ellipsis;
}
.topics-item.selected .topics-item-label { color:rgb(20,40,120); }

.topics-no-results {
  padding:12px 10px;
  font-size:13px; color:#94a3b8; text-align:center;
}

/* footer */
.topics-footer {
  display:flex; gap:6px;
  padding: 8px 10px;
  border-top: 1px solid #f1f3f8;
  background: rgba(30,55,153,0.02);
}
.topics-footer-btn {
  flex:1; padding:5px 8px;
  border-radius:8px;
  border: 1.5px solid rgb(30,55,153);
  background: rgb(30,55,153);
  font-size:12px; font-weight:600; color:#fff;
  cursor:pointer; font-family:inherit;
  transition: background .15s, border-color .15s, color .15s, opacity .15s;
}
.topics-footer-btn:hover { opacity:.85; }
.topics-footer-btn-ghost {
  background: transparent;
  color: rgb(30,55,153);
}
.topics-footer-btn-ghost:hover { background:rgba(30,55,153,0.07); opacity:1; }

/* ── Empty hint ── */
.topics-empty-hint {
  display:inline-flex; align-items:center; gap:5px;
  margin:0; font-size:12.5px; color:#94a3b8; font-style:italic;
}
</style>