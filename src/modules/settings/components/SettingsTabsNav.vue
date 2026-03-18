<template>
  <div class="nav-row">
    <div class="tab-buttons">
      <button
        type="button"
        class="tab-btn"
        :class="{ active: modelValue === 'templates' }"
        @click="$emit('update:modelValue', 'templates')"
      >
        <v-icon size="18">mdi-file-document-outline</v-icon>
        Доступные шаблоны
      </button>
      <button
        type="button"
        class="tab-btn"
        :class="{ active: modelValue === 'control-types' }"
        @click="$emit('update:modelValue', 'control-types')"
      >
        <v-icon size="18">mdi-format-list-checks</v-icon>
        Виды контроля
      </button>
    </div>
    <v-btn
      v-show="modelValue === 'templates'"
      class="add-template-btn"
      prepend-icon="mdi-plus"
      @click="$emit('add')"
    >
      Добавить шаблон
    </v-btn>
  </div>
</template>

<script setup lang="ts">
defineProps<{
  modelValue: string;
}>();

defineEmits<{
  'update:modelValue': [value: string];
  add: [];
}>();
</script>

<style scoped>
.tab-buttons {
  display: flex;
  gap: 0;
}

.tab-btn {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 10px 20px;
  border: none;
  background: #e5e7eb;
  color: #6b7280;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
  border-radius: 999px;
}

.tab-btn:first-child {
  margin-right: 8px;
}

.tab-btn:hover:not(.active) {
  background: #d1d5db;
  color: #374151;
}

.tab-btn.active {
  background: #20262e;
  color: #ffffff;
}

.tab-btn.active .v-icon {
  color: #ffffff !important;
}

.nav-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  flex-wrap: wrap;
  gap: 16px;
  margin-bottom: 24px;
}

.add-template-btn {
  background: #20262e !important;
  color: #ffffff !important;
  border-radius: 10px !important;
  text-transform: none;
}

.add-template-btn .v-icon {
  color: #ffffff !important;
}
</style>
