import { describe, expect, it, vi, beforeEach } from 'vitest';
import { flushPromises, mount } from '@vue/test-utils';
import UploadStudyWork from '@/modules/disciplines/components/UploadStudyWork.vue';

const validateDocumentMock = vi.hoisted(() => vi.fn());

vi.mock('@/api/info', () => ({
  validateDocument: validateDocumentMock,
}));

vi.mock('@/composables/useAcademicYear', () => ({
  useAcademicYear: () => ({ academicYear: { value: '2024-2025' } }),
}));

vi.mock('@/composables/useDownload', () => ({
  useDownload: () => ({
    downloadAnnotatedFileWithRemarks: vi.fn(),
  }),
}));

const vuetifyStubs = {
  'v-dialog': {
    props: ['modelValue'],
    template: '<div class="v-dialog-stub"><slot /></div>',
  },
  'v-card': { template: '<div class="v-card-stub"><slot /></div>' },
  'v-card-text': { template: '<div class="v-card-text-stub"><slot /></div>' },
  'v-card-actions': { template: '<div class="v-card-actions-stub"><slot /></div>' },
  'v-row': { template: '<div class="v-row-stub"><slot /></div>' },
  'v-col': { template: '<div class="v-col-stub"><slot /></div>' },
  'v-spacer': { template: '<span class="v-spacer-stub" />' },
  'v-icon': { template: '<span class="v-icon-stub"><slot /></span>' },
  'v-btn': {
    inheritAttrs: false,
    template:
      '<button type="button" v-bind="$attrs" :disabled="disabled || loading" @click="$emit(\'click\', $event)"><slot /></button>',
    props: ['disabled', 'loading'],
  },
  'v-text-field': {
    props: ['modelValue', 'label', 'readonly'],
    emits: ['update:modelValue'],
    template:
      '<input class="v-text-field-stub" :data-label="label" :readonly="readonly" :value="modelValue" @input="$emit(\'update:modelValue\', $event.target.value)" />',
  },
  'v-select': {
    props: ['modelValue', 'items', 'label', 'itemTitle', 'itemValue', 'disabled'],
    emits: ['update:modelValue'],
    methods: {
      optionValue(item: unknown) {
        if (item && typeof item === 'object') {
          const key = this.itemValue || 'value';
          return String((item as Record<string, unknown>)[key] ?? '');
        }
        return String(item ?? '');
      },
      optionTitle(item: unknown) {
        if (item && typeof item === 'object') {
          const key = this.itemTitle || 'title';
          return String((item as Record<string, unknown>)[key] ?? this.optionValue(item));
        }
        return String(item ?? '');
      },
    },
    template:
      '<select class="v-select-stub" :data-label="label" :disabled="disabled" :value="modelValue" @change="$emit(\'update:modelValue\', $event.target.value)"><option value=""></option><option v-for="item in items" :key="optionValue(item)" :value="optionValue(item)">{{ optionTitle(item) }}</option></select>',
  },
  'v-checkbox': {
    props: ['modelValue'],
    emits: ['update:modelValue'],
    template:
      '<label class="v-checkbox-stub"><input type="checkbox" :checked="modelValue" @change="$emit(\'update:modelValue\', $event.target.checked)" /><slot name="label" /></label>',
  },
};

function mountUploadModal() {
  localStorage.setItem(
    'user',
    JSON.stringify({ lastName: 'Иванов', fioShort: 'Иванов И.И.' })
  );

  return mount(UploadStudyWork, {
    props: {
      discipline: { Discipline: 'Программирование' },
      groups: ['4381'],
      studentsByGroup: {
        '4381': [{ studentId: 10, fio: 'Петров П.П.' }],
      },
      topics: ['Тема 1. Классы'],
      controls: [
        {
          groupName: '4381',
          controlText: 'Курсовая работа',
          topics: ['Тема 1. Классы'],
        },
      ],
      assessment: 'Экзамен',
      templateId: 7,
    },
    global: {
      stubs: vuetifyStubs,
    },
  });
}

describe('UploadStudyWork snapshot: загрузка учебной работы', () => {
  beforeEach(() => {
    localStorage.clear();
    validateDocumentMock.mockReset();
    validateDocumentMock.mockResolvedValue({
      valid: true,
      percent: 96,
      errors: [],
      criteria: [
        {
          code: 'font',
          title: 'Шрифт',
          message: 'Требование выполнено',
          passed: true,
        },
      ],
    });
  });

  it('собирает payload, показывает результат проверки и эмитит submit', async () => {
    const wrapper = mountUploadModal();

    await wrapper.get('select[data-label="Учебная группа *"]').setValue('4381');
    await flushPromises();
    await wrapper.get('select[data-label="Студент *"]').setValue('10');
    await wrapper.get('input[data-label="Название работы *"]').setValue('Лабораторная работа 1');

    const file = new File(['demo'], 'ПетровПП_Программирование_Лабораторная.docx', {
      type: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    });
    const fileInput = wrapper.get('input[type="file"]');
    Object.defineProperty(fileInput.element, 'files', {
      value: [file],
      configurable: true,
    });
    await fileInput.trigger('change');

    await wrapper.get('.upload-actions-submit').trigger('click');
    await flushPromises();

    expect(validateDocumentMock).toHaveBeenCalledWith(file, {
      templateId: 7,
      annotate: true,
    });
    expect(wrapper.text()).toContain('Проверка пройдена');
    expect(wrapper.html()).toMatchSnapshot();

    const confirmButtons = wrapper
      .findAll('button')
      .filter((button) => button.text().includes('Загрузить'));
    await confirmButtons[confirmButtons.length - 1]!.trigger('click');

    const payload = wrapper.emitted('submit')?.[0]?.[0] as Record<string, unknown>;
    expect({
      studentId: payload.studentId,
      groupName: payload.groupName,
      workType: payload.workType,
      workTitle: payload.workTitle,
      academicYear: payload.academicYear,
      uploadedBy: payload.uploadedBy,
      check: payload.check,
      fileName: (payload.file as File).name,
    }).toMatchInlineSnapshot(`
      {
        "academicYear": "2024-2025",
        "check": 96,
        "fileName": "ПетровПП_Программирование_Лабораторная.docx",
        "groupName": "4381",
        "studentId": 10,
        "uploadedBy": "Иванов И.И.",
        "workTitle": "Лабораторная работа 1",
        "workType": "Курсовая работа",
      }
    `);
  });
});
