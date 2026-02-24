<template>
  <v-app>
    <component
      :is="getLayout"
      class="page"
    />
  </v-app>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { useRoute } from 'vue-router';
import TheDefault from '@/layouts/TheDefault.vue';
import TheMain from '@/layouts/TheMain.vue';

const route = useRoute();

const getLayout = computed(() => {
  const layouts = {
    default: TheDefault,
    main: TheMain,
  };
  return layouts[(route.meta.layout as keyof typeof layouts) || 'default'] ?? layouts.default;
});
</script>
