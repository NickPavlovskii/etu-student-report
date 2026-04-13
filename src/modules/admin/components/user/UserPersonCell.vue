<template>
  <div class="person">
    <div :class="['person__avatar', avatarColorClass(teacher)]">
      {{ initials(teacher.fio || teacher.lastName) }}
    </div>
    <div class="person__meta">
      <span class="person__name">{{ displayName(teacher) }}</span>
      <span
        v-if="teacher.email"
        class="person__email"
      >
        {{ teacher.email }}
      </span>
    </div>
  </div>
</template>

<script setup lang="ts">
  import type { TeacherDto } from '@/api/info';
  import { displayName } from '../../utils/userTableHelpers';

  defineProps<{
    teacher: TeacherDto;
    initials: (s: string) => string;
    avatarColorClass: (t: TeacherDto) => string;
  }>();
</script>

<style scoped>
  .person {
    display: flex;
    align-items: center;
    gap: 13px;
  }
  .person__avatar {
    width: 38px;
    height: 38px;
    border-radius: 10px;
    display: grid;
    place-items: center;
    font-size: 12px;
    font-weight: 800;
    color: #fff;
    flex-shrink: 0;
    letter-spacing: 0.03em;
    box-shadow:
      0 2px 6px rgba(0, 0, 0, 0.12),
      inset 0 1px 0 rgba(255, 255, 255, 0.18);
    transition: transform 0.2s cubic-bezier(0.4, 0, 0.2, 1);
  }

  .avatar-blue {
    background: linear-gradient(140deg, #60a5fa 0%, #2563eb 100%);
  }
  .avatar-purple {
    background: linear-gradient(140deg, #a78bfa 0%, #7c3aed 100%);
  }
  .avatar-green {
    background: linear-gradient(140deg, #34d399 0%, #059669 100%);
  }

  .person__meta {
    display: flex;
    flex-direction: column;
    gap: 2px;
    min-width: 0;
  }
  .person__name {
    font-weight: 700;
    color: #1c1917;
    line-height: 1.25;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }
  .person__email {
    font-size: 11.5px;
    color: #a8a29e;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }
</style>
