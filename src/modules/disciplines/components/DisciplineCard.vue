<template>
  <v-card
    class="discipline-card"
    elevation="0"
    @click="$emit('click', item.CodeRow)"
  >
    <div class="card-header">
      <div class="card-header-inner">
        <div class="card-title">
          {{ sanitizeTitle(item.Discipline) }}
        </div>
        <div class="card-year">
          Курс: {{ item.Course }}, Семестр: {{ item.Semester }}
        </div>
        <div
          v-if="item.educationForm || item.educationLevel"
          class="card-meta"
        >
          <span v-if="item.educationLevel">
            {{ item.educationLevel }}
          </span>
          <span v-if="item.educationForm">
            {{ item.educationForm }}
          </span>
        </div>
      </div>
      <v-icon>
        mdi-chevron-right
      </v-icon>
    </div>

    <div class="card-stats">
      <v-chip
        color="blue"
        variant="tonal"
        size="small"
      >
        <v-icon
          start
          size="16"
        >
        mdi-file-outline
      </v-icon>
        Загружено: {{ item.loaded }}
      </v-chip>
    </div>

    <div class="progress">
      <div class="progress-label">
        <span>
          Выполнение
        </span>
        <span>
          {{ item.progress }}%
        </span>
      </div>
      <v-progress-linear
        height="6"
        rounded
        :model-value="item.progress"
        :color="progressColor"
      />
    </div>

    <div class="card-footer">
      <span>
        <v-icon size="16">
          mdi-account-group-outline
        </v-icon>
        {{ item.groupsCount }}
      </span>
    </div>
  </v-card>
</template>

<script setup>
import { computed } from 'vue';
import { sanitizeTitle } from '../composables/UseDisciplines';

const props = defineProps({
  item: {
    type: Object,
    required: true,
  },
});

defineEmits(['click']);

const progressColor = computed(() =>
  props.item.progress === 100 ? 'green' : 'primary'
);
</script>

<style scoped>
.discipline-card {
  border-radius: 18px;
  padding: 18px;
  background: #ffffff;
  box-shadow: 0 2px 8px rgba(15, 23, 42, 0.06);
  border: 1px solid #e5e7eb;
  transition: 0.25s;
  cursor: pointer;
}
.discipline-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 12px 28px rgba(15, 23, 42, 0.12);
}
.card-header {
  width: 96%;
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
}
.card-header-inner {
  width: 100%;
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
.card-meta {
  font-size: 11px;
  color: #9ca3af;
  margin-top: 4px;
}
.card-meta span + span::before {
  content: ' · ';
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
</style>