<template>
  <div class="toolbar">
    <div class="filters-row filters-left">
      <etu-pill-search-select
        :model-value="disciplineTeacherFilter"
        placeholder="Все преподаватели"
        :items="teacherFilterItems"
        @update:model-value="emit('update:disciplineTeacherFilter', $event)"
      />

      <div
        v-if="activeTeacherLabel"
        class="active-teacher-text"
      >
        <span class="active-teacher-prefix">Преподаватель:</span>
        <span class="active-teacher-value">{{ activeTeacherLabel }}</span>
      </div>
    </div>

    <Transition
      name="counter-swap"
      mode="out-in"
    >
      <admin-count-chip
        v-if="cardCount > 0"
        :key="cardCount"
        :label="countLabel"
      />
    </Transition>
  </div>
</template>

<script setup lang="ts">
  import { computed } from 'vue';
  import AdminCountChip from '../AdminCountChip.vue';
  import { disciplineCountLabel } from '../../utils/disciplineCountLabel';

  const props = defineProps<{
    disciplineTeacherFilter: string | null;
    teacherFilterItems: { title: string; value: string }[];
    cardCount: number;
  }>();

  const emit = defineEmits<{
    'update:disciplineTeacherFilter': [value: string | null];
  }>();

  const activeTeacherLabel = computed(() => {
    if (!props.disciplineTeacherFilter) {
      return null;
    }
    return (
      props.teacherFilterItems.find(
        (i) => i.value === props.disciplineTeacherFilter
      )?.title ?? null
    );
  });

  const countLabel = computed(() => disciplineCountLabel(props.cardCount));
</script>

<style scoped>
  .toolbar {
    display: flex;
    align-items: center;
    gap: 16px;
    margin-bottom: 20px;
    flex-wrap: wrap;
    justify-content: space-between;
  }

  .filters-row {
    display: flex;
    align-items: center;
    gap: 10px;
    flex-wrap: wrap;
  }

  .filters-left {
    flex: 1;
  }

  .active-teacher-text {
    display: inline-flex;
    align-items: center;
    gap: 6px;
    font-size: 13px;
    color: #1f2937;
    white-space: nowrap;
    margin-left: 10px;
    user-select: none;
  }

  .active-teacher-prefix {
    color: #6b7280;
    font-weight: 600;
  }

  .active-teacher-value {
    font-weight: 700;
    color: #111827;
    max-width: 260px;
    overflow: hidden;
    text-overflow: ellipsis;
  }

  .counter-swap-enter-active,
  .counter-swap-leave-active {
    transition:
      opacity 0.15s,
      transform 0.15s;
  }

  .counter-swap-enter-from {
    opacity: 0;
    transform: translateY(-3px);
  }

  .counter-swap-leave-to {
    opacity: 0;
    transform: translateY(3px);
  }
</style>
