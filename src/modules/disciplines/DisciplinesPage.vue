<template>
  <etu-loading-page v-if="loading" />
  <v-container
    v-else
    fluid
    class="page"
  >
    <etu-page-header
      icon="mdi-view-grid-outline"
      title="Мои дисциплины"
      subtitle="Обзор учебных дисциплин и текущего статуса работ"
    >
      <template #right>
        <etu-segment-switcher
          v-model="semesterHalf"
          :options="semesterHalfOptions"
          aria-label="Полугодие семестра"
        />
      </template>
    </etu-page-header>

    <v-row
      dense
      class="info-cards-row"
    >
      <v-col
        cols="12"
        sm="6"
        md="4"
      >
        <etu-info-card
          title="Дисциплины"
          icon="mdi-book-outline"
          color="blue"
          :value="visibleDisciplines.length"
        />
      </v-col>
      <v-col
        cols="12"
        sm="6"
        md="4"
      >
        <etu-info-card
          title="Группы"
          icon="mdi-account-group-outline"
          color="purple"
          :value="totalGroups"
        />
      </v-col>
      <v-col
        cols="12"
        sm="6"
        md="4"
      >
        <etu-info-card
          title="Учебных работ загружено"
          icon="mdi-file-upload-outline"
          color="green"
          :value="`${totalWorksStats.uploaded} / ${totalWorksStats.total}`"
        />
      </v-col>
    </v-row>

    <disciplines-filters
      v-model:search="search"
      v-model:course="course"
      :unique-courses="uniqueCourses"
      @check-all="handleCheckAll"
      @clear-all="clearAllCourses"
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
            :item="disciplineCardItem(item)"
            @click="openDiscipline"
          />
        </v-col>
      </v-row>
    </v-card>
  </v-container>
</template>

<script setup lang="ts">
  import { ref, computed, onMounted, watch, type Ref } from 'vue';
  import { useRouter } from 'vue-router';
  import DisciplinesFilters from './components/Disciplinesfilters.vue';
  import DisciplineCard from './components/DisciplineCard.vue';
  import { useDisciplines } from './composables/useDisciplinesList';
  import { useCourseFilter } from './composables/UseCourseFilter';
  import { useAcademicYear } from '@/composables/useAcademicYear';
  import { useUser } from '@/composables/useUser';
  import {
    matchesStudyPeriod,
    parsePlanSemester,
  } from '@/modules/analytics/utils/analyticsScope';
  import { normTeacherLast } from '@/modules/disciplines/utils/disciplineTeacherAssignments';
  import type { StudyPeriod } from '@/api/types';
  import type { DisciplineListRow } from './modal/disciplineCard';

  const router = useRouter();
  const { academicYear } = useAcademicYear();
  const { user } = useUser();
  const search = ref('');
  const semesterHalf = ref<'autumn' | 'spring'>(currentCalendarSemesterHalf());

  const semesterHalfOptions = [
    { value: 'autumn', label: 'Осенний семестр' },
    { value: 'spring', label: 'Весенний семестр' },
  ] as const;

  function currentCalendarSemesterHalf(): 'autumn' | 'spring' {
    const m = new Date().getMonth() + 1;
    if (m >= 9 || m <= 1) return 'autumn';
    return 'spring';
  }
  const filteredRef = ref<DisciplineListRow[]>([]);
  const {
    loading,
    loadData,
    uniqueDisciplines,
    totalGroups,
    totalWorksStats,
  } = useDisciplines(filteredRef as Ref<unknown[]>);

  function disciplineInSemesterHalf(
    d: DisciplineListRow,
    half: 'autumn' | 'spring'
  ): boolean {
    const raw = d.Semester ?? d.semester;
    const n = parsePlanSemester(raw);
    if (n == null) return true;
    const period: StudyPeriod =
      half === 'autumn' ? 'autumn_semester' : 'spring_semester';
    return matchesStudyPeriod(n, period);
  }

  const disciplinesForHalf = computed(() =>
    (uniqueDisciplines.value as DisciplineListRow[])
      .filter((d) => d.educationForm && d.educationLevel)
      .filter((d) => disciplineInSemesterHalf(d, semesterHalf.value))
  );

  const uniqueCourses = computed(() => {
    const set = new Set<number | string>();
    for (const d of disciplinesForHalf.value) {
      const v = d.Course ?? d.course;
      if (v === null || v === undefined) continue;
      const s = String(v).trim();
      if (!s) continue;
      const n = Number(s);
      set.add(Number.isFinite(n) ? n : s);
    }
    return [...set].sort((a, b) => Number(a) - Number(b));
  });

  const { course, handleCheckAll, clearAllCourses } = useCourseFilter(uniqueCourses);

  watch(semesterHalf, () => {
    course.value = [...uniqueCourses.value];
  });

  const filteredDisciplines = computed(() =>
    disciplinesForHalf.value
      .filter((d) => {
        if (!course.value.length) return true;
        const v = d.Course ?? d.course;
        const n = Number(v);
        const key = Number.isFinite(n) ? n : String(v).trim();
        return course.value.includes(key);
      })
      .filter((d) => {
        const q = search.value.toLowerCase();
        return !q || d.Discipline.toLowerCase().includes(q);
      })
  );

  watch(
    filteredDisciplines,
    (val) => {
      filteredRef.value = val;
    },
    { immediate: true }
  );

  const visibleDisciplines = computed(() =>
    filteredDisciplines.value.filter((d) => (d.groupsCount ?? 0) > 0)
  );

  function disciplineCardItem(item: DisciplineListRow) {
    const { teacherFio: _omit, ...rest } = item;
    return rest;
  }

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

  function openDiscipline(payload: {
    codeRow: string | number;
    planTeacherLastNameForApi?: string;
    planTeacherFromPlanFio?: string;
  }) {
    const id = String(payload.codeRow);
    const viewer = (user.value?.lastName ?? '').trim();
    const apiLn = (payload.planTeacherLastNameForApi ?? '').trim();
    const query: Record<string, string> = {};
    if (
      apiLn &&
      viewer &&
      normTeacherLast(apiLn) !== normTeacherLast(viewer)
    ) {
      query.planTeacherLastName = apiLn;
      const fio = (payload.planTeacherFromPlanFio ?? '').trim();
      if (fio) {
        query.planTeacherFio = fio;
      }
    }
    router.push({
      name: 'discipline',
      params: { id },
      ...(Object.keys(query).length ? { query } : {}),
    });
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

  @media (max-width: 599px) {
    .page {
      padding: 14px 12px 28px;
    }
  }
</style>
