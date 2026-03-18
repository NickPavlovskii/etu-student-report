<template>
  <div class="templates-tab">
    <div class="section-row">
      <div class="section-title-wrap">
        <h2 class="section-title">Доступные шаблоны</h2>
        <span v-if="templates.length" class="section-count">{{ templates.length }}</span>
      </div>
      <v-btn
        v-if="!hideAddButton"
        class="add-btn"
        prepend-icon="mdi-plus"
        @click="$emit('add')"
      >
        Добавить шаблон
      </v-btn>
    </div>

    <div
      v-if="loading"
      class="loading-state"
    >
      <v-progress-circular
        indeterminate
        color="primary"
        size="48"
      />
      <span>Загрузка шаблонов...</span>
    </div>

    <div
      v-else-if="error"
      class="error-state"
    >
      <v-icon color="error" size="40">mdi-alert-circle-outline</v-icon>
      <p>{{ error }}</p>
      <v-btn
        variant="tonal"
        color="primary"
        prepend-icon="mdi-refresh"
        @click="$emit('retry')"
      >
        Повторить
      </v-btn>
    </div>

    <v-row
      v-else
      dense
    >
      <v-col
        v-for="t in templates"
        :key="t.id"
        cols="12"
        md="6"
        lg="4"
      >
        <template-card
          :template="t"
          :can-edit="canEdit"
          @edit="$emit('edit', t)"
          @delete="$emit('delete', t)"
        />
      </v-col>
      <v-col
        v-if="!loading && !error && templates.length === 0"
        cols="12"
        class="empty-state"
      >
        <v-icon size="48" color="grey">mdi-file-document-outline</v-icon>
        <p>Нет шаблонов. Нажмите «Добавить шаблон», чтобы создать.</p>
      </v-col>
    </v-row>
  </div>
</template>

<script setup lang="ts">
import TemplateCard from './TemplateCard.vue';
import type { TemplateItem } from '../types';

withDefaults(
  defineProps<{
    templates: TemplateItem[];
    loading?: boolean;
    error?: string | null;
    canEdit?: boolean;
    hideAddButton?: boolean;
  }>(),
  { canEdit: false, hideAddButton: false, loading: false, error: null }
);

defineEmits<{
  add: [];
  edit: [template: TemplateItem];
  delete: [template: TemplateItem];
  retry: [];
}>();
</script>

<style scoped>
.templates-tab {
  padding: 0 0 24px;
}

.section-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
  margin-bottom: 16px;
  flex-wrap: wrap;
}

.section-title-wrap {
  display: flex;
  align-items: center;
  gap: 10px;
}

.section-title {
  margin: 0;
  font-size: 18px;
  font-weight: 700;
  color: #0f172a;
  letter-spacing: -0.02em;
}

.section-count {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-width: 24px;
  height: 22px;
  padding: 0 7px;
  border-radius: 11px;
  background: rgba(30, 55, 153, 0.1);
  color: rgb(30, 55, 153);
  font-size: 12px;
  font-weight: 700;
}

.add-btn {
  background: #20262e !important;
  color: #ffffff !important;
}

.loading-state,
.error-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 16px;
  padding: 48px 24px;
  color: #6b7280;
}

.error-state p {
  margin: 0;
  text-align: center;
}

.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 12px;
  padding: 48px 24px;
  color: #9ca3af;
  text-align: center;
}
</style>
