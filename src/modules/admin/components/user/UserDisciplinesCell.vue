<template>
  <div
    v-if="(teacher.disciplines ?? []).length"
    class="disc-cell"
  >
    <div
      class="disc-list"
      @mouseenter="onDiscListEnter"
      @mouseleave="onDiscListLeave"
    >
      <etu-label-chip
        v-for="(d, di) in firstDiscs(teacher, maxVisible)"
        :key="di"
        variant="inline"
        size="sm"
        icon-position="none"
        root-class="disc-tag"
        border-radius="5px"
        :label="d"
      />
      <span
        v-if="hasHiddenDisciplines"
        class="disc-more-wrap"
      >
        <etu-label-chip
          variant="inline"
          size="sm"
          icon-position="none"
          root-class="disc-more"
          border-radius="5px"
          :label="`+${(teacher.disciplines ?? []).length - maxVisible}`"
        />
      </span>
    </div>
  </div>
  <span
    v-else
    class="dash"
  >
    —
  </span>
</template>

<script setup lang="ts">
  import { computed } from 'vue';
  import type { TeacherDto } from '@/api/admin';
  import { firstDiscs } from '../../utils/userTableHelpers';

  const props = defineProps<{
    teacher: TeacherDto;
    maxVisible: number;
  }>();

  const emit = defineEmits<{
    showTooltip: [e: MouseEvent, t: TeacherDto];
    hideTooltip: [];
  }>();

  const hasHiddenDisciplines = computed(
    () => (props.teacher.disciplines ?? []).length > props.maxVisible
  );

  function onDiscListEnter(e: MouseEvent) {
    if (!hasHiddenDisciplines.value) {
      return;
    }

    emit('showTooltip', e, props.teacher);
  }

  function onDiscListLeave() {
    if (!hasHiddenDisciplines.value) {
      return;
    }
    emit('hideTooltip');
  }
</script>

<style scoped>
  .disc-cell {
    position: relative;
    cursor: default;
  }
  .disc-list {
    display: flex;
    flex-wrap: wrap;
    gap: 5px;
    align-items: center;
  }
  .disc-list--has-overflow {
    cursor: pointer;
  }

  .disc-tag.etu-label-chip--inline {
    padding: 2px 9px;
    border-radius: 5px !important;
    background: #f5f5f4 !important;
    color: #57534e !important;
    font-size: 11.5px !important;
    font-weight: 500 !important;
    max-width: 150px;
    white-space: nowrap;
    transition: background 0.15s;
    border: none !important;
    min-height: unset !important;
    box-shadow: none !important;
  }
  .disc-tag.etu-label-chip--inline :deep(.etu-label-chip__text) {
    overflow: hidden;
    text-overflow: ellipsis;
  }

  .disc-more-wrap {
    display: inline-flex;
    align-items: center;
    flex-shrink: 0;
    cursor: inherit;
  }

  .disc-more.etu-label-chip--inline {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    min-width: 24px;
    height: 22px;
    padding: 0 6px;
    border-radius: 5px !important;
    background: #eff6ff !important;
    color: #2563eb !important;
    font-size: 11px !important;
    font-weight: 700 !important;
    cursor: inherit;
    border: none !important;
    min-height: unset !important;
    box-shadow: none !important;
  }

  .dash {
    color: #e7e5e4;
    font-weight: 500;
  }
</style>
