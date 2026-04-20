<template>
  <v-app-bar
    class="app-header"
    color="#1E3799"
    height="64"
    flat
  >
    <v-btn
      class="menu-btn"
      icon
      @click="$emit('toggle-drawer')"
    >
      <v-icon size="26">mdi-menu</v-icon>
    </v-btn>
    <span class="header-title">ИС «Отчеты»</span>
    <v-spacer />
    <div class="date-info">Дата: {{ formattedDate }}</div>
    <v-select
      class="year-select"
      density="compact"
      variant="solo"
      hide-details
      v-model="selectedYear"
      :items="ACADEMIC_YEAR_SELECT_ITEMS"
      item-title="title"
      item-value="value"
    />
    <v-icon
      class="mr-5"
      @click="logout"
    >
      mdi-logout
    </v-icon>
  </v-app-bar>
</template>

<script setup lang="ts">
  import { computed } from 'vue';
  import { useRouter } from 'vue-router';
  import { ACADEMIC_YEAR_SELECT_ITEMS } from '@/constants/academicYearSelectItems';
  import { useAcademicYear } from '@/composables/useAcademicYear';
  import { bumpUserStorageTick } from '@/composables/userStorageTick';

  defineEmits(['toggle-drawer']);
  const router = useRouter();
  const { academicYear: selectedYear } = useAcademicYear();

  const today = new Date();

  const formattedDate = computed(() => {
    return today.toLocaleDateString('ru-RU', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    });
  });

  const logout = () => {
    localStorage.removeItem('user');
    bumpUserStorageTick();
    router.push('/auth');
  };
</script>

<style scoped>
  .year-select {
    max-width: 152px;
  }

  .year-select :deep(.v-field) {
    background-color: #6086f4;
    border-radius: 10px;
    margin-right: 12px;
    padding-right: 12px;
  }

  .year-select :deep(.v-select__selection-text) {
    color: white;
  }

  .date-info {
    margin-right: 12px;
    color: white;
    font-size: 14px;
  }

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
