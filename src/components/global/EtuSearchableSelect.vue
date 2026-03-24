<template>
  <div
    :class="['etu-searchable-select', `etu-searchable-select--${variant}`]"
  >
    <template v-if="variant === 'toolbar'">
      <v-menu
        v-model="menuOpen"
        scroll-strategy="reposition"
        location="bottom"
        :close-on-content-click="false"
        :disabled="disabled || loading"
        :offset="6"
        :z-index="3000"
        :width="menuWidth"
      >
        <template #activator="{ props: menuActivatorProps }">
          <div
            :class="['filter-wrap', { 'filter-wrap--open': menuOpen }]"
            v-bind="menuActivatorProps"
          >
            <v-icon
              class="filter-icon"
              size="15"
              color="#9ca3af"
            >
              {{ prependIcon }}
            </v-icon>
            <span
              :class="[
                'filter-trigger-text',
                { 'filter-trigger-text--placeholder': isPlaceholder },
              ]"
            >
              {{ displayLabel }}
            </span>
            <v-icon
              v-if="showClear"
              class="filter-clear"
              size="18"
              color="#9ca3af"
              @click.stop="clearSelection"
            >
              mdi-close-circle-outline
            </v-icon>
            <v-icon
              class="filter-chevron"
              size="18"
              color="#9ca3af"
            >
              {{ menuOpen ? 'mdi-chevron-up' : 'mdi-chevron-down' }}
            </v-icon>
          </div>
        </template>

        <v-card
          class="teacher-menu-card"
          elevation="0"
        >
          <div class="teacher-menu-search-wrap">
            <v-text-field
              v-model="searchQuery"
              density="compact"
              variant="plain"
              hide-details
              prepend-inner-icon="mdi-magnify"
              class="teacher-menu-search"
              autocomplete="off"
              :placeholder="searchPlaceholder"
              @click.stop
              @keydown.stop
            />
          </div>

          <v-list
            class="teacher-menu-list"
            density="compact"
            :max-height="maxListHeight"
          >
            <v-list-item
              v-if="showNullRow"
              :class="[
                'teacher-menu-item',
                { 'teacher-menu-item--selected': modelValue === null },
              ]"
              rounded="lg"
              @click="selectValue(null)"
            >
              <v-list-item-title class="teacher-menu-item-title">
                {{ nullOptionLabel }}
              </v-list-item-title>
            </v-list-item>

            <v-list-item
              v-for="item in filteredItems"
              :key="String(item.value)"
              :class="[
                'teacher-menu-item',
                { 'teacher-menu-item--selected': isSelected(item.value) },
              ]"
              rounded="lg"
              @click="selectValue(item.value)"
            >
              <v-list-item-title class="teacher-menu-item-title">
                {{ item.title }}
              </v-list-item-title>
            </v-list-item>

            <v-list-item
              v-if="showEmptyHint"
              class="teacher-menu-item teacher-menu-item--empty"
            >
              <v-list-item-title class="teacher-menu-empty">
                {{ emptyText }}
              </v-list-item-title>
            </v-list-item>
          </v-list>
        </v-card>
      </v-menu>
    </template>

    <template v-else>
      <v-menu
        v-model="menuOpen"
        scroll-strategy="reposition"
        :close-on-content-click="false"
        :disabled="disabled || loading"
        :location="settingsMenuLocation"
        :offset="6"
        :z-index="3000"
        :width="menuWidth"
      >
        <template #activator="{ props: menuActivatorProps }">
          <div
            :class="[
              'etu-ss__trigger',
              {
                'etu-ss__trigger--open': menuOpen,
                'etu-ss__trigger--disabled': disabled || loading,
              },
            ]"
            v-bind="menuActivatorProps"
          >
            <v-icon
              class="etu-ss__trigger-icon"
              size="15"
              :color="triggerIconColor"
            >
              {{ prependIcon }}
            </v-icon>
            <span
              :class="[
                'etu-ss__trigger-text',
                { 'etu-ss__trigger-text--placeholder': isPlaceholder },
              ]"
            >
              {{ displayLabel }}
            </span>
            <v-icon
              v-if="showClear"
              class="etu-ss__clear"
              size="18"
              color="#9ca3af"
              @click.stop="clearSelection"
            >
              mdi-close-circle-outline
            </v-icon>
            <v-icon
              class="etu-ss__chevron"
              size="18"
              :color="chevronColor"
            >
              {{ menuOpen ? 'mdi-chevron-up' : 'mdi-chevron-down' }}
            </v-icon>
          </div>
        </template>

        <v-card
          class="etu-ss__card"
          elevation="0"
        >
          <div class="etu-ss__search-wrap">
            <v-text-field
              v-model="searchQuery"
              density="compact"
              variant="plain"
              hide-details
              prepend-inner-icon="mdi-magnify"
              class="etu-ss__search"
              autocomplete="off"
              :placeholder="searchPlaceholder"
              @click.stop
              @keydown.stop
            />
          </div>

          <v-list
            class="etu-ss__list"
            density="compact"
            :max-height="maxListHeight"
          >
            <v-list-item
              v-if="showNullRow"
              :class="[
                'etu-ss__item',
                { 'etu-ss__item--selected': modelValue === null },
              ]"
              rounded="lg"
              @click="selectValue(null)"
            >
              <v-list-item-title class="etu-ss__item-title">
                {{ nullOptionLabel }}
              </v-list-item-title>
            </v-list-item>

            <v-list-item
              v-for="item in filteredItems"
              :key="String(item.value)"
              :class="[
                'etu-ss__item',
                { 'etu-ss__item--selected': isSelected(item.value) },
              ]"
              rounded="lg"
              @click="selectValue(item.value)"
            >
              <v-list-item-title class="etu-ss__item-title">
                {{ item.title }}
              </v-list-item-title>
            </v-list-item>

            <v-list-item
              v-if="showEmptyHint"
              :class="['etu-ss__item', 'etu-ss__item--empty']"
            >
              <v-list-item-title class="etu-ss__empty">
                {{ emptyText }}
              </v-list-item-title>
            </v-list-item>
          </v-list>
        </v-card>
      </v-menu>
    </template>
  </div>
</template>

<script setup lang="ts">
  import { computed, ref, watch } from 'vue';

  type Item = { title: string; value: string | number };

  const props = withDefaults(
    defineProps<{
      modelValue: string | number | null;
      items: Item[];
      placeholder?: string;
      nullOptionLabel?: string | null;
      clearable?: boolean;
      disabled?: boolean;
      loading?: boolean;
      loadingText?: string;
      prependIcon?: string;
      searchPlaceholder?: string;
      emptyText?: string;
      menuWidth?: number | string;
      maxListHeight?: number | string;
      menuLocation?: string;
      variant?: 'toolbar' | 'settings';
    }>(),
    {
      placeholder: '',
      nullOptionLabel: null,
      clearable: true,
      loading: false,
      loadingText: 'Загрузка…',
      prependIcon: 'mdi-book-open-variant',
      searchPlaceholder: 'Поиск...',
      emptyText: 'Ничего не найдено',
      menuWidth: 360,
      maxListHeight: 320,
      menuLocation: 'bottom start',
      variant: 'toolbar',
    }
  );

  const emit = defineEmits<{
    'update:modelValue': [value: string | number | null];
  }>();

  const menuOpen = ref(false);
  const searchQuery = ref('');

  const settingsMenuLocation = computed(() => props.menuLocation as any);

  watch(menuOpen, (open) => {
    if (!open) {
      searchQuery.value = '';
    }
  });

  const triggerIconColor = computed(() =>
    props.variant === 'settings' ? '#1e379b' : '#9ca3af'
  );

  const chevronColor = computed(() =>
    props.variant === 'settings' ? '#94a3b8' : '#9ca3af'
  );

  const displayLabel = computed(() => {
    if (props.loading) {
      return props.loadingText;
    }
    if (props.modelValue === null || props.modelValue === '') {
      return props.placeholder;
    }
    const found = props.items.find((i) => i.value === props.modelValue);
    return found?.title ?? props.placeholder;
  });

  const isPlaceholder = computed(() => {
    if (props.loading) {
      return false;
    }
    if (props.modelValue === null || props.modelValue === '') {
      return true;
    }
    return !props.items.some((i) => i.value === props.modelValue);
  });

  const showClear = computed(() => {
    if (!props.clearable || props.loading) {
      return false;
    }
    if (props.nullOptionLabel) {
      return props.modelValue !== null;
    }
    return props.modelValue !== null && props.modelValue !== '';
  });

  const filteredItems = computed(() => {
    const q = searchQuery.value.trim().toLowerCase();
    if (!q) {
      return props.items;
    }
    return props.items.filter((i) => i.title.toLowerCase().includes(q));
  });

  const showNullRow = computed(() => {
    if (!props.nullOptionLabel) {
      return false;
    }
    const q = searchQuery.value.trim().toLowerCase();
    if (!q) {
      return true;
    }
    return props.nullOptionLabel.toLowerCase().includes(q);
  });

  const showEmptyHint = computed(() => {
    const q = searchQuery.value.trim();
    if (!q.length) {
      return false;
    }
    const hasRows =
      filteredItems.value.length > 0 ||
      (showNullRow.value && props.nullOptionLabel);
    return !hasRows;
  });

  function isSelected(value: string | number) {
    return props.modelValue === value;
  }

  function selectValue(value: string | number | null) {
    emit('update:modelValue', value);
    menuOpen.value = false;
  }

  function clearSelection() {
    emit('update:modelValue', null);
    menuOpen.value = false;
  }
</script>

<style scoped>
  .etu-searchable-select--toolbar .filter-wrap {
    display: flex;
    align-items: center;
    gap: 6px;
    height: 38px;
    min-width: 220px;
    max-width: 360px;
    width: 100%;
    background: #eff6ff;
    border: 1.5px solid #bfdbfe;
    border-radius: 12px;
    padding: 0 8px 0 12px;
    overflow: visible;
    cursor: pointer;
    transition:
      border-color 0.18s,
      box-shadow 0.18s,
      background 0.18s;
  }

  .etu-searchable-select--toolbar .filter-wrap:hover {
    border-color: #93c5fd;
  }

  .etu-searchable-select--toolbar .filter-wrap--open,
  .etu-searchable-select--toolbar .filter-wrap:focus-visible {
    border-color: #2563eb;
    background: #fff;
    box-shadow: 0 0 0 3px rgba(37, 99, 235, 0.18);
    outline: none;
  }

  .etu-searchable-select--toolbar .filter-icon {
    flex-shrink: 0;
  }

  .etu-searchable-select--toolbar .filter-trigger-text {
    flex: 1;
    min-width: 0;
    font-size: 13px;
    line-height: 1.3;
    color: #111827;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
    text-align: left;
  }

  .etu-searchable-select--toolbar .filter-trigger-text--placeholder {
    color: #9ca3af;
    font-weight: 400;
  }

  .etu-searchable-select--toolbar .filter-clear {
    flex-shrink: 0;
    opacity: 0.85;
  }

  .etu-searchable-select--toolbar .filter-clear:hover {
    opacity: 1;
  }

  .etu-searchable-select--toolbar .filter-chevron {
    flex-shrink: 0;
  }

  .etu-searchable-select--toolbar .teacher-menu-card {
    border-radius: 14px !important;
    border: 1px solid #bfdbfe;
    overflow: hidden;
    box-shadow:
      0 8px 24px rgba(15, 23, 42, 0.08),
      0 2px 8px rgba(15, 23, 42, 0.04);
    background: #fff !important;
  }

  .etu-searchable-select--toolbar .teacher-menu-search-wrap {
    padding: 10px 12px 8px;
    border-bottom: 1px solid #e5e7eb;
    background: #fafafa;
  }

  .etu-searchable-select--toolbar .teacher-menu-search :deep(.v-field) {
    background: #fff !important;
    border: 1px solid #e5e7eb !important;
    border-radius: 10px !important;
    box-shadow: none !important;
    min-height: 38px !important;
    padding-inline: 4px !important;
  }

  .etu-searchable-select--toolbar .teacher-menu-search :deep(.v-field__outline) {
    display: none !important;
  }

  .etu-searchable-select--toolbar .teacher-menu-search :deep(.v-field__input) {
    font-size: 13px;
    color: #111827;
    min-height: 36px !important;
    padding-top: 0 !important;
    padding-bottom: 0 !important;
  }

  .etu-searchable-select--toolbar .teacher-menu-search :deep(.v-field__prepend-inner) {
    padding-inline-start: 8px !important;
  }

  .etu-searchable-select--toolbar
    .teacher-menu-search
    :deep(.v-field__prepend-inner .v-icon) {
    color: #9ca3af !important;
    opacity: 1;
  }

  .etu-searchable-select--toolbar .teacher-menu-search :deep(input::placeholder) {
    color: #9ca3af;
  }

  .etu-searchable-select--toolbar .teacher-menu-list {
    padding: 6px 8px 10px !important;
    overflow-y: auto;
  }

  .etu-searchable-select--toolbar .teacher-menu-item {
    min-height: 44px !important;
    margin-bottom: 2px;
    border-radius: 10px !important;
    cursor: pointer;
  }

  .etu-searchable-select--toolbar
    .teacher-menu-item:hover:not(.teacher-menu-item--empty) {
    background: #f3f4f6 !important;
  }

  .etu-searchable-select--toolbar .teacher-menu-item--selected {
    background: #dbeafe !important;
  }

  .etu-searchable-select--toolbar
    .teacher-menu-item--selected
    .teacher-menu-item-title {
    color: #1d4ed8 !important;
    font-weight: 700 !important;
  }

  .etu-searchable-select--toolbar .teacher-menu-item-title {
    font-size: 13px;
    line-height: 1.35;
    color: #1f2937;
    font-weight: 500;
    white-space: normal;
    word-break: break-word;
  }

  .etu-searchable-select--toolbar .teacher-menu-item--empty {
    pointer-events: none;
    cursor: default;
  }

  .etu-searchable-select--toolbar .teacher-menu-empty {
    font-size: 13px;
    color: #9ca3af !important;
    text-align: center;
    padding: 12px 8px;
  }

  .etu-searchable-select--settings .etu-ss__trigger {
    display: flex;
    align-items: center;
    gap: 10px;
    height: 46px;
    max-width: 440px;
    width: 100%;
    padding: 0 14px;
    border-radius: 13px;
    border: 1.5px solid #e2e8f0;
    background: #f8f9fb;
    cursor: pointer;
    user-select: none;
    transition:
      border-color 0.18s,
      box-shadow 0.18s,
      background 0.18s;
  }

  .etu-searchable-select--settings .etu-ss__trigger:hover:not(.etu-ss__trigger--disabled) {
    border-color: #c7d2e2;
    background: #fff;
  }

  .etu-searchable-select--settings .etu-ss__trigger--open {
    border-color: rgb(30, 55, 153);
    background: #fff;
    box-shadow: 0 0 0 3px rgba(30, 55, 153, 0.1);
  }

  .etu-searchable-select--settings .etu-ss__trigger--disabled {
    opacity: 0.6;
    cursor: default;
    pointer-events: none;
  }

  .etu-searchable-select--settings .etu-ss__trigger-icon {
    flex-shrink: 0;
    opacity: 0.75;
  }

  .etu-searchable-select--settings .etu-ss__trigger-text {
    flex: 1;
    min-width: 0;
    font-size: 14px;
    font-weight: 500;
    color: #0f172a;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
    text-align: left;
  }

  .etu-searchable-select--settings .etu-ss__trigger-text--placeholder {
    color: #94a3b8;
    font-weight: 400;
  }

  .etu-searchable-select--settings .etu-ss__card {
    border-radius: 16px !important;
    border: 1.5px solid #e8eaf0;
    overflow: hidden;
    box-shadow:
      0 10px 36px rgba(0, 0, 0, 0.12),
      0 2px 8px rgba(0, 0, 0, 0.06);
    background: #fff !important;
    min-width: 320px;
    max-width: 480px;
  }

  .etu-searchable-select--settings .etu-ss__search-wrap {
    padding: 10px 12px 8px;
    border-bottom: 1px solid #f1f3f8;
    background: #fff;
  }

  .etu-searchable-select--settings .etu-ss__search :deep(.v-field) {
    background: #f8fafc !important;
    border: 1px solid #e2e8f0 !important;
    border-radius: 10px !important;
    box-shadow: none !important;
    min-height: 38px !important;
  }

  .etu-searchable-select--settings .etu-ss__search :deep(.v-field__outline) {
    display: none !important;
  }

  .etu-searchable-select--settings .etu-ss__search :deep(.v-field__input) {
    font-size: 13px;
    color: #1e293b;
    min-height: 36px !important;
  }

  .etu-searchable-select--settings .etu-ss__search :deep(.v-field__prepend-inner .v-icon) {
    color: #94a3b8 !important;
  }

  .etu-searchable-select--settings .etu-ss__list {
    padding: 6px !important;
    overflow-y: auto;
  }

  .etu-searchable-select--settings .etu-ss__item {
    min-height: auto !important;
    margin-bottom: 2px;
    border-radius: 9px !important;
    cursor: pointer;
  }

  .etu-searchable-select--settings .etu-ss__item:hover:not(.etu-ss__item--empty) {
    background: rgba(30, 55, 153, 0.04) !important;
  }

  .etu-searchable-select--settings .etu-ss__item--selected {
    background: rgba(30, 55, 153, 0.07) !important;
  }

  .etu-searchable-select--settings .etu-ss__item--selected .etu-ss__item-title {
    color: rgb(20, 40, 120);
    font-weight: 600;
  }

  .etu-searchable-select--settings .etu-ss__item-title {
    font-size: 13.5px;
    color: #0f172a;
    font-weight: 500;
    white-space: normal;
    word-break: break-word;
    line-height: 1.35;
  }

  .etu-searchable-select--settings .etu-ss__empty {
    padding: 12px 10px;
    font-size: 13px;
    color: #94a3b8 !important;
    text-align: center;
  }

  .etu-searchable-select--settings .etu-ss__clear,
  .etu-searchable-select--settings .etu-ss__chevron {
    flex-shrink: 0;
  }

  .etu-ss__item--empty {
    pointer-events: none;
    cursor: default;
  }
</style>
