<template>
  <el-card class="discipline-card">
    <div class="discipline-header">
      <div>
        <h3 class="title">{{ title }}</h3>
        <span class="year">{{ year }}</span>
      </div>
      <v-icon>mdi-chevron-right</v-icon>
    </div>

    <div class="status-row">
      <div class="status blue">
        <v-icon size="18">mdi-upload-outline</v-icon>
        Загружено
        <strong>{{ uploaded }}</strong>
      </div>

      <div class="status orange">
        <v-icon size="18">mdi-alert-circle-outline</v-icon>
        Проблем
        <strong>{{ problems }}</strong>
      </div>
    </div>

    <div class="progress">
      <div class="progress-label">
        Выполнение
        <span>{{ percent }}%</span>
      </div>
      <v-progress-linear
        :model-value="percent"
        height="6"
        color="primary"
        rounded
      />
    </div>

    <!-- Groups -->
    <div class="groups">
      <v-icon size="18">mdi-account-group-outline</v-icon>
      {{ groups }} группы
    </div>

    <div class="tags">
      <el-tag
        type="warning"
        effect="light"
      >
        Отсутствует: {{ missing }}
      </el-tag>
      <el-tag
        type="danger"
        effect="light"
      >
        Ошибки проверки: {{ errors }}
      </el-tag>
    </div>
  </el-card>
</template>

<script setup lang="ts">
  defineProps<{
    title: string;
    year: string;
    uploaded: string;
    problems: number;
    percent: number;
    groups: number;
    missing: number;
    errors: number;
  }>();
</script>

<style scoped>
  .discipline-card {
    border-radius: 16px;
    transition: 0.25s;
  }

  .discipline-card:hover {
    transform: translateY(-4px);
    box-shadow: 0 12px 28px rgba(0, 0, 0, 0.08);
  }

  .discipline-header {
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
  }

  .title {
    font-size: 15px;
    margin: 0;
    font-weight: 600;
  }

  .year {
    font-size: 12px;
    color: #9ca3af;
  }

  .status-row {
    display: flex;
    gap: 12px;
    margin: 16px 0;
  }

  .status {
    flex: 1;
    padding: 10px 12px;
    border-radius: 10px;
    font-size: 13px;
    display: flex;
    align-items: center;
    gap: 6px;
  }

  .status.blue {
    background: #eff6ff;
    color: #2563eb;
  }

  .status.orange {
    background: #fff7ed;
    color: #ea580c;
  }

  .progress {
    margin-top: 8px;
  }

  .progress-label {
    display: flex;
    justify-content: space-between;
    font-size: 13px;
    margin-bottom: 6px;
  }

  .groups {
    margin: 12px 0;
    font-size: 13px;
    color: #6b7280;
    display: flex;
    align-items: center;
    gap: 6px;
  }

  .tags {
    display: flex;
    gap: 8px;
    flex-wrap: wrap;
  }
</style>
