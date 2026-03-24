<template>
  <div
    :class="[
      'admin-count-chip-wrap',
      { 'admin-count-chip-wrap--align-end': alignEnd },
    ]"
  >
    <etu-label-chip
      variant="inline"
      size="sm"
      shape="pill"
      preset=""
      bg-color="#f3f4f6"
      text-color="#6b7280"
      :label="label"
      :dot="showDot"
      :dot-color="resolvedDotColor"
      :padding="chipPadding"
    />
  </div>
</template>

<script setup lang="ts">
  import { computed } from 'vue';

  import EtuLabelChip from '@/components/global/EtuLabelChip.vue';

  const props = withDefaults(
    defineProps<{
      label: string;
      showDot?: boolean;
      alignEnd?: boolean;
      dotColor?: string;
    }>(),
    {
      showDot: true,
      alignEnd: true,
      dotColor: '',
    }
  );

  const chipPadding = computed(() =>
    props.showDot ? '5px 14px 5px 11px' : '5px 14px'
  );

  const resolvedDotColor = computed(() => {
    if (!props.showDot) {
      return '';
    }
    return props.dotColor || '#22c55e';
  });
</script>

<style scoped>
  .admin-count-chip-wrap {
    display: inline-flex;
    max-width: 100%;
  }

  .admin-count-chip-wrap--align-end {
    margin-left: auto;
    flex-shrink: 0;
  }
</style>
