<template>
  <etu-loading-page v-if="loading" />
  <v-container v-else fluid class="page">
    <etu-page-header
      icon="mdi-view-grid-outline"
      title="Мои дисциплины"
      subtitle="Обзор учебных дисциплин и текущего статуса работ"
    >
      <template #right>
        <semester-half-switcher
          v-model="semesterHalf"
        />
      </template>
    </etu-page-header>

    <v-row dense class="info-cards-row">
      <v-col cols="12" sm="6" md="4">
        <etu-info-card
          title="Дисциплины"
          :value="uniqueDisciplines.length"
          icon="mdi-book-outline"
          color="blue"
        />
      </v-col>
      <v-col cols="12" sm="6" md="4">
        <etu-info-card
          title="Группы"
          :value="totalGroups"
          icon="mdi-account-group-outline"
          color="purple"
        />
      </v-col>
      <v-col cols="12" sm="6" md="4">
        <etu-info-card
          title="Работ загружено"
          :value="`${totalWorksStats.uploaded} / ${totalWorksStats.total}`"
          icon="mdi-file-upload-outline"
          color="green"
        />
      </v-col>
    </v-row>

    <disciplines-filters
      v-model:search="search"
      v-model:semester="semester"
      :unique-semesters="semestersForHalf"
      :check-all="checkAll"
      :indeterminate="indeterminate"
      :is-all-selected="isAllSelected"
      @check-all="handleCheckAll"
      @clear-all="clearAllSemesters"
    />

    <v-card class="cards-wrap" elevation="0">
      <v-row dense>
        <v-col
          v-for="item in visibleDisciplines"
          :key="item._key ?? item.CodeRow"
          cols="12"
          md="4"
        >
          <etu-discipline-card
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
import SemesterHalfSwitcher from './components/SemesterHalfSwitcher.vue';
import { useDisciplines } from './composables/UseDisciplines';
import { useSemesterFilter } from './composables/UseSemesterFilter';
import { useAcademicYear } from '@/composables/useAcademicYear';
import { useUser } from '@/composables/useUser';

const router = useRouter();
const { academicYear } = useAcademicYear();
const { user } = useUser();
const search = ref('');

/** Текущая половина года: осень = нечётные семестры (1,3,5,7), весна = чётные (2,4,6,8). Сентябрь–январь = осень, февраль–июль = весна. */
function defaultSemesterHalf() {
  const month = new Date().getMonth();
  return month >= 1 && month <= 6 ? 'spring' : 'autumn';
}
const semesterHalf = ref(defaultSemesterHalf());

const filteredRef = ref([]);
const {
  loading,
  loadData,
  uniqueDisciplines,
  uniqueSemesters,
  totalGroups,
  totalWorksStats,
} = useDisciplines(filteredRef);

/** Семестры, соответствующие выбранной половине года (только нечётные или только чётные). */
const semestersForHalf = computed(() => {
  const list = uniqueSemesters.value;
  const odd = semesterHalf.value === 'autumn';
  return list.filter((s) => {
    const n = Number(s);
    if (Number.isNaN(n)) return true;
    return odd ? n % 2 === 1 : n % 2 === 0;
  });
});

const {
  semester,
  checkAll,
  indeterminate,
  isAllSelected,
  handleCheckAll,
  clearAllSemesters,
} = useSemesterFilter(computed(() => semestersForHalf.value));

const filteredDisciplines = computed(() =>
  uniqueDisciplines.value
    .filter((d) => d.educationForm && d.educationLevel)
    .filter((d) => {
      const s = Number(d.Semester);
      if (!Number.isNaN(s)) {
        const odd = semesterHalf.value === 'autumn';
        if (odd && s % 2 !== 1) return false;
        if (!odd && s % 2 !== 0) return false;
      }
      return true;
    })
    .filter((d) => !semester.value.length || semester.value.includes(d.Semester))
    .filter((d) => {
      const q = search.value.toLowerCase();
      return !q || d.Discipline.toLowerCase().includes(q);
    })
);

watch(filteredDisciplines, (val) => { filteredRef.value = val; }, { immediate: true });

watch(semesterHalf, () => {
  semester.value = [...semestersForHalf.value];
});

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

.info-cards-row {
  margin-bottom: 18px;
}

.info-cards-row .v-col {
  margin-bottom: 0;
}

.cards-wrap {
  background: transparent;
  border-radius: 0;
  padding: 0;
  box-shadow: none;
  border: none;
}
</style>
