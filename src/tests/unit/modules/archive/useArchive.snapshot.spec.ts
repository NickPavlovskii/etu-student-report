import { beforeEach, describe, expect, it, vi } from 'vitest';
import { ref } from 'vue';
import { useArchive } from '@/modules/archive/composables/UseArchive';

const state = vi.hoisted(() => {
  const { ref: vueRef } = require('vue') as typeof import('vue');
  return {
    academicYear: vueRef('2024-2025'),
    user: {
      lastName: vueRef('Иванов'),
      fioKey: vueRef('Иванов И.И.'),
      canSeeAll: vueRef(false),
    },
    fetchArchiveReportsForTeacherMock: vi.fn(),
    fetchArchiveReportsAllMock: vi.fn(),
  };
});

vi.mock('@/composables/useAcademicYear', () => ({
  useAcademicYear: () => ({ academicYear: state.academicYear }),
}));

vi.mock('@/composables/useUser', () => ({
  useUser: () => state.user,
}));

vi.mock('@/api/info', () => ({
  fetchArchiveReportsForTeacher: state.fetchArchiveReportsForTeacherMock,
  fetchArchiveReportsAll: state.fetchArchiveReportsAllMock,
}));

function createArchiveVm() {
  return useArchive({
    search: ref(''),
    filterDiscipline: ref(''),
    filterGroup: ref(''),
    filterWorkType: ref(''),
    filterTeacher: ref(''),
    dateFrom: ref(''),
    dateTo: ref(''),
  });
}

describe('useArchive snapshot: просмотр архива', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    state.academicYear.value = '2024-2025';
    state.user.lastName.value = 'Иванов';
    state.user.fioKey.value = 'Иванов И.И.';
    state.user.canSeeAll.value = false;
  });

  it('преподаватель видит свои архивные работы и справочники фильтров', async () => {
    state.fetchArchiveReportsForTeacherMock.mockResolvedValue([
      {
        id: 1,
        studentName: 'Петров П.П.',
        groupName: '4381',
        disciplineName: 'Программирование',
        controlType: 'Лабораторная работа',
        topic: 'Тема 1',
        uploadDate: '2026-06-10T12:30:00',
        uploadedBy: 'Иванов И.И.',
        check: 88,
        fileName: 'petrov_lab1.docx',
      },
      {
        id: 2,
        studentName: 'Сидоров С.С.',
        groupName: '4382',
        disciplineName: 'Базы данных',
        controlType: 'Курсовая работа',
        topic: 'ER-модель',
        uploadDate: '2026-06-11T09:00:00',
        uploadedBy: 'Петров П.П.',
        check: 40,
        fileName: 'sidorov_course.docx',
      },
      {
        id: 3,
        studentName: 'Без вида контроля',
        groupName: '4383',
        disciplineName: 'Скрытая дисциплина',
        controlType: '',
        topic: '—',
        uploadDate: null,
        uploadedBy: 'Иванов И.И.',
        check: null,
        fileName: 'hidden.docx',
      },
    ]);

    const vm = createArchiveVm();
    await vm.loadAll();

    expect(state.fetchArchiveReportsForTeacherMock).toHaveBeenCalledWith(
      'Иванов',
      '2024-2025'
    );
    expect(vm.filteredRows.value).toMatchInlineSnapshot(`
      [
        {
          "check": 88,
          "disciplineName": "Программирование",
          "fileName": "petrov_lab1.docx",
          "groupName": "4381",
          "id": 1,
          "status": "checked",
          "studentName": "Петров П.П.",
          "topic": "Тема 1",
          "uploadDate": "2026-06-10T12:30:00",
          "uploadedBy": "Иванов И.И.",
          "workControl": "Лабораторная работа",
        },
      ]
    `);
    expect({
      disciplines: vm.disciplines.value,
      groups: vm.groups.value,
      workTypes: vm.workTypes.value,
      teachers: vm.teachers.value,
    }).toMatchInlineSnapshot(`
      {
        "disciplines": [
          "Базы данных",
          "Программирование",
        ],
        "groups": [
          "4381",
          "4382",
        ],
        "teachers": [
          "Иванов И.И.",
          "Петров П.П.",
        ],
        "workTypes": [
          "Курсовая работа",
          "Лабораторная работа",
        ],
      }
    `);
  });

  it('завкафедрой использует кафедральный API и видит все работы', async () => {
    state.user.canSeeAll.value = true;
    state.fetchArchiveReportsAllMock.mockResolvedValue([
      {
        id: 7,
        studentName: 'Кузнецов К.К.',
        groupName: '4384',
        disciplineName: 'Алгоритмы',
        controlType: 'Реферат',
        topic: 'Графы',
        uploadDate: '2026-06-12',
        uploadedBy: 'Смирнов С.С.',
        check: null,
        fileName: 'graph.docx',
      },
    ]);

    const vm = createArchiveVm();
    await vm.loadAll();

    expect(state.fetchArchiveReportsAllMock).toHaveBeenCalledWith(
      undefined,
      '2024-2025'
    );
    expect(vm.filteredRows.value).toMatchInlineSnapshot(`
      [
        {
          "check": null,
          "disciplineName": "Алгоритмы",
          "fileName": "graph.docx",
          "groupName": "4384",
          "id": 7,
          "status": "pending",
          "studentName": "Кузнецов К.К.",
          "topic": "Графы",
          "uploadDate": "2026-06-12",
          "uploadedBy": "Смирнов С.С.",
          "workControl": "Реферат",
        },
      ]
    `);
  });
});
