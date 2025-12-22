<template>
  <v-navigation-drawer
    class="app-drawer"
    permanent
    app
    :model-value="modelValue"
    @update:modelValue="$emit('update:modelValue', $event)"
  >
    <div class="drawer-title">
      ИС
      <br />
      <span>
        Учёт и хранение
        <br />
        учебных работ
      </span>
    </div>

    <v-list
      nav
      class="drawer-list"
    >
      <v-list-item
        to="/"
        prepend-icon="mdi-file-document-outline"
        title="Учебные работы"
        class="drawer-item"
      />
      <v-list-item
        to="/upload"
        prepend-icon="mdi-upload"
        title="Загрузка работ"
        class="drawer-item"
      />
      <v-list-item
        to="/reports"
        prepend-icon="mdi-chart-bar"
        title="Отчёты"
        class="drawer-item"
      />
      <v-list-item
        to="/archive"
        prepend-icon="mdi-archive-outline"
        title="Архив"
        class="drawer-item"
      />
    </v-list>
  </v-navigation-drawer>
</template>

<script setup lang="ts">
  defineProps<{ modelValue: boolean }>();
  defineEmits(['update:modelValue']);
</script>

<style scoped>
  .app-drawer {
    background: linear-gradient(180deg, #1e3a8a, #1e40af);
    color: #fff;
    border-right: none;
  }

  /* Заголовок */
  .drawer-title {
    padding: 24px 20px;
    font-size: 18px;
    font-weight: 600;
    line-height: 1.3;
  }

  .drawer-title span {
    font-size: 13px;
    font-weight: 400;
    opacity: 0.85;
  }

  /* Список */
  .drawer-list {
    padding: 8px;
  }

  /* Пункты меню */
  .drawer-item {
    border-radius: 10px;
    margin-bottom: 6px;
    color: #fff !important;
  }

  /* Иконки */
  .drawer-item :deep(.v-icon) {
    color: #c7d2fe;
  }

  /* Активный пункт */
  .drawer-item.v-list-item--active {
    background: rgba(255, 255, 255, 0.18);
  }

  .drawer-item.v-list-item--active :deep(.v-list-item-title) {
    font-weight: 600;
  }

  /* Hover */
  .drawer-item:hover {
    background: rgba(255, 255, 255, 0.12);
  }
</style>
