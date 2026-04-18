<template>
  <v-container
    fluid
    class="page"
  >
    <etu-page-header
      icon="mdi-cog-outline"
      title="Настройки дисциплины"
      subtitle="Управление шаблонами проверки отчетов и видами контроля"
    />

    <div class="settings-nav">
      <settings-tabs-nav
        v-model="activeTab"
        @add="showAddModal = true"
      />
      <templates-tab
        v-show="activeTab === 'templates'"
        :templates="templates"
        :loading="templatesLoading"
        :error="templatesError"
        :can-edit="isAdminRole"
        :hide-add-button="true"
        @edit="onEditTemplate"
        @delete="onDeleteTemplate"
        @retry="loadTemplates"
      />
      <control-types-tab
        v-show="activeTab === 'control-types'"
        v-model:discipline-id="selectedDisciplineId"
        :disciplines="disciplines"
        :control-types="controlTypes"
        :templates="templates"
        :topics-by-control-type="topicsByControlType"
        :loading="disciplinesLoading || controlTypesLoading"
        :can-edit="!!user?.lastName"
        @save="onSaveControlTypes"
      />
    </div>

    <add-template-modal
      :key="editingTemplateId ?? 'new'"
      v-model="showAddModal"
      :initial-form="editingTemplateForm"
      @submit="onSubmitTemplate"
      @close="closeAddModal"
    />

    <v-snackbar
      v-model="saveSuccessVisible"
      :timeout="3000"
      color="success"
      location="bottom"
      variant="tonal"
    >
      <div class="snackbar-content">
        <v-icon size="22">mdi-check-circle-outline</v-icon>
        <span>Настройки сохранены успешно</span>
      </div>
    </v-snackbar>
  </v-container>
</template>

<script setup lang="ts">
  import { ref, onMounted, computed, watch } from 'vue';
  import { useRouter } from 'vue-router';
  import { useUser } from '@/composables/useUser';
  import { useAcademicYear } from '@/composables/useAcademicYear';
  import SettingsTabsNav from './components/SettingsTabsNav.vue';
  import TemplatesTab from './components/TemplatesTab.vue';
  import ControlTypesTab from './components/ControlTypesTab.vue';
  import AddTemplateModal from './components/AddTemplateModal.vue';
  import {
    getTemplates,
    getTemplate,
    createTemplate,
    updateTemplate,
    deleteTemplate,
    getDisciplineCards,
    getControlTypesFromApi,
    getDisciplineControls,
    type TemplateDto,
    type TemplateCriteriaDto,
  } from '@/api/info';
  import { JAVA_TEMPLATE_CRITERIA_DEFAULTS as J } from '@/api/info';
  import {
    mergeControlTypesWithSettings,
    saveControlTypesForDiscipline,
  } from './composables/useDisciplineControlTypes';
  import type { TemplateItem, ControlTypeItem, AddTemplateForm } from './modal';

  const router = useRouter();
  const { user } = useUser();
  const { academicYear } = useAcademicYear();

  const isAdminRole = computed(() => {
    const role = String(user.value?.role ?? '').toUpperCase();
    return role
      .split(',')
      .map((r) => r.trim())
      .includes('ADMIN');
  });

  const activeTab = ref<string>('templates');
  const showAddModal = ref(false);
  const editingTemplateForm = ref<AddTemplateForm | null>(null);
  const editingTemplateId = ref<string | null>(null);
  const templatesLoading = ref(false);
  const templatesError = ref<string | null>(null);

  const templates = ref<TemplateItem[]>([]);

  const disciplines = ref<{ id: string; name: string }[]>([]);
  const disciplinesLoading = ref(false);
  const controlTypesLoading = ref(false);
  const selectedDisciplineId = ref<string>('');
  const controlTypes = ref<ControlTypeItem[]>([]);
  const topicsByControlType = ref<Record<string, string[]>>({});
  const saveSuccessVisible = ref(false);

  function dtoToItem(dto: TemplateDto): TemplateItem {
    const sections = [
      dto.hasTitlePage,
      dto.hasToc,
      dto.hasIntroduction,
      dto.hasMainPart,
      dto.hasConclusion,
      dto.hasBibliography,
      dto.hasAppendices,
    ].filter(Boolean).length;
    const criteria = 11;
    const font =
      [dto.font, dto.fontSize].filter(Boolean).join(', ') ||
      'Times New Roman, 14pt';
    return {
      id: String(dto.id ?? ''),
      name: dto.name ?? '',
      description: dto.description ?? '',
      criteriaCount: criteria,
      sectionsCount: sections || 6,
      font,
      minPages: dto.minPages ? `${dto.minPages}+ стр.` : '10+ стр.',
      minSources: dto.minSources ? `${dto.minSources}+ ист.` : '7+ ист.',
      raw: dto as Record<string, unknown>,
    };
  }

  const FONT_SIZE_OPTIONS = [
    '9 пт',
    '10 пт',
    '11 пт',
    '12 пт',
    '14 пт',
    '16 пт',
    '18 пт',
    '20 пт',
    '22 пт',
    '24 пт',
  ];

  function normalizeFontSize(val: unknown): string {
    const s = String(val ?? '14')
      .trim()
      .replace(/\s*pt\s*/gi, '')
      .replace(/\s*пт\s*/gi, '');
    const num = parseInt(s, 10);
    const match = FONT_SIZE_OPTIONS.find((o) => o.startsWith(String(num)));
    return match ?? (num ? `${num} пт` : '14 пт');
  }

  const FIGURE_POSITION_UI = [
    'По центру страницы',
    'Слева',
    'Справа',
    'По ширине страницы',
  ] as const;
  const TABLE_POSITION_UI = [
    'Справа',
    'Слева',
    'По центру страницы',
  ] as const;
  const FIGURE_CAPTION_UI = ['Под рисунком', 'Над рисунком'] as const;
  const TABLE_TITLE_UI = [
    'Слово «Таблица» + номер + наименование',
    'Таблица N. — наименование',
    'Таблица с номером над таблицей',
    'Над таблицей по центру',
  ] as const;
  const ILL_NUMBERING_UI = [
    'Сквозная',
    'По разделам',
    'В рамках раздела',
  ] as const;

  function normalizeFigurePositionUi(v: unknown): string {
    const raw = v != null ? String(v).trim() : '';
    if (
      FIGURE_POSITION_UI.includes(raw as (typeof FIGURE_POSITION_UI)[number])
    ) {
      return raw;
    }
    const low = raw.toLowerCase();
    if (!raw) return 'По центру страницы';
    if (low.includes('ширин')) return 'По ширине страницы';
    if (
      low.includes('справа') ||
      low.includes('прав') ||
      low.includes('right')
    ) {
      return 'Справа';
    }
    if (low.includes('слева') || low.includes('лев') || low.includes('left')) {
      return 'Слева';
    }
    if (low.includes('центр') || low.includes('center')) {
      return 'По центру страницы';
    }
    return 'По центру страницы';
  }

  function normalizeTablePositionUi(v: unknown): string {
    const raw = v != null ? String(v).trim() : '';
    if (TABLE_POSITION_UI.includes(raw as (typeof TABLE_POSITION_UI)[number])) {
      return raw;
    }
    const low = raw.toLowerCase();
    if (!raw) return J.tablePosition ?? 'Справа';
    if (low.includes('ширин')) {
      return 'По центру страницы';
    }
    if (
      low.includes('справа') ||
      low.includes('прав') ||
      low.includes('right')
    ) {
      return 'Справа';
    }
    if (low.includes('слева') || low.includes('лев') || low.includes('left')) {
      return 'Слева';
    }
    if (low.includes('центр') || low.includes('center')) {
      return 'По центру страницы';
    }
    return 'По центру страницы';
  }

  function normalizeFigureCaptionUi(v: unknown): string {
    const raw = v != null ? String(v).trim() : '';
    if (FIGURE_CAPTION_UI.includes(raw as (typeof FIGURE_CAPTION_UI)[number])) {
      return raw;
    }
    const low = raw.toLowerCase();
    if (!raw) return 'Под рисунком';
    if (low.includes('над рисунк') || low.includes('above figure')) {
      return 'Над рисунком';
    }
    if (low.includes('под рисунк') || low.includes('under')) {
      return 'Под рисунком';
    }
    if (low.includes('над')) return 'Над рисунком';
    if (low.includes('под')) return 'Под рисунком';
    return 'Под рисунком';
  }

  function normalizeTableTitleUi(v: unknown): string {
    const raw = v != null ? String(v).trim() : '';
    if (TABLE_TITLE_UI.includes(raw as (typeof TABLE_TITLE_UI)[number])) {
      return raw;
    }
    if (!raw) return TABLE_TITLE_UI[0];
    const low = raw.toLowerCase();
    if (low.includes('над таблицей') && low.includes('центр')) {
      return 'Над таблицей по центру';
    }
    if (low.includes('с номером над') || low.includes('номер над таблиц')) {
      return 'Таблица с номером над таблицей';
    }
    if (low.includes('— наименован') || low.includes('- наименован')) {
      return 'Таблица N. — наименование';
    }
    if (low.includes('таблица') && (low.includes('номер') || low.includes('«'))) {
      return 'Слово «Таблица» + номер + наименование';
    }
    return TABLE_TITLE_UI[0];
  }

  function normalizeTableTitlePlacementUi(v: unknown): string {
    const raw = v != null ? String(v).trim() : '';
    if (raw === 'Над таблицей' || raw === 'Под таблицей') return raw;
    const low = raw.toLowerCase();
    if (!raw) return 'Над таблицей';
    if (low.includes('под')) return 'Под таблицей';
    return 'Над таблицей';
  }

  function normalizeIllNumberingUi(v: unknown): string {
    const raw = v != null ? String(v).trim() : '';
    if (ILL_NUMBERING_UI.includes(raw as (typeof ILL_NUMBERING_UI)[number])) {
      return raw;
    }
    const low = raw.toLowerCase();
    if (!raw) return 'Сквозная';
    if (low.includes('рамк') && low.includes('раздел')) {
      return 'В рамках раздела';
    }
    if (low.includes('раздел')) return 'По разделам';
    return 'Сквозная';
  }

  function dtoToForm(
    dto: TemplateDto | Record<string, unknown> | undefined
  ): AddTemplateForm {
    const t = (dto ?? {}) as Record<string, unknown>;
    return {
      name: String(t.name ?? ''),
      description: String(t.description ?? ''),
      fileFormat: String(t.fileFormat ?? J.fileFormat),
      font: String(t.font ?? J.font),
      fontSize: normalizeFontSize(t.fontSize),
      lineSpacing: String(t.lineSpacing ?? J.lineSpacing),
      minPages: String(t.minPages ?? J.minPages),
      minSources: String(t.minSources ?? J.minSources),
      illNumbering: normalizeIllNumberingUi(t.illNumbering),
      figurePosition: normalizeFigurePositionUi(t.figurePosition),
      figureCaption: normalizeFigureCaptionUi(t.figureCaption),
      tableTitle: normalizeTableTitleUi(t.tableTitle),
      tableTitlePlacement: normalizeTableTitlePlacementUi(t.tableTitlePlacement),
      tablePosition: normalizeTablePositionUi(t.tablePosition),
      submissionFormat: String(t.submissionFormat ?? 'Электронный вид'),
      titlePageRequiredStrings: Array.isArray(t.titlePageRequiredStrings)
        ? (t.titlePageRequiredStrings as string[])
        : undefined,
      hasTitlePage: Boolean(t.hasTitlePage ?? J.hasTitlePage),
      hasToc: Boolean(t.hasToc ?? J.hasToc),
      hasIntroduction: Boolean(t.hasIntroduction ?? J.hasIntroduction),
      hasMainPart: Boolean(t.hasMainPart ?? J.hasMainPart),
      hasConclusion: Boolean(t.hasConclusion ?? J.hasConclusion),
      hasBibliography: Boolean(t.hasBibliography ?? J.hasBibliography),
      hasAppendices: Boolean(t.hasAppendices ?? J.hasAppendices),
    };
  }

  function criteriaFromForm(form: AddTemplateForm): TemplateCriteriaDto {
    return {
      fileFormat: form.fileFormat,
      font: form.font,
      fontSize: form.fontSize,
      lineSpacing: form.lineSpacing,
      minPages: form.minPages,
      minSources: form.minSources,
      illNumbering: form.illNumbering,
      figurePosition: normalizeFigurePositionUi(form.figurePosition),
      figureCaption: form.figureCaption,
      tableTitle: form.tableTitle,
      tableTitlePlacement: form.tableTitlePlacement,
      tablePosition: normalizeTablePositionUi(form.tablePosition),
      submissionFormat: form.submissionFormat,
      titlePageRequiredStrings: form.titlePageRequiredStrings,
      hasTitlePage: form.hasTitlePage,
      hasToc: form.hasToc,
      hasIntroduction: form.hasIntroduction,
      hasMainPart: form.hasMainPart,
      hasConclusion: form.hasConclusion,
      hasBibliography: form.hasBibliography,
      hasAppendices: form.hasAppendices,
    };
  }

  function formToDto(form: AddTemplateForm): TemplateDto {
    return {
      name: form.name,
      description: form.description,
      criteria: criteriaFromForm(form),
    };
  }

  async function loadTemplates() {
    templatesLoading.value = true;
    templatesError.value = null;
    try {
      const list = await getTemplates();
      templates.value = list.map(dtoToItem);
    } catch (e: unknown) {
      templatesError.value =
        e instanceof Error ? e.message : 'Не удалось загрузить шаблоны';
      templates.value = [];
    } finally {
      templatesLoading.value = false;
    }
  }

  async function loadDisciplines() {
    const ln = user.value?.lastName;
    if (!ln) return;
    disciplinesLoading.value = true;
    try {
      const year = academicYear.value;
      const cards = await getDisciplineCards(ln, year);
      const raw = Array.isArray(cards)
        ? cards
        : (cards?.data ?? cards?.cards ?? []);
      const seen = new Map<string, { id: string; name: string }>();
      for (const c of raw) {
        const planId = String(c?.planRowId ?? c?.plan_row_id ?? '');
        const name = String(
          c?.disciplineName ?? c?.discipline_name ?? 'Без названия'
        )
          .replace(/"/g, '')
          .trim();
        if (planId && !seen.has(planId)) {
          seen.set(planId, { id: planId, name: name || 'Дисциплина' });
        }
      }
      disciplines.value = [...seen.values()];
      if (disciplines.value.length > 0 && !selectedDisciplineId.value) {
        selectedDisciplineId.value = disciplines.value[0].id;
      }
    } catch {
      disciplines.value = [];
    } finally {
      disciplinesLoading.value = false;
    }
  }

  function normalizeTopicsFromApi(topics: unknown): string[] {
    if (Array.isArray(topics)) return topics.map(String);
    if (typeof topics === 'string') {
      try {
        const parsed = JSON.parse(topics);
        if (Array.isArray(parsed)) return parsed.map(String);
      } catch {
        return [topics];
      }
    }
    return [];
  }

  function splitTopicsText(text: string): string[] {
    const s = (text ?? '').trim();
    if (!s) return [];
    const parts = s
      .split(/,\s*(?=Тема\s*\d+\.)/g)
      .map((x) => x.trim())
      .filter(Boolean);
    return parts.length > 0 ? parts : [s];
  }

  async function loadControlTypesForDiscipline() {
    const id = selectedDisciplineId.value;
    const ln = user.value?.lastName;
    if (!ln) {
      controlTypes.value = [];
      topicsByControlType.value = {};
      return;
    }
    controlTypesLoading.value = true;
    try {
      const year = academicYear.value;
      const planIds = disciplines.value
        .map((d) => Number(d.id))
        .filter((n) => Number.isFinite(n) && n > 0);
      const planRowId = id ? Number(id) : 0;
      const hasDiscipline = Number.isFinite(planRowId) && planRowId > 0;

      const [titlesFromApi, controlsRes] = await Promise.all([
        planIds.length
          ? getControlTypesFromApi(
              ln,
              hasDiscipline ? [planRowId] : planIds,
              year
            )
          : Promise.resolve([]),
        hasDiscipline
          ? getDisciplineControls(ln, planRowId, year).catch(() => [])
          : Promise.resolve([]),
      ]);

      const defaultTemplateId = templates.value[0]?.id ?? null;
      controlTypes.value = mergeControlTypesWithSettings(
        id || 'all',
        titlesFromApi,
        defaultTemplateId
      );

      const byType: Record<string, Set<string>> = {};
      for (const c of controlsRes ?? []) {
        const ct = String(c?.controlText ?? '').trim();
        if (!ct) continue;
        const topics = normalizeTopicsFromApi(c?.topics ?? []).flatMap((t) =>
          splitTopicsText(String(t))
        );
        const set = (byType[ct] ??= new Set());
        topics.forEach((t) => set.add(t));
      }
      const next: Record<string, string[]> = {};
      for (const [k, set] of Object.entries(byType)) {
        next[k] = [...set].sort((a, b) => a.localeCompare(b));
      }
      topicsByControlType.value = next;
    } catch {
      controlTypes.value = [];
      topicsByControlType.value = {};
    } finally {
      controlTypesLoading.value = false;
    }
  }

  watch(
    selectedDisciplineId,
    () => {
      loadControlTypesForDiscipline();
    },
    { immediate: true }
  );

  onMounted(async () => {
    if (!user.value?.lastName) {
      router.push('/auth');
      return;
    }
    await Promise.all([loadTemplates(), loadDisciplines()]);
    await loadControlTypesForDiscipline();
  });

  watch(activeTab, (tab) => {
    if (
      tab === 'templates' &&
      templates.value.length === 0 &&
      !templatesLoading.value
    ) {
      loadTemplates();
    }
    if (
      tab === 'control-types' &&
      disciplines.value.length === 0 &&
      !disciplinesLoading.value
    ) {
      loadDisciplines();
    }
  });

  watch(academicYear, async () => {
    await loadDisciplines();
    await loadControlTypesForDiscipline();
  });

  async function onEditTemplate(template: TemplateItem) {
    editingTemplateId.value = template.id;
    const rawBase: Record<string, unknown> =
      (template.raw as Record<string, unknown> | undefined) ?? {
        name: template.name,
        description: template.description,
        minPages: template.minPages.replace(/\D/g, '') || '10',
        minSources: template.minSources.replace(/\D/g, '') || '7',
        font: template.font.split(',')[0]?.trim() || 'Times New Roman',
        fontSize: template.font.includes('14') ? '14 пт' : '12 пт',
      };
    try {
      const full = await getTemplate(template.id);
      if (full) {
        const f = full as Record<string, unknown>;
        const merged: Record<string, unknown> = {
          ...rawBase,
          ...f,
          name:
            f.name != null && String(f.name).trim() !== ''
              ? f.name
              : (rawBase.name ?? template.name),
          description:
            f.description != null && String(f.description).trim() !== ''
              ? f.description
              : (rawBase.description ?? template.description),
        };
        editingTemplateForm.value = dtoToForm(merged);
      } else {
        editingTemplateForm.value = dtoToForm(rawBase);
      }
    } catch {
      editingTemplateForm.value = dtoToForm(rawBase);
    }
    showAddModal.value = true;
  }

  async function onDeleteTemplate(template: TemplateItem) {
    if (!confirm(`Удалить шаблон «${template.name}»?`)) return;
    try {
      await deleteTemplate(template.id);
      templates.value = templates.value.filter((t) => t.id !== template.id);
    } catch (e: unknown) {
      alert(e instanceof Error ? e.message : 'Ошибка при удалении');
    }
  }

  async function onSubmitTemplate(form: AddTemplateForm) {
    const templateId = editingTemplateId.value;
    try {
      const dto = formToDto(form);
      if (templateId) {
        await updateTemplate(templateId, dto);
        const fresh = await getTemplate(templateId);
        const idx = templates.value.findIndex(
          (t) => String(t.id) === String(templateId)
        );
        if (idx >= 0) {
          const row = {
            ...(fresh ?? ({} as TemplateDto)),
            ...dto,
            id: fresh?.id ?? templateId,
          } as TemplateDto;
          templates.value[idx] = dtoToItem(row);
        }
      } else {
        const created = await createTemplate(dto);
        const full =
          created?.id != null ? await getTemplate(created.id) : null;
        const row = {
          ...(full ?? created),
          ...dto,
          id: full?.id ?? created?.id,
        } as TemplateDto;
        templates.value.push(dtoToItem(row));
      }
      closeAddModal();
    } catch (e: unknown) {
      alert(e instanceof Error ? e.message : 'Ошибка при сохранении');
    }
  }

  function closeAddModal() {
    showAddModal.value = false;
    editingTemplateForm.value = null;
    editingTemplateId.value = null;
  }

  function onSaveControlTypes() {
    const id = selectedDisciplineId.value;
    if (id) {
      saveControlTypesForDiscipline(id, controlTypes.value);
      saveSuccessVisible.value = true;
    }
  }
</script>

<style scoped>
  .page {
    background: #f5f6f8;
    padding: 28px 30px 50px;
    min-height: 100%;
  }

  .settings-nav {
    margin-bottom: 24px;
  }

  .snackbar-content {
    display: inline-flex;
    align-items: center;
    gap: 10px;
    font-weight: 500;
  }
</style>
