<template>
  <v-card
    class="kpi-hero"
    elevation="0"
  >
    <div class="kpi-hero__icon">
      <v-icon
        size="32"
        color="primary"
      >
        mdi-upload-outline
      </v-icon>
    </div>
    <div class="kpi-hero__body">
      <div class="kpi-hero__title">Загружено работ</div>
      <div class="kpi-hero__value">
        {{ totalWorks }} из {{ expectedCount }}
      </div>
      <div class="kpi-hero__track">
        <div
          class="kpi-hero__fill"
          :style="{ width: pct + '%' }"
        />
      </div>
      <div class="kpi-hero__foot">{{ pct }}% от общего плана</div>
    </div>
  </v-card>
</template>

<script setup lang="ts">
  import { computed } from 'vue';

  const props = defineProps<{
    totalWorks: number;
    expectedCount: number;
  }>();

  const pct = computed(() => {
    if (props.expectedCount <= 0) return 0;
    return Math.min(
      100,
      Math.round((props.totalWorks / props.expectedCount) * 100)
    );
  });
</script>

<style scoped>
  .kpi-hero {
    display: flex;
    align-items: flex-start;
    gap: 20px;
    padding: 22px 24px;
    border-radius: 16px;
    border: 1px solid #e5e7eb;
    background: #fff;
    box-shadow: 0 1px 3px rgba(0, 0, 0, 0.06);
    margin-bottom: 22px;
  }
  .kpi-hero__icon {
    width: 56px;
    height: 56px;
    border-radius: 14px;
    background: #eff6ff;
    display: flex;
    align-items: center;
    justify-content: center;
    flex-shrink: 0;
  }
  .kpi-hero__title {
    font-size: 14px;
    color: #6b7280;
    margin-bottom: 4px;
  }
  .kpi-hero__value {
    font-size: 26px;
    font-weight: 700;
    color: #111827;
    margin-bottom: 12px;
  }
  .kpi-hero__track {
    height: 12px;
    background: #f3f4f6;
    border-radius: 6px;
    overflow: hidden;
    max-width: 420px;
  }
  .kpi-hero__fill {
    height: 100%;
    border-radius: 6px;
    background: linear-gradient(90deg, #818cf8, #6366f1);
    transition: width 0.4s ease;
  }
  .kpi-hero__foot {
    margin-top: 8px;
    font-size: 13px;
    color: #6b7280;
  }
</style>
