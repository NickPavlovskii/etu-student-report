<template>
  <v-dialog
    v-model="dialog"
    max-width="700"
  >
    <v-card
      class="upload-card"
      elevation="1"
    >
      <div class="header">
        <h3>Загрузить учебную работу</h3>
        <v-btn
          icon
          text
          @click="close"
        >
          <v-icon>mdi-close</v-icon>
        </v-btn>
      </div>

      <v-card-text>
        <!-- ===== Drop zone ===== -->
        <div
          class="file-dropzone"
          :class="{ 'is-dragover': isDragOver }"
          @click="openFileDialog"
          @dragover.prevent="isDragOver = true"
          @dragleave.prevent="isDragOver = false"
          @drop.prevent="onDrop"
        >
          <v-icon size="36">mdi-upload</v-icon>

          <div class="drop-title">
            {{ file ? file.name : 'Нажмите для выбора файла' }}
          </div>

          <div class="drop-sub">PDF, DOC, DOCX до 50 МБ</div>

          <div class="drop-hint">
            💡 Используйте формат ФамилияИО_Дисциплина_ТипРаботы
          </div>

          <input
            ref="fileInput"
            type="file"
            accept=".pdf,.doc,.docx"
            hidden
            @change="onFileChange"
          />
        </div>

        <v-row
          dense
          class="form-row"
        >
          <v-col cols="6">
            <v-select
              v-model="selectedGroup"
              label="Учебная группа *"
              :items="groups"
              required
              outlined
              dense
              hide-details
            />
          </v-col>

          <v-col cols="6">
            <v-text-field
              v-model="student"
              label="ФИО студента *"
              required
              outlined
              dense
              hide-details
            />
          </v-col>

          <v-col cols="6">
            <v-text-field
              label="Дисциплина *"
              :model-value="discipline.Name"
              disabled
              outlined
              dense
              hide-details
            />
          </v-col>

          <v-col cols="6">
            <v-select
              v-model="workType"
              label="Тип работы *"
              :items="workTypes"
              outlined
              dense
              hide-details
            />
          </v-col>

          <v-col cols="12">
            <v-text-field
              v-model="workTitle"
              label="Название работы *"
              placeholder="Например: Лабораторная работа №1"
              outlined
              dense
              hide-details
            />
          </v-col>

          <v-col
            cols="12"
            v-if="topics.length"
          >
            <v-select
              v-model="topic"
              label="Тема *"
              :items="topics"
              outlined
              dense
              placeholder="Подробное описание темы работы..."
              hide-details
            />
          </v-col>

          <v-col cols="12">
            <v-text-field
              v-model="academicYear"
              label="Учебный год"
              disabled
              outlined
              dense
              hide-details
            />
          </v-col>
        </v-row>

        <v-checkbox
          v-model="autoCheck"
          label="Требуется автоматическая проверка оформления по шаблону"
          class="auto-check"
          hide-details
        />
      </v-card-text>

      <v-card-actions class="actions">
        <v-btn
          text
          @click="close"
        >
          Отмена
        </v-btn>
        <v-btn
          color="#111827"
          :disabled="!isValid"
          @click="submitWork"
        >
          <v-icon left>mdi-upload</v-icon>
          Загрузить работу
        </v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script setup lang="ts">
  import { ref, computed, onMounted } from 'vue';

  const props = defineProps<{
    discipline: any;
    groups: string[];
  }>();

  const emit = defineEmits(['close', 'submit']);

  const dialog = ref(true);

  // ===== File drop =====
  const file = ref<File | null>(null);
  const fileInput = ref<HTMLInputElement | null>(null);
  const isDragOver = ref(false);

  const openFileDialog = () => {
    fileInput.value?.click();
  };

  const onFileChange = (e: Event) => {
    const input = e.target as HTMLInputElement;
    if (input.files?.length) {
      file.value = input.files[0];
    }
  };

  const onDrop = (e: DragEvent) => {
    isDragOver.value = false;
    if (e.dataTransfer?.files.length) {
      file.value = e.dataTransfer.files[0];
    }
  };
  const close = () => {
    dialog.value = false;
    emit('close');
  };

  // ===== Form =====
  const selectedGroup = ref('');
  const student = ref('');
  const workType = ref('');
  const topic = ref('');
  const workTitle = ref('');
  const academicYear = ref('2024/2025');
  const autoCheck = ref(true);

  const topics = ref<string[]>([]);
  const workTypes = ref<string[]>([]);

  onMounted(() => {
    if (props.discipline.Topics) {
      try {
        topics.value = JSON.parse(props.discipline.Topics);
      } catch {
        topics.value = [];
      }
    }

    if (props.discipline.Assessment) {
      workTypes.value = props.discipline.Assessment.split('/').map(
        (s: string) => s.trim()
      );
      workType.value = workTypes.value[0] || '';
    }
  });

  const isValid = computed(
    () =>
      !!file.value &&
      !!selectedGroup.value &&
      !!student.value &&
      !!workTitle.value &&
      !!workType.value
  );

  const submitWork = () => {
    emit('submit', {
      file: file.value,
      group: selectedGroup.value,
      student: student.value,
      discipline: props.discipline,
      workType: workType.value,
      topic: topic.value,
      workTitle: workTitle.value,
      academicYear: academicYear.value,
      autoCheck: autoCheck.value,
    });
    emit('close');
  };
</script>

<style scoped lang="scss">
  .file-dropzone {
    border: 2px dashed #d1d5db;
    border-radius: 16px;
    background: #fafafa;
    padding: 28px 16px;
    text-align: center;
    cursor: pointer;
    transition: all 0.3s ease;
    margin-bottom: 20px;
    color: #6b7280;

    &:hover {
      background: #f3f4f6;
      border-color: #2563eb;
      color: #1e40af;
    }

    &.is-dragover {
      border-color: #2563eb;
      background: #eef2ff;
      color: #1e40af;
      transform: scale(1.02);
    }

    v-icon {
      transition: transform 0.3s ease;
    }

    &:hover v-icon {
      transform: scale(1.2);
    }
  }

  .drop-title {
    font-size: 14px;
    font-weight: 600;
    margin-top: 8px;
  }

  .drop-sub {
    font-size: 12px;
    margin-top: 4px;
  }

  .drop-hint {
    font-size: 11px;
    margin-top: 8px;
    color: #9ca3af;
  }

  .upload-card {
    border-radius: 16px;
    overflow: hidden;
    background-color: #ffffff;
    box-shadow: 0 8px 24px rgba(0, 0, 0, 0.08);
    transition: box-shadow 0.3s ease;

    &:hover {
      box-shadow: 0 12px 28px rgba(0, 0, 0, 0.12);
    }
  }

  .header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 24px 24px 16px;

    h3 {
      margin: 0;
      font-weight: 600;
      font-size: 1.25rem;
      color: #111827;
    }

    .v-btn {
      color: #6b7280;
      transition: background-color 0.2s ease;

      &:hover {
        background-color: rgba(37, 99, 235, 0.08);
        color: #2563eb;
      }
    }
  }

  .v-card-text {
    padding: 16px 24px;

    .form-row {
      margin-bottom: 8px; /* уменьшено с 16px до 8px */
    }

    .v-file-input,
    .v-select,
    .v-text-field {
      margin-bottom: 8px; /* уменьшено с 16px до 8px */

      input {
        transition: border-color 0.2s ease, box-shadow 0.2s ease;
      }

      &:focus-within input {
        border-color: #2563eb;
        box-shadow: 0 0 0 2px rgba(37, 99, 235, 0.2);
      }
    }

    .auto-check {
      background-color: #f0f9ff;
      border-radius: 8px;
      padding: 8px;
      font-weight: 500;
      transition: background-color 0.3s ease;

      &:hover {
        background-color: #e0f2fe;
      }
    }
  }

  .actions {
    justify-content: flex-end;
    padding: 16px 24px;
    gap: 12px;

    .v-btn {
      min-width: 160px;
      border-radius: 8px;
      color: white;
      transition: background-color 0.3s ease, transform 0.2s ease;

      &:first-child {
        color: #111827;
        background-color: #f9fafb;

        &:hover {
          background-color: #e5e7eb;
        }
      }

      &:hover {
        transform: translateY(-2px);
        background-color: #1f2937;
      }
    }
  }
</style>
