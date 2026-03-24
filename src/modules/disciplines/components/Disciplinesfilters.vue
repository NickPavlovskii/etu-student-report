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
        class="semester-pill"
        :model-value="semesterStrings"
        :items="semesterItems"
        multiple
        placeholder="Все семестры"
        prepend-icon="mdi-calendar-month-outline"
        search-placeholder="Поиск…"
        empty-text="Не найдено"
        location="bottom start"
        :clearable="true"
        :show-null-option="false"
        :close-on-content-click="false"
        :menu-width="300"
        :max-list-height="280"
        @update:model-value="onSemesterUpdate"
      >
        <template #footer>
          <div class="semester-pill-footer">
            <v-btn
              variant="text"
              size="small"
              class="semester-pill-footer__btn"
              @click="$emit('check-all', true)"
            >
              Выбрать все
            </v-btn>
            <v-btn
              variant="text"
              size="small"
              class="semester-pill-footer__btn"
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
    semester: (number | string)[];
    uniqueSemesters: (number | string)[];
  }>();

  const emit = defineEmits<{
    'update:search': [value: string];
    'update:semester': [value: (number | string)[]];
    'check-all': [value: boolean];
    'clear-all': [];
  }>();

  const semesterItems = computed(() =>
    (props.uniqueSemesters ?? []).map((s) => ({
      title: `Семестр ${s}`,
      value: String(s),
    }))
  );

  const semesterStrings = computed(() =>
    (props.semester ?? []).map((x) => String(x))
  );

  function onSemesterUpdate(v: string | null | string[]) {
    if (!Array.isArray(v)) {
      emit('update:semester', []);
      return;
    }
    emit(
      'update:semester',
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

  .semester-pill {
    flex: 0 1 280px;
    min-width: 220px;
  }

  .semester-pill :deep(.v-menu) {
    display: block;
    width: 100%;
  }

  .semester-pill :deep(.etu-pss-trigger) {
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

  .semester-pill-footer {
    display: flex;
    justify-content: space-between;
    gap: 8px;
    padding: 8px 10px;
    border-top: 1px solid #e5e7eb;
    background: #fafafa;
  }

  .semester-pill-footer__btn {
    text-transform: none;
    font-weight: 600;
    font-size: 12px;
    color: #2563eb;
  }
</style>
