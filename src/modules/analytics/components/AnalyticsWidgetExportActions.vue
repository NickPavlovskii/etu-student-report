<template>
  <div class="analytics-export-actions">
    <v-tooltip
      v-if="showExcel"
      location="bottom"
      text="Скачать таблицу в Excel"
    >
      <template #activator="{ props: tip }">
        <v-btn
          v-bind="tip"
          icon
          variant="text"
          density="comfortable"
          aria-label="Скачать таблицу в Excel"
          @click="emit('exportExcel')"
        >
          <v-icon size="22" color="#15803d">mdi-microsoft-excel</v-icon>
        </v-btn>
      </template>
    </v-tooltip>
    <v-tooltip
      v-if="showChartPng"
      location="bottom"
      text="Скачать график как PNG"
    >
      <template #activator="{ props: tip }">
        <v-btn
          v-bind="tip"
          icon
          variant="text"
          density="comfortable"
          aria-label="Скачать график как PNG"
          @click="emit('exportChartPng')"
        >
          <v-icon size="22" color="#2563eb">mdi-file-image-outline</v-icon>
        </v-btn>
      </template>
    </v-tooltip>
  </div>
</template>

<script setup lang="ts">
  import { computed } from 'vue';

  const props = defineProps<{
    chartPngDisabled?: boolean;
  }>();

  const showExcel = computed(
    () => props.chartPngDisabled === undefined || props.chartPngDisabled !== false
  );
  const showChartPng = computed(
    () => props.chartPngDisabled === undefined || props.chartPngDisabled !== true
  );

  const emit = defineEmits<{
    exportExcel: [];
    exportChartPng: [];
  }>();
</script>

<style scoped>
  .analytics-export-actions {
    display: inline-flex;
    align-items: center;
    gap: 0;
  }
</style>
