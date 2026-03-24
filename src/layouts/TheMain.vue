<template>
  <nav-menu v-model="drawer" />
  <app-header @toggle-drawer="drawer = !drawer" />
  <v-main class="main-fill">
    <div class="content-wrap">
      <router-view />
    </div>
  </v-main>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import NavMenu from '@/views/NavMenu.vue';
import AppHeader from '@/components/sideBar/AppHeader.vue';

const drawer = ref(false);
</script>

<style scoped>
.main-fill {
  overflow: hidden;
  height: calc(100vh - 64px);
  flex: 1 1 auto;
  min-height: 0;
  display: flex;
  flex-direction: column;
}
.content-wrap {
  flex: 1;
  min-height: 0;
  overflow: hidden;
  display: flex;
  flex-direction: column;
}
.content-wrap > *:not(.loading-page):not(.page-loading) {
  flex: 1;
  min-height: 0;
  overflow-y: auto;
  overflow-x: hidden;
}
</style>

<style>
.v-application__wrap {
  height: 100vh;
  overflow: hidden;
  display: flex;
  flex-direction: column;
}
.v-app-bar {
  flex-shrink: 0;
}
</style>
