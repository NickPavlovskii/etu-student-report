<template>
  <v-card
    class="card filters"
    elevation="0"
  >
    <div class="filters-top">
      <div class="filters-left">
        <v-icon
          size="18"
          class="filter-ico"
        >
          mdi-filter-variant
        </v-icon>
        <div class="filters-caption">
          Фильтры и поиск
        </div>
      </div>
      <v-btn
        variant="text"
        class="reset"
        @click="$emit('reset')"
      >
        Сбросить все
      </v-btn>
    </div>
    <v-row
      dense
      class="filters-grid"
    >
      <v-col
        cols="12"
        md="8"
      >
        <v-text-field
          :model-value="search"
          class="ui"
          variant="outlined"
          density="comfortable"
          hide-details
          clearable
          label="Поиск по ФИО студента или теме"
          @update:model-value="$emit('update:search', $event)"
        />
      </v-col>
      <v-col
        cols="12"
        md="4"
      >
        <div class="date-wrap">
          <div class="date-label">
            <v-icon size="18">
              mdi-calendar-outline
            </v-icon>
            <span>
              Период загрузки:
            </span>
          </div>
          <div class="date-row">
            <v-text-field
              :model-value="dateFrom"
              class="ui"
              type="date"
              variant="outlined"
              density="comfortable"
              hide-details
              @update:model-value="$emit('update:dateFrom', $event)"
            />
            <span class="sep">—</span>
            <v-text-field
              :model-value="dateTo"
              class="ui"
              type="date"
              variant="outlined"
              density="comfortable"
              hide-details
              @update:model-value="$emit('update:dateTo', $event)"
            />
          </div>
        </div>
      </v-col>
      <v-col cols="12" md="4">
        <v-select
          :model-value="filterDiscipline"
          class="ui"
          variant="outlined"
          density="comfortable"
          hide-details
          clearable
          label="Все дисциплины"
          :items="disciplines"
          @update:model-value="$emit('update:filterDiscipline', $event)"
        />
      </v-col>
      <v-col
        cols="12"
        md="4"
      >
        <v-select
          :model-value="filterGroup"
          class="ui"
          variant="outlined"
          density="comfortable"
          hide-details
          clearable
          label="Все группы"
          :items="groups"
          @update:model-value="$emit('update:filterGroup', $event)"
        />
      </v-col>
      <v-col
        v-if="canSeeAll"
        cols="12"
        md="4"
      >
        <v-select
          :model-value="filterTeacher"
          class="ui"
          variant="outlined"
          density="comfortable"
          hide-details
          clearable
          label="Все преподаватели"
          :items="teachers"
          @update:model-value="$emit('update:filterTeacher', $event)"
        />
      </v-col>
    </v-row>
    <div class="found">
      Найдено: <span class="found-val">{{ count }}</span>
    </div>
  </v-card>
</template>

<script setup lang="ts">
defineProps<{
  search: string;
  filterDiscipline: string;
  filterGroup: string;
  filterTeacher: string;
  dateFrom: string;
  dateTo: string;
  disciplines: string[];
  groups: string[];
  teachers: string[];
  canSeeAll: boolean;
  count: number;
}>();

defineEmits([
  'reset',
  'update:search',
  'update:filterDiscipline',
  'update:filterGroup',
  'update:filterTeacher',
  'update:dateFrom',
  'update:dateTo',
]);
</script>

<style scoped>
.card {
  background: #fff;
  border: 1px solid #e5e7eb;
  border-radius: 14px;
  box-shadow: 0 8px 20px rgba(17, 24, 39, 0.04);
}
.filters {
  padding: 18px 18px 12px;
  margin: 0 auto 18px;
}
.filters-top {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 12px;
}
.filters-left {
  display: flex;
  align-items: center;
  gap: 10px;
}
.filter-ico {
  color: #111827;
  opacity: 0.8;
}
.filters-caption {
  font-size: 13.5px;
  font-weight: 600;
  color: #111827;
}
.reset {
  text-transform: none;
  font-weight: 500;
  color: #6b7280;
}
.filters-grid {
  margin-top: 8px;
}
.found {
  padding: 10px 2px 0;
  font-size: 13px;
  color: #6b7280;
}
.found-val {
  font-weight: 700;
  color: #111827;
}
.date-wrap {
  display: flex;
  align-items: center;
  gap: 12px;
}
.date-label {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 13px;
  color: #374151;
}
.date-row {
  display: flex;
  align-items: center;
  gap: 10px;
}
.sep {
  color: #9ca3af;
}
.ui :deep(.v-field) {
  border-radius: 10px;
}
</style>
