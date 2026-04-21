<template>
  <v-container
    fluid
    class="page"
  >
    <etu-page-header
      icon="mdi-shield-outline"
      title="Администрирование"
      subtitle="Пользователи ИС, дисциплины кафедры, журнал событий"
      icon-color="#2563eb"
      icon-bg-color="#eff6ff"
    />

    <v-tabs
      v-model="activeTab"
      class="admin-tabs"
      bg-color="transparent"
    >
      <v-tab value="users">Сотрудники кафедры</v-tab>
      <v-tab value="disciplines">Дисциплины кафедры</v-tab>
      <v-tab value="audit">Журнал событий</v-tab>
    </v-tabs>

    <v-window
      v-model="activeTab"
      class="admin-window"
    >
      <v-window-item value="users">
        <user-tab />
      </v-window-item>

      <v-window-item value="disciplines">
        <disciplines-tab />
      </v-window-item>

      <v-window-item value="audit">
        <audit-tab />
      </v-window-item>
    </v-window>
  </v-container>
</template>

<script setup lang="ts">
  import { ref, watch, onMounted, provide } from 'vue';
  import { useRoute, useRouter } from 'vue-router';
  import { useUser } from '@/composables/useUser';
  import { useAcademicYear } from '@/composables/useAcademicYear';
  import { getDisciplineCards } from '@/api/info';
  import UserTab from './components/user/UserTab.vue';
  import DisciplinesTab from './components/disciplines/DisciplinesTab.vue';
  import AuditTab from './components/audit/AuditTab.vue';
  import { useAdminUsers } from './composables/useAdminUsers';
  import { useAdminDisciplines } from './composables/useAdminDisciplines';
  import { useAdminAudit } from './composables/useAdminAudit';
  import type { AdminDisciplineCardItem } from './model';
  import {
    adminAuditKey,
    adminDisciplinesKey,
    adminOpenDisciplineKey,
    adminUsersKey,
  } from './injectionKeys';

  const router = useRouter();
  const route = useRoute();
  const { academicYear } = useAcademicYear();
  const { user: currentUser } = useUser();

  type AdminTab = 'users' | 'disciplines' | 'audit';

  function parseAdminTabQuery(q: unknown): AdminTab | null {
    const raw = Array.isArray(q) ? q[0] : q;
    const t = typeof raw === 'string' ? raw : '';
    if (t === 'staff') {
      return 'users';
    }
    if (t === 'users' || t === 'disciplines' || t === 'audit') {
      return t;
    }
    return null;
  }

  const activeTab = ref<AdminTab>(
    parseAdminTabQuery(route.query.tab) ?? 'users'
  );
  const adminUsers = useAdminUsers();
  const disciplines = useAdminDisciplines(adminUsers.teachers);
  const audit = useAdminAudit();

  provide(adminUsersKey, adminUsers);
  provide(adminDisciplinesKey, disciplines);
  provide(adminAuditKey, audit);

  async function openDisciplineByName(item: AdminDisciplineCardItem) {
    const id = item.codeRow;
    const isPlanRowId =
      typeof id === 'number' || (typeof id === 'string' && /^\d+$/.test(id));

    if (isPlanRowId) {
      router.push({
        name: 'discipline',
        params: { id: String(id) },
        query: { fromAdmin: '1', teacherFio: item.teacherFio || '' },
      });
      return;
    }

    const teacherFio = (item.teacherFio ?? '').trim();
    const disciplineName = (item.discipline ?? '').trim();
    const lastName =
      item.teacherLastName?.trim() ||
      (teacherFio ? teacherFio.split(/\s+/)[0] : '');

    if (!lastName || !disciplineName) {
      router.push('/disciplines');
      return;
    }

    const cached = disciplines.disciplineCardItems.value.find(
      (c) =>
        (c.discipline ?? '').trim() === disciplineName &&
        (c.teacherFio ?? '').trim() === teacherFio
    );
    if (cached) {
      const pr =
        typeof cached.codeRow === 'number'
          ? cached.codeRow
          : Number(cached.codeRow);
      if (Number.isFinite(pr) && pr > 0) {
        router.push({
          name: 'discipline',
          params: { id: String(pr) },
          query: { fromAdmin: '1', teacherFio: item.teacherFio || '' },
        });
        return;
      }
    }

    try {
      const raw = await getDisciplineCards(lastName, academicYear.value);
      const list = Array.isArray(raw) ? raw : (raw?.data ?? raw?.cards ?? []);
      const card = list.find(
        (c: Record<string, unknown>) =>
          String(c?.disciplineName ?? c?.discipline_name ?? '').trim() ===
          disciplineName
      );
      const planId = card
        ? Number(card?.planRowId ?? card?.plan_row_id ?? 0)
        : 0;
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

  provide(adminOpenDisciplineKey, openDisciplineByName);

  async function loadAdminTabData(tab: AdminTab) {
    if (tab === 'users') {
      await adminUsers.loadTeachers();
    }
    if (tab === 'disciplines') {
      if (!adminUsers.teachers.value.length) {
        await adminUsers.loadTeachers();
      }
      if (disciplines.disciplineTeacherFilter.value) {
        await disciplines.loadDisciplinesByTeacher(
          disciplines.disciplineTeacherFilter.value
        );
      } else if (adminUsers.teachers.value.length > 0) {
        await disciplines.loadDisciplinesForAllTeachers();
      }
    }
    if (tab === 'audit') {
      await audit.loadAuditLog();
    }
  }

  watch(activeTab, (tab) => {
    void loadAdminTabData(tab);
  });

  watch(academicYear, () => {
    void loadAdminTabData(activeTab.value);
  });

  onMounted(async () => {
    if (!currentUser.value?.lastName) {
      router.push('/auth');
      return;
    }
    const tabFromUrl = parseAdminTabQuery(route.query.tab);
    if (tabFromUrl && tabFromUrl !== activeTab.value) {
      activeTab.value = tabFromUrl;
      return;
    }
    await loadAdminTabData(activeTab.value);
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

  @media (max-width: 599px) {
    .page {
      padding: 14px 12px 32px;
    }

    .admin-window {
      padding: 14px 12px 18px;
      border-radius: 10px;
    }
  }
</style>
