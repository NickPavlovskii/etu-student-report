<template>
  <div
    class="the-main-layout"
    v-bind="$attrs"
  >
    <nav-menu v-model="drawer" />
    <app-header @toggle-drawer="drawer = !drawer" />
    <v-main class="main-fill">
      <div class="content-wrap">
        <router-view />
      </div>
    </v-main>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import NavMenu from '@/views/NavMenu.vue';
import AppHeader from '@/components/sideBar/AppHeader.vue';
import { refreshStoredUserRolesFromAuth } from '@/composables/refreshStoredUserRoles';

defineOptions({ inheritAttrs: false });

const drawer = ref(false);

onMounted(() => {
  void refreshStoredUserRolesFromAuth();
});
</script>

<style scoped>
.the-main-layout {
  display: flex;
  flex-direction: column;
  flex: 1 1 auto;
  min-height: 0;
  height: 100%;
}

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
