<template>
  <v-container fluid>
    <!-- Заголовок и статистика -->
    <v-card class="pa-6 mb-6">
      <div class="text-h6 mb-1">Архив учебных работ</div>
      <div class="text-body-2 text-medium-emphasis mb-4">
        Централизованное хранилище всех учебных работ кафедры
      </div>

      <v-row dense>
        <v-col cols="12" md="3">
          <v-card class="pa-4" color="blue-lighten-5">
            <div class="text-caption">Всего работ</div>
            <div class="text-h5">{{ filteredReports.length }}</div>
          </v-card>
        </v-col>
        <v-col cols="12" md="3">
          <v-card class="pa-4" color="green-lighten-5">
            <div class="text-caption">Проверено</div>
            <div class="text-h5">
              {{ filteredReports.filter(r => r.status === 'checked').length }}
            </div>
          </v-card>
        </v-col>
        <v-col cols="12" md="3">
          <v-card class="pa-4" color="orange-lighten-5">
            <div class="text-caption">Требуют проверки</div>
            <div class="text-h5">
              {{ filteredReports.filter(r => r.status === 'pending').length }}
            </div>
          </v-card>
        </v-col>
        <v-col cols="12" md="3">
          <v-card class="pa-4" color="red-lighten-5">
            <div class="text-caption">С ошибками</div>
            <div class="text-h5">
              {{ filteredReports.filter(r => r.status === 'error').length }}
            </div>
          </v-card>
        </v-col>
      </v-row>
    </v-card>

    <!-- Фильтры -->
    <v-card class="pa-6 mb-4">
      <div class="text-subtitle-1 mb-4">Фильтры и поиск</div>
      <v-row dense>
        <v-col cols="12" md="6">
          <v-text-field
            v-model="search"
            label="Поиск по ФИО студента или теме"
            clearable
          />
        </v-col>
        <v-col cols="12" md="3">
          <v-select
            v-model="filterDiscipline"
            :items="disciplines"
            label="Все дисциплины"
            clearable
          />
        </v-col>
        <v-col cols="12" md="3">
          <v-select
            v-model="filterGroup"
            :items="groups"
            label="Все группы"
            clearable
          />
        </v-col>
      </v-row>
    </v-card>

    <!-- Таблица -->
    <v-card class="pa-6">
      <v-data-table
        :headers="headers"
        :items="filteredReportsBySearch"
        item-key="id"
        class="data-table"
        items-per-page="10"
      >
        <!-- Тип работы -->
        <template #item.workType="{ item }">
          <v-chip size="small" color="primary" variant="tonal">
            {{ item.workType }}
          </v-chip>
        </template>

        <!-- Проверка -->
        <template #item.check="{ item }">
          <div class="d-flex align-center" style="gap:4px;">
            <v-icon v-if="item.status === 'checked'" color="green" size="18">
              mdi-check-circle
            </v-icon>
            <v-icon v-else-if="item.status === 'error'" color="red" size="18">
              mdi-close-circle
            </v-icon>
            <v-icon v-else color="orange" size="18">
              mdi-clock-outline
            </v-icon>
            <span v-if="item.check !== null">{{ item.check }}%</span>
            <span v-else>—</span>
          </div>
        </template>

        <!-- Статус -->
        <template #item.status="{ item }">
          <v-chip size="small" :color="statusColor(item.status)" variant="tonal">
            {{ statusLabel(item.status) }}
          </v-chip>
        </template>

        <!-- Действия -->
        <template #item.actions="{ item }">
          <div class="d-flex align-center" style="gap:8px;">
            <v-btn
              size="small"
              variant="text"
              color="primary"
              @click="openReport(item)"
            >
              Открыть
            </v-btn>
            <v-btn
              icon
              size="small"
              variant="text"
              @click="download(item)"
            >
              <v-icon>mdi-download</v-icon>
            </v-btn>
          </div>
        </template>
      </v-data-table>
    </v-card>
  </v-container>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import { useReportsStorage } from '@/composables/useReportsStorage';
import { useAuth } from '@/composables/useAuth';
import type { Report } from '@/types/report';

const { user, isHead } = useAuth();
const { reports, loadReports } = useReportsStorage();
onMounted(loadReports);

// Фильтры
const search = ref('');
const filterDiscipline = ref('');
const filterGroup = ref('');

// Уникальные значения для селектов
const disciplines = computed(() =>
  Array.from(new Set(reports.value.map(r => r.discipline)))
);
const groups = computed(() =>
  Array.from(new Set(reports.value.map(r => r.group)))
);

// Нормализация статуса
const normalizedReports = computed<Report[]>(() =>
  reports.value.map((r) => ({
    ...r,
    status: r.check === null ? 'pending' : r.check >= 60 ? 'checked' : 'error',
  }))
);

// Фильтр по роли
const filteredReports = computed(() => {
  if (!user.value) return [];
  if (isHead.value) return normalizedReports.value;
  return normalizedReports.value.filter((r) => r.uploadedBy === user.value.lastName);
});

// Фильтр по поиску и селектам
const filteredReportsBySearch = computed(() => {
  return filteredReports.value.filter((r) => {
    const matchesSearch =
      search.value === '' ||
      r.workTitle.toLowerCase().includes(search.value.toLowerCase()) ||
      (r.studentName && r.studentName.toLowerCase().includes(search.value.toLowerCase()));
    const matchesDiscipline =
      filterDiscipline.value === '' || r.discipline === filterDiscipline.value;
    const matchesGroup = filterGroup.value === '' || r.group === filterGroup.value;
    return matchesSearch && matchesDiscipline && matchesGroup;
  });
});

// Таблица
const headers = [
  { title: 'Группа', key: 'group' },
  { title: 'Дисциплина', key: 'discipline' },
  { title: 'Тип работы', key: 'workType' },
  { title: 'Тема', key: 'topic' },
  { title: 'Дата загрузки', key: 'uploadDate' },
  { title: 'Версия', key: 'version' },
  { title: 'Проверка', key: 'check' },
  { title: 'Статус', key: 'status' },
  { title: '', key: 'actions', sortable: false },
];

const statusLabel = (s: string) =>
  ({
    checked: 'Проверено',
    pending: 'Отправлено',
    error: 'Ошибка',
  }[s] ?? '—');

const statusColor = (s: string) => (s === 'checked' ? 'green' : s === 'error' ? 'red' : 'blue');

const openReport = (report: Report) => console.log('Открыть', report);
const download = (report: Report) => console.log('Скачать', report);
</script>


<style scoped>
  .page {
    background: #f7f8fa;
  }

  .header-card .title {
    font-size: 20px;
    font-weight: 600;
  }

  .header-card .subtitle {
    color: #777;
    margin-top: 4px;
  }

  .data-table {
    border-radius: 12px;
  }
</style>

<style scoped>
  .page {
    background: #f5f7fb;
    min-height: 100vh;
  }

  .header-card,
  .filters-card,
  .table-card {
    border-radius: 16px;
    box-shadow: 0 10px 25px rgba(0, 0, 0, 0.04);
  }

  .title {
    font-size: 20px;
    font-weight: 600;
  }

  .subtitle {
    color: #6b7280;
  }

  /* ===== Статистика ===== */
  .stats-card {
    padding: 16px;
    border-radius: 14px;
  }
  .stats-title {
    font-size: 13px;
    color: #6b7280;
  }
  .stats-value {
    font-size: 28px;
    font-weight: 600;
  }

  .stats-card.blue {
    background: #eff6ff;
  }
  .stats-card.green {
    background: #ecfdf5;
  }
  .stats-card.orange {
    background: #fff7ed;
  }
  .stats-card.red {
    background: #fef2f2;
  }

  /* ===== Фильтры ===== */
  .filters-title {
    font-size: 16px;
    font-weight: 600;
    margin-bottom: 12px;
  }

  .count {
    font-size: 14px;
    color: #374151;
  }

  /* ===== Таблица ===== */
  .data-table {
    border-radius: 16px;
  }
  .v-data-table-header th {
    background: #f9fafb;
    font-weight: 600;
    font-size: 13px;
  }
  .v-data-table__tr:hover {
    background: #f3f4f6;
  }
</style>
