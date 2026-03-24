<template>
  <div class="user-panel">
    <user-toolbar
      v-model:users-search="usersSearch"
      :count-label="countLabel"
      :debounced-load-teachers="u.debouncedLoadTeachers"
    />

    <etu-data-table
      empty-icon="mdi-account-search-outline"
      empty-text="Ничего не нашлось"
      :columns="columnsForTable"
      :rows="teachers"
      :loading="usersLoading"
      :show-skeleton="false"
      :shadow="true"
      :row-class="() => 'users-table__tr'"
      :row-style="userRowStyle"
    >
      <template #colgroup>
        <colgroup>
          <col
            v-for="c in USER_TABLE_COLUMNS"
            :key="c.key"
            :class="c.class"
          />
        </colgroup>
      </template>

      <template #cell-fio="{ row }">
        <user-person-cell
          :teacher="row"
          :initials="u.initials"
          :avatar-color-class="u.avatarColorClass"
        />
      </template>

      <template #cell-position="{ row }">
        <span
          v-if="row.position"
          class="pos-label"
        >
          {{ row.position }}
        </span>
        <span
          v-else
          class="dash"
        >
          —
        </span>
      </template>

      <template #cell-rank="{ row }">
        <template
          v-for="label in [teacherRank(row)]"
          :key="`${row.lastName ?? ''}-rank`"
        >
          <span
            v-if="label"
            class="pos-label"
          >
            {{ label }}
          </span>
          <span
            v-else
            class="dash"
          >
            —
          </span>
        </template>
      </template>

      <template #cell-degree="{ row }">
        <template
          v-for="label in [teacherDegree(row)]"
          :key="`${row.lastName ?? ''}-deg`"
        >
          <span
            v-if="label"
            class="pos-label"
          >
            {{ label }}
          </span>
          <span
            v-else
            class="dash"
          >
            —
          </span>
        </template>
      </template>

      <template #cell-role="{ row }">
        <user-role-cell
          :teacher="row"
          :role-items="u.roleItems"
          :teacher-roles="u.teacherRoles"
          :on-roles-change="u.onRolesChange"
          :on-chip-close="u.onChipClose"
        />
      </template>

      <template #cell-disciplines="{ row }">
        <user-disciplines-cell
          :teacher="row"
          :max-visible="MAX_DISC"
          @show-tooltip="showDiscTooltip"
          @hide-tooltip="hideDiscTooltip"
        />
      </template>

      <template #empty>
        <div class="users-table__empty">
          <v-icon
            size="44"
            class="users-table__empty-ico"
          >
            mdi-account-search-outline
          </v-icon>
          <p class="users-table__empty-title">Ничего не нашлось</p>
          <p class="users-table__empty-hint">Попробуйте другой запрос</p>
        </div>
      </template>
    </etu-data-table>

    <etu-tea-loader
      overlay
      :loading="usersLoading"
    />

    <user-disciplines-tooltip
      :visible="discTip.visible"
      :items="discTip.items"
      :style="discTip.style"
      @tooltip-enter="onDiscTooltipEnter"
      @tooltip-leave="onDiscTooltipLeave"
    />
  </div>
</template>

<script setup lang="ts">
  import { computed, inject, reactive, ref, toRef } from 'vue';
  import type { TeacherDto } from '@/api/admin';
  import type { TableColumn } from '@/components/global/etu-data-table/types';
  import UserToolbar from './UserToolbar.vue';
  import UserDisciplinesTooltip from './UserDisciplinesTooltip.vue';
  import UserPersonCell from './UserPersonCell.vue';
  import UserRoleCell from './UserRoleCell.vue';
  import UserDisciplinesCell from './UserDisciplinesCell.vue';
  import { tdClass, teacherRank, teacherDegree } from '../../utils/userTableHelpers';
  import { USER_TABLE_COLUMNS } from '../../constants';
  import { adminUsersKey } from '../../injectionKeys';

  const MAX_DISC = 3;

  const u = inject(adminUsersKey);
  if (!u) {
    throw new Error('UserTab: adminUsersKey не найден (ожидается AdminPage)');
  }

  /** top-level ref для v-model — иначе u.usersSearch в шаблоне даёт [object Object] */
  const usersSearch = toRef(u, 'usersSearch');

  const teachers = computed(() => u.teachers.value);

  const usersLoading = computed(() => u.usersLoading.value);

  const columnsForTable = computed<TableColumn<TeacherDto>[]>(() =>
    USER_TABLE_COLUMNS.map((c) => ({
      key: c.key,
      header: c.header,
      headerClass: c.headerClass,
      cellClass: tdClass(c.key),
    }))
  );

  function userRowStyle(_row: TeacherDto, i: number): Record<string, string> {
    return { '--i': String(i) };
  }

  const discTip = reactive<{
    visible: boolean;
    items: string[];
    style: Record<string, string>;
  }>({
    visible: false,
    items: [],
    style: {},
  });

  let tipTimer: ReturnType<typeof setTimeout> | null = null;
  const discTooltipHover = ref(false);

  function cancelHideDiscTooltip() {
    if (tipTimer) {
      clearTimeout(tipTimer);
    }
    tipTimer = null;
    discTip.visible = true;
  }

  function showDiscTooltip(e: MouseEvent, t: TeacherDto) {
    if (tipTimer) {
      clearTimeout(tipTimer);
    }
    const rect = (e.currentTarget as HTMLElement).getBoundingClientRect();
    discTip.items = t.disciplines ?? [];
    discTip.style = {
      top: `${rect.bottom + 8}px`,
      left: `${rect.left}px`,
    };
    discTip.visible = true;
  }

  function hideDiscTooltip() {
    tipTimer = setTimeout(() => {
      if (!discTooltipHover.value) {
        discTip.visible = false;
      }
    }, 120);
  }

  function onDiscTooltipEnter() {
    discTooltipHover.value = true;
    cancelHideDiscTooltip();
  }

  function onDiscTooltipLeave() {
    discTooltipHover.value = false;
    hideDiscTooltip();
  }

  const countLabel = computed(() => {
    const n = teachers.value.length;
    if (!n) {
      return 'Нет пользователей';
    }
    const m = n % 100;
    const d = n % 10;
    if (m >= 11 && m <= 19) {
      return `${n} пользователей`;
    }
    if (d === 1) {
      return `${n} пользователь`;
    }
    if (d >= 2 && d <= 4) {
      return `${n} пользователя`;
    }
    return `${n} пользователей`;
  });
</script>

<style scoped>
  .user-panel {
    --ease: cubic-bezier(0.4, 0, 0.2, 1);

    position: relative;
    min-height: 300px;
    font-family: 'DM Sans', 'Nunito Sans', system-ui, sans-serif;
  }

  .users-table__tr {
    transition: background 0.15s cubic-bezier(0.4, 0, 0.2, 1);
    animation: slideIn 0.35s cubic-bezier(0.4, 0, 0.2, 1) both;
    animation-delay: calc(var(--i, 0) * 25ms);
  }
  .users-table__tr:hover {
    background: #eff6ff;
  }

  .users-table__tr:hover :deep(.person__avatar) {
    transform: scale(1.06) rotate(-1deg);
  }

  .users-table__tr:hover :deep(.disc-tag) {
    background: #f0efed;
  }

  @keyframes slideIn {
    from {
      opacity: 0;
      transform: translateY(5px);
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }

  .td--fio {
    min-width: 210px;
  }
  .td--pos {
    max-width: 200px;
    color: #57534e;
    font-size: 13px;
    word-break: break-word;
  }
  .td--role {
    width: 280px;
    min-width: 250px;
  }
  .td--disc {
    max-width: 340px;
  }

  .dash {
    color: #e7e5e4;
    font-weight: 500;
  }

  .pos-label {
    display: inline-block;
    padding: 2px 9px;
    border-radius: 6px;
    background: #f5f5f4;
    color: #57534e;
    font-size: 12px;
    font-weight: 500;
    line-height: 1.5;
  }

  .users-table__empty {
    text-align: center;
    padding: 56px 24px;
    border-bottom: 0 !important;
  }
  .users-table__empty-ico {
    color: #e7e5e4;
    margin-bottom: 10px;
  }
  .users-table__empty-title {
    margin: 0 0 4px;
    font-size: 14px;
    font-weight: 700;
    color: #57534e;
  }
  .users-table__empty-hint {
    margin: 0;
    font-size: 12.5px;
    color: #a8a29e;
  }
</style>
