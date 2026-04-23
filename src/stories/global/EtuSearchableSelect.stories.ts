import type { Meta, StoryObj } from '@storybook/vue3';
import { ref } from 'vue';
import EtuSearchableSelect from '@/components/global/EtuSearchableSelect.vue';
import { MOCK_DISCIPLINE_SELECT_ITEMS } from '../mocks/select-items';

const meta = {
  title: 'Глобальные компоненты/EtuSearchableSelect',
  component: EtuSearchableSelect,
  tags: ['autodocs'],
  parameters: {
    docs: {
      description: {
        component:
          'Выпадающий список с поиском по пунктам. Вариант `toolbar` — компактный триггер для панелей; '
          + '`settings` — стиль для экранов настроек. Значение: `string | number | null`.',
      },
    },
  },
} satisfies Meta<typeof EtuSearchableSelect>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Toolbar: Story = {
  name: 'Вариант toolbar',
  render: () => ({
    components: { EtuSearchableSelect },
    setup() {
      const modelValue = ref<string | number | null>(null);
      return { modelValue, sampleItems: MOCK_DISCIPLINE_SELECT_ITEMS };
    },
    template: `
      <div style="max-width:420px;padding:8px;background:#f4f6f9;border-radius:12px">
        <EtuSearchableSelect
          v-model="modelValue"
          :items="sampleItems"
          variant="toolbar"
          placeholder="Выберите дисциплину"
          clearable
        />
        <p style="margin-top:12px;font-size:13px;color:#64748b">model: {{ modelValue }}</p>
      </div>
    `,
  }),
};

export const Settings: Story = {
  name: 'Вариант settings',
  render: () => ({
    components: { EtuSearchableSelect },
    setup() {
      const modelValue = ref<string | number | null>('cs');
      return { modelValue, sampleItems: MOCK_DISCIPLINE_SELECT_ITEMS };
    },
    template: `
      <div style="max-width:440px;padding:16px;background:#fff;border:1px solid #e5e7eb;border-radius:12px">
        <EtuSearchableSelect
          v-model="modelValue"
          :items="sampleItems"
          variant="settings"
          placeholder="Дисциплина"
        />
      </div>
    `,
  }),
};
