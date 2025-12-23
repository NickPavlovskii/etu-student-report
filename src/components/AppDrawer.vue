<template>
  <v-navigation-drawer
    temporary
    class="app-drawer"
    :model-value="modelValue"
    @update:modelValue="$emit('update:modelValue', $event)"
  >
    <div class="drawer-content">
      <div class="drawer-header">
        <img
          src="../assets/logo.jpg"
          alt="Logo"
          class="drawer-logo"
        />
        <div class="drawer-header-text">
          <v-icon size="30">mdi-archive-outline</v-icon>
          <span class="drawer-title">ИС «Отчеты»</span>
        </div>
      </div>
      <v-list
        nav
        class="drawer-list"
      >
        <v-list-item
          to="/uploadWork"
          prepend-icon="mdi-file-document-outline"
          title="Мои дисциплины"
          active-class="drawer-item--active"
        />
        <v-list-item
          to="/analytics"
          prepend-icon="mdi-chart-line"
          title="Аналитика"
          active-class="drawer-item--active"
        />
        <v-list-item
          to="/archive"
          prepend-icon="mdi-archive-outline"
          title="Архив работ"
          active-class="drawer-item--active"
        />
      </v-list>
      <div class="drawer-user">
        <div class="user-info">
          <div class="user-name">
            {{ teacherFullName }}
          </div>
          <div class="user-role">Преподаватель</div>
        </div>
        <v-btn
          icon
          variant="text"
          size="small"
          class="settings-btn"
        >
          <v-icon>mdi-cog-outline</v-icon>
        </v-btn>
      </div>
    </div>
  </v-navigation-drawer>
</template>

<script setup lang="ts">
  import { computed } from 'vue';
  import disciplinesDB from '../db/db.json';

  const teacherLastName = localStorage.getItem('teacher');

  const teacherData = disciplinesDB.find((d) => d.LastName === teacherLastName);

  const teacherFullName = computed(() => {
    if (!teacherData) return 'Преподаватель';
    const initials = `${
      teacherData.FirstName ? teacherData.FirstName[0] + '.' : ''
    }${teacherData.MiddleName ? teacherData.MiddleName[0] + '.' : ''}`;
    return `${teacherData.LastName} ${initials}`;
  });

  defineProps<{
    modelValue: boolean;
  }>();

  defineEmits<{
    (e: 'update:modelValue', value: boolean): void;
  }>();
</script>

<style scoped>
  .drawer-item--active {
    background-color: rgba(25, 118, 210, 0.12);
    color: #1976d2;
  }
  .app-drawer {
    background: #f8fafc;
    z-index: 2000;
  }

  .drawer-content {
    display: flex;
    flex-direction: column;
    height: 100%;
    opacity: 0;
    transform: translateX(-24px);
    transition: opacity 0.4s ease,
      transform 0.55s cubic-bezier(0.22, 1, 0.36, 1);
  }

  .v-navigation-drawer--active .drawer-content {
    opacity: 1;
    transform: translateX(0);
  }

  .drawer-header {
    display: flex;
    align-items: center;
    gap: 12px;
    padding: 20px 16px;
    border-bottom: 1px solid #e5e7eb;
  }

  .drawer-logo {
    width: 30px;
    height: 30px;
    border-radius: 8px;
    object-fit: cover;
  }

  .drawer-header-text {
    display: flex;
    align-items: center;
    gap: 6px;
    font-weight: 600;

  }

  .drawer-title {
    font-size: 16px;
  }

  .drawer-list {
    flex: 1;
    padding: 12px;
  }

  .drawer-list :deep(.v-list-item) {
    border-radius: 14px;
    margin-bottom: 6px;
    transition: background-color 0.3s ease, transform 0.25s ease;
  }

  .drawer-list :deep(.v-list-item:hover) {
    background: #eef2ff;
    transform: translateX(6px);
  }

  .drawer-list :deep(.v-list-item--active) {
    background: #eff6ff;
  }

  .drawer-list :deep(.v-list-item--active .v-list-item-title) {
    color: #2f70fc;
  }

  .drawer-user {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 16px;
    border-top: 1px solid rgba(0, 0, 0, 0.12);
  }

  .user-info {
    display: flex;
    flex-direction: column;
  }

  .user-name {
    font-size: 15px;
    font-weight: 600;
    color: #111827;
  }

  .user-role {
    font-size: 13px;
    color: #6b7280;
  }

  .settings-btn {
    color: #64748b;
    transition: color 0.25s ease;
  }

  .settings-btn:hover {
    color: #1e40af;
  }

  .v-navigation-drawer {
    transition: width 0.55s cubic-bezier(0.22, 1, 0.36, 1);
  }

  .v-navigation-drawer--active {
    width: 300px !important;
  }
  .drawer-item--active .v-icon {
    color: #1976d2;
  }
</style>
