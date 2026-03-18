<template>
  <v-card class="card filters" elevation="0">
    <div class="filters-inner">
      <div class="filters-top">
        <v-icon size="18" class="filter-ico">mdi-filter-variant</v-icon>
        <span class="filters-caption">Фильтры и поиск</span>
      </div>

      <div class="filters-grid">
        <div class="row-1">
          <v-text-field
            :model-value="search"
            class="search-field"
            variant="outlined"
            density="compact"
            hide-details
            clearable
            placeholder="Поиск по ФИО студента или теме"
            bg-color="#f9fafb"
            prepend-inner-icon="mdi-magnify"
            @update:model-value="$emit('update:search', $event)"
          />
          <div class="date-wrap">
            <v-icon size="18" class="date-ico">mdi-calendar-outline</v-icon>
            <span class="date-label">Период загрузки:</span>
            <v-text-field
              :model-value="dateFrom"
              class="date-field"
              type="date"
              variant="outlined"
              density="compact"
              hide-details
              placeholder="мм/дд/гггг"
              bg-color="white"
              @update:model-value="$emit('update:dateFrom', $event)"
            />
            <span class="sep">—</span>
            <v-text-field
              :model-value="dateTo"
              class="date-field"
              type="date"
              variant="outlined"
              density="compact"
              hide-details
              placeholder="мм/дд/гггг"
              bg-color="white"
              @update:model-value="$emit('update:dateTo', $event)"
            />
          </div>
        </div>
        <div class="row-2">
          <v-select
            :model-value="filterDiscipline"
            class="filter-select"
            variant="outlined"
            density="compact"
            hide-details
            clearable
            label="Все дисциплины"
            :items="disciplines"
            bg-color="white"
            @update:model-value="$emit('update:filterDiscipline', $event)"
          />
          <v-select
            :model-value="filterGroup"
            class="filter-select"
            variant="outlined"
            density="compact"
            hide-details
            clearable
            label="Все группы"
            :items="groups"
            bg-color="white"
            @update:model-value="$emit('update:filterGroup', $event)"
          />
          <v-select
            :model-value="filterWorkType"
            class="filter-select"
            variant="outlined"
            density="compact"
            hide-details
            clearable
            label="Все типы работ"
            :items="workTypes"
            bg-color="white"
            @update:model-value="$emit('update:filterWorkType', $event)"
          />
          <v-select
            v-if="canSeeAll"
            :model-value="filterTeacher"
            class="filter-select"
            variant="outlined"
            density="compact"
            hide-details
            clearable
            label="Все преподаватели"
            :items="teachers"
            bg-color="white"
            @update:model-value="$emit('update:filterTeacher', $event)"
          />
        </div>
      </div>

      <div class="filters-footer">
        <span class="found">Найдено: <span class="found-val">{{ count }}</span></span>
        <div class="footer-actions">
          <slot name="export" />
          <v-btn variant="text" class="reset" @click="$emit('reset')">
            Сбросить все
          </v-btn>
        </div>
      </div>
    </div>
  </v-card>
</template>

<script setup lang="ts">
defineProps<{
  search: string;
  filterDiscipline: string;
  filterGroup: string;
  filterWorkType: string;
  filterTeacher: string;
  dateFrom: string;
  dateTo: string;
  disciplines: string[];
  groups: string[];
  workTypes: string[];
  teachers: string[];
  canSeeAll: boolean;
  count: number;
}>();

defineEmits([
  'reset',
  'update:search',
  'update:filterDiscipline',
  'update:filterGroup',
  'update:filterWorkType',
  'update:filterTeacher',
  'update:dateFrom',
  'update:dateTo',
]);
</script>

<style scoped>
.card {
  background: #fff;
  border: 1px solid #e5e7eb;
  border-radius: 16px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.06);
}

.filters {
  padding: 16px 20px;
  margin-bottom: 18px;
}

.filters-inner {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.filters-top {
  display: flex;
  align-items: center;
  gap: 8px;
}

.filter-ico {
  color: #374151;
}

.filters-caption {
  font-size: 15px;
  font-weight: 600;
  color: #111827;
}

.filters-grid {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.row-1 {
  display: grid;
  grid-template-columns: 1fr auto;
  gap: 16px;
  align-items: center;
}

.search-field {
  min-width: 0;
}

.search-field :deep(.v-field) {
  border-radius: 10px;
  background: #f9fafb !important;
}

.date-wrap {
  display: flex;
  align-items: center;
  gap: 10px;
  flex-shrink: 0;
}

.date-ico {
  color: #6b7280;
}

.date-label {
  font-size: 13px;
  color: #374151;
  white-space: nowrap;
}

.date-field {
  width: 135px;
}

.date-field :deep(.v-field) {
  border-radius: 10px;
}

.sep {
  color: #9ca3af;
  font-weight: 500;
}

.row-2 {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
  gap: 12px;
}

.filter-select :deep(.v-field) {
  border-radius: 10px;
}

.filters-footer {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding-top: 4px;
}

.found {
  font-size: 14px;
  color: #6b7280;
}

.found-val {
  font-weight: 700;
  color: #111827;
}

.footer-actions {
  display: flex;
  align-items: center;
  gap: 12px;
}

.reset {
  text-transform: none;
  font-weight: 500;
  color: #6b7280;
}

@media (max-width: 900px) {
  .row-1 {
    grid-template-columns: 1fr;
  }
  .row-2 {
    grid-template-columns: 1fr 1fr !important;
  }
}

@media (max-width: 600px) {
  .row-2 {
    grid-template-columns: 1fr !important;
  }
  .date-wrap {
    flex-wrap: wrap;
  }
}
</style>
