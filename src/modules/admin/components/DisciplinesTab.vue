<template>
  <div class="tab-panel">
    <div class="toolbar disciplines-toolbar">
      <h3 class="section-title">
        Все дисциплины кафедры
      </h3>
      <v-autocomplete
        :model-value="disciplineTeacherFilter"
        :items="teacherFilterItems"
        item-title="title"
        item-value="value"
        placeholder="Поиск по имени преподавателя..."
        density="compact"
        variant="outlined"
        hide-details
        clearable
        class="teacher-filter-select"
        auto-select-first
        @update:model-value="(v) => $emit('update:disciplineTeacherFilter', v)"
      />
    </div>
    <v-card v-if="disciplineCardItems.length" class="cards-wrap" elevation="0">
      <v-row dense>
        <v-col
          v-for="(item, i) in disciplineCardItems"
          :key="item.CodeRow ?? i"
          cols="12"
          md="4"
        >
          <etu-discipline-card
            :item="item"
            @click="() => { console.log('[DisciplinesTab] Клик по карточке, item:', item); $emit('open-discipline', item); }"
          />
        </v-col>
      </v-row>
    </v-card>
    <p v-else-if="!disciplinesLoading && !disciplinesByTeacherLoading && !disciplinesByAllTeachersLoading" class="text-secondary">
      Нет дисциплин
    </p>
    <div v-if="disciplinesLoading || disciplinesByTeacherLoading || disciplinesByAllTeachersLoading" class="loading-overlay">
      <v-progress-circular indeterminate color="primary" />
    </div>
  </div>
</template>

<script setup lang="ts">
import type { AdminDisciplineCardItem } from '../composables/useAdminDisciplines';

defineProps<{
  disciplineTeacherFilter: string | null;
  teacherFilterItems: { title: string; value: string }[];
  disciplineCardItems: AdminDisciplineCardItem[];
  disciplinesLoading: boolean;
  disciplinesByTeacherLoading: boolean;
  disciplinesByAllTeachersLoading: boolean;
  onDisciplineTeacherFilterChange: () => void;
}>();

defineEmits<{
  'update:disciplineTeacherFilter': [value: string | null];
  'open-discipline': [item: AdminDisciplineCardItem];
}>();
</script>

<style scoped>
.tab-panel {
  min-height: 320px;
  position: relative;
}

.toolbar.disciplines-toolbar {
  display: flex;
  align-items: center;
  gap: 16px;
  margin-bottom: 16px;
  flex-wrap: wrap;
  justify-content: space-between;
}

.section-title {
  font-size: 18px;
  font-weight: 600;
  margin: 0;
  margin-right: auto;
}

.teacher-filter-select {
  min-width: 220px;
}

.cards-wrap {
  background: transparent;
  border-radius: 0;
  padding: 0;
  box-shadow: none;
  border: none;
}

.loading-overlay {
  position: absolute;
  inset: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(255, 255, 255, 0.7);
}

.text-secondary {
  color: #6b7280;
  padding: 16px 0;
}
</style>
