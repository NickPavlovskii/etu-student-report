<template>
  <v-menu
    v-model="menuOpen"
    :close-on-content-click="closeOnContentClick"
    :disabled="disabled || loading"
    :location="menuLocationBind"
    :offset="6"
    scroll-strategy="reposition"
    :z-index="3000"
    :width="menuWidth"
  >
    <template #activator="{ props: menuActivatorProps }">
      <slot
        name="activator"
        :menu-props="menuActivatorProps"
        :open="menuOpen"
      >
        <div
          :class="[
            'etu-pss-trigger',
            {
              'etu-pss-trigger--open': menuOpen,
              'etu-pss-trigger--disabled': disabled || loading,
            },
          ]"
          v-bind="menuActivatorProps"
        >
          <v-icon
            class="etu-pss-trigger-icon"
            size="15"
            color="#9ca3af"
          >
            {{ prependIcon }}
          </v-icon>
          <div
            v-if="$slots.selection"
            class="etu-pss-trigger-custom"
          >
            <slot
              name="selection"
              :item="selectedItem"
              :label="displayLabel"
              :loading="loading"
            />
          </div>
          <span
            v-else
            :class="[
              'etu-pss-trigger-text',
              {
                'etu-pss-trigger-text--placeholder': !displayLabel,
              },
            ]"
          >
            {{ displayLabel }}
          </span>
          <v-icon
            v-if="showClear"
            class="etu-pss-clear"
            size="18"
            color="#9ca3af"
            @click.stop="clearSelection"
          >
            mdi-close-circle-outline
          </v-icon>
          <v-icon
            class="etu-pss-chevron"
            size="18"
            color="#9ca3af"
          >
            {{ menuOpen ? 'mdi-chevron-up' : 'mdi-chevron-down' }}
          </v-icon>
        </div>
      </slot>
    </template>

    <v-card
      class="etu-pss-card"
      elevation="0"
    >
      <div
        v-if="searchable"
        class="etu-pss-search-wrap"
      >
        <v-text-field
          v-model="searchQuery"
          density="compact"
          variant="plain"
          hide-details
          prepend-inner-icon="mdi-magnify"
          class="etu-pss-search"
          autocomplete="off"
          :placeholder="searchPlaceholder"
          @click.stop
          @keydown.stop
        />
      </div>

      <v-list   
        density="compact"
        :class="['etu-pss-list', { 'etu-pss-list--no-search': !searchable }]"
        :max-height="maxListHeight"
      >
        <v-list-item
          v-if="showNullOption && !multiple"
          :class="[
            'etu-pss-item',
            { 'etu-pss-item--selected': isNullOptionSelected },
          ]"
          rounded="lg"
          @click="selectNullOption"
        >
          <slot name="null-option">
            <v-list-item-title class="etu-pss-item-title">
              {{ placeholder }}
            </v-list-item-title>
          </slot>
        </v-list-item>

        <v-list-item
          v-for="item in filteredItems"
          :key="item.value"
          :class="[
            'etu-pss-item',
            {
              'etu-pss-item--selected': rowSelected(item.value),
              'etu-pss-item--multiple': multiple,
            },
          ]"
          rounded="lg"
          @click="onRowClick(item.value)"
        >
          <template
            v-if="multiple"
            #prepend
          >
            <v-icon
              size="20"
              :color="isItemChecked(item.value) ? 'rgb(30,55,153)' : '#9ca3af'"
            >
              {{
                isItemChecked(item.value)
                  ? 'mdi-checkbox-marked'
                  : 'mdi-checkbox-blank-outline'
              }}
            </v-icon>
          </template>
          <slot
            name="item"
            :item="item"
            :selected="isItemChecked(item.value)"
          >
            <v-list-item-title class="etu-pss-item-title">
              {{ item.title }}
            </v-list-item-title>
          </slot>
        </v-list-item>

        <v-list-item
          v-if="searchable && filteredItems.length === 0 && searchQuery.trim().length"
          :class="['etu-pss-item', 'etu-pss-item--empty']"
        >
          <v-list-item-title class="etu-pss-empty">
            {{ emptyText }}
          </v-list-item-title>
        </v-list-item>
      </v-list>

      <div
        v-if="$slots.footer"
        class="etu-pss-footer"
      >
        <slot name="footer" />
      </div>
    </v-card>
  </v-menu>
</template>

<script setup lang="ts">
  import { computed, ref, watch } from 'vue';

  const props = withDefaults(
    defineProps<{
      modelValue: string | null | string[];
      items: { title: string; value: string }[];
      placeholder?: string;
      searchable?: boolean;
      searchPlaceholder?: string;
      emptyText?: string;
      prependIcon?: string;
      clearable?: boolean;
      showNullOption?: boolean;
      clearValue?: string | null;
      loading?: boolean;
      loadingText?: string;
      disabled?: boolean;
      menuWidth?: number | string;
      maxListHeight?: number | string;
      multiple?: boolean;
      closeOnContentClick?: boolean;
      location?: string;
    }>(),
    {
      placeholder: 'Все',
      searchable: true,
      searchPlaceholder: 'Поиск...',
      emptyText: 'Ничего не найдено',
      prependIcon: 'mdi-account-outline',
      clearable: true,
      showNullOption: true,
      clearValue: null,
      loading: false,
      loadingText: 'Загрузка…',
      disabled: false,
      menuWidth: 360,
      maxListHeight: 320,
      multiple: false,
      closeOnContentClick: false,
      location: 'bottom',
    }
  );

  const emit = defineEmits<{
    'update:modelValue': [value: string | null | string[]];
  }>();

  const menuOpen = ref(false);
  const searchQuery = ref('');

  const menuLocationBind = computed(() => props.location as any);

  watch(menuOpen, (open) => {
    if (!open) {
      searchQuery.value = '';
    }
  });

  const selectedItem = computed(() => {
    if (props.multiple) {
      return null;
    }
    const v = props.modelValue;
    if (v === null || v === undefined || Array.isArray(v)) {
      return null;
    }
    return props.items.find((i) => i.value === v) ?? null;
  });

  const activeLabel = computed(() => selectedItem.value?.title ?? null);

  const displayLabel = computed(() => {
    if (props.loading) {
      return props.loadingText;
    }
    return activeLabel.value ?? props.placeholder;
  });

  const isNullOptionSelected = computed(() => {
    if (!props.showNullOption || props.multiple) {
      return false;
    }
    return props.modelValue === props.clearValue;
  });

  const showClear = computed(() => {
    if (!props.clearable || props.loading || props.disabled) {
      return false;
    }
    if (props.multiple) {
      return Array.isArray(props.modelValue) && props.modelValue.length > 0;
    }
    const v = props.modelValue;
    const cv = props.clearValue;
    if (v === null || v === undefined) {
      return false;
    }
    if (cv === null || cv === undefined) {
      return v !== '';
    }
    return v !== cv;
  });

  const filteredItems = computed(() => {
    if (!props.searchable) {
      return props.items;
    }
    const q = searchQuery.value.trim().toLowerCase();
    if (!q) {
      return props.items;
    }
    return props.items.filter((i) => i.title.toLowerCase().includes(q));
  });

  function isItemChecked(value: string): boolean {
    if (!props.multiple) {
      return props.modelValue === value;
    }
    const arr = props.modelValue;
    return Array.isArray(arr) && arr.includes(value);
  }

  function rowSelected(value: string): boolean {
    return isItemChecked(value);
  }

  function onRowClick(value: string) {
    if (props.multiple) {
      toggleMultiple(value);
    } else {
      selectValue(value);
    }
  }

  function toggleMultiple(value: string) {
    const cur = Array.isArray(props.modelValue) ? [...props.modelValue] : [];
    const i = cur.indexOf(value);
    if (i >= 0) {
      cur.splice(i, 1);
    } else {
      cur.push(value);
    }
    emit('update:modelValue', cur);
  }

  function selectValue(value: string | null) {
    emit('update:modelValue', value);
    menuOpen.value = false;
  }

  function selectNullOption() {
    emit('update:modelValue', props.clearValue);
    menuOpen.value = false;
  }

  function clearSelection() {
    if (props.multiple) {
      emit('update:modelValue', []);
    } else {
      emit('update:modelValue', props.clearValue);
    }
    menuOpen.value = false;
  }
</script>

<style scoped>
  .etu-pss-trigger {
    display: flex;
    align-items: center;
    gap: 6px;
    height: 38px;
    min-width: 220px;
    max-width: 455px;
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

  .etu-pss-trigger:hover:not(.etu-pss-trigger--disabled) {
    border-color: #93c5fd;
  }

  .etu-pss-trigger--disabled {
    opacity: 0.55;
    cursor: not-allowed;
    pointer-events: none;
  }

  .etu-pss-trigger--open,
  .etu-pss-trigger:focus-visible {
    border-color: #2563eb;
    background: #fff;
    box-shadow: 0 0 0 3px rgba(37, 99, 235, 0.18);
    outline: none;
  }

  .etu-pss-trigger-icon {
    flex-shrink: 0;
  }

  .etu-pss-trigger-custom {
    flex: 1;
    min-width: 0;
    display: flex;
    align-items: center;
    overflow: hidden;
  }

  .etu-pss-trigger-text {
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

  .etu-pss-trigger-text--placeholder {
    color: #9ca3af;
    font-weight: 400;
  }

  .etu-pss-clear {
    flex-shrink: 0;
    opacity: 0.85;
  }

  .etu-pss-clear:hover {
    opacity: 1;
  }

  .etu-pss-chevron {
    flex-shrink: 0;
  }

  .etu-pss-card {
    border-radius: 14px !important;
    border: 1px solid #bfdbfe;
    overflow: hidden;
    box-shadow:
      0 8px 24px rgba(15, 23, 42, 0.08),
      0 2px 8px rgba(15, 23, 42, 0.04);
    background: #fff !important;
  }

  .etu-pss-search-wrap {
    padding: 10px 12px 8px;
    border-bottom: 1px solid #e5e7eb;
    background: #fafafa;
  }

  .etu-pss-search :deep(.v-field) {
    background: #fff !important;
    border: 1px solid #e5e7eb !important;
    border-radius: 10px !important;
    box-shadow: none !important;
    min-height: 38px !important;
    padding-inline: 4px !important;
  }

  .etu-pss-search :deep(.v-field__outline) {
    display: none !important;
  }

  .etu-pss-search :deep(.v-field__input) {
    font-size: 13px;
    color: #111827;
    min-height: 36px !important;
    padding-top: 0 !important;
    padding-bottom: 0 !important;
  }

  .etu-pss-search :deep(.v-field__prepend-inner) {
    padding-inline-start: 8px !important;
  }

  .etu-pss-search :deep(.v-field__prepend-inner .v-icon) {
    color: #9ca3af !important;
    opacity: 1;
  }

  .etu-pss-search :deep(input::placeholder) {
    color: #9ca3af;
  }

  .etu-pss-list {
    padding: 6px 8px 10px !important;
    overflow-y: auto;
  }

  .etu-pss-list--no-search {
    padding-top: 10px !important;
  }

  .etu-pss-item {
    min-height: 44px !important;
    margin-bottom: 2px;
    border-radius: 10px !important;
    cursor: pointer;
  }

  .etu-pss-item:hover:not(.etu-pss-item--empty) {
    background: #f3f4f6 !important;
  }

  .etu-pss-item--selected {
    background: #dbeafe !important;
  }

  .etu-pss-item--selected .etu-pss-item-title {
    color: #1d4ed8 !important;
    font-weight: 700 !important;
  }

  .etu-pss-item--multiple.etu-pss-item--selected {
    background: rgba(30, 55, 153, 0.07) !important;
  }

  .etu-pss-item--multiple.etu-pss-item--selected .etu-pss-item-title {
    color: rgb(20, 40, 120) !important;
  }

  .etu-pss-item-title {
    font-size: 13px;
    line-height: 1.35;
    color: #1f2937;
    font-weight: 500;
    white-space: normal;
    word-break: break-word;
  }

  .etu-pss-item--empty {
    pointer-events: none;
    cursor: default;
  }

  .etu-pss-empty {
    font-size: 13px;
    color: #9ca3af !important;
    text-align: center;
    padding: 12px 8px;
  }

  .etu-pss-footer {
    display: flex;
    flex-wrap: wrap;
    gap: 6px;
    padding: 8px 10px;
    border-top: 1px solid #e5e7eb;
    background: #fafafa;
  }
</style>
