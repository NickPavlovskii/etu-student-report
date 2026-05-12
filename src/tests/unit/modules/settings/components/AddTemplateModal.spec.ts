import { describe, expect, it } from 'vitest';
import { mount } from '@vue/test-utils';
import AddTemplateModal from '@/modules/settings/components/AddTemplateModal.vue';
import type { AddTemplateForm } from '@/modules/settings/modal';
import { JAVA_TEMPLATE_CRITERIA_DEFAULTS as J } from '@/api/info';

function baseForm(overrides: Partial<AddTemplateForm> = {}): AddTemplateForm {
  return {
    name: '',
    description: '',
    submissionFormat: 'Электронный вид',
    ...J,
    ...overrides,
  } as AddTemplateForm;
}

const vuetifyLikeStubs = {
  'v-dialog': { template: '<div class="v-dialog-stub"><slot /></div>' },
  'v-card': { template: '<div class="v-card-stub"><slot /></div>' },
  'v-card-text': { template: '<div class="v-card-text-stub"><slot /></div>' },
  'v-card-actions': { template: '<div class="v-card-actions-stub"><slot /></div>' },
  'v-spacer': { template: '<span />' },
  'v-icon': { template: '<span class="v-icon-stub" />' },
  'v-tooltip': {
    template:
      '<span class="v-tooltip-stub"><slot name="activator" /><slot /></span>',
  },
  'v-btn': {
    inheritAttrs: false,
    template:
      '<button type="button" v-bind="$attrs" @click="$emit(\'click\', $event)"><slot /></button>',
  },
  'v-text-field': {
    props: ['modelValue'],
    emits: ['update:modelValue'],
    template:
      '<input class="v-text-field-stub" :value="modelValue" @input="$emit(\'update:modelValue\', $event.target.value)" />',
  },
  'v-textarea': {
    props: ['modelValue'],
    emits: ['update:modelValue'],
    template:
      '<textarea class="v-textarea-stub" :value="modelValue" @input="$emit(\'update:modelValue\', $event.target.value)" />',
  },
  'v-select': { template: '<select class="v-select-stub"><option /></select>' },
  'v-checkbox': { template: '<label class="v-checkbox-stub"><input type="checkbox" /></label>' },
  'v-expansion-panels': { template: '<div class="v-exp-panels"><slot /></div>' },
  'v-expansion-panel': { template: '<div class="v-exp-panel"><slot /></div>' },
  'v-expansion-panel-title': { template: '<div class="v-exp-title"><slot /></div>' },
  'v-expansion-panel-text': { template: '<div class="v-exp-text"><slot /></div>' },
};

describe('AddTemplateModal (создание / редактирование шаблона)', () => {
  it('режим создания: заголовок «Новый шаблон», кнопка «Создать шаблон»', () => {
    const w = mount(AddTemplateModal, {
      props: {
        modelValue: true,
        initialForm: null,
      },
      global: { stubs: vuetifyLikeStubs },
    });

    expect(w.find('.modal-title').text()).toContain('Новый шаблон');
    expect(w.find('.btn-submit').text()).toContain('Создать шаблон');
  });

  it('режим редактирования: заголовок и кнопка «Сохранить»', () => {
    const w = mount(AddTemplateModal, {
      props: {
        modelValue: true,
        initialForm: baseForm({ name: 'Существующий', description: 'Описание' }),
      },
      global: { stubs: vuetifyLikeStubs },
    });

    expect(w.find('.modal-title').text()).toContain('Редактировать');
    expect(w.find('.btn-submit').text()).toContain('Сохранить');
  });

  it('без названия кнопка отправки disabled', () => {
    const w = mount(AddTemplateModal, {
      props: {
        modelValue: true,
        initialForm: baseForm({ name: '   ' }),
      },
      global: { stubs: vuetifyLikeStubs },
    });

    expect((w.find('.btn-submit').element as HTMLButtonElement).disabled).toBe(true);
  });

  it('после ввода названия эмитит submit с формой', async () => {
    const w = mount(AddTemplateModal, {
      props: {
        modelValue: true,
        initialForm: null,
      },
      global: { stubs: vuetifyLikeStubs },
    });

    const nameInput = w.findAll('.v-text-field-stub').at(0);
    expect(nameInput?.exists()).toBe(true);
    await nameInput?.setValue('Курсовая 2025');

    expect((w.find('.btn-submit').element as HTMLButtonElement).disabled).toBe(false);
    await w.find('.btn-submit').trigger('click');

    expect(w.emitted('submit')).toBeTruthy();
    const payload = w.emitted('submit')?.[0]?.[0] as AddTemplateForm;
    expect(payload.name).toBe('Курсовая 2025');
    expect(payload.font).toBe(J.font);
  });

  it('эмитит close по кнопке Отмена', async () => {
    const w = mount(AddTemplateModal, {
      props: {
        modelValue: true,
        initialForm: null,
      },
      global: { stubs: vuetifyLikeStubs },
    });

    const cancel = w.find('.modal-actions .btn-cancel');
    expect(cancel.exists()).toBe(true);
    await cancel.trigger('click');
    expect(w.emitted('close')?.length).toBeGreaterThanOrEqual(1);
  });
});
