<template>
  <div
    :class="['upload-prog', { 'upload-prog--compact': compact }]"
  >
    <div class="upload-prog__label">{{ label }}</div>
    <div class="upload-prog__track">
      <div
        :class="['upload-prog__fill', fillClass]"
        :style="{ width: pct + '%' }"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
  import { computed } from 'vue';
  import { useProgressFormat } from '@/composables/useProgressFormat';

  const props = withDefaults(
    defineProps<{
      uploaded: number;
      plan: number;
      compact?: boolean;
    }>(),
    { compact: false }
  );

  const { progressPct, progressClass, uploadedSlashExpected } =
    useProgressFormat();

  const pct = computed(() => progressPct(props.uploaded, props.plan));
  const fillClass = computed(() => progressClass(props.uploaded, props.plan));
  const label = computed(() =>
    uploadedSlashExpected(props.uploaded, props.plan)
  );
</script>

<style scoped>
  .upload-prog {
    display: inline-block;
    min-width: 132px;
    max-width: 240px;
    width: 100%;
    vertical-align: middle;
  }
  .upload-prog--compact {
    min-width: 108px;
    max-width: 168px;
  }
  .upload-prog__label {
    font-size: 12px;
    font-weight: 500;
    color: #4b5563;
    font-variant-numeric: tabular-nums;
    white-space: nowrap;
    text-align: right;
    line-height: 1.25;
    margin-bottom: 5px;
  }
  .upload-prog__track {
    height: 6px;
    background: #e5e7eb;
    border-radius: 999px;
    overflow: hidden;
  }
  .upload-prog__fill {
    height: 100%;
    min-width: 0;
    border-radius: 999px;
    transition: width 0.3s ease;
  }
  .upload-prog__fill.prog__fill--high {
    background: #10b981;
  }
  .upload-prog__fill.prog__fill--mid {
    background: #6366f1;
  }
  .upload-prog__fill.prog__fill--low {
    background: #f59e0b;
  }
</style>
