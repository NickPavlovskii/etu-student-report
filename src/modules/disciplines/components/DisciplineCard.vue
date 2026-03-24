<template>
  <v-card
    class="discipline-card"
    elevation="0"
    @click="$emit('click', card.codeRow)"
  >
    <div class="card-header">
      <div class="card-header-inner">
        <div class="card-title">
          {{ sanitizeTitle(card.discipline) }}
        </div>
        <div class="card-year">
          Курс: {{ card.course }}, Семестр: {{ card.semester }}
        </div>
        <div
          v-if="card.teacherFio"
          class="card-teacher"
        >
          <v-icon
            size="14"
            class="card-teacher-icon"
          >
            mdi-account-outline
          </v-icon>
          <span class="card-teacher-name">{{ card.teacherFio }}</span>
        </div>
        <div
          v-if="card.educationForm || card.educationLevel"
          class="card-meta"
        >
          <v-icon
            size="18"
            class="card-meta-icon"
          >
            {{ disciplineIcon }}
          </v-icon>
          <span v-if="card.educationLevel">
            {{ card.educationLevel }}
          </span>
          <span v-if="card.educationForm">
            {{ card.educationForm }}
          </span>
        </div>
      </div>
      <v-icon
        class="card-header-chevron"
        size="22"
      >
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
        Загружено: {{ card.loaded }}
      </v-chip>
    </div>

    <div class="progress">
      <div class="progress-label">
        <span>Выполнение</span>
        <span>{{ card.progress }}%</span>
      </div>
      <v-progress-linear
        height="6"
        rounded
        :model-value="card.progress"
        :color="progressColor"
      />
    </div>

    <div class="card-footer">
      <div class="card-footer-groups">
        <span class="card-footer-count">
          <v-icon size="16">mdi-account-group-outline</v-icon>
          {{ card.groupsCount }}
        </span>
        <div
          v-if="card.groups?.length"
          class="card-footer-chips"
        >
          <v-chip
            v-for="group in card.groups"
            :key="group"
            size="x-small"
            variant="tonal"
            color="grey"
            class="group-chip"
          >
            {{ formatGroupDisplay(group) }}
          </v-chip>
        </div>
      </div>
    </div>
  </v-card>
</template>

<script setup lang="ts">
  import { computed } from 'vue';
  import { sanitizeTitle } from '@/utils/sanitizeTitle';

  const props = defineProps<{
    item: Record<string, unknown>;
  }>();

  defineEmits<{ click: [codeRow: string | number] }>();

  const card = computed(() => {
    const i = props.item;
    return {
      codeRow: (i.codeRow ?? i.CodeRow) as string | number,
      discipline: String(i.discipline ?? i.Discipline ?? ''),
      course: (i.course ?? i.Course ?? '—') as string | number,
      semester: (i.semester ?? i.Semester ?? '—') as string | number,
      teacherFio: i.teacherFio as string | undefined,
      educationLevel: i.educationLevel as string | undefined,
      educationForm: i.educationForm as string | undefined,
      loaded: i.loaded as number | string,
      progress: Number(i.progress ?? 0),
      groupsCount: Number(i.groupsCount ?? 0),
      groups: (Array.isArray(i.groups) ? i.groups : []) as string[],
    };
  });

  function formatGroupDisplay(group: unknown): string {
    const s = String(group ?? '').trim();
    if (s.length === 3 && /^\d{3}$/.test(s)) {
      return '0' + s;
    }
    return s || String(group);
  }

  const progressColor = computed(() =>
    card.value.progress === 100 ? 'green' : 'primary'
  );

  const disciplineIcon = computed(() => {
    const level = String(card.value.educationLevel ?? '').toLowerCase();
    if (level.includes('магистр')) {
      return 'mdi-school';
    }
    if (level.includes('бакалавр') || level.includes('бакалавриат')) {
      return 'mdi-school-outline';
    }

    const form = String(card.value.educationForm ?? '').toLowerCase();
    if (form.includes('очн') || form.includes('заочн')) {
      return 'mdi-book-open-page-variant-outline';
    }
    return 'mdi-book-education-outline';
  });
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
    align-items: flex-start;
    gap: 8px;
    margin-bottom: 12px;
  }
  .card-header-chevron {
    flex-shrink: 0;
    margin-top: 2px;
    color: #9ca3af !important;
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
    transition: color 0.2s ease;
  }
  .discipline-card:hover .card-title {
    color: #2563eb;
  }
  .card-year {
    font-size: 12px;
    color: #6b7280;
  }

  .card-teacher {
    display: flex;
    align-items: center;
    gap: 6px;
    margin-top: 6px;
    width: 100%;
  }
  .card-teacher-icon {
    color: #9ca3af;
    flex-shrink: 0;
  }
  .card-teacher-name {
    font-family:
      'Segoe UI',
      system-ui,
      -apple-system,
      'Helvetica Neue',
      Helvetica,
      Arial,
      sans-serif;
    font-size: 13px;
    font-weight: 600;
    letter-spacing: 0.02em;
    line-height: 1.35;
    color: #0f172a;
    font-feature-settings: 'kern' 1;
  }
  .card-meta {
    display: flex;
    align-items: center;
    flex-wrap: wrap;
    gap: 6px;
    font-size: 11px;
    color: #9ca3af;
    margin-top: 4px;
    width: 100%;
  }
  .card-meta-icon {
    color: #9ca3af;
    flex-shrink: 0;
  }
  .card-meta span + span::before {
    content: ' · ';
    margin-right: 2px;
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
    align-items: center;
    font-size: 12px;
    color: #6b7280;
  }
  .card-footer-groups {
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    gap: 8px;
    width: 100%;
  }
  .card-footer-count {
    display: inline-flex;
    align-items: center;
    gap: 4px;
    flex-shrink: 0;
  }
  .card-footer-chips {
    display: flex;
    flex-wrap: wrap;
    gap: 6px;
  }
  .group-chip {
    font-size: 11px;
  }
</style>
