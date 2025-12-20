<template>
  <el-card
    class="stat-card"
    :class="color"
  >
    <div class="stat-content">
      <div class="stat-icon">
        <v-icon size="26">{{ icon }}</v-icon>
      </div>
      <div>
        <div class="stat-title">{{ title }}</div>
        <div class="stat-value">{{ value }}</div>
      </div>
    </div>
  </el-card>
</template>

<script setup lang="ts">
  defineProps<{
    title: string;
    value: string | number;
    icon: string;
    color: 'blue' | 'green' | 'purple' | 'orange';
  }>();
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
  }
  .stat-card.blue {
    background: #eaf2ff;
  }
  .stat-card.green {
    background: #ecfdf3;
  }
  .stat-card.purple {
    background: #f5f0ff;
  }
  .stat-card.orange {
    background: #fff4e5;
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
</style>
