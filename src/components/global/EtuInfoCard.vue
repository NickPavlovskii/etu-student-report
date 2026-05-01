<template>
  <v-card class="etu-info-card" elevation="0">
    <div class="info-inner">
      <div
        :class="['info-icon-wrap', color]"
      >
        <v-icon size="28" :icon="icon" />
      </div>
      <div class="info-text">
        <div class="info-title">{{ title }}</div>
        <div class="info-value">{{ displayValue }}</div>
        <div
          v-if="subtitle"
          class="info-subtitle"
        >
          {{ subtitle }}
        </div>
      </div>
    </div>
  </v-card>
</template>

<script setup lang="ts">
import { computed } from 'vue';

const props = withDefaults(
  defineProps<{
    title: string;
    value: string | number;
    icon: string;
    color?: 'blue' | 'green' | 'purple' | 'orange';
    subtitle?: string;
  }>(),
  { color: 'blue', subtitle: '' }
);

const displayValue = computed(() => String(props.value));
</script>

<style scoped>
.etu-info-card {
  background: #ffffff;
  border-radius: 16px;
  padding: 20px 24px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.06);
  border: 1px solid #e5e7eb;
}

.info-inner {
  display: flex;
  align-items: center;
  gap: 16px;
}

.info-icon-wrap {
  width: 48px;
  height: 48px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.info-icon-wrap.blue {
  background: #dbeafe;
  color: #2563eb;
}

.info-icon-wrap.green {
  background: #dcfce7;
  color: #16a34a;
}

.info-icon-wrap.purple {
  background: #ede9fe;
  color: #7c3aed;
}

.info-icon-wrap.orange {
  background: #ffedd5;
  color: #ea580c;
}

.info-title {
  font-size: 14px;
  color: #6b7280;
  margin-bottom: 4px;
}

.info-value {
  font-size: 22px;
  font-weight: 700;
  color: #111827;
}

.info-subtitle {
  margin-top: 6px;
  font-size: 13px;
  line-height: 1.35;
  color: #6b7280;
}
</style>
