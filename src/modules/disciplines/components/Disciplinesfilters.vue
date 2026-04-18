<template>
  <v-card
    class="filters"
    elevation="0"
  >
    <div class="filters-row">
      <v-text-field
        :model-value="search"
        class="disciplines-search pill-input"
        variant="outlined"
        density="compact"
        hide-details
        clearable
        placeholder="Поиск по названию дисциплины…"
        prepend-inner-icon="mdi-magnify"
        @update:model-value="$emit('update:search', $event)"
      />

      <etu-pill-search-select
        class="course-pill"
        :model-value="courseStrings"
        multiple
        placeholder="Все курсы"
        prepend-icon="mdi-school-outline"
        search-placeholder="Поиск…"
        empty-text="Не найдено"
        location="bottom start"
        :items="courseItems"
        :clearable="true"
        :show-null-option="false"
        :close-on-content-click="false"
        :menu-width="300"
        :max-list-height="280"
        @update:model-value="onCourseUpdate"
      >
        <template #footer>
          <div class="course-pill-footer">
            <v-btn
              variant="text"
              size="small"
              class="course-pill-footer__btn"
              @click="$emit('check-all', true)"
            >
              Выбрать все
            </v-btn>
            <v-btn
              variant="text"
              size="small"
              class="course-pill-footer__btn"
              @click="$emit('clear-all')"
            >
              Сбросить
            </v-btn>
          </div>
        </template>
      </etu-pill-search-select>
    </div>
  </v-card>
</template>

<script setup lang="ts">
  import { computed } from 'vue';

  const props = defineProps<{
    search: string;
    course: (number | string)[];
    uniqueCourses: (number | string)[];
  }>();

  const emit = defineEmits<{
    'update:search': [value: string];
    'update:course': [value: (number | string)[]];
    'check-all': [value: boolean];
    'clear-all': [];
  }>();

  const courseItems = computed(() =>
    (props.uniqueCourses ?? []).map((c) => ({
      title: `Курс ${c}`,
      value: String(c),
    }))
  );

  const courseStrings = computed(() =>
    (props.course ?? []).map((x) => String(x))
  );

  function onCourseUpdate(v: string | null | string[]) {
    if (!Array.isArray(v)) {
      emit('update:course', []);
      return;
    }
    emit(
      'update:course',
      v.map((s) => {
        const n = Number(s);
        return Number.isFinite(n) ? n : s;
      })
    );
  }
</script>

<style scoped>
  .filters {
    padding: 18px 22px 20px;
    margin: 0 0 20px;
    border-radius: 16px;
    background: #fff;
    box-shadow:
      0 1px 3px rgba(0, 0, 0, 0.05),
      0 1px 2px rgba(0, 0, 0, 0.04);
    border: 1px solid #e5e7eb;
  }

  .filters-row {
    display: flex;
    align-items: stretch;
    gap: 12px;
    flex-wrap: wrap;
  }

  .disciplines-search {
    flex: 1 1 260px;
    min-width: 0;
  }

  .course-pill {
    flex: 0 1 280px;
    min-width: 220px;
  }

  .course-pill :deep(.v-menu) {
    display: block;
    width: 100%;
  }

  .course-pill :deep(.etu-pss-trigger) {
    width: 100%;
    min-width: 0;
    max-width: none;
  }

  .pill-input :deep(.v-field__outline) {
    display: none !important;
  }

  .pill-input :deep(.v-field) {
    border-radius: 12px !important;
    border: 1.5px solid #bfdbfe !important;
    background: #eff6ff !important;
    box-shadow: none !important;
    transition:
      border-color 0.18s,
      box-shadow 0.18s,
      background 0.18s;
  }

  .pill-input :deep(.v-field__input) {
    min-height: 38px;
    font-size: 13px;
    color: #111827;
  }

  .pill-input :deep(.v-field--focused) {
    border-color: #2563eb !important;
    background: #fff !important;
    box-shadow: 0 0 0 3px rgba(37, 99, 235, 0.15) !important;
  }

  .pill-input :deep(.v-field__prepend-inner .v-icon) {
    color: #9ca3af !important;
  }

  .course-pill-footer {
    display: flex;
    justify-content: space-between;
    gap: 8px;
    padding: 8px 10px;
    border-top: 1px solid #e5e7eb;
    background: #fafafa;
  }

  .course-pill-footer__btn {
    text-transform: none;
    font-weight: 600;
    font-size: 12px;
    color: #2563eb;
  }
</style>
