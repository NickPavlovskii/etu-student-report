<template>
  <etu-loading-page v-if="loading" />
  <v-container v-else fluid class="page">
    <etu-page-header
      icon="mdi-chart-line"
      title="Статистика и аналитика"
      :subtitle="pageSubtitle"
      icon-color="#6366f1"
      icon-bg-color="#eef2ff"
    />

    <div class="filters-row">
      <div class="range-btns">
        <button
          type="button"
          class="range-btn"
          :class="{ active: dateRange === 'week' }"
          @click="dateRange = 'week'"
        >
          Неделя
        </button>
        <button
          type="button"
          class="range-btn"
          :class="{ active: dateRange === 'month' }"
          @click="dateRange = 'month'"
        >
          Месяц
        </button>
        <button
          type="button"
          class="range-btn"
          :class="{ active: dateRange === 'all' }"
          @click="dateRange = 'all'"
        >
          Всё время
        </button>
      </div>
      <div v-if="dateRange === 'month'" class="month-year-row">
        <v-select
          v-model="selectedMonth"
          :items="monthOptions"
          item-title="label"
          item-value="value"
          density="compact"
          variant="outlined"
          hide-details
          class="filter-select"
          placeholder="Месяц"
        />
        <v-select
          v-model="selectedYear"
          :items="yearOptions"
          density="compact"
          variant="outlined"
          hide-details
          class="filter-select"
          placeholder="Год"
        />
      </div>
      <div v-if="canSeeAll" class="scope-toggle">
        <button
          type="button"
          class="scope-btn"
          :class="{ active: scopeMode === 'department' }"
          @click="scopeMode = 'department'"
        >
          По кафедре
        </button>
        <button
          type="button"
          class="scope-btn"
          :class="{ active: scopeMode === 'personal' }"
          @click="scopeMode = 'personal'"
        >
          Моя статистика
        </button>
      </div>
      <v-select
        v-if="showDepartmentStats"
        v-model="filterTeacher"
        :items="teacherOptions"
        item-title="title"
        item-value="value"
        density="compact"
        variant="outlined"
        hide-details
        class="filter-select"
        placeholder="Преподаватель"
      />
      <div class="view-toggle">
        <button
          type="button"
          class="view-btn"
          :class="{ active: viewMode === 'chart' }"
          @click="viewMode = 'chart'"
        >
          <v-icon size="18">mdi-chart-bar</v-icon>
          Графики
        </button>
        <button
          type="button"
          class="view-btn"
          :class="{ active: viewMode === 'table' }"
          @click="viewMode = 'table'"
        >
          <v-icon size="18">mdi-table</v-icon>
          Таблица
        </button>
      </div>
    </div>

    <v-alert v-if="error" type="error" variant="tonal" class="mb-4" closable>
      {{ error }}
    </v-alert>

    <template v-if="kpi">
      <v-row dense class="stats-row">
        <v-col cols="12" sm="6" md="3">
          <div class="stat-card stat-total">
            <div class="stat-icon"><v-icon size="28">mdi-file-document-multiple-outline</v-icon></div>
            <div class="stat-content">
              <div class="stat-title">Всего работ</div>
              <div class="stat-value">{{ kpi.totalWorks }}</div>
            </div>
          </div>
        </v-col>
        <v-col cols="12" sm="6" md="3">
          <div class="stat-card stat-secondary">
            <div class="stat-icon"><v-icon size="28">mdi-book-open-page-variant-outline</v-icon></div>
            <div class="stat-content">
              <div class="stat-title">{{ showDepartmentStats ? 'Преподавателей' : 'Дисциплин' }}</div>
              <div class="stat-value">{{ cardSecondaryCount }}</div>
            </div>
          </div>
        </v-col>
        <v-col cols="12" sm="6" md="3">
          <div class="stat-card stat-tertiary">
            <div class="stat-icon"><v-icon size="28">mdi-account-group-outline</v-icon></div>
            <div class="stat-content">
              <div class="stat-title">{{ showDepartmentStats ? 'Дисциплин' : 'Групп' }}</div>
              <div class="stat-value">{{ cardTertiaryCount }}</div>
            </div>
          </div>
        </v-col>
        <v-col cols="12" sm="6" md="3">
          <div class="stat-card stat-avg">
            <div class="stat-icon"><v-icon size="28">mdi-percent-outline</v-icon></div>
            <div class="stat-content">
              <div class="stat-title">Средний %</div>
              <div class="stat-value">{{ kpi.avgPercent }}%</div>
            </div>
          </div>
        </v-col>
      </v-row>

      <v-row dense>
        <v-col cols="12">
          <v-card class="chart-card" elevation="0">
            <h3 class="chart-title">Частые ошибки оформления</h3>
            <p class="chart-subtitle">Количество ошибок по категориям</p>
            <div v-if="frequentErrors.length" class="horizontal-bars">
              <div
                v-for="item in frequentErrors.slice(0, 8)"
                :key="item.category"
                class="hbar-row"
              >
                <span class="hbar-label">{{ item.category }}</span>
                <div class="hbar-track">
                  <div
                    class="hbar-fill"
                    :style="{ width: freqErrPct(item.count) + '%' }"
                  />
                </div>
                <span class="hbar-value">{{ item.count }}</span>
              </div>
            </div>
            <p v-else class="chart-empty">Нет данных</p>
          </v-card>
        </v-col>
      </v-row>

      <v-row v-if="viewMode === 'chart'" dense>
        <v-col cols="12" lg="6">
          <v-card class="chart-card" elevation="0">
            <h3 class="chart-title">Динамика загрузок</h3>
            <p class="chart-subtitle">Работы по месяцам</p>
            <div v-if="uploadDynamics.length" class="line-chart-wrap">
              <svg class="line-chart" viewBox="0 0 400 220" preserveAspectRatio="xMidYMid meet">
                <defs>
                  <line id="grid-y" x1="0" y1="0" x2="0" y2="180" stroke="#e5e7eb" stroke-width="1" />
                  <line id="grid-x" x1="0" y1="180" x2="400" y2="180" stroke="#e5e7eb" stroke-width="1" />
                </defs>
                <!-- Y grid -->
                <g v-for="i in 5" :key="'gy-' + i">
                  <line
                    :x1="40"
                    :y1="20 + (i - 1) * 40"
                    :x2="380"
                    :y2="20 + (i - 1) * 40"
                    stroke="#e5e7eb"
                    stroke-width="1"
                  />
                </g>
                <!-- X grid -->
                <g v-for="(_, i) in uploadDynamics" :key="'gx-' + i">
                  <line
                    :x1="40 + (i / Math.max(1, uploadDynamics.length - 1)) * 340"
                    :y1="20"
                    :x2="40 + (i / Math.max(1, uploadDynamics.length - 1)) * 340"
                    :y2="200"
                    stroke="#e5e7eb"
                    stroke-width="1"
                  />
                </g>
                <!-- Работы по месяцам -->
                <polyline
                  v-if="lineUploadedPath"
                  :points="lineUploadedPath"
                  fill="none"
                  stroke="#2563eb"
                  stroke-width="2.5"
                  stroke-linecap="round"
                  stroke-linejoin="round"
                />
                <g v-for="(p, i) in lineUploadedPoints" :key="'up-' + i">
                  <rect
                    :x="p.x - 4"
                    :y="p.y - 4"
                    width="8"
                    height="8"
                    fill="#2563eb"
                    stroke="white"
                    stroke-width="1.5"
                  />
                </g>
              </svg>
              <div class="line-chart-x-labels">
                <span v-for="item in uploadDynamics" :key="item.month" class="x-label">
                  {{ formatMonthShort(item.month) }}
                </span>
              </div>
            </div>
            <p v-else class="chart-empty">Нет данных</p>
          </v-card>
        </v-col>
        <v-col cols="12" lg="6">
          <v-card class="chart-card gauge-card" elevation="0">
            <h3 class="chart-title">Распределение соответствия</h3>
            <p class="chart-subtitle">По уровню соответствия</p>
            <div v-if="complianceBuckets.length" class="donut-wrap">
              <div class="donut-svg-wrap">
                <svg class="donut-chart" viewBox="0 0 120 120">
                  <g transform="translate(60, 60)">
                    <path
                      v-for="(seg, i) in donutSegments"
                      :key="seg.bucket"
                      :d="seg.path"
                      :fill="seg.color"
                      class="donut-segment"
                    />
                  </g>
                </svg>
              </div>
              <div class="donut-legend">
                <div v-for="b in sortedBuckets" :key="b.bucket" class="donut-legend-item">
                  <span class="donut-dot" :style="bucketColor(b.bucket)" />
                  <span>{{ b.bucket }}: {{ b.count }}</span>
                </div>
              </div>
            </div>
            <p v-else class="chart-empty">Нет данных</p>
          </v-card>
        </v-col>
      </v-row>

      <v-row v-if="viewMode === 'chart' && showDepartmentStats && teachersSummary.length" dense>
        <v-col cols="12">
          <v-card class="chart-card" elevation="0">
            <h3 class="chart-title">Статистика по преподавателям</h3>
            <p class="chart-subtitle">Нагрузка и % по шаблону</p>
            <v-table class="analytics-table teachers-table">
              <thead>
                <tr>
                  <th>ПРЕПОДАВАТЕЛЬ</th>
                  <th>ДИСЦИПЛИНЫ</th>
                  <th>ЗАГРУЖЕНО</th>
                  <th>ОЖИДАЛОСЬ</th>
                  <th>СРЕД. СООТВЕТСТВИЕ</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="row in teachersSummary" :key="teacherName(row)">
                  <td>
                    <div class="teacher-cell">
                      <div
                        class="teacher-avatar"
                        :style="{ background: avatarColor(teacherName(row)) }"
                      >
                        {{ initials(teacherName(row)) }}
                      </div>
                      <span>{{ teacherName(row) }}</span>
                    </div>
                  </td>
                  <td>{{ row.disciplinesCount ?? '—' }}</td>
                  <td>{{ row.uploadedCount ?? row.totalWorks ?? '—' }}</td>
                  <td>{{ row.expectedCount ?? '—' }}</td>
                  <td>
                    <div class="avg-compliance">
                      <div class="avg-bar-wrap">
                        <div
                          class="avg-bar-fill"
                          :class="{ 'avg-bar--green': row.avgPercent >= 80, 'avg-bar--orange': row.avgPercent < 80 }"
                          :style="{ width: row.avgPercent + '%' }"
                        />
                      </div>
                      <span class="avg-pct">{{ row.avgPercent }}%</span>
                    </div>
                  </td>
                </tr>
              </tbody>
            </v-table>
          </v-card>
        </v-col>
      </v-row>

      <v-row v-if="viewMode === 'table'" dense>
        <v-col cols="12">
          <v-card class="table-card" elevation="0">
            <h3 class="chart-title">{{ showDepartmentStats ? 'Статистика по преподавателям' : 'Статистика по группам' }}</h3>
            <p v-if="showDepartmentStats" class="chart-subtitle">Нагрузка и % по шаблону</p>
            <v-table v-if="showDepartmentStats && teachersSummary.length" class="analytics-table teachers-table">
              <thead>
                <tr>
                  <th>ПРЕПОДАВАТЕЛЬ</th>
                  <th>ДИСЦИПЛИНЫ</th>
                  <th>ЗАГРУЖЕНО</th>
                  <th>ОЖИДАЛОСЬ</th>
                  <th>СРЕД. СООТВЕТСТВИЕ</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="row in teachersSummary" :key="teacherName(row)">
                  <td>
                    <div class="teacher-cell">
                      <div
                        class="teacher-avatar"
                        :style="{ background: avatarColor(teacherName(row)) }"
                      >
                        {{ initials(teacherName(row)) }}
                      </div>
                      <span>{{ teacherName(row) }}</span>
                    </div>
                  </td>
                  <td>{{ row.disciplinesCount ?? '—' }}</td>
                  <td>{{ row.uploadedCount ?? row.totalWorks ?? '—' }}</td>
                  <td>{{ row.expectedCount ?? '—' }}</td>
                  <td>
                    <div class="avg-compliance">
                      <div class="avg-bar-wrap">
                        <div
                          class="avg-bar-fill"
                          :class="{ 'avg-bar--green': row.avgPercent >= 80, 'avg-bar--orange': row.avgPercent < 80 }"
                          :style="{ width: row.avgPercent + '%' }"
                        />
                      </div>
                      <span class="avg-pct">{{ row.avgPercent }}%</span>
                    </div>
                  </td>
                </tr>
              </tbody>
            </v-table>
            <v-table v-else-if="(!canSeeAll || !showDepartmentStats) && groupsTable.length" class="analytics-table">
              <thead>
                <tr>
                  <th>Группа</th>
                  <th>Дисциплина</th>
                  <th>Студентов</th>
                  <th>Загружено</th>
                  <th>Ожидалось</th>
                  <th>Ср. %</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="row in groupsTable" :key="row.groupName + row.disciplineName">
                  <td>{{ row.groupName }}</td>
                  <td>{{ row.disciplineName }}</td>
                  <td>{{ row.studentsCount }}</td>
                  <td>{{ row.uploaded }}</td>
                  <td>{{ row.expected }}</td>
                  <td>{{ row.avgPercent }}%</td>
                </tr>
              </tbody>
            </v-table>
            <p v-else class="chart-empty">Нет данных за выбранный период</p>
          </v-card>
        </v-col>
      </v-row>

      <v-row v-if="viewMode === 'table' && problematicGroups.length" dense>
        <v-col cols="12">
          <v-card class="table-card" elevation="0">
            <h3 class="chart-title">Проблемные группы</h3>
            <v-table class="analytics-table">
              <thead>
                <tr>
                  <th>Группа</th>
                  <th>Отчётов</th>
                  <th>Ср. %</th>
                  <th>Не прошли</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="row in problematicGroups" :key="row.groupName">
                  <td>{{ row.groupName }}</td>
                  <td>{{ row.reports }}</td>
                  <td>{{ row.avgPercent }}%</td>
                  <td>{{ row.invalidCount }}</td>
                </tr>
              </tbody>
            </v-table>
          </v-card>
        </v-col>
      </v-row>
    </template>
  </v-container>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { useUser } from '@/composables/useUser';
import { useAnalytics, type ViewMode, type ScopeMode } from './composables/useAnalytics';

const router = useRouter();
const { user, canSeeAll } = useUser();

const dateRange = ref<'week' | 'month' | 'all'>('month');
const selectedMonth = ref<number | null>(new Date().getMonth());
const selectedYear = ref<number | null>(new Date().getFullYear());
const filterTeacher = ref('');
const viewMode = ref<ViewMode>('chart');
const scopeMode = ref<ScopeMode>('department');

const {
  loading,
  error,
  loadAll,
  kpi,
  groupsTable,
  uploadDynamics,
  complianceBuckets,
  frequentErrors,
  problematicGroups,
  teachersList,
  teachersSummary,
  showDepartmentStats,
} = useAnalytics({
  dateRange,
  month: selectedMonth,
  year: selectedYear,
  teacherLastName: filterTeacher,
  scopeMode,
});

const monthOptions = [
  { value: 0, label: 'Январь' },
  { value: 1, label: 'Февраль' },
  { value: 2, label: 'Март' },
  { value: 3, label: 'Апрель' },
  { value: 4, label: 'Май' },
  { value: 5, label: 'Июнь' },
  { value: 6, label: 'Июль' },
  { value: 7, label: 'Август' },
  { value: 8, label: 'Сентябрь' },
  { value: 9, label: 'Октябрь' },
  { value: 10, label: 'Ноябрь' },
  { value: 11, label: 'Декабрь' },
];

const yearOptions = computed(() => {
  const y = new Date().getFullYear();
  return [y, y - 1, y - 2];
});

const pageSubtitle = computed(() => {
  if (showDepartmentStats.value) return 'Аналитика по кафедре';
  if (canSeeAll.value) return 'Ваша личная статистика';
  return 'Ваша статистика по загруженным отчётам';
});

const teacherOptions = computed(() => [
  { title: 'Все преподаватели', value: '' },
  ...teachersList.value.map((t) => ({ title: t, value: t })),
]);

const cardSecondaryCount = computed(() => {
  if (showDepartmentStats.value && teachersSummary.value.length)
    return teachersSummary.value.length;
  const groups = groupsTable.value;
  if (groups.length)
    return new Set(groups.map((r) => r.disciplineName)).size;
  return 0;
});

const cardTertiaryCount = computed(() => {
  if (showDepartmentStats.value && teachersSummary.value.length) {
    const sum = teachersSummary.value.reduce(
      (s, t) => s + (t.disciplinesCount ?? 0),
      0
    );
    return sum || teachersSummary.value.length;
  }
  const groups = groupsTable.value;
  if (groups.length) return new Set(groups.map((r) => r.groupName)).size;
  return 0;
});

function formatMonthShort(monthStr: string) {
  const parts = monthStr.split('-');
  const m = parts[1];
  if (!m) return '';
  const months = ['Янв', 'Фев', 'Мар', 'Апр', 'Май', 'Июн', 'Июл', 'Авг', 'Сен', 'Окт', 'Ноя', 'Дек'];
  return months[parseInt(m, 10) - 1] ?? '';
}

const chartPadding = { left: 40, right: 20, top: 20, bottom: 40 };
const chartW = 360;
const chartH = 180;

const lineUploadedPoints = computed(() => {
  const data = uploadDynamics.value;
  if (!data.length) return [] as { x: number; y: number }[];
  const maxVal = Math.max(1, ...data.map((d: { uploaded: number }) => d.uploaded));
  return data.map((d: { uploaded: number; checked: number }, i: number) => {
    const x = chartPadding.left + (i / Math.max(1, data.length - 1)) * chartW;
    const y = chartPadding.top + chartH - (d.uploaded / maxVal) * chartH;
    return { x, y };
  });
});

const lineUploadedPath = computed(() =>
  lineUploadedPoints.value.map((p: { x: number; y: number }) => `${p.x},${p.y}`).join(' ')
);

const sortedBuckets = computed(() => {
  const order = ['90-100', '70-89', '50-69', '<50'];
  const idx = (b: string) => {
    const norm = (b ?? '').replace('%', '');
    const i = order.indexOf(norm);
    return i >= 0 ? i : 99;
  };
  return [...complianceBuckets.value].sort(
    (a: { bucket: string; count: number }, b: { bucket: string; count: number }) => idx(a.bucket) - idx(b.bucket)
  );
});

function polarToCart(cx: number, cy: number, r: number, deg: number) {
  const rad = ((deg - 90) * Math.PI) / 180;
  return { x: cx + r * Math.cos(rad), y: cy + r * Math.sin(rad) };
}

function describeArc(
  cx: number,
  cy: number,
  r: number,
  startDeg: number,
  endDeg: number,
  sweep = 1
) {
  const start = polarToCart(cx, cy, r, startDeg);
  const end = polarToCart(cx, cy, r, endDeg);
  const diff = sweep > 0 ? endDeg - startDeg : startDeg - endDeg;
  const large = diff > 180 ? 1 : 0;
  return `M ${start.x} ${start.y} A ${r} ${r} 0 ${large} ${sweep} ${end.x} ${end.y}`;
}

const donutSegments = computed(() => {
  const buckets = sortedBuckets.value;
  if (!buckets.length || totalBucketCount.value === 0) return [];
  const cx = 0;
  const cy = 0;
  const ri = 35;
  const ro = 50;
  let startDeg = 0;
  const segments: { bucket: string; path: string; color: string }[] = [];
  for (const b of buckets) {
    const pct = bucketPct(b);
    const sweep = (pct / 100) * 360;
    const endDeg = startDeg + sweep;
    if (sweep < 0.1) {
      startDeg = endDeg;
      continue;
    }
    const path =
      describeArc(cx, cy, ro, startDeg, endDeg) +
      ' L ' +
      polarToCart(cx, cy, ri, endDeg).x +
      ' ' +
      polarToCart(cx, cy, ri, endDeg).y +
      ' ' +
      describeArc(cx, cy, ri, endDeg, startDeg, 0) +
      ' Z';
    segments.push({ bucket: b.bucket, path, color: bucketColorHex(b.bucket ?? '') });
    startDeg = endDeg;
  }
  return segments;
});

function bucketColorHex(bucket: string): string {
  const b = bucket ?? '';
  if (b.includes('90') || b.includes('100')) return '#16a34a';
  if (b.includes('70') || b.includes('89')) return '#f97316';
  if (b.includes('50') || b.includes('69')) return '#ef4444';
  return '#991b1b';
}

function initials(name: string) {
  if (!name) return '—';
  const parts = name.trim().split(/\s+/);
  if (parts.length >= 2 && parts[0] && parts[1])
    return (parts[0][0] + parts[1][0]).toUpperCase();
  return name.slice(0, 2).toUpperCase() || '—';
}

const avatarColors = ['#6366f1', '#8b5cf6', '#ec4899', '#0ea5e9'];
function avatarColor(name: string) {
  let h = 0;
  for (let i = 0; i < (name ?? '').length; i++) h += (name ?? '').charCodeAt(i);
  return avatarColors[Math.abs(h) % avatarColors.length];
}

function teacherName(row: { teacherFio?: string; teacherLastName?: string }) {
  return row.teacherFio ?? row.teacherLastName ?? '—';
}

const totalBucketCount = computed(() =>
  complianceBuckets.value.reduce((s, b) => s + b.count, 0)
);

function bucketPct(b: { bucket: string; count: number }) {
  if (totalBucketCount.value === 0) return 0;
  return (b.count / totalBucketCount.value) * 100;
}

function bucketColor(bucket: string): Record<string, string> {
  return { backgroundColor: bucketColorHex(bucket) };
}

const maxFreqErr = computed(() =>
  Math.max(1, ...frequentErrors.value.map((item: { count: number }) => item.count))
);

function freqErrPct(count: number) {
  return Math.min(100, (count / maxFreqErr.value) * 100);
}

onMounted(async () => {
  if (user.value?.lastName || canSeeAll.value) {
    await loadAll();
  } else {
    router.push('/auth');
  }
});
</script>

<style scoped>
.page {
  background: #f5f6f8;
  padding: 28px 30px 50px;
  min-height: 100%;
}

.filters-row {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 16px;
  margin-bottom: 24px;
}

.range-btns {
  display: flex;
  gap: 0;
  background: #e5e7eb;
  border-radius: 10px;
  padding: 2px;
}

.range-btn {
  padding: 8px 16px;
  border: none;
  background: transparent;
  font-size: 14px;
  font-weight: 500;
  color: #6b7280;
  cursor: pointer;
  border-radius: 8px;
  transition: all 0.2s;
}

.range-btn:hover { color: #374151; }
.range-btn.active { background: #111827; color: white; }

.scope-toggle {
  display: flex;
  gap: 0;
  background: #e5e7eb;
  border-radius: 10px;
  padding: 2px;
}
.scope-btn {
  padding: 8px 16px;
  border: none;
  background: transparent;
  font-size: 14px;
  font-weight: 500;
  color: #6b7280;
  cursor: pointer;
  border-radius: 8px;
  transition: all 0.2s;
}
.scope-btn:hover { color: #374151; }
.scope-btn.active { background: #111827; color: white; }

.month-year-row { display: flex; gap: 12px; }

.filter-select { max-width: 180px; }
.filter-select :deep(.v-field) { border-radius: 10px; background: white; }

.view-toggle {
  display: flex;
  gap: 0;
  background: #e5e7eb;
  border-radius: 10px;
  padding: 2px;
  margin-left: auto;
}

.view-btn {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 8px 16px;
  border: none;
  background: transparent;
  font-size: 14px;
  font-weight: 500;
  color: #6b7280;
  cursor: pointer;
  border-radius: 8px;
  transition: all 0.2s;
}

.view-btn:hover { color: #374151; }
.view-btn.active { background: #111827; color: white; }

.stats-row { margin-bottom: 24px; }

.stat-card {
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 20px;
  border-radius: 16px;
  background: white;
  border: 1px solid #e5e7eb;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.06);
  height: 100%;
}

.stat-icon {
  width: 48px;
  height: 48px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.stat-total .stat-icon { background: #eef2ff; color: #6366f1; }
.stat-secondary .stat-icon { background: #dbeafe; color: #2563eb; }
.stat-tertiary .stat-icon { background: #e0e7ff; color: #4f46e5; }
.stat-avg .stat-icon { background: #dcfce7; color: #16a34a; }

.stat-title { font-size: 13px; color: #6b7280; margin-bottom: 4px; }
.stat-value { font-size: 22px; font-weight: 700; color: #111827; }

.chart-card {
  padding: 20px;
  border-radius: 16px;
  border: 1px solid #e5e7eb;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.06);
  margin-bottom: 20px;
}

.chart-title { margin: 0 0 4px; font-size: 16px; font-weight: 600; color: #111827; }
.chart-subtitle { margin: 0 0 16px; font-size: 13px; color: #6b7280; }
.chart-empty { margin: 24px 0; color: #9ca3af; font-size: 14px; }

/* Line chart */
.line-chart-wrap { position: relative; }
.line-chart { width: 100%; height: 220px; display: block; }
.line-chart-legend {
  display: flex;
  gap: 24px;
  margin-top: 12px;
  padding-top: 12px;
  border-top: 1px solid #e5e7eb;
}
.legend-item { display: inline-flex; align-items: center; gap: 8px; font-size: 13px; color: #374151; }
.legend-mark { width: 12px; height: 12px; border-radius: 2px; }
.legend-mark--square { background: #2563eb; }
.legend-mark--circle { background: #16a34a; border-radius: 50%; }
.line-chart-x-labels {
  display: flex;
  justify-content: space-between;
  margin-top: 4px;
  padding-left: 40px;
  padding-right: 20px;
}
.x-label { font-size: 11px; color: #6b7280; }

/* Donut chart */
.gauge-card .donut-wrap { display: flex; gap: 24px; align-items: center; flex-wrap: wrap; }
.donut-svg-wrap {
  width: 180px;
  height: 180px;
  flex-shrink: 0;
}
.donut-chart {
  width: 100%;
  height: 100%;
  display: block;
}
.donut-segment {
  transition: opacity 0.2s;
}
.donut-segment:hover {
  opacity: 0.9;
}
.donut-legend { display: flex; flex-direction: column; gap: 8px; }
.donut-legend-item { display: flex; align-items: center; gap: 8px; font-size: 13px; }
.donut-dot { width: 12px; height: 12px; border-radius: 4px; flex-shrink: 0; }

/* Horizontal bar chart */
.horizontal-bars { display: flex; flex-direction: column; gap: 12px; }
.hbar-row { display: flex; align-items: center; gap: 12px; }
.hbar-label { flex: 0 0 120px; font-size: 13px; color: #374151; }
.hbar-track { flex: 1; height: 24px; background: #f3f4f6; border-radius: 6px; overflow: hidden; }
.hbar-fill { height: 100%; background: #2563eb; border-radius: 6px; transition: width 0.3s; }
.hbar-value { flex: 0 0 40px; font-size: 13px; font-weight: 600; color: #374151; text-align: right; }

/* Teachers table */
.teachers-table .teacher-cell { display: flex; align-items: center; gap: 12px; }
.teacher-avatar {
  width: 36px;
  height: 36px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-size: 12px;
  font-weight: 600;
  flex-shrink: 0;
}
.avg-compliance { display: flex; align-items: center; gap: 12px; }
.avg-bar-wrap { flex: 1; max-width: 120px; height: 8px; background: #f3f4f6; border-radius: 4px; overflow: hidden; }
.avg-bar-fill { height: 100%; border-radius: 4px; transition: width 0.3s; }
.avg-bar--green { background: #16a34a; }
.avg-bar--orange { background: #f97316; }
.avg-pct { font-size: 13px; font-weight: 600; color: #374151; min-width: 36px; }

.progress-list { display: flex; flex-direction: column; gap: 16px; }
.progress-item { display: flex; flex-direction: column; gap: 6px; }
.progress-header { display: flex; justify-content: space-between; align-items: center; }
.progress-label { font-size: 13px; color: #374151; font-weight: 500; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.progress-pct { font-size: 13px; font-weight: 600; color: #6366f1; }
.progress-track { height: 8px; background: #f3f4f6; border-radius: 4px; overflow: hidden; }
.progress-fill { height: 100%; background: linear-gradient(90deg, #6366f1, #8b5cf6); border-radius: 4px; transition: width 0.3s; }
.progress-fill--alt { background: linear-gradient(90deg, #0ea5e9, #06b6d4); }
.progress-meta { font-size: 11px; color: #9ca3af; }

.table-card {
  padding: 20px;
  border-radius: 16px;
  border: 1px solid #e5e7eb;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.06);
  margin-bottom: 20px;
}

.analytics-table { font-size: 14px; }
.analytics-table th { font-weight: 600; color: #374151; background: #f9fafb; }
.analytics-table td, .analytics-table th { padding: 12px 16px; }
</style>
