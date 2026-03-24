<template>
  <v-card
    class="template-card"
    elevation="0"
  >
    <div class="card-top">
      <div class="card-header-left">
        <v-icon
          class="doc-icon"
          size="28"
        >
          mdi-file-document-outline
        </v-icon>
        <h3 class="card-title">{{ template.name }}</h3>
      </div>
      <div class="card-actions">
        <button
          type="button"
          class="action-icon-btn"
          title="Редактировать"
          @click="$emit('edit')"
        >
          <v-icon size="18">mdi-pencil-outline</v-icon>
        </button>
        <button
          type="button"
          class="action-icon-btn"
          title="Удалить"
          @click="$emit('delete')"
        >
          <v-icon size="18">mdi-delete-outline</v-icon>
        </button>
      </div>
    </div>
    <p class="card-desc">{{ template.description }}</p>
    <div class="card-criteria-row">
      <span class="criteria-badge">
        Критериев: {{ template.criteriaCount }}
      </span>
    </div>
    <hr class="card-divider" />
    <div class="card-tags">
      <span class="detail-tag">
        <v-icon size="14">mdi-format-font</v-icon>
        {{ template.font }}
      </span>
      <span class="detail-tag">
        <v-icon size="14">mdi-file-multiple-outline</v-icon>
        {{ template.minPages }}
      </span>
      <span class="detail-tag">
        <v-icon size="14">mdi-book-open-page-variant-outline</v-icon>
        {{ template.minSources }}
      </span>
    </div>
    <div class="card-sections">
      <v-icon size="16">mdi-format-list-bulleted</v-icon>
      <span>Разделов: {{ template.sectionsCount }}</span>
    </div>
  </v-card>
</template>

<script setup lang="ts">
  import type { TemplateItem } from '../modal';

  withDefaults(
    defineProps<{
      template: TemplateItem;
      canEdit?: boolean;
    }>(),
    { canEdit: false }
  );

  defineEmits<{
    edit: [];
    delete: [];
  }>();
</script>

<style scoped>
  .template-card {
    background: #ffffff;
    border-radius: 12px;
    padding: 20px;
    border: 1px solid #e5e7eb;
    box-shadow: 0 2px 12px rgba(0, 0, 0, 0.08);
    height: 100%;
  }

  .doc-icon {
    color: rgb(30, 55, 153) !important;
    flex-shrink: 0;
  }

  .card-top {
    display: flex;
    align-items: flex-start;
    justify-content: space-between;
    gap: 12px;
    margin-bottom: 10px;
  }

  .card-header-left {
    display: flex;
    align-items: flex-start;
    gap: 12px;
    flex: 1;
    min-width: 0;
  }

  .card-title {
    margin: 0;
    font-size: 16px;
    font-weight: 600;
    color: #111827;
    line-height: 1.4;
  }

  .card-actions {
    display: flex;
    align-items: center;
    gap: 4px;
    flex-shrink: 0;
  }

  .action-icon-btn {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    padding: 4px;
    border: none;
    background: transparent;
    color: #9ca3af;
    cursor: pointer;
    border-radius: 6px;
  }

  .action-icon-btn:hover {
    color: #6b7280;
  }

  .card-desc {
    margin: 0 0 10px;
    font-size: 14px;
    color: #6b7280;
    line-height: 1.45;
  }

  .card-criteria-row {
    display: flex;
    justify-content: flex-end;
    margin-bottom: 14px;
  }

  .criteria-badge {
    display: inline-block;
    padding: 5px 12px;
    border-radius: 8px;
    background: #dce7ff;
    color: rgb(30, 55, 153);
    font-size: 12px;
    font-weight: 500;
  }

  .card-divider {
    border: none;
    border-top: 1px solid #e5e7eb;
    margin: 0 0 14px;
  }

  .card-tags {
    display: flex;
    flex-wrap: wrap;
    gap: 12px;
    margin-bottom: 12px;
  }

  .detail-tag {
    display: inline-flex;
    align-items: center;
    gap: 6px;
    padding: 6px 10px;
    border-radius: 6px;
    background: #f3f4f6;
    font-size: 13px;
    color: #4b5563;
  }

  .detail-tag .v-icon {
    color: #9ca3af !important;
  }

  .card-sections {
    display: flex;
    align-items: center;
    gap: 8px;
    font-size: 13px;
    color: #4b5563;
  }

  .card-sections .v-icon {
    color: #9ca3af !important;
  }
</style>
