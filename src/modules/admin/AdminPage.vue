<template>
  <v-container fluid class="page">
    <etu-page-header
      icon="mdi-shield-outline"
      title="Администрирование"
      subtitle="Сотрудники кафедры, дисциплины, журнал событий"
      icon-color="#7c3aed"
      icon-bg-color="#f5f3ff"
    />

    <v-tabs
      v-model="activeTab"
      class="admin-tabs"
      bg-color="transparent"
    >
      <v-tab value="staff">Сотрудники кафедры</v-tab>
      <v-tab value="disciplines">Дисциплины кафедры</v-tab>
      <v-tab value="audit">Журнал событий</v-tab>
    </v-tabs>

    <v-window v-model="activeTab" class="admin-window">
      <v-window-item value="staff">
        <staff-tab
          :staff-search="staffSearchValue"
          :teachers="teachersValue"
          :staff-loading="staffLoadingValue"
          :role-items="user.roleItems"
          :columns="STAFF_TABLE_COLUMNS"
          :initials="user.initials"
          :avatar-color-class="user.avatarColorClass"
          :teacher-roles="user.teacherRoles"
          :debounced-load-teachers="user.debouncedLoadTeachers"
          :on-roles-change="user.onRolesChange"
          :on-chip-close="user.onChipClose"
          @update:staff-search="onStaffSearchUpdate"
        />
      </v-window-item>

      <v-window-item value="disciplines">
        <disciplines-tab
          :discipline-teacher-filter="disciplineTeacherFilterValue"
          :teacher-filter-items="teacherFilterItemsValue"
          :discipline-card-items="disciplineCardItemsValue"
          :disciplines-loading="disciplinesLoadingValue"
          :disciplines-by-teacher-loading="disciplinesByTeacherLoadingValue"
          :disciplines-by-all-teachers-loading="disciplinesByAllTeachersLoadingValue"
          :on-discipline-teacher-filter-change="disciplines.onDisciplineTeacherFilterChange"
          @update:discipline-teacher-filter="onDisciplineFilterUpdate"
          @open-discipline="openDisciplineByName"
        />
      </v-window-item>

      <v-window-item value="audit">
        <audit-tab
          :audit-search="auditSearchValue"
          :audit-action-filter="auditActionFilterValue"
          :audit-date-preset="auditDatePresetValue"
          :audit-log="auditLogValue"
          :audit-loading="auditLoadingValue"
          :audit-action-items="audit.auditActionItems"
          :audit-date-items="audit.auditDateItems"
          :rollback-dialog="rollbackDialogValue"
          :rollback-loading="rollbackLoadingValue"
          :rollback-snackbar="rollbackSnackbarValue"
          :format-audit-date="audit.formatAuditDate"
          :action-label="audit.actionLabel"
          :action-chip-class="audit.actionChipClass"
          :can-rollback="audit.canRollback"
          :load-audit-log="audit.loadAuditLog"
          :debounced-load-audit="audit.debouncedLoadAudit"
          :on-audit-date-preset-change="audit.onAuditDatePresetChange"
          :open-rollback-confirm="audit.openRollbackConfirm"
          @update:audit-search="onAuditSearchUpdate"
          @update:audit-action-filter="onAuditActionFilterUpdate"
          @update:audit-date-preset="onAuditDatePresetUpdate"
          @update:rollback-dialog="onRollbackDialogUpdate"
          @update:rollback-snackbar-visible="onRollbackSnackbarVisibleUpdate"
          @confirm-rollback="() => audit.confirmRollback()"
        />
      </v-window-item>
    </v-window>
  </v-container>
</template>

<script setup lang="ts">
import { ref, computed, watch, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { useUser } from '@/composables/useUser';
import { useAcademicYear } from '@/composables/useAcademicYear';
import { getDisciplineCards } from '@/api/disciplinesCard';
import StaffTab from './components/StaffTab.vue';
import DisciplinesTab from './components/DisciplinesTab.vue';
import AuditTab from './components/AuditTab.vue';
import { useAdminStaff } from './composables/useAdminStaff';
import { useAdminDisciplines } from './composables/useAdminDisciplines';
import { useAdminAudit } from './composables/useAdminAudit';
import { STAFF_TABLE_COLUMNS } from './staffTableColumns';
import type { AdminDisciplineCardItem } from './composables/useAdminDisciplines';

const router = useRouter();
const { academicYear } = useAcademicYear();
const { user: currentUser } = useUser();

const activeTab = ref('staff');
const user = useAdminStaff();
const disciplines = useAdminDisciplines(user.teachers);
const audit = useAdminAudit();

// Разворачиваем refs для передачи в дочерние компоненты (в шаблоне ref из объекта не разворачивается)
const staffSearchValue = computed(() => user.staffSearch.value);
const teachersValue = computed(() => user.teachers.value);
const staffLoadingValue = computed(() => user.staffLoading.value);

const disciplineTeacherFilterValue = computed(() => disciplines.disciplineTeacherFilter.value);
const disciplineCardItemsValue = computed(() => disciplines.disciplineCardItems.value);
const disciplinesLoadingValue = computed(() => disciplines.disciplinesLoading.value);
const disciplinesByTeacherLoadingValue = computed(() => disciplines.disciplinesByTeacherLoading.value);
const disciplinesByAllTeachersLoadingValue = computed(() => disciplines.disciplinesByAllTeachersLoading.value);
const teacherFilterItemsValue = computed(() => disciplines.teacherFilterItems.value);

const auditSearchValue = computed(() => audit.auditSearch.value);
const auditActionFilterValue = computed(() => audit.auditActionFilter.value);
const auditDatePresetValue = computed(() => audit.auditDatePreset.value);
const auditLogValue = computed(() => audit.auditLog.value);
const auditLoadingValue = computed(() => audit.auditLoading.value);
const rollbackDialogValue = computed(() => audit.rollbackDialog.value);
const rollbackLoadingValue = computed(() => audit.rollbackLoading.value);
const rollbackSnackbarValue = computed(() => audit.rollbackSnackbar.value);

async function openDisciplineByName(item: AdminDisciplineCardItem) {
  const id = item.CodeRow;
  const isPlanRowId = typeof id === 'number' || (typeof id === 'string' && /^\d+$/.test(id));

  if (isPlanRowId) {
    router.push({
      name: 'discipline',
      params: { id: String(id) },
      query: { fromAdmin: '1', teacherFio: item.teacherFio || '' },
    });
    return;
  }

  // Нет planRowId (бэкенд disciplines-with-teachers не вернул его) — пробуем получить по ФИО и названию дисциплины
  const teacherFio = (item.teacherFio ?? '').trim();
  const disciplineName = (item.Discipline ?? '').trim();
  const lastName = teacherFio ? teacherFio.split(/\s+/)[0] : '';

  if (!lastName || !disciplineName) {
    router.push('/disciplines');
    return;
  }

  try {
    const raw = await getDisciplineCards(lastName, academicYear.value);
    const list = Array.isArray(raw) ? raw : raw?.data ?? raw?.cards ?? [];
    const card = list.find(
      (c: Record<string, unknown>) =>
        String(c?.disciplineName ?? c?.discipline_name ?? '').trim() === disciplineName
    );
    const planId = card ? Number(card?.planRowId ?? card?.plan_row_id ?? 0) : 0;
    if (planId > 0) {
      router.push({
        name: 'discipline',
        params: { id: String(planId) },
        query: { fromAdmin: '1', teacherFio: item.teacherFio || '' },
      });
    } else {
      router.push('/disciplines');
    }
  } catch {
    router.push('/disciplines');
  }
}

function onStaffSearchUpdate(v: string) {
  user.staffSearch.value = v;
  user.debouncedLoadTeachers();
}

function onDisciplineFilterUpdate(v: string | null) {
  disciplines.disciplineTeacherFilter.value = v;
  disciplines.onDisciplineTeacherFilterChange();
}

function onAuditSearchUpdate(v: string) {
  audit.auditSearch.value = v;
  audit.debouncedLoadAudit();
}

function onAuditActionFilterUpdate(v: string) {
  audit.auditActionFilter.value = v;
  audit.loadAuditLog();
}

function onAuditDatePresetUpdate(v: string) {
  audit.auditDatePreset.value = v;
  audit.onAuditDatePresetChange();
}

function onRollbackDialogUpdate(v: boolean) {
  audit.rollbackDialog.value = v;
}

function onRollbackSnackbarVisibleUpdate(v: boolean) {
  audit.rollbackSnackbar.value.visible = v;
}

watch(activeTab, (tab) => {
  if (tab === 'staff') user.loadTeachers();
  if (tab === 'disciplines') {
    disciplines.loadDisciplines();
    if (!user.teachers.value.length) user.loadTeachers();
    if (disciplines.disciplineTeacherFilter.value) {
      disciplines.loadDisciplinesByTeacher(disciplines.disciplineTeacherFilter.value);
    } else if (user.teachers.value.length > 0) {
      disciplines.loadDisciplinesForAllTeachers();
    }
  }
  if (tab === 'audit') audit.loadAuditLog();
});

onMounted(() => {
  if (!currentUser.value?.lastName) {
    router.push('/auth');
    return;
  }
  user.loadTeachers();
});
</script>

<style scoped>
.page {
  background: #f5f6f8;
  padding: 24px 28px 50px;
  min-height: 100%;
}

.admin-tabs {
  margin-top: 8px;
  margin-bottom: 0;
}

.admin-tabs :deep(.v-tab) {
  text-transform: none;
  font-weight: 600;
}

.admin-window {
  background: #fff;
  border-radius: 12px;
  padding: 24px;
  margin-top: 0;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.06);
  border: 1px solid #e5e7eb;
}
</style>
