<template>
  <div class="role-cell">
    <div class="role-chips">
      <etu-label-chip
        v-for="rv in teacherRoles(teacher)"
        :key="rv"
        variant="inline"
        size="sm"
        closable
        close-aria-label="Убрать роль"
        :icon="roleIco(rv)"
        :icon-size="12"
        :label="roleName(rv)"
        :root-class="['rchip', `rchip--${rv.toLowerCase()}`]"
        @close="onChipClose(teacher, rv)"
      />
    </div>

    <v-menu
      location="bottom start"
      offset="4"
      :close-on-content-click="false"
    >
      <template #activator="{ props: menuProps }">
        <button
          type="button"
          class="role-add-btn"
          title="Изменить роли"
          v-bind="menuProps"
        >
          <v-icon size="14">mdi-plus</v-icon>
        </button>
      </template>

      <div class="role-dropdown">
        <div class="role-dropdown__title">Роли</div>
        <label
          v-for="ri in roleItems"
          class="role-dropdown__item"
          :key="ri.value"
        >
          <input
            type="checkbox"
            class="role-dropdown__cb"
            :checked="teacherRoles(teacher).includes(ri.value)"
            @change="toggleRole(ri.value)"
          />
          <v-icon
            size="15"
            class="role-dropdown__ico"
          >
            {{ roleIco(ri.value) }}
          </v-icon>
          <span>{{ ri.title }}</span>
        </label>
      </div>
    </v-menu>
  </div>
</template>

<script setup lang="ts">
  import type { TeacherDto } from '@/api/info';
  import { roleIco, roleName } from '../../utils/userTableHelpers';

  const props = defineProps<{
    teacher: TeacherDto;
    roleItems: readonly { title: string; value: string }[];
    teacherRoles: (t: TeacherDto) => string[];
    onRolesChange: (t: TeacherDto, v: string[]) => void;
    onChipClose: (t: TeacherDto, role: string) => void;
  }>();

  function toggleRole(roleValue: string) {
    const { teacher } = props;
    const current = props.teacherRoles(teacher);
    const has = current.includes(roleValue);
    const next = has
      ? current.filter((r) => r !== roleValue)
      : [...current, roleValue];
    props.onRolesChange(teacher, next.length ? next : ['TEACHER']);
  }
</script>

<style scoped>
  .role-cell {
    display: flex;
    align-items: center;
    gap: 7px;
  }
  .role-chips {
    display: flex;
    flex-wrap: wrap;
    gap: 4px 5px;
    align-items: center;
    flex: 1;
    min-width: 0;
  }

  .rchip.etu-label-chip--inline {
    display: inline-flex;
    align-items: center;
    gap: 3px;
    padding: 4px 9px 4px 7px;
    border-radius: 7px;
    font-size: 11px;
    font-weight: 700;
    line-height: 1.1;
    white-space: nowrap;
    transition:
      filter 0.15s,
      transform 0.1s;
    user-select: none;
    border: none !important;
    min-height: unset;
    box-shadow: none !important;
    background: transparent;
  }
  .rchip.etu-label-chip--inline:hover {
    filter: brightness(0.93);
  }
  .rchip.etu-label-chip--inline :deep(.etu-label-chip__icon) {
    opacity: 0.6;
    flex-shrink: 0;
  }
  .rchip.etu-label-chip--inline :deep(.etu-label-chip__text) {
    letter-spacing: 0.01em;
  }
  .rchip.etu-label-chip--inline :deep(.etu-label-chip__close) {
    display: inline-grid;
    place-items: center;
    width: 15px;
    height: 15px;
    margin-left: 1px;
    padding: 0;
    border-radius: 50%;
    background: rgba(0, 0, 0, 0.07);
    color: inherit;
    cursor: pointer;
    opacity: 0;
    transform: scale(0.65);
    transition:
      opacity 0.15s,
      transform 0.15s,
      background 0.15s;
  }
  .rchip.etu-label-chip--inline:hover :deep(.etu-label-chip__close) {
    opacity: 1;
    transform: scale(1);
  }
  .rchip.etu-label-chip--inline :deep(.etu-label-chip__close:hover) {
    background: rgba(0, 0, 0, 0.18);
  }

  .rchip--admin {
    background: #ede9fe !important;
    color: #5b21b6 !important;
  }
  .rchip--teacher {
    background: #dbeafe !important;
    color: #1e40af !important;
  }
  .rchip--head {
    background: #dcfce7 !important;
    color: #15803d !important;
  }

  .role-add-btn {
    display: inline-grid;
    place-items: center;
    width: 26px;
    height: 26px;
    border: 1.5px dashed #e7e5e4;
    border-radius: 7px;
    background: transparent;
    color: #a8a29e;
    cursor: pointer;
    transition:
      border-color 0.15s,
      color 0.15s,
      background 0.15s;
    flex-shrink: 0;
  }
  .role-add-btn:hover {
    border-color: #2563eb;
    color: #2563eb;
    background: #eff6ff;
  }

  .role-dropdown {
    background: #fff !important;
    border: 1.5px solid #bfdbfe;
    border-radius: 11px;
    padding: 10px 0;
    min-width: 210px;
    box-shadow:
      0 10px 36px rgba(28, 25, 23, 0.13),
      0 2px 6px rgba(28, 25, 23, 0.06);
  }
  .role-dropdown__title {
    padding: 0 14px 8px;
    font-size: 10px;
    font-weight: 800;
    color: #a8a29e;
    text-transform: uppercase;
    letter-spacing: 0.08em;
    border-bottom: 1px solid #f0efed;
    margin-bottom: 4px;
  }
  .role-dropdown__item {
    display: flex;
    align-items: center;
    gap: 9px;
    padding: 9px 14px;
    cursor: pointer;
    font-size: 13px;
    font-weight: 500;
    color: #1c1917;
    transition: background 0.12s;
  }
  .role-dropdown__item:hover {
    background: #eff6ff;
  }
  .role-dropdown__ico {
    color: #a8a29e;
  }
  .role-dropdown__cb {
    width: 16px;
    height: 16px;
    accent-color: #2563eb;
    cursor: pointer;
    border-radius: 3px;
  }
</style>
