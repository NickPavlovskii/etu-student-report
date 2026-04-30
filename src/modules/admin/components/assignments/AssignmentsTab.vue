<template>
  <div class="assignments-panel">
    <div class="toolbar">
      <div
        :class="['search-box', { 'search-box--active': searchFocused }]"
      >
        <v-icon
          class="search-box__icon"
          size="17"
        >
          mdi-magnify
        </v-icon>
        <input
          ref="searchEl"
          class="search-box__input"
          placeholder="Поиск по дисциплине или преподавателю…"
          :value="assignmentsSearch"
          @input="onSearchInput"
          @focus="searchFocused = true"
          @blur="searchFocused = false"
          @keydown.escape="clearSearch"
        />
        <Transition name="pop">
          <button
            v-if="assignmentsSearch"
            class="search-box__clear"
            type="button"
            aria-label="Очистить"
            @click="clearSearch"
          >
            <v-icon size="13">mdi-close</v-icon>
          </button>
        </Transition>
      </div>

      <div class="filters">
        <etu-pill-search-select
          :model-value="teacherFilter"
          placeholder="Все преподаватели"
          prepend-icon="mdi-account-outline"
          :items="teacherFilterItems"
          :clearable="true"
          :show-null-option="false"
          :clear-value="''"
          :searchable="true"
          search-placeholder="Фильтр по фактическому преподавателю…"
          class="filter-pill"
          @update:model-value="onTeacherFilterUpdate"
        />

        <etu-pill-search-select
          :model-value="courseFilter"
          placeholder="Все курсы"
          prepend-icon="mdi-school-outline"
          :items="courseFilterItems"
          :clearable="true"
          :show-null-option="false"
          :clear-value="''"
          :searchable="false"
          class="filter-pill filter-pill--course"
          @update:model-value="onCourseFilterUpdate"
        />
      </div>

      <Transition
        name="counter-swap"
        mode="out-in"
      >
        <admin-count-chip
          :key="countLabel"
          :label="countLabel"
        />
      </Transition>
    </div>

    <v-alert
      v-if="ctx.error.value"
      class="alert"
      type="error"
      density="compact"
      variant="tonal"
      closable
      @click:close="ctx.error.value = null"
    >
      {{ ctx.error.value }}
    </v-alert>

    <etu-data-table
      scrollable
      table-min-width="980px"
      :columns="columnsForTable"
      :rows="filteredAssignments"
      :loading="assignmentsLoading"
      :show-skeleton="true"
      :shadow="true"
      :row-class="() => 'assignments-table__tr'"
      :row-style="assignmentRowStyle"
      empty-icon="mdi-book-education-outline"
      empty-text="Нет строк рабочей программы"
    >
      <template #colgroup>
        <colgroup>
          <col
            v-for="c in visibleColumns"
            :key="c.key"
            :class="c.class"
          />
        </colgroup>
      </template>

      <template #cell-disciplineName="{ row }">
        <span class="cell-main">{{ row.disciplineName || '—' }}</span>
      </template>

      <template #cell-course="{ row }">
        <span>{{ formatCell(row.course) }}</span>
      </template>

      <template #cell-semester="{ row }">
        <span>{{ formatCell(row.semester) }}</span>
      </template>

      <template #cell-planTeacher="{ row }">
        <span
          class="plan-fio"
          :class="{ 'plan-fio--muted': row.hasOverride }"
        >
          {{ planFio(row) }}
        </span>
      </template>

      <template #cell-actualTeacher="{ row }">
        <div class="actual-cell">
          <etu-label-chip
            v-if="row.hasOverride"
            variant="inline"
            size="sm"
            label="Переопределено"
            icon="mdi-account-switch-outline"
            :icon-size="12"
            :root-class="'override-chip'"
          />
          <div class="actual-teacher-pill">
            <etu-pill-search-select
              :model-value="pillModelValue(row.planRowId)"
              :items="selectItems"
              placeholder="Фактический преподаватель"
              prepend-icon="mdi-account-outline"
              :clearable="false"
              :show-null-option="false"
              :searchable="true"
              search-placeholder="Поиск по ФИО…"
              :menu-width="320"
              :disabled="ctx.isRowSaving(row.planRowId)"
              @update:model-value="(v) => onTeacherPill(row, v)"
            />
          </div>
        </div>
      </template>
    </etu-data-table>
  </div>
</template>

<script setup lang="ts">
  import { computed, inject, ref, watch } from 'vue';
  import type { DisciplineTeacherAssignmentDto, TeacherDto } from '@/api/types';
  import EtuDataTable from '@/components/global/etu-data-table/EtuDataTable.vue';
  import EtuLabelChip from '@/components/global/EtuLabelChip.vue';
  import EtuPillSearchSelect from '@/components/global/EtuPillSearchSelect.vue';
  import type { TableColumn } from '@/components/global/etu-data-table/types';
  import AdminCountChip from '../AdminCountChip.vue';
  import { ASSIGNMENTS_TABLE_COLUMNS } from '../../constants';
  import { tdClass } from '../../utils/userTableHelpers';
  import { adminAssignmentsKey } from '../../injectionKeys';
  import type { AdminAssignmentsContext } from '../../injectionKeys';
  import { useUser } from '@/composables/useUser';
  import { useSuppressGlobalAxiosWhileLoading } from '@/composables/useSuppressGlobalAxiosWhileLoading';

  const assignmentsCtx = inject(adminAssignmentsKey);
  if (!assignmentsCtx) {
    throw new Error('AssignmentsTab: adminAssignmentsKey не найден');
  }
  const ctx: AdminAssignmentsContext = assignmentsCtx;

  const { user } = useUser();
  const actorLastName = computed(() => (user.value?.lastName ?? '').trim());

  const assignments = computed(() => ctx.assignments.value);
  const assignmentsLoading = computed(() => ctx.assignmentsLoading.value);
  const assignmentsSearch = computed({
    get: () => ctx.assignmentsSearch.value,
    set: (v: string) => {
      ctx.assignmentsSearch.value = v;
    },
  });

  const teacherFilter = ref('');
  const courseFilter = ref('');
  const searchFocused = ref(false);
  const searchEl = ref<HTMLInputElement>();
  const pendingByPlanRowId = ref<Record<number, string>>({});

  useSuppressGlobalAxiosWhileLoading(assignmentsLoading);

  const visibleColumns = computed(() =>
    ASSIGNMENTS_TABLE_COLUMNS.filter((c) => c.key !== 'actions')
  );

  const columnsForTable = computed<TableColumn<DisciplineTeacherAssignmentDto>[]>(() =>
    visibleColumns.value.map((c) => ({
      key: c.key,
      header: c.header,
      headerClass: c.headerClass,
      cellClass: tdClass(c.key),
    }))
  );

  function assignmentRowStyle(
    _row: DisciplineTeacherAssignmentDto,
    i: number
  ): Record<string, string> {
    return { '--i': String(i) };
  }

  function normLast(s: string | undefined | null) {
    return (s ?? '').trim().toLowerCase();
  }

  function fioFromParts(
    ln?: string | null,
    fn?: string | null,
    pat?: string | null
  ) {
    const p = [ln, fn, pat].filter((x) => (x ?? '').trim()).join(' ');
    return p || '—';
  }

  function planFio(row: DisciplineTeacherAssignmentDto) {
    if (row.planTeacherFio?.trim()) {
      return row.planTeacherFio.trim();
    }
    return fioFromParts(row.planLastName, row.planFirstName, row.planPatronymic);
  }

  function effectiveActualLastName(row: DisciplineTeacherAssignmentDto) {
    const a = (row.actualLastName ?? '').trim();
    if (a) {
      return row.actualLastName!.trim();
    }
    return (row.planLastName ?? '').trim();
  }

  function formatCell(v: number | string | undefined) {
    if (v === undefined || v === null || v === '') {
      return '—';
    }
    return String(v);
  }

  const teacherByNormLast = computed(() => {
    const m = new Map<string, TeacherDto>();
    for (const t of ctx.teachers.value) {
      const ln = (t.lastName ?? '').trim();
      if (ln) {
        m.set(normLast(ln), t);
      }
    }
    return m;
  });

  const selectItems = computed(() => {
    const seen = new Set<string>();
    const items: { title: string; value: string }[] = [];

    const pushTeacher = (t: TeacherDto) => {
      const ln = (t.lastName ?? '').trim();
      if (!ln || seen.has(normLast(ln))) {
        return;
      }
      seen.add(normLast(ln));
      const title =
        (t.fio ?? '').trim() ||
        fioFromParts(t.lastName, t.firstName, t.patronymic);
      items.push({ title, value: ln });
    };

    for (const t of ctx.teachers.value) {
      pushTeacher(t);
    }

    for (const row of ctx.assignments.value) {
      const ln = (row.planLastName ?? '').trim();
      if (ln && !seen.has(normLast(ln))) {
        seen.add(normLast(ln));
        items.push({ title: planFio(row), value: ln });
      }
    }

    items.sort((a, b) => a.title.localeCompare(b.title, 'ru'));
    return items;
  });

  const teacherFilterItems = computed(() => [
    ...selectItems.value,
  ]);

  const courseFilterItems = computed(() => {
    const set = new Set<string>();
    for (const row of assignments.value) {
      const c = formatCell(row.course);
      if (c !== '—') {
        set.add(c);
      }
    }
    return [...set]
      .sort((a, b) => Number(a) - Number(b))
      .map((v) => ({ title: `Курс ${v}`, value: v }));
  });

  const filteredAssignments = computed(() =>
    assignments.value.filter((row) => {
      if (teacherFilter.value) {
        const actualLn = normLast(effectiveActualLastName(row));
        const planLn = normLast(row.planLastName);
        const f = normLast(teacherFilter.value);
        if (actualLn !== f && planLn !== f) {
          return false;
        }
      }
      if (courseFilter.value && formatCell(row.course) !== courseFilter.value) {
        return false;
      }
      return true;
    })
  );

  function syncPendingFromRows() {
    const next: Record<number, string> = {};
    for (const row of ctx.assignments.value) {
      next[row.planRowId] = effectiveActualLastName(row);
    }
    pendingByPlanRowId.value = next;
  }

  watch(
    () => ctx.assignments.value,
    () => {
      syncPendingFromRows();
    },
    { deep: true, immediate: true }
  );

  const countLabel = computed(() => {
    const n = filteredAssignments.value.length;
    if (n === 0) return 'Нет записей';
    if (n === 1) return '1 назначение';
    if (n >= 2 && n <= 4) return `${n} назначения`;
    return `${n} назначений`;
  });

  function pendingLastName(planRowId: number) {
    return pendingByPlanRowId.value[planRowId] ?? '';
  }

  function pillModelValue(planRowId: number): string | null {
    const v = pendingLastName(planRowId);
    return v.trim() ? v : null;
  }

  function setPending(planRowId: number, lastName: string) {
    pendingByPlanRowId.value = {
      ...pendingByPlanRowId.value,
      [planRowId]: lastName,
    };
  }

  function isDirty(row: DisciplineTeacherAssignmentDto) {
    const cur = normLast(pendingLastName(row.planRowId));
    const eff = normLast(effectiveActualLastName(row));
    return cur !== eff;
  }

  function resolveTeacherForPut(
    pendingLast: string,
    row: DisciplineTeacherAssignmentDto
  ): TeacherDto {
    const fromDept = teacherByNormLast.value.get(normLast(pendingLast));
    if (fromDept) return fromDept;
    if (normLast(pendingLast) === normLast(row.planLastName)) {
      return {
        lastName: row.planLastName ?? pendingLast,
        firstName: row.planFirstName,
        patronymic: row.planPatronymic,
      };
    }
    if (normLast(pendingLast) === normLast(row.actualLastName)) {
      return {
        lastName: row.actualLastName ?? pendingLast,
        firstName: row.actualFirstName,
        patronymic: row.actualPatronymic,
      };
    }
    return { lastName: pendingLast };
  }

  async function onApply(row: DisciplineTeacherAssignmentDto) {
    const actor = actorLastName.value;
    if (!actor) return;
    const pending = pendingLastName(row.planRowId);
    const planLn = (row.planLastName ?? '').trim();
    if (normLast(pending) === normLast(planLn) && row.hasOverride) {
      await ctx.resetAssignment(row.planRowId, actor);
      return;
    }
    const t = resolveTeacherForPut(pending, row);
    await ctx.saveAssignment(row.planRowId, t, actor);
  }

  async function onTeacherPill(
    row: DisciplineTeacherAssignmentDto,
    v: string | null | string[]
  ) {
    if (Array.isArray(v)) return;
    const next = (v ?? '').trim();
    if (!next) return;
    setPending(row.planRowId, next);
    if (!isDirty(row)) return;
    await onApply(row);
  }

  function onSearchInput(ev: Event) {
    const v = (ev.target as HTMLInputElement).value;
    assignmentsSearch.value = v;
    ctx.debouncedLoadAssignments();
  }

  function clearSearch() {
    assignmentsSearch.value = '';
    searchEl.value?.focus();
    ctx.debouncedLoadAssignments();
  }

  function onTeacherFilterUpdate(v: string | null | string[]) {
    if (Array.isArray(v)) return;
    teacherFilter.value = (v ?? '').trim();
  }

  function onCourseFilterUpdate(v: string | null | string[]) {
    if (Array.isArray(v)) return;
    courseFilter.value = (v ?? '').trim();
  }
</script>

<style scoped>
  .assignments-panel {
    --ease: cubic-bezier(0.4, 0, 0.2, 1);
    position: relative;
    display: flex;
    flex-direction: column;
    gap: 16px;
    min-width: 0;
    min-height: 300px;
    font-family: 'DM Sans', 'Nunito Sans', system-ui, sans-serif;
  }
  .assignments-table__tr {
    transition: background 0.15s var(--ease);
    animation: slideIn 0.35s var(--ease) both;
    animation-delay: calc(var(--i, 0) * 22ms);
  }
  .assignments-table__tr:hover {
    background: #eff6ff;
  }
  @keyframes slideIn {
    from { opacity: 0; transform: translateY(4px); }
    to { opacity: 1; transform: translateY(0); }
  }
  :deep(.col-discipline) { width: 33%; min-width: 220px; }
  :deep(.col-course), :deep(.col-semester) { width: 7%; min-width: 56px; }
  :deep(.col-plan) { width: 22%; min-width: 170px; }
  :deep(.col-actual) { width: 31%; min-width: 250px; }

  .toolbar {
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    gap: 12px 16px;
    margin-bottom: 18px;
  }
  .filters {
    display: flex;
    gap: 10px;
    align-items: center;
  }
  .filter-pill { width: 260px; }
  .filter-pill--course { width: 170px; }

  .search-box {
    flex: 1 1 240px;
    max-width: 400px;
    display: flex;
    align-items: center;
    gap: 7px;
    height: 40px;
    padding: 0 12px;
    background: #eff6ff;
    border: 1.5px solid #bfdbfe;
    border-radius: 11px;
    transition: border-color 0.2s cubic-bezier(0.4, 0, 0.2, 1), background 0.2s cubic-bezier(0.4, 0, 0.2, 1), box-shadow 0.2s cubic-bezier(0.4, 0, 0.2, 1);
  }
  .search-box--active {
    border-color: #2563eb;
    background: #fff;
    box-shadow: 0 0 0 3px rgba(37, 99, 235, 0.18);
  }
  .search-box__icon { color: #a8a29e; flex-shrink: 0; transition: color 0.2s; }
  .search-box--active .search-box__icon { color: #2563eb; }
  .search-box__input {
    flex: 1;
    align-self: stretch;
    min-height: 0;
    border: 0;
    outline: 0;
    background: transparent;
    font: inherit;
    font-size: 13.5px;
    color: #1c1917;
    line-height: 1.35;
    padding: 0;
    margin: 0;
  }
  .search-box__input::placeholder { color: #a8a29e; }
  .search-box__clear {
    width: 22px;
    height: 22px;
    display: grid;
    place-items: center;
    border: 0;
    border-radius: 50%;
    background: #e7e5e4;
    color: #57534e;
    cursor: pointer;
    flex-shrink: 0;
    transition: background 0.15s, transform 0.15s;
  }
  .search-box__clear:hover { background: #a8a29e; color: #fff; transform: scale(1.08); }
  .alert { margin: 0; }
  .cell-main { font-weight: 600; color: #111827; line-height: 1.35; }
  .plan-fio { color: #44403c; font-size: 13px; line-height: 1.4; }
  .plan-fio--muted { color: #78716c; }
  .actual-cell { display: flex; flex-direction: column; align-items: stretch; gap: 8px; }
  :deep(.override-chip.etu-label-chip--inline) {
    align-self: flex-start;
    padding: 3px 8px 3px 6px;
    border-radius: 7px;
    font-size: 11px;
    font-weight: 700;
    line-height: 1.15;
    background: #eff6ff;
    color: #1d4ed8;
    border: 1px solid #bfdbfe !important;
  }
  .actual-teacher-pill { min-width: 0; width: 100%; max-width: 100%; }
  .actual-teacher-pill :deep(.etu-pss-trigger) { min-width: 0; max-width: 100%; height: 36px; }
  .actual-teacher-pill :deep(.etu-pss-trigger-text) { font-size: 12.5px; }
  .td--num { color: #57534e; font-size: 13px; font-weight: 600; }

  .pop-enter-active, .pop-leave-active { transition: opacity 0.12s ease, transform 0.12s ease; }
  .pop-enter-from, .pop-leave-to { opacity: 0; transform: scale(0.85); }
  .counter-swap-enter-active, .counter-swap-leave-active { transition: opacity 0.14s ease; }
  .counter-swap-enter-from, .counter-swap-leave-to { opacity: 0; }
</style>
