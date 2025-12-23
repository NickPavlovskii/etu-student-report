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
      <v-icon size="26">mdi-menu</v-icon>
    </v-btn>
    <span class="header-title">ИС «Отчеты»</span>
    <v-spacer />
    <div class="date-info">
      Дата: {{ formattedDate }} &nbsp; Неделя: {{ weekNumber }}
    </div>
     <v-icon class="mr-5" @click="logout" left>mdi-logout</v-icon>
    <!-- <v-btn
      class="profile-btn"
      small
      @click="logout"
    >
      <v-icon left>mdi-logout</v-icon>
      Выйти
    </v-btn> -->
  </v-app-bar>
</template>

<script setup lang="ts">
  import { computed } from 'vue';
  import { useRouter } from 'vue-router';

  defineEmits(['toggle-drawer']);

  const router = useRouter();

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

  const logout = () => {
    localStorage.removeItem('teacher');
    router.push('/auth');
  };
</script>

<style scoped>
  .app-header {
    padding: 0 12px;
  }

  .menu-btn {
    color: #ffffff;
  }

  .header-title {
    font-family: Roboto, sans-serif;
    -webkit-font-smoothing: antialiased;
    font-size: 1.25rem;
    line-height: 2rem;
    font-weight: 500;
    letter-spacing: 0.0125em;
    text-transform: inherit;
    padding-left: 20px;
    padding-right: 0px;
    text-overflow: ellipsis;
    z-index: 1;
    text-decoration: inherit;
    white-space: nowrap;
    overflow: hidden;
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
