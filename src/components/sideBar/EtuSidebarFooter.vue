<template>
  <div class="drawer-user">
    <div class="user-info">
      <div class="user-name">{{ teacherFullName }}</div>
      <div class="user-role">
        {{ roleDisplay }}
        <span v-if="teacherDept">· {{ teacherDept }}</span>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
  import { computed } from 'vue';
  import { useUser } from '@/composables/useUser';

  const { user, roleDisplay } = useUser();

  const teacherFullName = computed(() => user.value?.fioShort ?? 'Преподаватель');
  const teacherDept = computed(() => user.value?.department ?? '');
</script>

<style scoped>
  .drawer-user {
    display: flex;
    align-items: center;
    justify-content: space-between;
    width: 100%;
  }

  .user-info {
    min-width: 0;
    flex: 1;
    display: flex;
    flex-direction: column;
    overflow: hidden;
  }
  .user-name {
    font-size: 15px;
    font-weight: 600;
    line-height: 1.2;
    color: #111827;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }

  .user-role {
    font-size: 13px;
    color: #6b7280;
    margin-top: 2px;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }

  .settings-btn {
    color: #64748b;
    transition: color 0.25s ease;
  }

  .settings-icon {
    color: #64748b;
  }

  .settings-btn:hover {
    color: #1e40af;
  }
</style>
