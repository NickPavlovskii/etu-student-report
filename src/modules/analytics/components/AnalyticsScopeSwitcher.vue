<template>
  <div class="scope-switcher-wrap">
    <div
      class="scope-switcher"
      data-analytics-scope-tabs
      role="tablist"
      aria-label="Режим аналитики"
    >
      <button
        v-for="tab in tabs"
        :key="tab.value"
        type="button"
        role="tab"
        :aria-selected="modelValue === tab.value"
        :class="['scope-tab', { 'scope-tab--active': modelValue === tab.value }]"
        @click="$emit('update:modelValue', tab.value)"
      >
        <v-icon
          size="20"
          class="scope-tab-icon"
        >
          {{ tab.icon }}
        </v-icon>
        {{ tab.label }}
      </button>
    </div>
    <p class="scope-hint">{{ hint }}</p>
  </div>
</template>

<script setup lang="ts">
  import { computed } from 'vue';
  import type { ScopeMode } from '../model';

  const props = defineProps<{ modelValue: ScopeMode }>();
  defineEmits<{ 'update:modelValue': [value: ScopeMode] }>();

  const tabs = [
    {
      value: 'personal' as const,
      icon: 'mdi-account-outline',
      label: 'Моя аналитика',
    },
    {
      value: 'department' as const,
      icon: 'mdi-briefcase-outline',
      label: 'Аналитика кафедры',
    },
  ];

  const hint = computed(() =>
    props.modelValue === 'department'
      ? 'Сводка по кафедре: все преподаватели и группы.'
      : 'Только ваши дисциплины и группы.'
  );
</script>

<style scoped>
  .scope-switcher-wrap {
    margin: 4px 0 22px;
    padding: 0 4px;
  }
  .scope-switcher {
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    gap: 8px;
  }
  .scope-tab {
    display: inline-flex;
    align-items: center;
    gap: 10px;
    padding: 10px 22px;
    border-radius: 999px;
    border: none;
    background: #f1f5f9;
    color: #64748b;
    font-size: 15px;
    font-weight: 500;
    cursor: pointer;
    transition:
      background 0.2s,
      color 0.2s,
      box-shadow 0.2s;
    box-shadow: none;
  }
  .scope-tab:hover:not(.scope-tab--active) {
    color: #475569;
    background: #e2e8f0;
  }
  .scope-tab--active {
    background: #1e293b;
    color: #fff;
    box-shadow:
      0 2px 10px rgba(30, 41, 59, 0.35),
      0 1px 3px rgba(15, 23, 42, 0.2);
  }
  .scope-switcher[data-analytics-scope-tabs]
    .scope-tab:not(.scope-tab--active)
    :deep(.scope-tab-icon) {
    flex-shrink: 0;
    color: #94a3b8;
    transition: color 0.2s;
  }
  .scope-switcher[data-analytics-scope-tabs]
    .scope-tab--active
    :deep(.scope-tab-icon) {
    flex-shrink: 0;
    color: #fff;
    transition: color 0.2s;
  }
  .scope-switcher[data-analytics-scope-tabs]
    .scope-tab:hover:not(.scope-tab--active)
    :deep(.scope-tab-icon) {
    flex-shrink: 0;
    color: #64748b;
    transition: color 0.2s;
  }
  .scope-hint {
    margin: 10px 0 0;
    font-size: 13px;
    color: #6b7280;
    line-height: 1.45;
    max-width: 520px;
  }
</style>
