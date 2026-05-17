<template>
  <div
    role="group"
    :class="['etu-segment-switcher', { 'etu-segment-switcher--compact': compact }]"
    :aria-label="ariaLabel"
  >
    <button
      v-for="opt in options"
      :key="String(opt.value)"
      type="button"
      :class="[
        'etu-segment-switcher__option',
        { 'etu-segment-switcher__option--active': modelValue === opt.value },
      ]"
      @click="$emit('update:modelValue', opt.value)"
    >
      {{ opt.label }}
    </button>
  </div>
</template>

<script setup lang="ts">
  export type SegmentOption<T extends string | number = string> = {
    value: T;
    label: string;
  };

  withDefaults(
    defineProps<{
      modelValue: string | number;
      options: SegmentOption[];
      ariaLabel?: string;
      /** Меньше отступы и перенос на узких экранах (3+ пунктов). */
      compact?: boolean;
    }>(),
    {
      ariaLabel: 'Выбор варианта',
      compact: false,
    }
  );

  defineEmits<{
    'update:modelValue': [value: string | number];
  }>();
</script>

<style scoped>
  .etu-segment-switcher {
    display: inline-flex;
    padding: 4px;
    border-radius: 999px;
    background: #f3f4f6;
    gap: 0;
    border: 1px solid rgba(0, 0, 0, 0.06);
  }

  .etu-segment-switcher--compact {
    flex-wrap: wrap;
    justify-content: flex-end;
    max-width: 100%;
  }

  .etu-segment-switcher__option {
    padding: 8px 16px;
    font-size: 12px;
    font-weight: 600;
    letter-spacing: 0.02em;
    text-transform: uppercase;
    color: #4b5563;
    background: transparent;
    border: none;
    border-radius: 999px;
    cursor: pointer;
    transition: background 0.2s, color 0.2s;
  }

  .etu-segment-switcher--compact .etu-segment-switcher__option {
    padding: 8px 12px;
    font-size: 11px;
    white-space: nowrap;
  }

  @media (min-width: 960px) {
    .etu-segment-switcher--compact .etu-segment-switcher__option {
      padding: 8px 14px;
      font-size: 12px;
    }
  }

  .etu-segment-switcher__option:hover {
    color: #374151;
  }

  .etu-segment-switcher__option--active {
    background: #fff;
    color: rgb(37, 99, 235);
    box-shadow: 0 1px 2px rgba(0, 0, 0, 0.06);
  }
</style>
