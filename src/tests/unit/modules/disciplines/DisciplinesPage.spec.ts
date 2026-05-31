import {
  describe,
  it,
  expect,
  vi,
  beforeEach,
  afterEach,
  beforeAll,
  afterAll,
} from 'vitest'
import { mount, flushPromises } from '@vue/test-utils'
import { defineComponent } from 'vue'

import DisciplinesPage from '@/modules/disciplines/DisciplinesPage.vue'

import type { DisciplineListRow } from '@/modules/disciplines/modal/disciplineCard'
import EtuInfoCard from '@/components/global/EtuInfoCard.vue'
import EtuPageHeader from '@/components/global/EtuPageHeader.vue'
import EtuSegmentSwitcher from '@/components/global/EtuSegmentSwitcher.vue'

vi.mock('@/api/axiosLoading', () => ({
  beginGlobalAxiosOverlaySuppression: vi.fn(),
  endGlobalAxiosOverlaySuppression: vi.fn(),
}))

const mocks = vi.hoisted(() => {
  type Row = import('@/modules/disciplines/modal/disciplineCard').DisciplineListRow
  const { ref, computed } = require('vue') as typeof import('vue')

  const uniqueDisciplines = ref<Row[]>([])

  function getFiltered(rowsInput: unknown): unknown[] {
    if (rowsInput != null && typeof rowsInput === 'object' && 'value' in rowsInput) {
      const v = (rowsInput as { value: unknown[] }).value
      return Array.isArray(v) ? v : []
    }
    if (Array.isArray(rowsInput)) return rowsInput
    return []
  }

  function useDisciplinesImpl(rowsInput?: unknown) {
    const totalGroups = computed(() => {
      const rows = getFiltered(rowsInput)
      let n = 0
      for (const d of rows) {
        const gc = Number((d as { groupsCount?: number }).groupsCount ?? 0)
        if (gc > 0) n += gc
      }
      return n
    })

    const totalWorksStats = computed(() => {
      const rows = getFiltered(rowsInput)
      let uploaded = 0
      let moodleUploaded = 0
      let total = 0
      for (const d of rows) {
        const row = d as {
          uploadedWorks?: number
          uploadedMoodleWorks?: number
          expectedWorksTotal?: number
          loadedCount?: number
          totalStudents?: number
        }
        if ((row.expectedWorksTotal ?? 0) > 0) {
          uploaded += row.uploadedWorks ?? 0
          moodleUploaded += row.uploadedMoodleWorks ?? 0
          total += row.expectedWorksTotal ?? 0
        } else {
          uploaded += row.loadedCount ?? 0
          total += row.totalStudents ?? 0
        }
      }
      return { uploaded, moodleUploaded, total }
    })

    return {
      loading: ref(false),
      loadData: vi.fn(),
      uniqueDisciplines: computed(() => uniqueDisciplines.value),
      totalGroups,
      totalWorksStats,
    }
  }

  return { uniqueDisciplines, useDisciplinesImpl }
})

vi.mock('@/modules/disciplines/composables/useDisciplinesList', () => ({
  useDisciplines(filteredRows?: unknown) {
    return mocks.useDisciplinesImpl(filteredRows)
  },
}))

const userRef = vi.hoisted(() => {
  const { ref } = require('vue') as typeof import('vue')
  return ref({ lastName: 'Тестов' })
})

vi.mock('@/composables/useUser', () => ({
  useUser: () => ({ user: userRef }),
}))

const academicYearRef = vi.hoisted(() => {
  const { ref } = require('vue') as typeof import('vue')
  return ref('2024-2025')
})

vi.mock('@/composables/useAcademicYear', () => ({
  useAcademicYear: () => ({ academicYear: academicYearRef }),
}))

const pushSpy = vi.fn()

vi.mock('vue-router', () => ({
  useRouter: () => ({
    push: pushSpy,
  }),
}))

let nextSyntheticCodeRow = 10000

function makeRow(overrides: Partial<DisciplineListRow>): DisciplineListRow {
  const Discipline =
    overrides.Discipline ??
    overrides._key?.split('__')[0] ??
    'Дисциплина'

  return {
    CodeRow: overrides.CodeRow ?? ++nextSyntheticCodeRow,
    _key: overrides._key ?? `${Discipline}__${overrides.Course ?? '1'}__${overrides.Semester ?? '1'}`,
    Discipline,
    Course: overrides.Course ?? '1',
    Semester: overrides.Semester ?? '1',
    Assessment: overrides.Assessment ?? '—',
    groupsCount: overrides.groupsCount ?? 1,
    groups: overrides.groups ?? [],
    loadedCount: overrides.loadedCount ?? 0,
    totalStudents: overrides.totalStudents ?? 0,
    uploadedWorks: overrides.uploadedWorks ?? 0,
    uploadedMoodleWorks: overrides.uploadedMoodleWorks ?? 0,
    expectedWorksTotal: overrides.expectedWorksTotal ?? 0,
    loaded: overrides.loaded ?? '',
    progress: overrides.progress ?? 0,
    educationForm: overrides.educationForm ?? 'Очная',
    educationLevel: overrides.educationLevel ?? 'Магистратура',
    ...overrides,
  }
}

/** Нечётный семестр по плану — половина года «осень». */
function autumnCourse(): DisciplineListRow {
  return makeRow({
    CodeRow: 901,
    _key: 'math__2__1',
    Discipline: 'Осенняя теория',
    Course: '2',
    Semester: '1',
    uploadedWorks: 5,
    expectedWorksTotal: 20,
    groupsCount: 2,
  })
}

/** Чётный семестр по плану — половина года «весна». */
function springCourses(): DisciplineListRow[] {
  return [
    makeRow({
      CodeRow: 902,
      _key: 'phys__3__2',
      Discipline: 'Весенняя практика',
      Course: '3',
      Semester: '2',
      uploadedWorks: 10,
      expectedWorksTotal: 30,
      groupsCount: 2,
    }),
    makeRow({
      CodeRow: 903,
      _key: 'chem__1__2',
      Discipline: 'Весенняя семинарская',
      Course: '1',
      Semester: '2',
      uploadedWorks: 10,
      expectedWorksTotal: 40,
      groupsCount: 1,
    }),
  ]
}

const EtuPillSearchSelectStub = defineComponent({
  name: 'EtuPillSearchSelect',
  props: ['modelValue', 'items'],
  emits: ['update:modelValue'],
  template: '<span class="course-filter-stub" />',
})

const defaultStubs = {
  transition: false,
  Transition: false,
  'etu-loading-page': true,
  'v-icon': true,
  'v-container': { template: '<div class="v-container"><slot /></div>' },
  'v-row': { template: '<div class="v-row"><slot /></div>' },
  'v-col': { template: '<div class="v-col"><slot /></div>' },
  'v-chip': true,
  'v-btn': { template: '<button type="button"><slot /></button>' },
  'v-menu': {
    props: ['modelValue'],
    template:
      '<div class="v-menu-stub"><slot name="activator" :props="{}" /><slot /></div>',
  },
  'v-card': { template: '<div class="v-card"><slot /></div>' },
  'v-list': true,
  'v-list-item': true,
  'v-list-item-title': true,
  'v-divider': true,
  'v-text-field': {
    props: ['modelValue'],
    emits: ['update:modelValue'],
    template:
      '<input role="searchbox" class="v-text-field-stub" :value="modelValue" @input="$emit(\'update:modelValue\', $event.target.value)" />',
  },
  'etu-pill-search-select': EtuPillSearchSelectStub,
  'discipline-card': {
    template: '<div class="discipline-card-stub">{{ item.Discipline }}</div>',
    props: ['item'],
  },
}

function mountDisciplinesPage() {
  return mount(DisciplinesPage, {
    attachTo: document.body,
    global: {
      components: {
        'etu-info-card': EtuInfoCard,
        'etu-page-header': EtuPageHeader,
        'etu-segment-switcher': EtuSegmentSwitcher,
      },
      stubs: defaultStubs,
    },
  })
}

describe('DisciplinesPage: семестр, поиск, курс и данные по дисциплине', () => {
  beforeAll(() => {
    vi.useFakeTimers()
    vi.setSystemTime(new Date('2026-05-08T12:00:00+03:00'))
  })

  afterAll(() => {
    vi.useRealTimers()
  })

  beforeEach(() => {
    mocks.uniqueDisciplines.value = [autumnCourse(), ...springCourses()]
    userRef.value = { lastName: 'Тестов' }
    academicYearRef.value = '2024-2025'
    pushSpy.mockClear()
  })

  afterEach(() => {
    document.body.innerHTML = ''
  })

  it('переключает половину семестра: показывает только строки нужного семестра', async () => {
    const wrapper = mountDisciplinesPage()
    await flushPromises()

    expect(wrapper.text()).toContain('Весенняя практика')
    expect(wrapper.text()).toContain('Весенняя семинарская')
    expect(wrapper.text()).not.toContain('Осенняя теория')

    const switcherBtns = wrapper.find('.etu-segment-switcher').findAll('button')
    await switcherBtns[0]!.trigger('click')
    await flushPromises()

    expect(wrapper.text()).toContain('Осенняя теория')
    expect(wrapper.text()).not.toContain('Весенняя практика')

    const springBtn = wrapper.find('.etu-segment-switcher').findAll('button').filter((b) =>
      b.text().includes('Весенний')
    )
    expect(springBtn.length).toBe(1)
    await springBtn[0]!.trigger('click')
    await flushPromises()

    expect(wrapper.text()).toContain('Весенняя семинарская')
  })

  it('Поиск по названию фильтрует видимые дисциплины', async () => {
    const wrapper = mountDisciplinesPage()
    await flushPromises()

    const input = wrapper.get('input.disciplines-search')
    await input.setValue('семинар')
    await flushPromises()

    expect(wrapper.text()).toContain('Весенняя семинарская')
    expect(wrapper.text()).not.toContain('Весенняя практика')
  })

  it('фильтр по курсу (мульти-выбор) оставляет только выбранные курсы', async () => {
    const wrapper = mountDisciplinesPage()
    await flushPromises()

    const pill = wrapper.findComponent({ name: 'EtuPillSearchSelect' })
    expect(pill.exists()).toBe(true)
    await pill.vm.$emit('update:modelValue', ['1'])
    await flushPromises()

    expect(wrapper.text()).toContain('Весенняя семинарская')
    expect(wrapper.text()).not.toContain('Весенняя практика')
  })

  it('карточки статистики отражают отфильтрованный список', async () => {
    const wrapper = mountDisciplinesPage()
    await flushPromises()

    function cardProp(titleRu: string) {
      const c = wrapper
        .findAllComponents(EtuInfoCard)
        .find((i) => i.props('title') === titleRu)
      expect(c?.exists()).toBe(true)
      return c!.props('value')
    }

    /**
     * Весенняя половина: две строки × groupsCount 2+1 → сумма групп = 3;
     * загрузки работ: (10/30)+(10/40) → 20 / 70.
     * Счётчик «Дисциплины» — число видимых строк (с groupsCount > 0) = 2.
     */
    expect(cardProp('Дисциплины')).toBe(2)
    expect(cardProp('Группы')).toBe(3)
    expect(cardProp('Учебных работ загружено')).toBe('20 / 70')

    const pill = wrapper.findComponent({ name: 'EtuPillSearchSelect' })
    await pill.vm.$emit('update:modelValue', ['1'])
    await flushPromises()

    /** Одна строка «курс 1», groupsCount = 1, работы только по ней → 10 / 40 */
    expect(cardProp('Дисциплины')).toBe(1)
    expect(cardProp('Группы')).toBe(1)
    expect(cardProp('Учебных работ загружено')).toBe('10 / 40')
  })
})
