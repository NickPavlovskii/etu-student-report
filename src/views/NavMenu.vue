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
  import type { SideBarItem } from '@/components/sideBar/model';
  import logoUrl from '@/assets/logo.jpg';

  const { user } = useAuth();
  const router = useRouter();

  const isAdminRole = computed(() =>
    new Set([
      'администратор',
      'заведущий',
      'заведующий',
      'зам заведующего',
    ]).has(
      String(user.value?.position ?? '')
        .trim()
        .toLowerCase()
    )
  );

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
  ];
  const adminItems: SideBarItem[] = [
    {
      title: 'Настройки',
      name: 'settings',
      path: '/settings',
      mdiIcon: 'mdi-cog-outline',
    },
    {
      title: 'Администрирование',
      name: 'admin',
      path: '/admin',
      mdiIcon: 'mdi-shield-outline',
    },
  ];
  const sidebarItems = computed(() => {
    if (!isAdminRole.value) return baseItems;
    return [
      ...baseItems,
      { title: '', name: 'divider', path: '', divider: true },
      ...adminItems,
    ];
  });

  const drawerModel = defineModel<boolean>({ default: false });
  function onSelect(item: SideBarItem) {
    router.push(item.path);
  }
</script>
