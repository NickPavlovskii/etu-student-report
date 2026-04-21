<template>
  <etu-side-bar
    v-model="drawerModel"
    temporary
    title="ИС «Отчеты»"
    :logo-src="logoUrl"
    :items="sidebarItems"
    @select="onSelect"
  />
</template>

<script setup lang="ts">
  import { computed } from 'vue';
  import { useRouter } from 'vue-router';
  import EtuSideBar from '@/components/sideBar/EtuSideBar.vue';
  import { useAuth } from '@/composables/useAuth';
  import { usePhoneLayout } from '@/composables/usePhoneLayout';
  import type { SideBarItem } from '@/components/sideBar/model';
  import logoUrl from '@/assets/logo.jpg';

  const { user } = useAuth();
  const router = useRouter();
  const { isPhone } = usePhoneLayout();

  const isAdminRole = computed(() => {
    const role = String(user.value?.role ?? '').toUpperCase();
    return role.split(',').map((r) => r.trim()).includes('ADMIN');
  });

  const baseItems: SideBarItem[] = [
    {
      title: 'Мои дисциплины',
      name: 'disciplines',
      path: '/disciplines',
      mdiIcon: 'mdi-view-grid-outline',
    },
    {
      title: 'Аналитика',
      name: 'analytics',
      path: '/analytics',
      mdiIcon: 'mdi-chart-line',
    },
    {
      title: 'Архив работ',
      name: 'archive',
      path: '/archive',
      mdiIcon: 'mdi-archive-outline',
    },
    {
      title: 'Настройки',
      name: 'settings',
      path: '/settings',
      mdiIcon: 'mdi-cog-outline',
    },
  ];
  const adminItems: SideBarItem[] = [
    {
      title: 'Администрирование',
      name: 'admin',
      path: '/admin',
      mdiIcon: 'mdi-shield-outline',
    },
  ];
  const sidebarItems = computed(() => {
    const base = isPhone.value
      ? baseItems.filter((i) => i.name !== 'analytics')
      : baseItems;
    if (!isAdminRole.value) return base;
    return [
      ...base,
      { title: '', name: 'divider', path: '', divider: true },
      ...adminItems,
    ];
  });

  const drawerModel = defineModel<boolean>({ default: false });
  function onSelect(item: SideBarItem) {
    router.push(item.path);
  }
</script>
