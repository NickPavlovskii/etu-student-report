import { describe, it, expect, vi, beforeEach } from 'vitest'
import { ref } from 'vue'
import { useAnalytics } from '@/modules/analytics/composables/useAnalytics'

const {
  userState,
  getTeacherStatsMock,
  getTeacherStatsDisciplinesTableMock,
  getTeacherStatsBySemesterMock,
  getAdminAnalyticsMock,
  getAdminAnalyticsTeachersSummaryMock,
  getAdminAnalyticsDisciplinesTableMock,
  getAdminAnalyticsBySemesterMock,
  getDepartmentDisciplinesWithTeachersMock,
  getDisciplineCardsMock,
  teacherCardsResponseToArrayMock,
} = vi.hoisted(() => ({
  userState: {
    lastName: { value: 'Иванов' },
    canSeeAll: { value: false },
  },
  getTeacherStatsMock: vi.fn(),
  getTeacherStatsDisciplinesTableMock: vi.fn(),
  getTeacherStatsBySemesterMock: vi.fn(),
  getAdminAnalyticsMock: vi.fn(),
  getAdminAnalyticsTeachersSummaryMock: vi.fn(),
  getAdminAnalyticsDisciplinesTableMock: vi.fn(),
  getAdminAnalyticsBySemesterMock: vi.fn(),
  getDepartmentDisciplinesWithTeachersMock: vi.fn(),
  getDisciplineCardsMock: vi.fn(),
  teacherCardsResponseToArrayMock: vi.fn(),
}))

vi.mock('@/composables/useUser', () => ({
  useUser: () => userState,
}))

vi.mock('@/api/info', () => ({
  getTeacherStats: getTeacherStatsMock,
  getTeacherStatsDisciplinesTable: getTeacherStatsDisciplinesTableMock,
  getTeacherStatsBySemester: getTeacherStatsBySemesterMock,
  getAdminAnalytics: getAdminAnalyticsMock,
  getAdminAnalyticsTeachersSummary: getAdminAnalyticsTeachersSummaryMock,
  getAdminAnalyticsDisciplinesTable: getAdminAnalyticsDisciplinesTableMock,
  getAdminAnalyticsBySemester: getAdminAnalyticsBySemesterMock,
  getDepartmentDisciplinesWithTeachers: getDepartmentDisciplinesWithTeachersMock,
  getDisciplineCards: getDisciplineCardsMock,
}))

vi.mock('@/modules/analytics/utils/analyticsScope', () => ({
  teacherCardsResponseToArray: teacherCardsResponseToArrayMock,
}))

describe('useAnalytics', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    userState.lastName.value = 'Иванов'
    userState.canSeeAll.value = false
  })

  it('не загружает данные при fetchEnabled=false', async () => {
    const vm = useAnalytics({
      academicYear: ref('2024/2025'),
      studyPeriod: ref('academic_year'),
      fetchEnabled: ref(false),
    })

    await vm.loadAll()
    expect(getTeacherStatsMock).not.toHaveBeenCalled()
    expect(getAdminAnalyticsMock).not.toHaveBeenCalled()
  })

  it('сбрасывает состояние при пустом учебном годе', async () => {
    const vm = useAnalytics({
      academicYear: ref(''),
      studyPeriod: ref('academic_year'),
    })
    vm.disciplinesTable.value = [
      { disciplineName: 'X', expectedCount: 1, uploadedCount: 1, groupsCount: 1, studentsCount: 1 },
    ]

    await vm.loadAll()

    expect(vm.disciplinesTable.value).toEqual([])
    expect(vm.bySemester.value).toEqual([])
    expect(vm.teacherDisciplineCards.value).toEqual([])
  })

  it('в режиме администратора использует admin API и включает showDepartmentStats', async () => {
    userState.canSeeAll.value = true
    getAdminAnalyticsMock.mockResolvedValue({
      expectedCount: 100,
      totalWorks: 25,
      totalTeachers: 10,
    })
    getAdminAnalyticsTeachersSummaryMock.mockResolvedValue([{ teacherFio: 'A' }])
    getAdminAnalyticsDisciplinesTableMock.mockResolvedValue([
      { disciplineName: 'Math', expectedCount: 20, uploadedCount: 5, groupsCount: 1, studentsCount: 20 },
    ])
    getAdminAnalyticsBySemesterMock.mockResolvedValue([{ semester: 1, expectedCount: 20, uploadedCount: 5 }])
    getDepartmentDisciplinesWithTeachersMock.mockResolvedValue([{ disciplineName: 'Math' }])

    const vm = useAnalytics({
      academicYear: ref('2024/2025'),
      studyPeriod: ref('academic_year'),
      scopeMode: ref('department'),
    })
    await vm.loadAll()

    expect(getAdminAnalyticsMock).toHaveBeenCalledWith({ academicYear: '2024-2025' })
    expect(getTeacherStatsMock).not.toHaveBeenCalled()
    expect(vm.showDepartmentStats.value).toBe(true)
    expect(vm.kpi.value).toEqual({
      expectedCount: 20,
      totalWorks: 5,
      moodleWorks: 0,
      totalTeachers: 10,
    })
  })

  it('в режиме преподавателя использует teacher API и нормализует карточки', async () => {
    userState.canSeeAll.value = false
    userState.lastName.value = 'Петров'

    getTeacherStatsMock.mockResolvedValue({ expectedCount: 40, totalWorks: 12 })
    getTeacherStatsDisciplinesTableMock.mockResolvedValue([
      { disciplineName: 'Physics', expectedCount: 10, uploadedCount: 3, groupsCount: 1, studentsCount: 12 },
    ])
    getTeacherStatsBySemesterMock.mockResolvedValue([{ semester: 2, expectedCount: 10, uploadedCount: 3 }])
    getDisciplineCardsMock.mockResolvedValue({ data: [{ id: 1 }] })
    teacherCardsResponseToArrayMock.mockReturnValue([{ id: 'card-1' }])

    const vm = useAnalytics({
      academicYear: ref('2024/2025'),
      studyPeriod: ref('spring_semester'),
      scopeMode: ref('personal'),
    })
    await vm.loadAll()

    expect(getTeacherStatsMock).toHaveBeenCalledWith('Петров', {
      academicYear: '2024-2025',
      studyPeriod: 'spring_semester',
    })
    expect(getDisciplineCardsMock).toHaveBeenCalledWith('Петров', '2024-2025')
    expect(teacherCardsResponseToArrayMock).toHaveBeenCalledWith({ data: [{ id: 1 }] })
    expect(vm.teacherDisciplineCards.value).toEqual([{ id: 'card-1' }])
    expect(vm.showDepartmentStats.value).toBe(false)
  })

  it('при ошибке API заполняет error и очищает агрегаты', async () => {
    userState.canSeeAll.value = true
    getAdminAnalyticsMock.mockRejectedValue(new Error('network down'))

    const vm = useAnalytics({
      academicYear: ref('2024/2025'),
      studyPeriod: ref('academic_year'),
      scopeMode: ref('department'),
    })
    vm.disciplinesTable.value = [
      { disciplineName: 'Old', expectedCount: 1, uploadedCount: 1, groupsCount: 1, studentsCount: 1 },
    ]

    await vm.loadAll()

    expect(vm.error.value).toBe('network down')
    expect(vm.disciplinesTable.value).toEqual([])
    expect(vm.teacherDisciplineCards.value).toEqual([])
    expect(vm.loading.value).toBe(false)
  })

  it('kpi берётся из adminKpi, если таблица дисциплин пуста', async () => {
    userState.canSeeAll.value = true
    getAdminAnalyticsMock.mockResolvedValue({
      expectedCount: 77,
      totalWorks: 33,
      totalTeachers: 9,
    })
    getAdminAnalyticsTeachersSummaryMock.mockResolvedValue([])
    getAdminAnalyticsDisciplinesTableMock.mockResolvedValue([])
    getAdminAnalyticsBySemesterMock.mockResolvedValue([])
    getDepartmentDisciplinesWithTeachersMock.mockResolvedValue([])

    const vm = useAnalytics({
      academicYear: ref('2024/2025'),
      studyPeriod: ref('academic_year'),
      scopeMode: ref('department'),
    })
    await vm.loadAll()

    expect(vm.kpi.value).toEqual({
      expectedCount: 77,
      totalWorks: 33,
      moodleWorks: 0,
      totalTeachers: 9,
    })
  })

  it('kpi берётся из teacherKpi, если таблица дисциплин пуста у преподавателя', async () => {
    userState.canSeeAll.value = false
    userState.lastName.value = 'Сидоров'
    getTeacherStatsMock.mockResolvedValue({ expectedCount: 12, totalWorks: 8 })
    getTeacherStatsDisciplinesTableMock.mockResolvedValue([])
    getTeacherStatsBySemesterMock.mockResolvedValue([])
    getDisciplineCardsMock.mockResolvedValue([])
    teacherCardsResponseToArrayMock.mockReturnValue([])

    const vm = useAnalytics({
      academicYear: ref('2024/2025'),
      studyPeriod: ref('academic_year'),
      scopeMode: ref('personal'),
    })
    await vm.loadAll()

    expect(vm.kpi.value).toEqual({
      expectedCount: 12,
      totalWorks: 8,
      moodleWorks: 0,
    })
  })

  it('kpi считает moodleWorks из moodleLinksCount в строках дисциплин', async () => {
    userState.canSeeAll.value = true
    getAdminAnalyticsMock.mockResolvedValue({
      expectedCount: 100,
      totalWorks: 40,
      totalTeachers: 7,
    })
    getAdminAnalyticsTeachersSummaryMock.mockResolvedValue([])
    getAdminAnalyticsDisciplinesTableMock.mockResolvedValue([
      {
        disciplineName: 'Math',
        expectedCount: 20,
        uploadedCount: 8,
        moodleLinksCount: 6,
        groupsCount: 1,
        studentsCount: 20,
      },
      {
        disciplineName: 'Physics',
        expectedCount: 30,
        uploadedCount: 12,
        moodleLinksCount: 4,
        groupsCount: 1,
        studentsCount: 25,
      },
    ])
    getAdminAnalyticsBySemesterMock.mockResolvedValue([])
    getDepartmentDisciplinesWithTeachersMock.mockResolvedValue([])

    const vm = useAnalytics({
      academicYear: ref('2024/2025'),
      studyPeriod: ref('academic_year'),
      scopeMode: ref('department'),
    })
    await vm.loadAll()

    expect(vm.kpi.value).toEqual({
      expectedCount: 50,
      totalWorks: 20,
      moodleWorks: 10,
      totalTeachers: 7,
    })
  })

  it('kpi использует moodleUploadedCount как fallback', async () => {
    userState.canSeeAll.value = true
    getAdminAnalyticsMock.mockResolvedValue({
      expectedCount: 50,
      totalWorks: 20,
      totalTeachers: 3,
    })
    getAdminAnalyticsTeachersSummaryMock.mockResolvedValue([])
    getAdminAnalyticsDisciplinesTableMock.mockResolvedValue([
      {
        disciplineName: 'Math',
        expectedCount: 10,
        uploadedCount: 5,
        moodleUploadedCount: 2,
        groupsCount: 1,
        studentsCount: 10,
      },
    ])
    getAdminAnalyticsBySemesterMock.mockResolvedValue([])
    getDepartmentDisciplinesWithTeachersMock.mockResolvedValue([])

    const vm = useAnalytics({
      academicYear: ref('2024/2025'),
      studyPeriod: ref('academic_year'),
      scopeMode: ref('department'),
    })
    await vm.loadAll()

    expect(vm.kpi.value).toEqual({
      expectedCount: 10,
      totalWorks: 5,
      moodleWorks: 2,
      totalTeachers: 3,
    })
  })
})
