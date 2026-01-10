<template>
  <v-card
    class="discipline-card"
    elevation="0"
    @click="$emit('open', item.CodeRow)"
  >
    <div class="card-header">
      <div class="card-header-text">
        <div class="card-title text-truncate">{{ cleanTitle }}</div>
        <div class="card-year">
          Курс: {{ item.Course }}, Семестр: {{ item.Semester }}
        </div>
      </div>
      <v-icon>mdi-chevron-right</v-icon>
    </div>

    <div class="card-stats">
      <stat-chip
        icon="mdi-file-outline"
        color="blue"
      >
        Загружено: {{ item.loaded }}
      </stat-chip>
      <stat-chip
        icon="mdi-alert-outline"
        color="orange"
      >
        Проблем: {{ item.issues }}
      </stat-chip>
    </div>

    <div class="progress">
      <div class="progress-label">
        <span>Выполнение</span>
        <span>{{ item.progress }}%</span>
      </div>
      <v-progress-linear
        :model-value="item.progress"
        height="6"
        rounded
        :color="item.progress === 100 ? 'green' : 'primary'"
      />
    </div>

    <div class="card-footer">
      <v-icon size="16">mdi-account-group-outline</v-icon>
      {{ item.groupsCount }}
    </div>
  </v-card>
</template>

<script setup>
  import { computed } from 'vue';
  const props = defineProps({ item: Object });

  const cleanTitle = computed(() => props.item.Discipline.replace(/"/g, ''));
</script>

<style scoped>
  .discipline-card {
    border-radius: 18px;
    padding: 18px;
    background: #ffffff;
    box-shadow: 0 10px 30px rgba(15, 23, 42, 0.06);
    transition: 0.25s;
    cursor: pointer;
  }

  .discipline-card:hover {
    transform: translateY(-4px);
    box-shadow: 0 18px 42px rgba(15, 23, 42, 0.12);
  }

  .card-header {
    width: 96%;
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 12px;
  }

  .card-title {
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
    display: block;
    font-weight: 600;
  }

  .card-year {
    font-size: 12px;
    color: #6b7280;
  }

  .card-stats {
    display: flex;
    gap: 8px;
    margin-bottom: 12px;
  }

  .progress {
    margin-bottom: 12px;
  }

  .progress-label {
    display: flex;
    justify-content: space-between;
    font-size: 12px;
    margin-bottom: 4px;
  }

  .card-footer {
    display: flex;
    justify-content: space-between;
    align-items: center;
    font-size: 12px;
    color: #6b7280;
  }

  .tags {
    display: flex;
    gap: 6px;
  }
</style>
