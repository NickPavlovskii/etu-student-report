<template>
  <v-container
    v-if="discipline"
    fluid
    class="page"
  >
    <!-- ===== Header ===== -->
    <v-card
      class="block"
      elevation="0"
    >
      <div class="top-row">
        <div>
          <v-btn
            variant="text"
            class="back-btn"
            prepend-icon="mdi-chevron-left"
            @click="goBack"
          >
            Вернуться к дисциплинам
          </v-btn>

          <!-- Название дисциплины -->
          <h2 class="title">{{ discipline.Discipline.replace(/"/g, '') }}</h2>

          <!-- Метаданные -->
          <div class="meta">
            <span>
              <v-icon size="16">mdi-calendar-outline</v-icon>
              Курс: {{ discipline.Course }}, Семестр: {{ discipline.Semester }}
            </span>
            <span>
              <v-icon size="16">mdi-file-document-outline</v-icon>
              Оценивание: {{ discipline.Assessment }}
            </span>
          </div>

          <!-- Темы -->
          <div
            class="types"
            v-if="topics.length"
          >
            <v-chip
              v-for="(topic, idx) in topics"
              :key="idx"
              size="small"
              variant="tonal"
              color="primary"
            >
              {{ topic }}
            </v-chip>
          </div>
        </div>

        <div class="actions">
          <etu-button
            title="Перейти в архив"
            :prepend-icon="ARCHIVE_ICON"
            color="#111827"
            :border-color="'#E5E7EB'"
            :bg-color="'white'"
            :border="true"
            width="auto"
            @click="goToArchive"
          />

          <etu-button
            title="Загрузить работу"
            :prepend-icon="PLUS_ICON"
            color="white"
            :bg-color="'#111827'"
            :border="false"
            width="auto"
            @click="uploadWork"
          />
        </div>
      </div>
    </v-card>

    <v-card
      class="block"
      elevation="0"
    >
      <h3 class="section-title">Статистика часов</h3>
      <div class="stats">
        <v-card
          class="stat-card"
          elevation="0"
        >
          <div class="stat-title">Лекции</div>
          <div class="stat-row">{{ discipline.LectureHours }} ч.</div>
        </v-card>
        <v-card
          class="stat-card"
          elevation="0"
        >
          <div class="stat-title">Практика</div>
          <div class="stat-row">{{ discipline.PracticeHours }} ч.</div>
        </v-card>
      </div>
    </v-card>

    <!-- ===== Таблица групп ===== -->
    <v-card
      class="block"
      elevation="0"
    >
      <h3 class="section-title">Учебные группы</h3>

      <template v-if="groups.length">
        <v-table>
          <thead>
            <tr>
              <th>Группа</th>
              <th>Курс</th>
              <th>Загружено</th>
            </tr>
          </thead>
          <tbody>
            <tr
              v-for="group in groups"
              :key="group"
            >
              <td>{{ group }}</td>
              <td>{{ discipline.Course }}</td>
              <td>
                0 / {{ discipline.LectureHours + discipline.PracticeHours }}
              </td>
            </tr>
          </tbody>
        </v-table>
      </template>

      <div
        v-else
        class="empty"
      >
        Нет данных по учебным группам
      </div>
    </v-card>
  </v-container>

  <upload-work-modal
    v-model="uploadDialog"
    :discipline="discipline"
    :groups="groups"
    :topics="topics"
    :assessment="discipline.Assessment"
    @close="uploadDialog = false"
    @submit="onUpload"
  />
</template>

<script setup>
  import { useRoute, useRouter } from 'vue-router';
  import { computed } from 'vue';
  import disciplinesDB from '../db/db.json';
  import ARCHIVE_ICON from '../assets/icons/archive.svg';
  import PLUS_ICON from '../assets/icons/plus.svg';
  import UploadWorkModal from '../components/UploadStudyWork.vue';
  import { ref } from 'vue';
  const route = useRoute();
  const router = useRouter();

  const discipline = computed(() =>
    disciplinesDB.find((d) => d.CodeRow === Number(route.params.id))
  );
  const uploadDialog = ref(false);

  const uploadWork = () => {
    uploadDialog.value = true;
  };

  const closeUploadDialog = () => {
    uploadDialog.value = false;
  };

  const goBack = () => router.push('/uploadWork');

  // Разбираем Topics в массив
  const topics = computed(() => {
    if (!discipline.value || !discipline.value.Topics) return [];
    try {
      return JSON.parse(discipline.value.Topics);
    } catch (e) {
      return [discipline.value.Topics];
    }
  });

  // Собираем уникальные группы по дисциплине
  const groups = computed(() => {
    const set = new Set();
    disciplinesDB.forEach((d) => {
      if (
        d.Discipline === discipline.value.Discipline &&
        d.Course === discipline.value.Course &&
        d.Semester === discipline.value.Semester &&
        d.Group
      ) {
        set.add(d.Group);
      }
    });
    return Array.from(set);
  });
</script>

<style scoped>
  .page {
    background: #f5f6f8;
    padding: 16px;
  }

  .block {
    border-radius: 16px;
    padding: 20px;
    margin-bottom: 16px;
  }

  .top-row {
    display: flex;
    justify-content: space-between;
    gap: 24px;
  }

  .back-btn {
    padding-left: 0;
  }

  .title {
    font-size: 22px;
    font-weight: 600;
    margin: 6px 0;
  }

  .meta {
    display: flex;
    gap: 16px;
    font-size: 13px;
    color: #6b7280;
  }

  .types {
    display: flex;
    gap: 8px;
    margin-top: 8px;
  }

  .actions {
    display: flex;
    gap: 12px;
  }

  .section-title {
    font-size: 16px;
    font-weight: 600;
    margin-bottom: 12px;
  }

  .stats {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(260px, 1fr));
    gap: 16px;
  }

  .stat-card {
    background: #fafafa;
    border-radius: 14px;
    padding: 16px;
  }

  .error {
    color: #dc2626;
  }

  .success {
    color: #16a34a;
  }
</style>
