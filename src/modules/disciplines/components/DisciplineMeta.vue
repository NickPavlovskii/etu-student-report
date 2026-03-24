<template>
  <div class="meta">
    <span>
      <v-icon size="16">mdi-calendar-outline</v-icon>
      Курс: {{ discipline.Course }}, Семестр: {{ discipline.Semester }}
    </span>
    <span>
      <v-icon size="16">mdi-file-document-outline</v-icon>
      Оценивание: {{ discipline.Assessment }}
    </span>
    <span v-if="discipline.EducationLevel">
      <v-icon size="16">mdi-school-outline</v-icon>
      {{ discipline.EducationLevel }}
    </span>
    <span v-if="discipline.EducationForm">
      <v-icon size="16">mdi-account-school-outline</v-icon>
      {{ discipline.EducationForm }}
    </span>
  </div>
</template>

<script setup lang="ts">
defineProps<{
  discipline: {
    Course: number | string | null;
    Semester: number | string | null;
    Assessment: string;
    EducationLevel?: string | null;
    EducationForm?: string | null;
  };
}>();
</script>

<style scoped>
.meta {
  display: flex;
  gap: 16px;
  font-size: 13px;
  color: #6b7280;
  flex-wrap: wrap;
}
</style>
