<script setup lang="ts">
import { ref } from 'vue'
import AppHeader from './components/AppHeader.vue'
import AppDrawer from './components/AppDrawer.vue'

const drawer = ref(false)
</script>

<template>
<v-app>
  <AppDrawer v-model="drawer" />
  <AppHeader @toggle-drawer="drawer = !drawer" />
  <v-main>
    <router-view />
  </v-main>
</v-app>

</template>
