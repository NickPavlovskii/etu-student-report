<template>
  <v-card
    class="filters-card"
    elevation="0"
  >
    <div class="filters-inner">
      <div class="filters-top">
        <v-icon
          size="18"
          class="filter-ico"
        >
          mdi-filter-variant
        </v-icon>
        <span class="filters-caption">Фильтры и поиск</span>
      </div>

      <div class="row-1">
        <v-text-field
          :model-value="search"
          class="search-field pill-input"
          variant="outlined"
          density="compact"
          hide-details
          clearable
          placeholder="Поиск по ФИО студента или теме"
          prepend-inner-icon="mdi-magnify"
          @update:model-value="$emit('update:search', $event)"
        />

        <div class="date-range">
          <v-icon
            size="17"
            class="date-range__icon"
          >
            mdi-calendar-range-outline
          </v-icon>
          <span class="date-range__label">Период:</span>
          <v-menu
            v-model="menuFrom"
            :close-on-content-click="false"
            location="bottom start"
            offset="4"
            transition="scale-transition"
          >
            <template #activator="{ props: mp }">
              <button
                v-bind="mp"
                type="button"
                :class="[
                  'date-btn',
                  {
                    'date-btn--active': menuFrom,
                    'date-btn--filled': dateFrom,
                  },
                ]"
              >
                <v-icon
                  size="15"
                  class="date-btn__ico"
                >
                  mdi-calendar-start-outline
                </v-icon>
                <span
                  :class="[
                    'date-btn__text',
                    { 'date-btn__text--placeholder': !dateFrom },
                  ]"
                >
                  {{ dateFrom ? formatDateRu(dateFrom) : 'ДД.ММ.ГГГГ' }}
                </span>
                <v-icon
                  v-if="dateFrom"
                  size="14"
                  class="date-btn__clear"
                  @click.stop="$emit('update:dateFrom', '')"
                >
                  mdi-close-circle
                </v-icon>
              </button>
            </template>
            <v-date-picker
              :model-value="dateFrom ? new Date(dateFrom) : undefined"
              class="date-picker-popup"
              color="primary"
              weekday-format="short"
              show-adjacent-months
              rounded="lg"
              :max="dateTo || undefined"
              :first-day-of-week="1"
              @update:model-value="onPickFrom"
            />
          </v-menu>
          <span class="date-range__sep">—</span>
          <v-menu
            v-model="menuTo"
            :close-on-content-click="false"
            location="bottom end"
            offset="4"
            transition="scale-transition"
          >
            <template #activator="{ props: mp }">
              <button
                v-bind="mp"
                type="button"
                :class="[
                  'date-btn',
                  { 'date-btn--active': menuTo, 'date-btn--filled': dateTo },
                ]"
              >
                <v-icon
                  size="15"
                  class="date-btn__ico"
                >
                  mdi-calendar-end-outline
                </v-icon>
                <span
                  :class="[
                    'date-btn__text',
                    { 'date-btn__text--placeholder': !dateTo },
                  ]"
                >
                  {{ dateTo ? formatDateRu(dateTo) : 'ДД.ММ.ГГГГ' }}
                </span>
                <v-icon
                  v-if="dateTo"
                  size="14"
                  class="date-btn__clear"
                  @click.stop="$emit('update:dateTo', '')"
                >
                  mdi-close-circle
                </v-icon>
              </button>
            </template>
            <v-date-picker
              :model-value="dateTo ? new Date(dateTo) : undefined"
              class="date-picker-popup"
              color="primary"
              rounded="lg"
              weekday-format="short"
              show-adjacent-months
              :min="dateFrom || undefined"
              :first-day-of-week="1"
              @update:model-value="onPickTo"
            />
          </v-menu>
        </div>
      </div>
      <div class="row-2">
        <etu-pill-search-select
          class="archive-filter-pill"
          :model-value="filterDiscipline"
          :items="disciplineItems"
          placeholder="Все дисциплины"
          prepend-icon="mdi-book-open-page-variant"
          search-placeholder="Поиск…"
          empty-text="Не найдено"
          location="bottom start"          :clearable="true"
          :show-null-option="false"
          :clear-value="''"
          :menu-width="280"
          :max-list-height="260"
          @update:model-value="$emit('update:filterDiscipline', $event ?? '')"
        />
        <etu-pill-search-select
          class="archive-filter-pill"
          :model-value="filterGroup"
          :items="groupItems"
          placeholder="Все группы"
          prepend-icon="mdi-account-group-outline"
          search-placeholder="Поиск…"
          empty-text="Не найдено"
          location="bottom start"
          :clearable="true"
          :show-null-option="false"
          :clear-value="''"
          :menu-width="260"
          :max-list-height="260"
          @update:model-value="$emit('update:filterGroup', $event ?? '')"
        />
        <etu-pill-search-select
          class="archive-filter-pill"
          :model-value="filterWorkType"
          :items="workTypeItems"
          placeholder="Все типы работ"
          prepend-icon="mdi-file-document-outline"
          search-placeholder="Поиск…"
          empty-text="Не найдено"
          location="bottom start"
          :clearable="true"
          :show-null-option="false"
          :clear-value="''"
          :menu-width="280"
          :max-list-height="260"
          @update:model-value="$emit('update:filterWorkType', $event ?? '')"
        />
        <etu-pill-search-select
          v-if="canSeeAll"
          class="archive-filter-pill"
          :model-value="filterTeacher"
          :items="teacherItems"
          placeholder="Все преподаватели"
          prepend-icon="mdi-account-outline"
          search-placeholder="Поиск…"
          empty-text="Не найдено"
          location="bottom start"
          :clearable="true"
          :show-null-option="false"
          :clear-value="''"
          :menu-width="280"
          :max-list-height="260"
          @update:model-value="$emit('update:filterTeacher', $event ?? '')"
        />
      </div>
      <div class="filters-footer">
        <span class="found">
          Найдено:
          <span class="found-val">{{ count }}</span>
        </span>
        <div class="footer-actions">
          <slot name="export" />
          <v-btn
            variant="text"
            class="reset-btn"
            @click="$emit('reset')"
          >
            Сбросить все
          </v-btn>
        </div>
      </div>
    </div>
  </v-card>
</template>

<script setup lang="ts">
  import { computed, ref } from 'vue';

  const props = defineProps<{
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

  const emit = defineEmits([
    'reset',
    'update:search',
    'update:filterDiscipline',
    'update:filterGroup',
    'update:filterWorkType',
    'update:filterTeacher',
    'update:dateFrom',
    'update:dateTo',
  ]);

  const menuFrom = ref(false);
  const menuTo = ref(false);

  function formatDateRu(iso: string): string {
    if (!iso) return '';
    const parts = iso.split('-');
    if (parts.length !== 3) return iso;
    const [y, m, d] = parts;
    return `${d}.${m}.${y}`;
  }

  function toISO(d: Date): string {
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, '0');
    const dd = String(d.getDate()).padStart(2, '0');
    return `${y}-${m}-${dd}`;
  }

  function onPickFrom(val: unknown) {
    if (val instanceof Date) {
      emit('update:dateFrom', toISO(val));
    }
    menuFrom.value = false;
  }

  function onPickTo(val: unknown) {
    if (val instanceof Date) {
      emit('update:dateTo', toISO(val));
    }
    menuTo.value = false;
  }

  function withAllRow(
    label: string,
    values: string[]
  ): { title: string; value: string }[] {
    return [
      { title: label, value: '' },
      ...values.map((v) => ({ title: v, value: v })),
    ];
  }

  const disciplineItems = computed(() =>
    withAllRow('Все дисциплины', props.disciplines)
  );
  const groupItems = computed(() => withAllRow('Все группы', props.groups));
  const workTypeItems = computed(() =>
    withAllRow('Все типы работ', props.workTypes)
  );
  const teacherItems = computed(() =>
    withAllRow('Все преподаватели', props.teachers)
  );
</script>

<style scoped>
  .filters-card {
    background: #fff;
    border: 1px solid #e5e7eb;
    border-radius: 16px;
    box-shadow: 0 1px 4px rgba(0, 0, 0, 0.05);
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


  .row-1 {
    display: flex;
    align-items: center;
    gap: 10px;
    width: 100%;
  }

  .search-field {
    flex: 1 1 0;
    min-width: 0;
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

  .pill-input :deep(.v-field--focused .v-field__outline) {
    --v-field-border-width: 1.5px;
  }

  .pill-input :deep(.v-field--focused) {
    border-color: #2563eb !important;
    background: #fff !important;
    box-shadow: 0 0 0 3px rgba(37, 99, 235, 0.15) !important;
  }

  .pill-input :deep(.v-field__prepend-inner .v-icon) {
    color: #9ca3af !important;
    opacity: 1;
  }

  .date-range {
    display: flex;
    align-items: center;
    gap: 8px;
    flex: 0 0 auto;
  }

  .date-range__icon {
    color: #6b7280 !important;
    flex-shrink: 0;
  }

  .date-range__label {
    font-size: 13px;
    color: #374151;
    white-space: nowrap;
    font-weight: 500;
  }

  .date-range__sep {
    color: #c4c9d1;
    font-weight: 600;
    flex-shrink: 0;
    user-select: none;
  }

  .date-btn {
    display: inline-flex;
    align-items: center;
    gap: 6px;
    height: 36px;
    padding: 0 12px;
    border-radius: 10px;
    border: 1.5px solid #e0e4ea;
    background: #f9fafb;
    color: #9ca3af;
    font-size: 13px;
    font-weight: 500;
    font-family: inherit;
    cursor: pointer;
    white-space: nowrap;
    outline: none;
    appearance: none;
    transition:
      border-color 0.15s,
      background 0.15s,
      box-shadow 0.15s,
      color 0.15s;
  }

  .date-btn:hover {
    background: #f0f4fa;
    border-color: #bfcfe0;
  }

  .date-btn--active {
    border-color: #2563eb !important;
    background: #fff !important;
    box-shadow: 0 0 0 3px rgba(37, 99, 235, 0.12);
    color: #2563eb;
  }

  .date-btn--filled {
    color: #111827;
    background: #fff;
    border-color: #bfdbfe;
  }

  .date-btn__ico {
    color: inherit !important;
    opacity: 0.7;
  }

  .date-btn__text {
    line-height: 1;
  }

  .date-btn__text--placeholder {
    color: #9ca3af;
    font-weight: 400;
  }

  .date-btn__clear {
    color: #9ca3af !important;
    margin-left: 2px;
    cursor: pointer;
    transition: color 0.15s;
  }

  .date-btn__clear:hover {
    color: #ef4444 !important;
  }

  .date-picker-popup {
    border-radius: 16px !important;
    overflow: hidden;
    border: 1px solid #e5e7eb !important;
    box-shadow:
      0 12px 40px rgba(15, 23, 42, 0.12),
      0 4px 12px rgba(15, 23, 42, 0.06) !important;
  }

  .date-picker-popup :deep(.v-date-picker-header) {
    padding: 14px 16px !important;
    background: linear-gradient(180deg, #f8fafc 0%, #f1f5f9 100%) !important;
    color: #0f172a !important;
  }

  .date-picker-popup :deep(.v-date-picker-header__content) {
    color: #0f172a !important;
    opacity: 1 !important;
  }

  .date-picker-popup :deep(.v-date-picker-header.text-high-emphasis),
  .date-picker-popup :deep(.v-date-picker-header .text-high-emphasis) {
    color: #0f172a !important;
  }

  .date-picker-popup :deep(.v-date-picker-month__day) {
    font-weight: 500;
  }

  .date-picker-popup :deep(.v-btn--icon) {
    border-radius: 10px !important;
  }

  .row-2 {
    display: flex;
    flex-wrap: wrap;
    gap: 10px;
    width: 100%;
    align-items: stretch;
  }

  .archive-filter-pill {
    flex: 1 1 0;
    min-width: 0;
  }

  .archive-filter-pill :deep(.v-menu) {
    display: block;
    width: 100%;
  }

  .archive-filter-pill :deep(.etu-pss-trigger) {
    width: 100%;
    min-width: 0;
    max-width: none;
  }

  .filters-footer {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding-top: 4px;
    flex-wrap: wrap;
    gap: 8px;
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
    flex-wrap: wrap;
  }

  .reset-btn {
    text-transform: none;
    font-weight: 500;
    color: #6b7280;
  }

  @media (max-width: 1100px) {
    .row-1 {
      flex-wrap: wrap;
    }

    .search-field {
      flex: 1 1 100%;
    }

    .date-range {
      width: 100%;
    }
  }

  @media (max-width: 600px) {
    .filters-card {
      padding: 14px 16px;
    }

    .row-2 {
      flex-direction: column;
    }

    .archive-filter-pill {
      flex: 1 1 auto;
      width: 100%;
      min-width: 0;
    }

    .date-range {
      flex-wrap: wrap;
    }

    .date-range__label {
      width: 100%;
    }

    .date-btn {
      flex: 1 1 0;
      justify-content: center;
    }
  }
</style>
