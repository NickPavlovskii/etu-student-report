<script setup lang="ts">
  import { ref } from 'vue';
  import { useRoute } from 'vue-router';
  import AppHeader from './components/AppHeader.vue';
  import AppDrawer from './components/AppDrawer.vue';

  const drawer = ref(false);
  const route = useRoute();

  const noDrawerRoutes = ['/', '/login'];
</script>

<template>
  <v-app>
    <AppDrawer
      v-if="!noDrawerRoutes.includes(route.path)"
      v-model="drawer"
    />
    <AppHeader
      v-if="!noDrawerRoutes.includes(route.path)"
      @toggle-drawer="drawer = !drawer"
    />
    <v-main>
      <router-view />
    </v-main>
  </v-app>
</template>
