<template>
  <etu-loading-page v-if="loading" />
  <v-container v-else fluid class="page">
    <v-card class="stats-card" elevation="0">
      <div class="header-top">
        <h2 class="page-title">
          Мои дисциплины
        </h2>
        <p class="subtitle">
          Обзор учебных дисциплин и текущего статуса работ
        </p>
      </div>
      <v-row dense>
        <v-col
          cols="12"
          sm="6"
          md="4"
        >
          <etu-stat-card
            icon="mdi-book-outline"
            title="Дисциплины"
            color="blue"
            :value="uniqueDisciplines.length"
          />
        </v-col>
        <v-col
          cols="12"
          sm="6"
          md="4"
        >
          <etu-stat-card
            icon="mdi-account-group-outline"
            title="Группы"
            color="purple"
            :value="totalGroups"
          />
        </v-col>
        <v-col
          cols="12"
          sm="6"
          md="4"
        >
          <etu-stat-card
            icon="mdi-file-upload-outline"
            title="Работ загружено"
            color="green"
            :value="`${totalWorksStats.uploaded} / ${totalWorksStats.total}`"
          />
        </v-col>
      </v-row>
    </v-card>

    <disciplines-filters
      v-model:search="search"
      v-model:semester="semester"
      :unique-semesters="uniqueSemesters"
      :check-all="checkAll"
      :indeterminate="indeterminate"
      :is-all-selected="isAllSelected"
      @check-all="handleCheckAll"
      @clear-all="clearAllSemesters"
    />

    <v-card
      class="cards-wrap"
      elevation="0"
    >
      <v-row dense>
        <v-col
          v-for="item in visibleDisciplines"
          :key="item._key ?? item.CodeRow"
          cols="12"
          md="4"
        >
          <discipline-card
            :item="item"
            @click="openDiscipline"
          />
        </v-col>
      </v-row>
    </v-card>
  </v-container>
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue';
import { useRouter } from 'vue-router';
import DisciplinesFilters from './components/Disciplinesfilters.vue';
import DisciplineCard from './components/DisciplineCard.vue';
import { useDisciplines } from './composables/UseDisciplines';
import { useSemesterFilter } from './composables/UseSemesterFilter';
import { useAcademicYear } from '@/composables/useAcademicYear';
import { useUser } from '@/composables/useUser';

const router = useRouter();
const { academicYear } = useAcademicYear();
const { user } = useUser();
const search = ref('');

const filteredRef = ref([]);
const {
  loading,
  loadData,
  uniqueDisciplines,
  uniqueSemesters,
  totalGroups,
  totalWorksStats,
} = useDisciplines(filteredRef);

const {
  semester,
  checkAll,
  indeterminate,
  isAllSelected,
  handleCheckAll,
  clearAllSemesters,
} = useSemesterFilter(uniqueSemesters);

const filteredDisciplines = computed(() =>
  uniqueDisciplines.value
    .filter((d) => d.educationForm && d.educationLevel)
    .filter((d) => !semester.value.length || semester.value.includes(d.Semester))
    .filter((d) => {
      const q = search.value.toLowerCase();
      return !q || d.Discipline.toLowerCase().includes(q);
    })
);

watch(filteredDisciplines, (val) => { filteredRef.value = val; }, { immediate: true });

const visibleDisciplines = computed(() =>
  filteredDisciplines.value.filter((d) => (d.groupsCount ?? 0) > 0)
);

onMounted(async () => {
  if (user.value?.lastName) {
    await loadData(user.value);
  } else {
    router.push('/auth');
  }
});

watch(academicYear, () => {
  if (user.value?.lastName) {
    loadData(user.value);
  }
});

function openDiscipline(planRowId) {
  router.push({ name: 'discipline', params: { id: String(planRowId) } });
}
</script>

<style scoped>
.page {
  background: #f5f6f8;
  height: 100%;
  padding: 24px 28px 40px;
}


.header-top {
  margin-bottom: 20px;
  padding: 0 4px;
}

.page-title {
  font-size: 26px;
  font-weight: 700;
  color: #111827;
  margin: 0 0 6px;
}

.subtitle {
  color: #6b7280;
  font-size: 14px;
  margin: 0;
}

.stats-card {
  background: #ffffff;
  border-radius: 16px;
  padding: 20px 24px;
  margin-bottom: 18px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.06);
  border: 1px solid #e5e7eb;
}

.cards-wrap {
  background: #f5f6f8;
  border-radius: 16px;
  padding: 20px 24px;
}
</style>
