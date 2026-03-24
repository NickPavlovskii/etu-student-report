<template>
  <el-card :class="['stat-card', color]">
    <div class="stat-content">
      <div
        v-if="icon"
        class="stat-icon"
      >
        <v-icon size="26">{{ icon }}</v-icon>
      </div>
      <div>
        <div class="stat-title">{{ title }}</div>
        <div class="stat-value">{{ displayValue }}</div>
      </div>
    </div>
  </el-card>
</template>

<script setup lang="ts">
  import { computed } from 'vue';

  const props = withDefaults(
    defineProps<{
      title: string;
      value: string | number;
      icon?: string;
      color?: 'blue' | 'green' | 'purple' | 'orange' | 'gray';
      unit?: string;
    }>(),
    { color: 'blue' }
  );

  const displayValue = computed(() =>
    typeof props.value === 'number' && props.unit
      ? `${props.value} ${props.unit}`
      : props.value
  );
</script>

<style scoped>
  .stat-card {
    border-radius: 14px;
    border: none;
  }
  .stat-content {
    display: flex;
    gap: 14px;
    align-items: center;
  }
  .stat-icon {
    width: 42px;
    height: 42px;
    border-radius: 10px;
    display: flex;
    align-items: center;
    justify-content: center;
  }
  .stat-title {
    font-size: 13px;
    color: #6b7280;
  }
  .stat-value {
    font-size: 20px;
    font-weight: 700;
    color: #111827;
  }
  .stat-card.blue {
    background: #eaf2ff;
    border: 1px solid #bfdbfe;
  }
  .stat-card.green {
    background: #ecfdf3;
    border: 1px solid #bbf7d0;
  }
  .stat-card.purple {
    background: #f5f0ff;
    border: 1px solid #ddd6fe;
  }
  .stat-card.orange {
    background: #fff4e5;
    border: 1px solid #fed7aa;
  }
  .stat-card.blue .stat-icon {
    background: #dbeafe;
    color: #2563eb;
  }
  .stat-card.green .stat-icon {
    background: #dcfce7;
    color: #16a34a;
  }
  .stat-card.purple .stat-icon {
    background: #ede9fe;
    color: #7c3aed;
  }
  .stat-card.orange .stat-icon {
    background: #ffedd5;
    color: #ea580c;
  }
  .stat-card.gray {
    background: #f9fafb;
    border: 1px solid #e5e7eb;
  }
  .stat-card.gray .stat-icon {
    background: #f3f4f6;
    color: #6b7280;
  }
</style>
