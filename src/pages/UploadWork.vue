<template>
  <v-container
    fluid
    class="page"
  >
    <v-card
      class="page-header"
      elevation="0"
    >
      <div class="header-top">
        <div>
          <h2 class="page-title">Мои дисциплины</h2>
          <p class="subtitle">
            Обзор учебных дисциплин и текущего статуса работ
          </p>
        </div>
      </div>

      <v-row
        dense
        class="mt-4"
      >
        <v-col
          cols="12"
          sm="6"
          md="3"
        >
          <stat-card
            icon="mdi-book-outline"
            title="Дисциплины"
            color="blue"
            :value="uniqueDisciplines.length"
          />
        </v-col>
        <v-col
          cols="12"
          sm="6"
          md="3"
        >
          <stat-card
            icon="mdi-account-group-outline"
            title="Группы"
            :value="totalGroups"
            color="purple"
          />
        </v-col>
      </v-row>
    </v-card>
    <v-card
      class="filters"
      elevation="0"
    >
      <el-input
        v-model="search"
        placeholder="Поиск по названию дисциплины..."
        clearable
        class="search"
        :prefix-icon="Search"
      />
      <el-select
        v-model="semester"
        multiple
        clearable
        collapse-tags
        placeholder="Все семестры"
        popper-class="custom-header"
        :max-collapse-tags="1"
        style="width: 240px"
      >
        <template #header>
          <el-checkbox
            v-model="checkAll"
            :indeterminate="indeterminate"
            @change="handleCheckAll"
          >
            Все семестры
          </el-checkbox>
        </template>
        <template #tag>
          <el-tag
            v-if="isAllSelected"
            closable
            @close="clearAllSemesters"
          >
            Все семестры
          </el-tag>
        </template>

        <el-option
          v-for="s in uniqueSemesters"
          :key="s"
          :label="'Семестр ' + s"
          :value="s"
        />
      </el-select>
    </v-card>

    <v-row dense>
      <v-col
        v-for="item in filteredDisciplines"
        :key="item.CodeRow"
        cols="12"
        md="4"
      >
        <v-card
          class="discipline-card"
          elevation="0"
          @click="openDiscipline(item.CodeRow)"
        >
          <div class="card-header">
            <div>
              <div class="card-title">
                {{ item.Discipline.replace(/"/g, '') }}
              </div>
              <div class="card-year">
                Курс: {{ item.Course }}, Семестр: {{ item.Semester }}
              </div>
            </div>
            <v-icon>mdi-chevron-right</v-icon>
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
              Загружено: {{ item.loaded || '0 / 0' }}
            </v-chip>

            <v-chip
              color="orange"
              variant="tonal"
              size="small"
            >
              <v-icon
                start
                size="16"
              >
                mdi-alert-outline
              </v-icon>
              Проблем: {{ item.issues || 0 }}
            </v-chip>
          </div>

          <div class="progress">
            <div class="progress-label">
              <span>Выполнение</span>
              <span>{{ item.progress || 0 }}%</span>
            </div>
            <v-progress-linear
              :model-value="item.progress || 0"
              height="6"
              rounded
              :color="item.progress === 100 ? 'green' : 'primary'"
            />
          </div>

          <div class="card-footer">
            <span>
              <v-icon size="16">mdi-account-group-outline</v-icon>
              {{ countGroups(item) }}
            </span>
          </div>
        </v-card>
      </v-col>
    </v-row>
  </v-container>
</template>

<script setup>
  import { ref, computed, onMounted, watch } from 'vue';
  import { useRouter } from 'vue-router';
  import { Search } from '@element-plus/icons-vue';
  import disciplinesDB from '../db/db.json';
  const isAllSelected = computed(
    () =>
      semester.value.length === uniqueSemesters.value.length &&
      uniqueSemesters.value.length > 0
  );
  const clearAllSemesters = () => {
    semester.value = [];
    checkAll.value = false;
    indeterminate.value = false;
  };

  const router = useRouter();

  const search = ref('');
  const semester = ref([]);
  const checkAll = ref(false);
  const indeterminate = ref(false);

  const teacherName = localStorage.getItem('teacher');
  onMounted(() => {
    if (!teacherName) router.push('/');
  });

  const teacherDisciplines = computed(() =>
    disciplinesDB.filter((d) => d.LastName === teacherName)
  );

  const uniqueDisciplines = computed(() => {
    const map = new Map();

    teacherDisciplines.value.forEach((d) => {
      const key = `${d.Discipline}-${d.Course}-${d.Semester}`;
      if (!map.has(key)) {
        map.set(key, {
          ...d,
          loaded: `${Number(d.LectureHours) + Number(d.PracticeHours)} / ${
            Number(d.LectureHours) + Number(d.PracticeHours)
          }`,
          issues: 0,
          progress: 100,
        });
      }
    });

    return Array.from(map.values());
  });

  const uniqueSemesters = computed(() => {
    return [...new Set(uniqueDisciplines.value.map((d) => d.Semester))];
  });

  watch(
    uniqueSemesters,
    (val) => {
      if (val.length && semester.value.length === 0) {
        semester.value = [...val];
        checkAll.value = true;
      }
    },
    { immediate: true }
  );

  const handleCheckAll = (val) => {
    semester.value = val ? [...uniqueSemesters.value] : [];
    indeterminate.value = false;
  };

  watch(semester, (val) => {
    if (val.length === 0) {
      checkAll.value = false;
      indeterminate.value = false;
    } else if (val.length === uniqueSemesters.value.length) {
      checkAll.value = true;
      indeterminate.value = false;
    } else {
      checkAll.value = false;
      indeterminate.value = true;
    }
  });

  const filteredDisciplines = computed(() =>
    uniqueDisciplines.value
      .filter(
        (d) => !semester.value.length || semester.value.includes(d.Semester)
      )
      .filter(
        (d) =>
          !search.value ||
          d.Discipline.toLowerCase().includes(search.value.toLowerCase())
      )
  );

  const groupsByDiscipline = computed(() => {
    const map = {};

    teacherDisciplines.value.forEach((d) => {
      const key = `${d.Discipline}-${d.Course}-${d.Semester}`;
      if (!map[key]) map[key] = new Set();
      if (d.Group) map[key].add(d.Group);
    });

    return map;
  });

  const countGroups = (discipline) => {
    const key = `${discipline.Discipline}-${discipline.Course}-${discipline.Semester}`;
    return groupsByDiscipline.value[key]?.size || 0;
  };

  const totalGroups = computed(() => {
    const groups = new Set();
    teacherDisciplines.value.forEach((d) => d.Group && groups.add(d.Group));
    return groups.size;
  });

  const openDiscipline = (id) => {
    router.push(`/discipline/${id}`);
  };
</script>

<style scoped>
  .page {
    background: #f5f6f8;
    height: 100%;
  }

  .page-header {
    border-radius: 16px;
    padding: 24px;
  }

  .header-top {
    display: flex;
    justify-content: space-between;
    align-items: center;
  }

  .page-title {
    font-size: 26px;
    font-weight: 700;
  }

  .subtitle {
    color: #6b7280;
    font-size: 14px;
  }

  .filters {
    display: flex;
    gap: 12px;
    padding: 16px;
    margin: 16px 0;
    border-radius: 16px;
    background: #fff;
  }

  .search {
    flex: 1;
  }

  .filter {
    width: 200px;
  }

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
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 12px;
  }

  .card-title {
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
