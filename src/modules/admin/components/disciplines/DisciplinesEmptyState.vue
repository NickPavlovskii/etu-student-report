<template>
  <div class="empty-state">
    <div class="empty-icon">
      <v-icon
        size="36"
        color="#d1d5db"
      >
        mdi-book-open-outline
      </v-icon>
    </div>
    <p class="empty-title">Дисциплины не найдены</p>
    <p class="empty-hint">{{ hint }}</p>
  </div>
</template>

<script setup lang="ts">
  defineProps<{
    hint: string;
  }>();
</script>

<style scoped>
  .empty-state {
    display: flex;
    flex-direction: column;
    align-items: center;
    padding: 64px 24px;
    gap: 8px;
  }

  .empty-icon {
    width: 64px;
    height: 64px;
    border-radius: 16px;
    background: #f9fafb;
    border: 1.5px solid #e5e7eb;
    display: flex;
    align-items: center;
    justify-content: center;
    margin-bottom: 8px;
  }

  .empty-title {
    font-size: 15px;
    font-weight: 600;
    color: #374151;
    margin: 0;
  }

  .empty-hint {
    font-size: 13px;
    color: #9ca3af;
    margin: 0;
  }
</style>
