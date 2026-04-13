<template>
  <div
    class="semester-switcher"
    role="group"
    aria-label="Период: учебный год или семестр"
  >
    <button
      type="button"
      :class="[
        'semester-switcher__option',
        { 'semester-switcher__option--active': modelValue === 'academic_year' },
      ]"
      @click="$emit('update:modelValue', 'academic_year')"
    >
      Учебный год
    </button>
    <button
      type="button"
      :class="[
        'semester-switcher__option',
        { 'semester-switcher__option--active': modelValue === 'autumn_semester' },
      ]"
      @click="$emit('update:modelValue', 'autumn_semester')"
    >
      Осенний семестр
    </button>
    <button
      type="button"
      :class="[
        'semester-switcher__option',
        { 'semester-switcher__option--active': modelValue === 'spring_semester' },
      ]"
      @click="$emit('update:modelValue', 'spring_semester')"
    >
      Весенний семестр
    </button>
  </div>
</template>

<script setup lang="ts">
  import type { StudyPeriod } from '@/api/info';

  defineProps<{
    modelValue: StudyPeriod;
  }>();

  defineEmits<{
    'update:modelValue': [value: StudyPeriod];
  }>();
</script>

<style scoped>
  .semester-switcher {
    display: inline-flex;
    flex-wrap: wrap;
    justify-content: flex-end;
    padding: 4px;
    border-radius: 999px;
    background: #f3f4f6;
    gap: 0;
    border: 1px solid rgba(0, 0, 0, 0.06);
    max-width: 100%;
  }

  .semester-switcher__option {
    padding: 8px 12px;
    font-size: 11px;
    font-weight: 600;
    letter-spacing: 0.02em;
    text-transform: uppercase;
    color: #4b5563;
    background: transparent;
    border: none;
    border-radius: 999px;
    cursor: pointer;
    transition:
      background 0.2s,
      color 0.2s;
    white-space: nowrap;
  }

  @media (min-width: 960px) {
    .semester-switcher__option {
      padding: 8px 14px;
      font-size: 12px;
    }
  }

  .semester-switcher__option:hover {
    color: #374151;
  }

  .semester-switcher__option--active {
    background: #fff;
    color: rgb(37, 99, 235);
    box-shadow: 0 1px 2px rgba(0, 0, 0, 0.06);
  }
</style>
