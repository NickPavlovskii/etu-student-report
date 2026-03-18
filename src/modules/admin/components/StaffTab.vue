<template>
  <div class="tab-panel">
    <div class="toolbar">
      <el-input
        :model-value="staffSearch"
        placeholder="Поиск по имени или email..."
        clearable
        class="search-input"
        :prefix-icon="SearchIcon"
        @input="(v: string) => { $emit('update:staffSearch', v); debouncedLoadTeachers(); }"
      />
    </div>
    <v-table class="staff-table">
      <colgroup>
        <col v-for="col in columns" :key="col.key" :class="col.class" />
      </colgroup>
      <thead>
        <tr>
          <th v-for="col in columns" :key="col.key" :class="col.headerClass">
            {{ col.header }}
          </th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="t in teachers" :key="t.lastName">
          <td>
            <div class="cell-fio">
              <div class="avatar" :class="avatarColorClass(t)">
                {{ initials(t.fio || t.lastName) }}
              </div>
              <span>{{ t.fio || [t.lastName, t.firstName, t.patronymic].filter(Boolean).join(' ') || t.lastName }}</span>
            </div>
          </td>
          <td>{{ t.email || '—' }}</td>
          <td class="cell-position">{{ t.position || '—' }}</td>
          <td class="cell-role">
            <v-select
              :model-value="teacherRoles(t)"
              :items="roleItems"
              item-title="title"
              item-value="value"
              multiple
              chips
              closable-chips
              density="compact"
              variant="outlined"
              hide-details
              class="role-select role-select-chips"
              placeholder="Роли"
              @update:model-value="(v) => onRolesChange(t, v)"
            >
              <template #chip="{ item }">
                <v-chip
                  :class="['role-chip', 'role-chip--' + (item.raw?.value ?? item.value ?? '')]"
                  size="small"
                  closable
                  @click:close="(e) => { e.stopPropagation(); onChipClose(t, item.raw?.value ?? item.value); }"
                >
                  {{ item.raw?.title ?? item.title ?? item.value }}
                </v-chip>
              </template>
            </v-select>
          </td>
          <td>{{ t.disciplinesCount ?? 0 }}</td>
        </tr>
        <tr v-if="!teachers.length && !staffLoading">
          <td colspan="5" class="text-center">Нет данных</td>
        </tr>
      </tbody>
    </v-table>
    <div v-if="staffLoading" class="loading-overlay">
      <v-progress-circular indeterminate color="primary" />
    </div>
  </div>
</template>

<script setup lang="ts">
import { Search } from '@element-plus/icons-vue';
import type { TeacherDto } from '@/api/admin';
import type { StaffTableColumn } from '../staffTableColumns';

const SearchIcon = Search;

defineProps<{
  teachers: TeacherDto[];
  staffSearch: string;
  staffLoading: boolean;
  roleItems: readonly { title: string; value: string }[];
  columns: StaffTableColumn[];
  initials: (str: string) => string;
  avatarColorClass: (t: TeacherDto) => string;
  teacherRoles: (t: TeacherDto) => string[];
  debouncedLoadTeachers: () => void;
  onRolesChange: (t: TeacherDto, v: string[]) => void;
  onChipClose: (t: TeacherDto, role: string) => void;
}>();

defineEmits<{ 'update:staffSearch': [value: string] }>();
</script>

<style scoped>
.tab-panel {
  min-height: 320px;
  position: relative;
}
.toolbar {
  display: flex;
  align-items: center;
  gap: 16px;
  margin-bottom: 20px;
  flex-wrap: wrap;
}
.search-input {
  flex: 1;
  min-width: 240px;
  max-width: 400px;
}
.staff-table {
  width: 100%;
  border-collapse: collapse;
  font-size: 14px;
}
.staff-table th,
.staff-table td {
  padding: 12px 16px;
  border-bottom: 1px solid #e5e7eb;
  text-align: left;
}
.staff-table th {
  font-weight: 600;
  color: #374151;
  background: #f9fafb;
}
.staff-table thead th {
  position: relative;
}
.staff-table thead th.th-filled:has(+ th.th-filled)::after {
  content: '';
  position: absolute;
  right: 0;
  top: 50%;
  transform: translateY(-50%);
  height: 60%;
  width: 1px;
  background: #e5e7eb;
}
.cell-role {
  width: 200px;
  min-width: 200px;
  max-width: 200px;
  overflow: hidden;
  vertical-align: middle;
}
.cell-fio {
  display: flex;
  align-items: center;
  gap: 12px;
}
.cell-position {
  max-width: 220px;
  word-break: break-word;
}
.avatar {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 14px;
  font-weight: 600;
  color: #fff;
  flex-shrink: 0;
}
.avatar-blue { background: #3b82f6; }
.avatar-purple { background: #8b5cf6; }
.avatar-green { background: #10b981; }
.role-select {
  width: 100%;
  max-width: 200px;
  min-height: 36px;
}
.role-select :deep(.v-field) {
  border-radius: 8px;
  min-height: 36px;
  max-height: 36px;
}
.role-select :deep(.v-field__overlay) { border-radius: 8px; }
.role-select-chips :deep(.v-field__input) {
  min-height: 34px;
  max-height: 34px;
  padding-top: 2px;
  padding-bottom: 2px;
  overflow: hidden;
}
.role-select-chips :deep(.v-chip) {
  font-size: 11px;
  max-height: 24px;
  margin: 0 2px;
}
.role-select-chips :deep(.v-chip .v-chip__content) {
  padding-inline-start: 6px;
  padding-inline-end: 4px;
}
.role-select-chips :deep(.v-selection-overflow) {
  flex-wrap: nowrap;
  overflow: hidden;
}
.role-select-chips :deep(.v-input__append-inner) { align-items: center; }
.loading-overlay {
  position: absolute;
  inset: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(255, 255, 255, 0.7);
}
.text-center {
  text-align: center;
  padding: 24px;
  color: #6b7280;
}
</style>
