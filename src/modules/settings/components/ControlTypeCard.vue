<template>
  <div :class="cardShellClass">
    <div class="card-header">
      <div class="card-header-left">
        <button
          type="button"
          :class="['toggle-btn', { 'toggle-on': controlType.active }]"
          :disabled="!canEdit"
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
        <div
          v-if="controlType.active"
          key="on"
          class="active-badge"
        >
          <span class="active-dot" />
          Активно
        </div>
        <div
          v-else
          key="off"
          class="inactive-badge"
        >
          Отключено
        </div>
      </transition>
    </div>

    <transition name="slide-down">
      <div
        v-if="controlType.active"
        class="card-options"
      >
        <div class="divider" />
        <div class="option-row">
          <label class="option-label">
            <span
              class="option-label-icon"
              v-html="fileDocument13Svg"
            />
            Шаблон проверки
          </label>
          <v-menu
            location="bottom start"
            content-class="tpl-dropdown"
            :disabled="!canEdit"
            :close-on-content-click="true"
          >
            <template #activator="{ props: menuProps, isActive }">
              <div
                v-bind="menuProps"
                :class="['tpl-trigger', { disabled: !canEdit, open: isActive }]"
              >
                <span
                  class="tpl-trigger-icon"
                  v-html="fileDocument14Svg"
                />
                <span
                  :class="[
                    'tpl-trigger-value',
                    { placeholder: !selectedTemplate },
                  ]"
                >
                  {{ templateTriggerLabel }}
                </span>
                <span
                  :class="['tpl-trigger-arrow', { rotated: isActive }]"
                  v-html="chevronDown14Svg"
                />
              </div>
            </template>
            <div class="tpl-list-wrap">
              <button
                v-for="t in templateOptions"
                :key="t.id"
                :class="[
                  'tpl-item',
                  { selected: controlType.templateId === t.id },
                ]"
                type="button"
                @click="$emit('update:templateId', t.id)"
              >
                <span
                  class="tpl-item-check"
                  v-html="templateRowCheckSvg(t.id)"
                />
                <span class="tpl-item-label">{{ t.name }}</span>
              </button>
              <div
                v-if="!templateOptions.length"
                class="tpl-empty"
              >
                Шаблоны не найдены
              </div>
            </div>
          </v-menu>
        </div>
        <div class="option-row">
          <label class="option-label">
            <span
              class="option-label-icon"
              v-html="tag13Svg"
            />
            Отображаемые темы
          </label>

          <etu-pill-search-select
            v-if="availableTopics.length"
            :model-value="displayedTopicsValue"
            multiple
            search-placeholder="Поиск темы…"
            empty-text="Не найдено"
            location="bottom start"
            :disabled="!canEdit"
            :show-null-option="false"
            :clearable="false"
            :items="topicItems"
            :searchable="true"
            :menu-width="400"
            :max-list-height="224"
            @update:model-value="onTopicsModelUpdate"
          >
            <template #activator="{ menuProps, open }">
              <div
                v-bind="menuProps"
                :class="['topics-trigger', { disabled: !canEdit, open }]"
              >
                <span
                  class="topics-trigger-icon"
                  v-html="list14Svg"
                />

                <span
                  :class="[
                    'topics-trigger-label',
                    { muted: isAllTopicsSelected, empty: isNoTopicsSelected },
                  ]"
                >
                  {{ topicsSelectionLabel }}
                </span>

                <span
                  v-if="!isNoTopicsSelected"
                  :class="['topics-count-pill', { all: isAllTopicsSelected }]"
                >
                  {{ topicsPillCount }}
                </span>

                <span
                  :class="['topics-trigger-arrow', { rotated: open }]"
                  v-html="chevronDown14Svg"
                />
              </div>
            </template>
            <template #footer>
              <div class="topics-footer">
                <button
                  class="topics-footer-btn"
                  type="button"
                  @click="selectAll"
                >
                  Выбрать все
                </button>
                <button
                  class="topics-footer-btn topics-footer-btn-ghost"
                  type="button"
                  @click="clearAll"
                >
                  Сбросить
                </button>
              </div>
            </template>
          </etu-pill-search-select>

          <p
            v-else
            class="topics-empty-hint"
          >
            <span
              class="topics-empty-hint__ico"
              v-html="infoCircleSvg"
            />
            Выберите дисциплину выше — появятся темы из плана
          </p>
        </div>
      </div>
    </transition>
  </div>
</template>

<script setup lang="ts">
  import { computed } from 'vue';
  import check11Svg from '@/assets/icons/check-11.svg?raw';
  import chevronDown14Svg from '@/assets/icons/chevron-down-14.svg?raw';
  import fileDocument13Svg from '@/assets/icons/file-document-13.svg?raw';
  import fileDocument14Svg from '@/assets/icons/file-document-14.svg?raw';
  import infoCircleSvg from '@/assets/icons/info-circle.svg?raw';
  import list14Svg from '@/assets/icons/list-14.svg?raw';
  import tag13Svg from '@/assets/icons/tag-13.svg?raw';
  import type { TemplateItem, ControlTypeItem } from '../modal';

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

  const cardShellClass = computed(() => [
    'control-type-card',
    props.controlType.active ? 'card-active' : 'card-inactive',
  ]);

  const templateOptions = computed(() =>
    props.templates.map((t) => ({ id: t.id, name: t.name }))
  );

  const displayedTopicsValue = computed(() => {
    const saved = props.controlType.displayedTopics;
    if (saved === undefined)
      return props.availableTopics.length ? [...props.availableTopics] : [];
    return saved;
  });

  const isAllTopicsSelected = computed(
    () =>
      displayedTopicsValue.value.length === props.availableTopics.length &&
      props.availableTopics.length > 0
  );
  const isNoTopicsSelected = computed(
    () =>
      props.availableTopics.length > 0 &&
      displayedTopicsValue.value.length === 0
  );

  const topicsPillCount = computed(() =>
    isAllTopicsSelected.value
      ? props.availableTopics.length
      : displayedTopicsValue.value.length
  );

  const topicsSelectionLabel = computed(() => {
    if (isNoTopicsSelected.value) {
      return 'Нет тем';
    }
    if (isAllTopicsSelected.value) {
      return 'Все темы';
    }
    return 'Выбрано тем';
  });

  const selectedTemplate = computed(
    () =>
      templateOptions.value.find(
        (t) => t.id === props.controlType.templateId
      ) ?? null
  );

  const templateTriggerLabel = computed(
    () => selectedTemplate.value?.name ?? 'Выберите шаблон…'
  );

  function templateRowCheckSvg(templateId: string) {
    return props.controlType.templateId === templateId ? check11Svg : '';
  }

  const topicItems = computed(() =>
    props.availableTopics.map((t) => ({ title: t, value: t }))
  );

  function onTopicsModelUpdate(v: string | null | string[]) {
    const arr = Array.isArray(v) ? v : [];
    if (
      arr.length === props.availableTopics.length &&
      props.availableTopics.length > 0
    ) {
      emit('update:displayedTopics', undefined);
    } else if (arr.length === 0) {
      emit('update:displayedTopics', []);
    } else {
      emit('update:displayedTopics', arr);
    }
  }

  function selectAll() {
    emit('update:displayedTopics', undefined);
  }
  function clearAll() {
    emit('update:displayedTopics', []);
  }
</script>

<style scoped>
  .control-type-card {
    border-radius: 18px;
    padding: 16px 18px;
    border: 1.5px solid #e8eaf0;
    background: #ffffff;
    position: relative;
    overflow: hidden;
    transition:
      border-color 0.25s ease,
      box-shadow 0.25s ease,
      background 0.25s ease;
  }

  .card-inactive {
    background: #f8f9fb;
    border-color: #e4e6ed;
    border-style: dashed;
    box-shadow: none;
  }
  .card-inactive .card-title {
    color: #9ca3af;
  }
  .card-inactive .card-desc {
    color: #c4c9d4;
  }

  .card-active {
    background: #ffffff;
    border-style: solid;
    border-color: rgba(30, 55, 153, 0.28);
    box-shadow:
      0 1px 6px rgba(0, 0, 0, 0.06),
      0 0 0 3px rgba(30, 55, 153, 0.04);
  }
  .card-active::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    height: 2px;
    background: linear-gradient(
      90deg,
      rgb(74, 97, 185) 0%,
      rgb(180, 193, 230) 100%
    );
    border-radius: 18px 18px 0 0;
    opacity: 0.7;
  }

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

  .toggle-btn {
    flex-shrink: 0;
    width: 40px;
    height: 23px;
    border-radius: 12px;
    border: none;
    background: #d1d5db;
    cursor: pointer;
    padding: 0;
    position: relative;
    transition:
      background 0.22s ease,
      box-shadow 0.22s ease;
    outline: none;
  }
  .toggle-btn:focus-visible {
    box-shadow: 0 0 0 3px rgba(30, 55, 153, 0.25);
  }
  .toggle-btn:disabled {
    cursor: default;
    opacity: 0.45;
  }
  .toggle-btn.toggle-on {
    background: rgb(30, 55, 153);
    box-shadow: 0 2px 8px rgba(30, 55, 153, 0.35);
  }
  .toggle-thumb {
    position: absolute;
    top: 3px;
    left: 3px;
    width: 17px;
    height: 17px;
    border-radius: 50%;
    background: #fff;
    box-shadow: 0 1px 4px rgba(0, 0, 0, 0.18);
    transition: transform 0.22s cubic-bezier(0.34, 1.56, 0.64, 1);
  }
  .toggle-on .toggle-thumb {
    transform: translateX(17px);
  }

  .card-title-block {
    min-width: 0;
    flex: 1;
  }
  .card-title {
    margin: 0 0 2px;
    font-size: 14px;
    font-weight: 650;
    color: #0f172a;
    letter-spacing: -0.01em;
    line-height: 1.3;
    transition: color 0.25s;
  }
  .card-desc {
    margin: 0;
    font-size: 12.5px;
    color: #94a3b8;
    line-height: 1.4;
    transition: color 0.25s;
  }

  .active-badge,
  .inactive-badge {
    flex-shrink: 0;
    display: inline-flex;
    align-items: center;
    gap: 5px;
    padding: 3px 10px 3px 8px;
    border-radius: 20px;
    font-size: 11.5px;
    font-weight: 600;
    letter-spacing: 0.01em;
    white-space: nowrap;
  }
  .active-badge {
    background: rgba(30, 55, 153, 0.08);
    color: rgb(30, 55, 153);
    border: 1px solid rgba(30, 55, 153, 0.18);
  }
  .inactive-badge {
    background: #f1f2f5;
    color: #b0b7c3;
    border: 1px solid #e4e6ed;
  }
  .active-dot {
    width: 6px;
    height: 6px;
    border-radius: 50%;
    background: rgb(30, 55, 153);
    animation: blink 2.4s ease-in-out infinite;
  }
  @keyframes blink {
    0%,
    100% {
      opacity: 1;
      transform: scale(1);
    }
    50% {
      opacity: 0.35;
      transform: scale(0.65);
    }
  }
  .badge-pop-enter-active,
  .badge-pop-leave-active {
    transition:
      opacity 0.18s ease,
      transform 0.18s ease;
  }
  .badge-pop-enter-from,
  .badge-pop-leave-to {
    opacity: 0;
    transform: scale(0.8);
  }

  .divider {
    height: 1px;
    background: linear-gradient(
      90deg,
      transparent,
      #e8eaf0 20%,
      #e8eaf0 80%,
      transparent
    );
    margin: 14px 0;
  }
  .card-options {
    overflow: hidden;
  }
  .slide-down-enter-active {
    transition:
      opacity 0.24s ease,
      max-height 0.32s ease;
    max-height: 600px;
  }
  .slide-down-leave-active {
    transition:
      opacity 0.18s ease,
      max-height 0.24s ease;
  }
  .slide-down-enter-from,
  .slide-down-leave-to {
    opacity: 0;
    max-height: 0;
  }

  .option-row {
    display: flex;
    flex-direction: column;
    gap: 7px;
    margin-bottom: 14px;
  }
  .option-row:last-child {
    margin-bottom: 0;
  }

  .option-label {
    display: inline-flex;
    align-items: center;
    gap: 5px;
    font-size: 10.5px;
    font-weight: 700;
    color: #94a3b8;
    text-transform: uppercase;
    letter-spacing: 0.08em;
  }
  .option-label-icon {
    display: flex;
    align-items: center;
    color: #94a3b8;
    line-height: 0;
  }
  .option-label-icon :deep(svg) {
    display: block;
  }

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
    transition:
      border-color 0.18s,
      box-shadow 0.18s,
      background 0.18s;
  }
  .tpl-trigger:hover:not(.disabled) {
    border-color: #c7d2e2;
    background: #fff;
  }
  .tpl-trigger.open {
    border-color: rgb(30, 55, 153);
    background: #fff;
    box-shadow: 0 0 0 3px rgba(30, 55, 153, 0.1);
  }
  .tpl-trigger.disabled {
    opacity: 0.5;
    cursor: default;
    pointer-events: none;
  }

  .tpl-trigger-icon {
    color: #94a3b8;
    flex-shrink: 0;
    display: flex;
    align-items: center;
    line-height: 0;
  }
  .tpl-trigger-icon :deep(svg) {
    display: block;
  }

  .tpl-trigger-value {
    flex: 1;
    min-width: 0;
    font-size: 13.5px;
    font-weight: 500;
    color: #1e293b;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }
  .tpl-trigger-value.placeholder {
    color: #94a3b8;
    font-weight: 400;
  }

  .tpl-trigger-arrow {
    flex-shrink: 0;
    color: #94a3b8;
    display: flex;
    align-items: center;
    transition: transform 0.2s ease;
    line-height: 0;
  }
  .tpl-trigger-arrow :deep(svg) {
    display: block;
  }
  .tpl-trigger-arrow.rotated {
    transform: rotate(180deg);
  }

  :deep(.tpl-dropdown) {
    border-radius: 14px !important;
    box-shadow:
      0 8px 28px rgba(0, 0, 0, 0.1),
      0 2px 6px rgba(0, 0, 0, 0.06) !important;
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
    border: none;
    background: transparent;
    border-radius: 9px;
    cursor: pointer;
    text-align: left;
    font-family: inherit;
    transition: background 0.13s;
  }
  .tpl-item:hover {
    background: rgba(30, 55, 153, 0.04);
  }
  .tpl-item.selected {
    background: rgba(30, 55, 153, 0.07);
  }

  .tpl-item-check {
    width: 18px;
    height: 18px;
    border-radius: 5px;
    border: 1.5px solid #d1d5db;
    background: #fff;
    flex-shrink: 0;
    display: flex;
    align-items: center;
    justify-content: center;
    transition:
      border-color 0.15s,
      background 0.15s;
    color: #fff;
    line-height: 0;
  }
  .tpl-item-check :deep(svg) {
    display: block;
  }
  .tpl-item.selected .tpl-item-check {
    background: rgb(30, 55, 153);
    border-color: rgb(30, 55, 153);
  }

  .tpl-item-label {
    font-size: 13.5px;
    color: #1e293b;
    font-weight: 500;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }
  .tpl-item.selected .tpl-item-label {
    color: rgb(20, 40, 120);
    font-weight: 600;
  }

  .tpl-empty {
    padding: 10px;
    font-size: 13px;
    color: #94a3b8;
    text-align: center;
  }

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
    transition:
      border-color 0.18s,
      box-shadow 0.18s,
      background 0.18s;
  }
  .topics-trigger:hover:not(.disabled) {
    border-color: #c7d2e2;
    background: #fff;
  }
  .topics-trigger.open {
    border-color: rgb(30, 55, 153);
    background: #fff;
    box-shadow: 0 0 0 3px rgba(30, 55, 153, 0.12);
  }
  .topics-trigger.disabled {
    opacity: 0.5;
    cursor: default;
  }

  .topics-trigger-icon {
    color: #94a3b8;
    flex-shrink: 0;
    display: flex;
    align-items: center;
    line-height: 0;
  }
  .topics-trigger-icon :deep(svg) {
    display: block;
  }

  .topics-trigger-label {
    flex: 1;
    min-width: 0;
    font-size: 13.5px;
    font-weight: 500;
    color: #1e293b;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }
  .topics-trigger-label.muted {
    color: #64748b;
    font-weight: 400;
  }
  .topics-trigger-label.empty {
    color: #94a3b8;
    font-style: italic;
  }

  .topics-count-pill {
    flex-shrink: 0;
    height: 20px;
    min-width: 22px;
    padding: 0 6px;
    border-radius: 10px;
    background: rgb(30, 55, 153);
    color: #fff;
    font-size: 11px;
    font-weight: 700;
    display: flex;
    align-items: center;
    justify-content: center;
  }
  .topics-count-pill.all {
    background: rgba(30, 55, 153, 0.1);
    color: rgb(30, 55, 153);
  }

  .topics-trigger-arrow {
    flex-shrink: 0;
    color: #94a3b8;
    display: flex;
    align-items: center;
    transition: transform 0.2s ease;
    line-height: 0;
  }
  .topics-trigger-arrow :deep(svg) {
    display: block;
  }
  .topics-trigger-arrow.rotated {
    transform: rotate(180deg);
  }

  .topics-footer {
    display: flex;
    gap: 6px;
    width: 100%;
    padding: 0;
    border-top: none;
    background: transparent;
  }
  .topics-footer-btn {
    flex: 1;
    padding: 5px 8px;
    border-radius: 8px;
    border: 1.5px solid rgb(30, 55, 153);
    background: rgb(30, 55, 153);
    font-size: 12px;
    font-weight: 600;
    color: #fff;
    cursor: pointer;
    font-family: inherit;
    transition:
      background 0.15s,
      border-color 0.15s,
      color 0.15s,
      opacity 0.15s;
  }
  .topics-footer-btn:hover {
    opacity: 0.85;
  }
  .topics-footer-btn-ghost {
    background: transparent;
    color: rgb(30, 55, 153);
  }
  .topics-footer-btn-ghost:hover {
    background: rgba(30, 55, 153, 0.07);
    opacity: 1;
  }

  .topics-empty-hint {
    display: inline-flex;
    align-items: center;
    gap: 5px;
    margin: 0;
    font-size: 12.5px;
    color: #94a3b8;
    font-style: italic;
  }
  .topics-empty-hint__ico {
    display: inline-flex;
    flex-shrink: 0;
    opacity: 0.5;
    line-height: 0;
  }
  .topics-empty-hint__ico :deep(svg) {
    display: block;
  }
</style>
