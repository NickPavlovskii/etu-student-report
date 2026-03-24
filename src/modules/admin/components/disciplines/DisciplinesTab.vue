<template>
  <div class="tab-panel">
    <v-alert
      v-if="disciplinesError"
      type="error"
      density="compact"
      variant="tonal"
      class="disciplines-error"
      closable
      border="start"
      @click:close="d.clearDisciplinesError()"
    >
      {{ disciplinesError }}
    </v-alert>

    <disciplines-toolbar
      :discipline-teacher-filter="disciplineTeacherFilter"
      :teacher-filter-items="teacherFilterItems"
      :card-count="disciplineCardItems.length"
      @update:discipline-teacher-filter="onDisciplineTeacherFilterUpdate"
    />

    <disciplines-cards-grid
      v-if="disciplineCardItems.length"
      :items="disciplineCardItems"
      @open-discipline="openDiscipline"
    />

    <disciplines-empty-state
      v-else-if="isIdle"
      :hint="emptyHint"
    />

    <etu-tea-loader
      overlay
      label="Загрузка"
      :loading="isLoading"
    />
  </div>
</template>

<script setup lang="ts">
  import { computed, inject } from 'vue';
  import DisciplinesCardsGrid from './DisciplinesCardsGrid.vue';
  import DisciplinesEmptyState from './DisciplinesEmptyState.vue';
  import DisciplinesToolbar from './DisciplinesToolbar.vue';
  import { useDisciplinesTabView } from '../../composables/useDisciplinesTab';
  import {
    adminDisciplinesKey,
    adminOpenDisciplineKey,
  } from '../../injectionKeys';

  const d = inject(adminDisciplinesKey);
  const openDiscipline = inject(adminOpenDisciplineKey);
  if (!d || !openDiscipline) {
    throw new Error(
      'DisciplinesTab: adminDisciplinesKey / adminOpenDisciplineKey не найдены'
    );
  }

  const disciplineTeacherFilter = computed(() => d.disciplineTeacherFilter.value);
  const teacherFilterItems = computed(() => d.teacherFilterItems.value);
  const disciplineCardItems = computed(() => d.disciplineCardItems.value);
  const disciplinesError = computed(() => d.disciplinesError.value);

  const { isLoading, isIdle } = useDisciplinesTabView(d);

  function onDisciplineTeacherFilterUpdate(value: string | null) {
    d.disciplineTeacherFilter.value = value;
    d.onDisciplineTeacherFilterChange();
  }

  const emptyHint = computed(() =>
    d.disciplineTeacherFilter.value
      ? 'У выбранного преподавателя нет дисциплин'
      : 'Нет данных для отображения'
  );
</script>

<style scoped>
  .tab-panel {
    min-height: 320px;
    position: relative;
  }

  .disciplines-error {
    margin-bottom: 16px;
  }
</style>
