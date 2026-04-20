<template>
  <v-dialog
    :model-value="modelValue"
    max-width="980"
    persistent
    scrollable
    @update:model-value="$emit('update:modelValue', $event)"
  >
    <v-card class="batch-card">
      <div class="header">
        <div>
          <h3>Мультизагрузка работ</h3>
          <div class="sub">
            Выберите несколько файлов, укажите группу/вид контроля и сопоставьте студентов.
          </div>
        </div>
        <v-btn
          icon
          variant="text"
          @click="$emit('update:modelValue', false)"
        >
          <v-icon>mdi-close</v-icon>
        </v-btn>
      </div>

      <v-card-text class="body">
        <div class="top-grid">
          <v-select
            v-model="selectedGroup"
            class="field"
            label="Учебная группа *"
            variant="outlined"
            density="compact"
            hide-details
            :items="groups"
          />
          <v-select
            v-model="workType"
            class="field"
            label="Вид контроля *"
            variant="outlined"
            density="compact"
            hide-details
            :items="controlTypesOptions"
          />
          <v-select
            v-model="topic"
            class="field"
            label="Тема"
            variant="outlined"
            density="compact"
            hide-details
            :items="filteredTopicsList"
            :disabled="filteredTopicsList.length === 0"
          />
          <v-select
            v-model="academicYear"
            class="field"
            label="Учебный год"
            :items="ACADEMIC_YEAR_SELECT_ITEMS"
            item-title="title"
            item-value="value"
            variant="outlined"
            density="compact"
            hide-details
          />
        </div>

        <div class="files-block">
          <div class="files-head">
            <div class="files-title">Файлы</div>
            <div class="files-actions">
              <v-btn
                variant="outlined"
                color="primary"
                @click="openFileDialog"
              >
                Добавить файлы
              </v-btn>
              <v-btn
                variant="text"
                :disabled="!rows.length || busy"
                @click="clearAll"
              >
                Очистить
              </v-btn>
            </div>
          </div>

          <input
            ref="fileInput"
            type="file"
            accept=".pdf,.doc,.docx"
            multiple
            hidden
            @change="onFilesPicked"
          />

          <div
            v-if="!rows.length"
            class="empty"
          >
            Добавьте несколько файлов студентов.
            Рекомендуемый формат имени: <br />
            <code>Группа_НомерЗачётки_описание_работы_2024-2025.docx</code>
            (части через <code>_</code>; группа — как в списке или код вроде
            <code>0370</code>; номер зачётки — 5–9 цифр; в конце учебный год из списка)
          </div>

          <div
            v-else
            class="table"
          >
            <div class="thead">
              <div>Файл</div>
              <div>Студент *</div>
              <div>Название работы *</div>
              <div>Проверка</div>
              <div></div>
            </div>

            <div
              v-for="r in rows"
              :key="r.id"
              class="trow"
            >
              <div class="file-cell">
                <div class="file-name">{{ r.file.name }}</div>
                <div class="file-meta">
                  {{ formatBytes(r.file.size) }}
                </div>
              </div>

              <div>
                <v-select
                  v-model="r.studentId"
                  class="field"
                  label="Студент"
                  item-title="name"
                  item-value="id"
                  variant="outlined"
                  density="compact"
                  hide-details
                  :items="studentsForSelect"
                  :disabled="!selectedGroup"
                />
              </div>

              <div>
                <v-text-field
                  v-model="r.workTitle"
                  class="field"
                  label="Название"
                  variant="outlined"
                  density="compact"
                  hide-details
                />
              </div>

              <div class="status">
                <template v-if="r.validation">
                  <span
                    :class="['pill', r.validation.valid ? 'ok' : 'warn']"
                  >
                    {{ r.validation.valid ? 'OK' : 'Есть замечания' }}
                  </span>
                  <span class="muted">{{ r.validation.percent ?? '—' }}%</span>
                </template>
                <template v-else>
                  <span class="muted">—</span>
                </template>
              </div>

              <div class="row-actions">
                <v-btn
                  icon
                  variant="text"
                  :disabled="busy"
                  @click="removeRow(r.id)"
                >
                  <v-icon>mdi-close</v-icon>
                </v-btn>
              </div>

              <div
                v-if="r.validation?.annotatedFileBase64"
                class="annotated"
              >
                <v-btn
                  size="small"
                  variant="tonal"
                  prepend-icon="mdi-file-eye-outline"
                  @click="downloadAnnotated(r)"
                >
                  Файл с замечаниями
                </v-btn>
              </div>
            </div>
          </div>
        </div>

        <div class="options">
          <v-checkbox
            v-model="autoCheck"
            color="primary"
            density="comfortable"
            hide-details
          >
            <template #label>
              <span>Проверять оформление по шаблону перед загрузкой</span>
            </template>
          </v-checkbox>
        </div>

        <div
          v-if="errorText"
          class="error"
        >
          {{ errorText }}
        </div>
      </v-card-text>

      <v-card-actions class="actions">
        <v-btn
          variant="text"
          @click="$emit('update:modelValue', false)"
        >
          Отмена
        </v-btn>
        <v-spacer />
        <v-btn
          color="#111827"
          :disabled="!canSubmit || busy"
          :loading="busy"
          @click="validateAndUpload"
        >
          <v-icon start>mdi-upload</v-icon>
          {{
            busy && phase === 'validate'
              ? 'Проверка…'
              : 'Загрузить все'
          }}
        </v-btn>
      </v-card-actions>

      <v-dialog
        v-model="showBatchReviewDialog"
        max-width="720"
        persistent
      >
        <v-card class="batch-review-card">
          <div class="batch-review-header">
            <div>
              <h3 class="batch-review-title">Проверка по шаблону</h3>
              <p class="batch-review-sub">
                Файлов: {{ rows.length }}. Откройте подробный отчёт по строке или загрузите все на сервер.
              </p>
            </div>
            <v-btn
              icon
              variant="text"
              @click="closeBatchReviewDialog"
            >
              <v-icon>mdi-close</v-icon>
            </v-btn>
          </div>
          <v-card-text class="batch-review-body">
            <div
              v-for="r in rows"
              :key="'rev-' + r.id"
              class="batch-review-row"
            >
              <div class="batch-review-row-main">
                <span class="batch-review-fname">{{ r.file.name }}</span>
                <template v-if="r.validation">
                  <span
                    :class="['pill', r.validation.valid ? 'ok' : 'warn']"
                  >
                    {{ r.validation.valid ? 'OK' : 'Замечания' }}
                  </span>
                  <span class="muted">{{ r.validation.percent ?? '—' }}%</span>
                </template>
                <span
                  v-else
                  class="muted"
                >Нет результата</span>
              </div>
              <v-btn
                size="small"
                variant="tonal"
                color="primary"
                :disabled="!r.validation"
                @click="openValidationDetail(r)"
              >
                Подробнее
              </v-btn>
            </div>
          </v-card-text>
          <v-card-actions class="batch-review-actions">
            <v-btn
              variant="text"
              @click="closeBatchReviewDialog"
            >
              Назад к списку
            </v-btn>
            <v-spacer />
            <v-btn
              color="primary"
              :loading="busy && phase === 'upload'"
              @click="confirmBatchUploadAfterReview"
            >
              Загрузить все
            </v-btn>
          </v-card-actions>
        </v-card>
      </v-dialog>

      <validation-report-modal
        v-model="showValidationDetailDialog"
        :result="validationDetailResult"
        :breadcrumb="validationDetailBreadcrumb"
      />
    </v-card>
  </v-dialog>
</template>

<script setup lang="ts">
  import { computed, nextTick, ref, watch } from 'vue';
  import { useAcademicYear } from '@/composables/useAcademicYear';
  import { useDownload } from '@/composables/useDownload';
  import { useUser } from '@/composables/useUser';
  import { ACADEMIC_YEAR_SELECT_ITEMS } from '@/constants/academicYearSelectItems';
  import { uploadDisciplineReport, validateBatch, type ValidationResult } from '@/api/info';
  import type { BatchValidationResult } from '@/api/types';
  import ValidationReportModal from './ValidationReportModal.vue';
  import type { StudentInGroupRow, UploadDisciplineModalProps, UploadWorkPayload } from '../modal/uploadWorkModal';

  const props = defineProps<
    {
      modelValue: boolean;
      planRowId: number;
      teacherLastName: string;
    } & UploadDisciplineModalProps
  >();

  const emit = defineEmits<{
    (e: 'update:modelValue', v: boolean): void;
    (e: 'uploaded'): void;
  }>();

  const { academicYear } = useAcademicYear();
  const { uploadedBy } = useUser();
  const { downloadAnnotatedFile } = useDownload();

  const selectedGroup = ref('');
  const workType = ref('');
  const topic = ref('');
  const autoCheck = ref(true);
  const annotate = ref(false);
  const errorText = ref<string>('');
  const busy = ref(false);
  const phase = ref<'idle' | 'validate' | 'upload'>('idle');
  const fileInput = ref<HTMLInputElement | null>(null);
  const showBatchReviewDialog = ref(false);
  const showValidationDetailDialog = ref(false);
  const validationDetailResult = ref<ValidationResult | null>(null);
  const validationDetailBreadcrumb = ref('');

  type Row = {
    id: string;
    file: File;
    studentId: number | string | null;
    workTitle: string;
    validation?: ValidationResult | null;
  };

  const rows = ref<Row[]>([]);

  // значение года в модели должно быть как в запросах (через дефис)
  watch(
    academicYear,
    (v) => {
      if (typeof v === 'string' && v.includes('/')) {
        academicYear.value = v.replace(/\//g, '-');
      }
    },
    { immediate: true }
  );

  const groups = computed(() => props.groups ?? []);

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

  function normalizeTopics(t: unknown): string[] {
    if (Array.isArray(t)) return t.map((x) => String(x).trim()).filter(Boolean);
    if (typeof t === 'string') {
      try {
        const parsed = JSON.parse(t);
        if (Array.isArray(parsed)) return parsed.map((x) => String(x).trim()).filter(Boolean);
      } catch {}
      return t.split(',').map((x) => x.trim()).filter(Boolean);
    }
    return [];
  }

  function topicsForGroupAndWorkType(group: string, ct: string): string[] {
    const controlType = String(ct ?? '').trim();
    if (!controlType) return props.topics ?? [];
    const groupName = String(group ?? '').trim();
    const set = new Set<string>();
    for (const c of props.controls ?? []) {
      const controlGroup = String(c?.groupName ?? '').trim();
      const controlText = String(c?.controlText ?? '').trim();
      if (controlText !== controlType) continue;
      if (groupName && controlGroup && controlGroup !== groupName) continue;
      normalizeTopics(c?.topics).forEach((t) => set.add(t));
    }
    const arr = [...set].filter(Boolean).sort((a, b) => a.localeCompare(b));
    return arr.length ? arr : props.topics ?? [];
  }

  const filteredTopicsList = computed(() =>
    topicsForGroupAndWorkType(String(selectedGroup.value ?? '').trim(), String(workType.value ?? '').trim())
  );

  watch([selectedGroup, workType], () => {
    if (!selectedGroup.value) return;
    if (workType.value && !controlTypesOptions.value.includes(workType.value)) {
      workType.value = '';
    }
    if (topic.value && filteredTopicsList.value.length && !filteredTopicsList.value.includes(topic.value)) {
      topic.value = '';
    }
  });

  function getStudentIdRaw(s: StudentInGroupRow): number {
    const v = s.studentId ?? s.lkId ?? s.lk_id ?? s['ID ИОТ'];
    const n = Number(v);
    return Number.isFinite(n) ? n : 0;
  }

  /** Номер в имени файла может совпадать с зачёткой, а в списке — id студента. */
  function resolveStudentIdFromFileToken(raw: string): number | null {
    const n = Number(raw);
    if (!Number.isFinite(n) || n <= 0) return null;
    const map = props.studentsByGroup ?? {};
    for (const list of Object.values(map)) {
      for (const s of list ?? []) {
        const sid = getStudentIdRaw(s);
        if (sid === n) return sid;
        const book =
          s.recordBook ?? s.record_book ?? s.gradebook ?? s.Зачетка;
        if (book == null || book === '') continue;
        const digits = String(book).replace(/\D/g, '');
        if (digits && Number(digits) === n) return sid;
      }
    }
    return null;
  }

  const studentsForSelect = computed(() => {
    const group = selectedGroup.value;
    if (!group) return [];
    const seen = new Set<number>();
    return (props.studentsByGroup[group] ?? [])
      .map((s) => {
        const id = getStudentIdRaw(s);
        return { id, name: s.fio ?? s['ФИО'] ?? s['Фамилия И.О.'] ?? String(id || '—') };
      })
      .filter((x) => x.id !== 0 && !seen.has(x.id) && (seen.add(x.id), true));
  });

  const canSubmit = computed(() => {
    const g = selectedGroup.value.trim();
    const wt = workType.value.trim();
    if (!g || !wt) return false;
    if (!rows.value.length) return false;
    return rows.value.every((r) => Number.isFinite(Number(r.studentId)) && r.workTitle.trim().length > 0);
  });

  function openFileDialog() {
    fileInput.value?.click();
  }

  function onFilesPicked(e: Event) {
    const input = e.target as HTMLInputElement;
    const fs = [...(input.files ?? [])].filter((f) => f instanceof File);
    if (!fs.length) return;
    void addFiles(fs);
    input.value = '';
  }

  async function addFiles(fs: File[]) {
    for (const f of fs) {
      const r: Row = {
        id: `${Date.now()}_${Math.random().toString(16).slice(2)}`,
        file: f,
        studentId: null,
        workTitle: '',
        validation: null,
      };
      rows.value.push(r);
      await applyFilenameAutofill(r, f.name);
    }
  }

  function clearAll() {
    rows.value = [];
    errorText.value = '';
  }

  function removeRow(id: string) {
    rows.value = rows.value.filter((r) => r.id !== id);
  }

  function normalizeForMatch(s: string): string {
    return String(s ?? '')
      .toLowerCase()
      .trim()
      .replace(/_/g, ' ')
      .replace(/\s+/g, ' ')
      .trim();
  }

  function bestMatchOption(input: string, options: string[]): string | null {
    const q = normalizeForMatch(input);
    if (!q) return null;
    const exact = options.find((o) => normalizeForMatch(o) === q);
    if (exact) return exact;
    let bestPrefix: string | null = null;
    let bestLen = -1;
    for (const o of options) {
      const n = normalizeForMatch(o);
      if (!n) continue;
      if (q.startsWith(n) && n.length > bestLen) {
        bestPrefix = o;
        bestLen = n.length;
      }
      if (n.startsWith(q) && q.length > bestLen) {
        bestPrefix = o;
        bestLen = q.length;
      }
    }
    if (bestPrefix) return bestPrefix;
    const contains = options.find((o) => {
      const n = normalizeForMatch(o);
      return n.includes(q) || q.includes(n);
    });
    return contains ?? null;
  }

  function resolveGroupFromToken(token: string): string | null {
    const t = String(token ?? '').trim();
    if (!t) return null;
    const gs = groups.value ?? [];
    const exact = gs.find((g) => String(g).trim() === t);
    if (exact != null) return String(exact);
    const tl = t.toLowerCase();
    const sub = gs.find((g) => {
      const s = String(g).trim().toLowerCase();
      return s.includes(tl) || tl.includes(s);
    });
    if (sub != null) return String(sub);
    // Код группы только цифрами (напр. 0370): вхождение в название или хвост цифр в названии
    if (/^\d{3,6}$/.test(t)) {
      const byCode = gs.find((g) => {
        const s = String(g).trim();
        if (s.includes(t)) return true;
        const digits = s.replace(/\D/g, '');
        return digits.endsWith(t) || digits === t || t.endsWith(digits);
      });
      if (byCode != null) return String(byCode);
    }
    return null;
  }

  /** Если в имени файла указан номер зачётки — находим группу по списку студентов. */
  function resolveGroupFromStudentRecordId(studentId: number): string | null {
    if (!Number.isFinite(studentId) || studentId <= 0) return null;
    const map = props.studentsByGroup ?? {};
    for (const g of Object.keys(map)) {
      const list = map[g] ?? [];
      for (const s of list) {
        if (getStudentIdRaw(s) === studentId) return g;
      }
    }
    return null;
  }

  function distinctControlTextsAll(): string[] {
    const seen = new Set<string>();
    const list: string[] = [];
    for (const c of props.controls ?? []) {
      const controlText = String(c?.controlText ?? '').trim();
      if (controlText && !seen.has(controlText)) {
        seen.add(controlText);
        list.push(controlText);
      }
    }
    return list.sort((a, b) => a.localeCompare(b));
  }

  function controlTextsForWorkTypeMatch(): string[] {
    const fromOptions = controlTypesOptions.value;
    return fromOptions.length ? fromOptions : distinctControlTextsAll();
  }

  function findLongestPrefixMatch(parts: string[], options: string[]): { hit: string; k: number } | null {
    for (let k = parts.length; k >= 1; k--) {
      for (const sep of [' ', '_'] as const) {
        const cand = parts.slice(0, k).join(sep);
        const m = bestMatchOption(cand, options);
        if (m) return { hit: m, k };
      }
    }
    return null;
  }

  function consumedWordsForTopic(remainderParts: string[], topicTitle: string): number {
    const tn = normalizeForMatch(topicTitle);
    if (!tn || !remainderParts.length) return 0;
    for (let m = remainderParts.length; m >= 1; m--) {
      for (const sep of [' ', '_'] as const) {
        const cand = normalizeForMatch(remainderParts.slice(0, m).join(sep));
        if (cand === tn || tn.startsWith(cand) || cand.startsWith(tn)) {
          return m;
        }
      }
    }
    return 0;
  }

  /** Подбор вида контроля по всей «середине» имени (не только с начала токенов). */
  function matchWorkTypeFromMiddle(
    middleParts: string[],
    controlOpts: string[]
  ): { hit: string; consumedTokens: number } | null {
    if (!middleParts.length || !controlOpts.length) return null;
    const prefixHit = findLongestPrefixMatch(middleParts, controlOpts);
    if (prefixHit) {
      return { hit: prefixHit.hit, consumedTokens: prefixHit.k };
    }
    const joined = middleParts.join(' ');
    const whole = bestMatchOption(joined, controlOpts);
    if (whole) return { hit: whole, consumedTokens: middleParts.length };
    for (let start = 0; start < middleParts.length; start++) {
      const slice = middleParts.slice(start);
      const hit = findLongestPrefixMatch(slice, controlOpts);
      if (hit) {
        return { hit: hit.hit, consumedTokens: start + hit.k };
      }
    }
    return null;
  }

  async function applyFilenameAutofill(row: Row, fileName: string) {
    const base = String(fileName ?? '').replace(/\.[^.]+$/, '').trim();
    if (!base) return;

    let parts = base.split('_').map((p) => p.trim()).filter(Boolean);
    if (!parts.length) return;

    const last = parts[parts.length - 1];
    if (
      last &&
      (/^\d{4}-\d{4}$/.test(last) || /^\d{4}\/\d{4}$/.test(last))
    ) {
      const norm = last.replace(/\//g, '-');
      const allowed = new Set<string>(
        ACADEMIC_YEAR_SELECT_ITEMS.map((i) => String(i.value))
      );
      if (allowed.has(norm)) {
        academicYear.value = norm;
      }
      parts = parts.slice(0, -1);
    }
    if (!parts.length) return;

    const second = parts[1] ?? '';
    const secondIsStudentId = /^\d{5,9}$/.test(second);
    if (secondIsStudentId) {
      const sid = resolveStudentIdFromFileToken(second);
      row.studentId = sid ?? Number(second);
    }

    const gFromToken = resolveGroupFromToken(parts[0] ?? '');
    if (gFromToken && !selectedGroup.value) {
      selectedGroup.value = gFromToken;
      await nextTick();
    }

    if (!selectedGroup.value && secondIsStudentId) {
      const sid = Number(row.studentId);
      if (Number.isFinite(sid) && sid > 0) {
        const gFromStudent = resolveGroupFromStudentRecordId(sid);
        if (gFromStudent) {
          selectedGroup.value = gFromStudent;
          await nextTick();
        }
      }
    }

    const middleStart = secondIsStudentId ? 2 : 1;
    const middleParts = parts.slice(middleStart);
    if (!middleParts.length) return;

    const controlOpts = controlTextsForWorkTypeMatch();
    const wtHit = matchWorkTypeFromMiddle(middleParts, controlOpts);
    let typeK = 0;
    if (!wtHit) {
      row.workTitle = middleParts.join(' ').replace(/\s+/g, ' ').trim();
      return;
    }
    const curWt = String(workType.value ?? '').trim();
    if (!curWt) {
      workType.value = wtHit.hit;
      typeK = wtHit.consumedTokens;
    } else if (normalizeForMatch(curWt) === normalizeForMatch(wtHit.hit)) {
      typeK = wtHit.consumedTokens;
    } else {
      const locked = findLongestPrefixMatch(middleParts, [curWt]);
      typeK = locked?.k ?? 0;
    }

    await nextTick();

    const remainderParts = middleParts.slice(typeK);
    const topics = topicsForGroupAndWorkType(
      String(selectedGroup.value ?? '').trim(),
      String(workType.value ?? '').trim()
    );

    let topicWordCount = 0;
    if (remainderParts.length && topics.length) {
      if (!topic.value) {
        const topicHit = findLongestPrefixMatch(remainderParts, topics);
        if (topicHit) {
          topic.value = topicHit.hit;
          topicWordCount = topicHit.k;
        } else {
          const joinedRem = remainderParts.join(' ');
          const topicWhole = bestMatchOption(joinedRem, topics);
          if (topicWhole) {
            topic.value = topicWhole;
            topicWordCount = remainderParts.length;
          }
        }
      } else {
        topicWordCount = consumedWordsForTopic(remainderParts, topic.value);
      }
    }

    const titleParts = remainderParts.slice(topicWordCount);
    row.workTitle = titleParts.length
      ? titleParts.join(' ').replace(/\s+/g, ' ').trim()
      : remainderParts.join(' ').replace(/\s+/g, ' ').trim();
    if (!String(row.workTitle ?? '').trim()) {
      row.workTitle = middleParts.join(' ').replace(/\s+/g, ' ').trim();
    }
  }

  function formatBytes(n: number): string {
    const v = Number(n);
    if (!Number.isFinite(v) || v <= 0) return '—';
    const kb = 1024;
    const mb = kb * 1024;
    if (v >= mb) return `${(v / mb).toFixed(1)} МБ`;
    if (v >= kb) return `${Math.round(v / kb)} КБ`;
    return `${v} Б`;
  }

  function downloadAnnotated(r: Row) {
    const b64 = r.validation?.annotatedFileBase64;
    const name = r.validation?.annotatedFileName ?? `${r.file.name}_замечания.docx`;
    if (!b64) return;
    downloadAnnotatedFile(b64, name);
  }

  function buildUploadPayload(r: Row): UploadWorkPayload {
    return {
      studentId: Number(r.studentId),
      groupName: selectedGroup.value,
      topic: filteredTopicsList.value.length ? (topic.value || '') : '',
      controlType: '', // будет заполнено на сервере/в отчётах как есть; сейчас не вводим отдельно
      workType: workType.value,
      workTitle: r.workTitle,
      academicYear: academicYear.value,
      autoCheck: autoCheck.value,
      check: autoCheck.value ? (r.validation?.percent ?? null) : null,
      status: 'Загружен',
      uploadedBy: uploadedBy.value ?? 'unknown',
      file: r.file,
    };
  }

  function normalizeBatchFileKey(name: string): string {
    const s = String(name ?? '').trim();
    const base = (s.split(/[/\\]/).pop() ?? s).trim();
    return base.toLowerCase();
  }

  /** Сопоставление ответа /validate/batch со строками: имя файла (без учёта регистра) или порядок. */
  function applyBatchValidationToRows(res: BatchValidationResult, fileRows: Row[]) {
    const items = res.results ?? [];
    const byKey = new Map<string, ValidationResult>();
    for (const x of items) {
      const k = normalizeBatchFileKey(x.filename);
      if (k) byKey.set(k, x.result);
    }
    fileRows.forEach((r, i) => {
      const k = normalizeBatchFileKey(r.file.name);
      let val = k ? byKey.get(k) : undefined;
      if (!val && items[i]?.result) {
        val = items[i].result;
      }
      r.validation = val ?? null;
    });
  }

  async function executeBatchValidation(): Promise<void> {
    const resolved = workType.value.trim();
    const tid =
      props.templateId ??
      (resolved ? props.templateIdByWorkType?.[resolved] : undefined) ??
      null;
    const res = await validateBatch(
      rows.value.map((r) => r.file),
      { templateId: tid, annotate: annotate.value }
    );
    applyBatchValidationToRows(res, rows.value);
  }

  async function uploadAllRows(): Promise<void> {
    phase.value = 'upload';
    for (const r of rows.value) {
      const payload = buildUploadPayload(r);
      await uploadDisciplineReport(
        props.teacherLastName,
        props.planRowId,
        payload
      );
    }
    rows.value = [];
    errorText.value = '';
    emit('update:modelValue', false);
    emit('uploaded');
  }

  function closeBatchReviewDialog() {
    showBatchReviewDialog.value = false;
  }

  function openValidationDetail(r: Row) {
    if (!r.validation) return;
    validationDetailResult.value = r.validation;
    validationDetailBreadcrumb.value = r.file.name;
    showValidationDetailDialog.value = true;
  }

  async function confirmBatchUploadAfterReview() {
    showBatchReviewDialog.value = false;
    busy.value = true;
    try {
      await uploadAllRows();
    } catch (e: unknown) {
      errorText.value =
        e instanceof Error ? e.message : 'Ошибка загрузки';
    } finally {
      phase.value = 'idle';
      busy.value = false;
    }
  }

  async function validateAndUpload() {
    errorText.value = '';
    if (!canSubmit.value) {
      errorText.value =
        'Заполните группу, вид контроля, студента и название работы для каждого файла.';
      return;
    }
    busy.value = true;
    try {
      if (autoCheck.value) {
        phase.value = 'validate';
        await executeBatchValidation();
        showBatchReviewDialog.value = true;
        return;
      }
      await uploadAllRows();
    } catch (e: unknown) {
      errorText.value =
        e instanceof Error ? e.message : 'Ошибка загрузки';
    } finally {
      phase.value = 'idle';
      busy.value = false;
    }
  }

  watch(
    () => props.modelValue,
    (open) => {
      if (!open) {
        showBatchReviewDialog.value = false;
        showValidationDetailDialog.value = false;
        validationDetailResult.value = null;
        validationDetailBreadcrumb.value = '';
      }
    }
  );
</script>

<style scoped>
  .batch-card {
    border-radius: 16px;
    overflow: hidden;
  }
  .header {
    display: flex;
    align-items: flex-start;
    justify-content: space-between;
    gap: 12px;
    padding: 20px 24px 12px;
  }
  .header h3 {
    margin: 0;
    font-size: 20px;
    font-weight: 700;
    color: #0f172a;
  }
  .sub {
    margin-top: 6px;
    font-size: 13px;
    color: #64748b;
  }
  .body {
    padding: 12px 24px 16px;
  }
  .top-grid {
    display: grid;
    grid-template-columns: 1.2fr 1.2fr 1.6fr 0.8fr;
    gap: 12px;
    margin-bottom: 16px;
  }
  .field :deep(.v-field) {
    border-radius: 10px;
    background: #f8fafc;
  }
  .files-block {
    border: 1px solid #e2e8f0;
    border-radius: 14px;
    background: #ffffff;
    padding: 12px 14px;
  }
  .files-head {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 10px;
    margin-bottom: 10px;
  }
  .files-title {
    font-size: 14px;
    font-weight: 700;
    color: #0f172a;
  }
  .files-actions {
    display: flex;
    align-items: center;
    gap: 8px;
  }
  .empty {
    padding: 14px;
    color: #64748b;
    font-size: 13px;
    line-height: 1.5;
    background: #f8fafc;
    border-radius: 12px;
  }
  .table {
    display: flex;
    flex-direction: column;
    gap: 8px;
  }
  .thead {
    display: grid;
    grid-template-columns: 2fr 1.4fr 1.6fr 0.9fr 44px;
    gap: 10px;
    padding: 8px 10px;
    font-size: 12px;
    font-weight: 700;
    color: #475569;
  }
  .trow {
    display: grid;
    grid-template-columns: 2fr 1.4fr 1.6fr 0.9fr 44px;
    gap: 10px;
    padding: 10px;
    border: 1px solid #e2e8f0;
    border-radius: 12px;
    background: #f8fafc;
    align-items: start;
  }
  .file-name {
    font-weight: 600;
    color: #0f172a;
    word-break: break-word;
  }
  .file-meta {
    margin-top: 4px;
    font-size: 12px;
    color: #64748b;
  }
  .status {
    display: flex;
    align-items: center;
    gap: 8px;
    padding-top: 8px;
  }
  .pill {
    font-size: 12px;
    font-weight: 700;
    padding: 2px 8px;
    border-radius: 999px;
  }
  .pill.ok {
    background: #dcfce7;
    color: #166534;
  }
  .pill.warn {
    background: #fef3c7;
    color: #92400e;
  }
  .muted {
    font-size: 12px;
    color: #64748b;
  }
  .row-actions {
    display: flex;
    justify-content: flex-end;
    padding-top: 4px;
  }
  .annotated {
    grid-column: 1 / -1;
    margin-top: 6px;
  }
  .options {
    display: flex;
    flex-wrap: wrap;
    gap: 6px 18px;
    margin-top: 14px;
  }
  .error {
    margin-top: 12px;
    padding: 10px 12px;
    border-radius: 10px;
    background: #fef2f2;
    border: 1px solid #fecaca;
    color: #991b1b;
    font-size: 13px;
  }
  .actions {
    padding: 16px 24px 20px;
    gap: 10px;
    flex-wrap: wrap;
  }

  .batch-review-card {
    border-radius: 16px;
    overflow: hidden;
  }
  .batch-review-header {
    display: flex;
    align-items: flex-start;
    justify-content: space-between;
    gap: 12px;
    padding: 18px 20px 8px;
  }
  .batch-review-title {
    margin: 0;
    font-size: 18px;
    font-weight: 700;
    color: #0f172a;
  }
  .batch-review-sub {
    margin: 6px 0 0;
    font-size: 13px;
    color: #64748b;
    line-height: 1.4;
  }
  .batch-review-body {
    padding-top: 8px;
    max-height: min(52vh, 420px);
    overflow-y: auto;
  }
  .batch-review-row {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 12px;
    padding: 10px 12px;
    margin-bottom: 8px;
    border: 1px solid #e2e8f0;
    border-radius: 10px;
    background: #f8fafc;
  }
  .batch-review-row-main {
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    gap: 8px;
    min-width: 0;
    flex: 1;
  }
  .batch-review-fname {
    font-size: 13px;
    font-weight: 600;
    color: #0f172a;
    word-break: break-word;
    flex: 1 1 160px;
    min-width: 0;
  }
  .batch-review-actions {
    padding: 12px 20px 18px;
    flex-wrap: wrap;
  }

  @media (max-width: 900px) {
    .top-grid {
      grid-template-columns: 1fr;
    }
    .thead,
    .trow {
      grid-template-columns: 1fr;
    }
    .row-actions {
      justify-content: flex-start;
    }
  }
</style>

