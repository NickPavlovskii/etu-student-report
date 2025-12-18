<template>
  <v-app-bar
    color="#1E3799"
    height="64"
    flat
    class="app-header"
  >
    <v-btn
      icon
      class="menu-btn"
      @click="$emit('toggle-drawer')"
    >
      <v-icon size="26">
        mdi-menu
      </v-icon>
    </v-btn>
    <v-toolbar-title class="header-title">
      ИС «Хранение отчетов»
    </v-toolbar-title>
    <v-spacer />
    <div class="date-info">
      Дата: {{ formattedDate }} &nbsp; Неделя: {{ weekNumber }}
    </div>
  </v-app-bar>
</template>
<script setup lang="ts">
  import { computed } from 'vue';

  defineEmits(['toggle-drawer']);

  const today = new Date();

  const formattedDate = computed(() => {
    return today.toLocaleDateString('ru-RU', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    });
  });

  const weekNumber = computed(() => {
    const start = new Date(today.getFullYear(), 0, 1);
    const diff = Number(today) - Number(start);
    return Math.ceil((diff / 86400000 + start.getDay() + 1) / 7);
  });
</script>

<style scoped>
  .app-header {
    padding: 0 12px;
  }

  .menu-btn {
    color: #ffffff;
  }

  .header-title {
    font-weight: 600;
    font-size: 18px;
  }

  .date-info {
    font-size: 14px;
    margin-right: 16px;
    opacity: 0.9;
  }

  .profile-btn {
    background: #ffffff;
    color: #1e40af;
    border-radius: 10px;
    font-weight: 500;
    text-transform: none;
  }
</style>
