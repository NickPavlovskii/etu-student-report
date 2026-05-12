import { describe, expect, it } from 'vitest';
import { mount } from '@vue/test-utils';
import ControlTypesTab from '@/modules/settings/components/ControlTypesTab.vue';
import type { ControlTypeItem, TemplateItem } from '@/modules/settings/modal';

const stubs = {
  'etu-pill-search-select': { template: '<div class="etu-pill-stub" />' },
  'control-type-card': { template: '<div class="ct-card-stub" />' },
  'v-card': { template: '<div class="v-card-stub"><slot /></div>' },
  'v-icon': { template: '<span />' },
  'v-row': { template: '<div class="v-row-stub"><slot /></div>' },
  'v-col': { template: '<div class="v-col-stub"><slot /></div>' },
};

const sampleControlTypes: ControlTypeItem[] = [
  {
    id: 'kr',
    title: 'Контрольная работа',
    description: '',
    active: true,
    showInTable: true,
    templateId: 't1',
  },
];

const defaultProps = {
  disciplineId: '101',
  disciplines: [{ id: '101', name: 'Математика' }],
  controlTypes: sampleControlTypes,
  templates: [] as TemplateItem[],
  topicsByControlType: { 'Контрольная работа': ['Тема 1'] },
  loading: false,
  canEdit: true,
};

describe('ControlTypesTab (страница «Виды контроля»)', () => {
  it('при canEdit показывает кнопку сохранения и эмитит save', async () => {
    const w = mount(ControlTypesTab, {
      props: { ...defaultProps },
      global: { stubs },
    });

    const saveBtn = w.find('.save-btn');
    expect(saveBtn.exists()).toBe(true);
    await saveBtn.trigger('click');
    expect(w.emitted('save')).toHaveLength(1);
  });

  it('при canEdit=false кнопки сохранения нет', () => {
    const w = mount(ControlTypesTab, {
      props: { ...defaultProps, canEdit: false },
      global: { stubs },
    });

    expect(w.find('.save-btn').exists()).toBe(false);
  });

  it('показывает счётчик видов контроля', () => {
    const w = mount(ControlTypesTab, {
      props: { ...defaultProps },
      global: { stubs },
    });

    expect(w.find('.section-count').text()).toBe('1');
  });

  it('эмитит update:disciplineId при выборе дисциплины в дочернем компоненте', async () => {
    const Pill = {
      name: 'EtuPillSearchSelect',
      props: ['modelValue', 'items'],
      emits: ['update:modelValue'],
      template:
        '<button type="button" class="pill-change" @click="$emit(\'update:modelValue\', \'202\')">pick</button>',
    };

    const w = mount(ControlTypesTab, {
      props: { ...defaultProps },
      global: { stubs: { ...stubs, 'etu-pill-search-select': Pill } },
    });

    await w.find('.pill-change').trigger('click');
    expect(w.emitted('update:disciplineId')?.[0]).toEqual(['202']);
  });
});
