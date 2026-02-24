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
          variant="text"
          @click="close"
        >
          <v-icon>mdi-close</v-icon>
        </v-btn>
      </div>

      <v-card-text>
        <div
          :class="['file-dropzone', {'is-dragover': isDragOver}]"
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
          <div class="drop-hint">💡 ФамилияИО_Дисциплина_ТипРаботы</div>
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
              outlined
              dense
              hide-details
              :items="groups"
            />
          </v-col>

          <v-col cols="6">
            <v-select
              v-model="selectedStudentId"
              label="Студент *"
              item-title="name"
              item-value="id"
              outlined
              dense
              hide-details
              :disabled="!selectedGroup"
              :items="studentsForSelect"
            />
          </v-col>

          <v-col cols="6">
            <v-text-field
              :model-value="disciplineTitle"
              label="Дисциплина"
              disabled
              outlined
              dense
              hide-details
            />
          </v-col>

          <v-col cols="6">
            <v-select
              v-model="workType"
              label="Вид контроля *"
              outlined
              dense
              hide-details
              :items="controlTypesOptions"
            />
          </v-col>

          <v-col cols="12">
            <v-text-field
              v-model="workTitle"
              label="Название работы *"
              outlined
              dense
              hide-details
            />
          </v-col>

          <v-col
            cols="12"
            v-if="topicsList.length"
          >
            <v-select
              v-model="topic"
              label="Тема"
              outlined
              dense
              hide-details
              :items="topicsList"
            />
          </v-col>

          <v-col cols="12">
            <v-text-field
              v-model="academicYear"
              label="Учебный год"
              outlined
              dense
              hide-details
            />
          </v-col>
        </v-row>

        <v-checkbox
          v-model="autoCheck"
          label="Автоматическая проверка оформления"
          hide-details
        />
      </v-card-text>

      <v-card-actions class="actions">
        <v-btn
          variant="text"
          @click="close"
        >
          Отмена
        </v-btn>
        <v-btn
          color="#111827"
          :disabled="!isValid"
          @click="submitWork"
        >
          <v-icon start>mdi-upload</v-icon>
          Загрузить
        </v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script setup lang="ts">
  import { ref, computed, watch } from 'vue';
  import { useAcademicYear } from '@/composables/useAcademicYear';

  const { academicYear } = useAcademicYear();

  type DisciplineUi = {
    Discipline?: string;
    Name?: string;
    Assessment?: string;
  };

  const props = defineProps<{
    discipline: DisciplineUi | null;
    groups: string[];
    studentsByGroup: Record<string, any[]>;
    topics: string[];
    controls: any[];
    assessment: string;
  }>();

  const emit = defineEmits<{
    (e: 'close'): void;
    (
      e: 'submit',
      payload: {
        studentId: number;
        groupName: string;
        topic: string;
        workType: string;
        workTitle: string;
        academicYear: string;
        autoCheck: boolean;
        check?: number | null;
        status: string;
        uploadedBy: string;
        file: File;
      }
    ): void;
  }>();

  const dialog = ref(true);

  const file = ref<File | null>(null);
  const fileInput = ref<HTMLInputElement | null>(null);
  const isDragOver = ref(false);
  const selectedGroup = ref('');

  const selectedStudentId = ref<number | null>(null);

  const workType = ref('');
  const topic = ref('');
  const workTitle = ref('');
  const autoCheck = ref(true);

  const disciplineTitle = computed(() => {
    const d: any = props.discipline;
    return d?.Discipline ?? d?.Name ?? '';
  });

  const topicsList = computed(() => props.topics ?? []);

  const controlTypesOptions = computed(() => {
    const group = String(selectedGroup.value ?? '').trim();
    const list: string[] = [];
    const seen = new Set<string>();
    for (const c of props.controls ?? []) {
      const controlGroup = String(c?.groupName ?? '').trim();
      const controlText = String(c?.controlText ?? '').trim();
      if (controlText && (group === '' || controlGroup === group)) {
        if (!seen.has(controlText)) {
          seen.add(controlText);
          list.push(controlText);
        }
      }
    }
    return list.sort();
  });

  watch(selectedGroup, () => {
    selectedStudentId.value = null;
    const opts = controlTypesOptions.value;
    const current = workType.value;
    if (opts.length > 0 && !opts.includes(current)) {
      workType.value = opts[0] ?? '';
    }
  });

  watch(controlTypesOptions, (opts) => {
    if (opts.length > 0 && !opts.includes(workType.value)) {
      workType.value = opts[0] ?? '';
    }
  }, { immediate: true });

  watch(topicsList, (val) => {
    if (!val?.length) {
      topic.value = '';
    }
  });

  const openFileDialog = () => fileInput.value?.click();

  const onFileChange = (e: Event) => {
    const input = e.target as HTMLInputElement;
    const f = input.files?.[0];
    if (f) {
      file.value = f;
    }
  };

  const onDrop = (e: DragEvent) => {
    isDragOver.value = false;
    const f = e.dataTransfer?.files?.[0];
    if (f) {
      file.value = f;
    }
  };

  function getStudentIdRaw(s: any): number {
    const v = s?.studentId ?? s?.lkId ?? s?.lk_id ?? s?.['ID ИОТ'];
    const n = Number(v);
    return Number.isFinite(n) ? n : 0;
  }

  const studentsForSelect = computed(() => {
    const group = selectedGroup.value;
    if (!group) {
      return [];
    }

    const seen = new Set<number>();

    return (props.studentsByGroup[group] ?? [])
      .map((s) => {
        const id = getStudentIdRaw(s);
        return {
          id,
          name: s.fio ?? s['ФИО'] ?? s['Фамилия И.О.'] ?? String(id || '—'),
        };
      })
      .filter((x) => {
        if (x.id === 0) return false;
        if (seen.has(x.id)) return false;
        seen.add(x.id);
        return true;
      });
  });

  const isValid = computed(() => {
    const hasFile = file.value instanceof File;
    const hasGroup = selectedGroup.value.trim().length > 0;
    const hasStudent = typeof selectedStudentId.value === 'number';
    const hasTitle = workTitle.value.trim().length > 0;
    const hasWorkType = workType.value.trim().length > 0;

    return hasFile && hasGroup && hasStudent && hasTitle && hasWorkType;
  });

  function getUploadedBy(): string {
    const raw = localStorage.getItem('user');
    if (raw) {
      try {
        const u = JSON.parse(raw);
        return u?.fioShort ?? u?.lastName ?? 'unknown';
      } catch {
        return 'unknown';
      }
    }
    return 'unknown';
  }

  function normalizeTopics(t: any): string[] {
    if (Array.isArray(t)) {
      return t.map((x) => String(x).trim());
    }

    if (typeof t === 'string') {
      try {
        const parsed = JSON.parse(t);
        if (Array.isArray(parsed)) {
          return parsed.map((x) => String(x).trim());
        }
      } catch {}

      return t
        .split(',')
        .map((x) => x.trim())
        .filter(Boolean);
    }

    return [];
  }

  const resolvedControlType = computed(() => {
    const group = String(selectedGroup.value ?? '').trim();
    const chosenTopic = String(topic.value ?? '').trim();

    if (group && chosenTopic) {
      for (const c of props.controls ?? []) {
        const controlGroup = String(c?.groupName ?? '').trim();
        const controlText = String(c?.controlText ?? '').trim();
        const topicsArr = normalizeTopics(c?.topics);

        const groupMatch = controlGroup === group;
        const topicMatch = topicsArr.includes(chosenTopic);

        if (groupMatch && topicMatch) {
          return controlText;
        }
      }
    }
    return '';
  });

  const submitWork = () => {
    const sid = selectedStudentId.value;
    const f = file.value;

    if (isValid.value && sid !== null && f instanceof File) {
      const payload = {
        studentId: sid,
        groupName: selectedGroup.value,
        topic: topicsList.value.length ? topic.value || '' : '',
        controlType: resolvedControlType.value,
        workType: workType.value,
        workTitle: workTitle.value,
        academicYear: academicYear.value,
        autoCheck: autoCheck.value,
        check: autoCheck.value ? Math.floor(85 + Math.random() * 15) : null,
        status: 'Загружен',
        uploadedBy: getUploadedBy(),
        file: f,
      };

      emit('submit', payload);
      close();
    }
  };

  const close = () => {
    dialog.value = false;
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
