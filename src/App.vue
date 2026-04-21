<template>
  <v-app>
    <Teleport to="body">
      <div
        v-if="apiLoading"
        class="global-axios-loader"
        aria-busy="true"
        aria-live="polite"
      >
        <etu-tea-loader
          overlay
          :loading="apiLoading"
          label="Загрузка данных…"
        />
      </div>
    </Teleport>
    <component
      :is="getLayout"
      class="page"
    />
  </v-app>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { useRoute } from 'vue-router';
import {
  axiosPendingCount,
  globalAxiosOverlaySuppressCount,
} from '@/api/axiosLoading';
import TheDefault from '@/layouts/TheDefault.vue';
import TheMain from '@/layouts/TheMain.vue';

const route = useRoute();

const apiLoading = computed(
  () =>
    axiosPendingCount.value > 0 &&
    globalAxiosOverlaySuppressCount.value === 0
);

const getLayout = computed(() => {
  const layouts = {
    default: TheDefault,
    main: TheMain,
  };
  return layouts[(route.meta.layout as keyof typeof layouts) || 'default'] ?? layouts.default;
});
</script>

<style scoped>
.global-axios-loader {
  position: fixed;
  inset: 0;
  z-index: 10050;
  pointer-events: auto;
}
</style>
