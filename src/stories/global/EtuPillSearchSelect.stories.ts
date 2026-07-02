import type { Meta, StoryObj } from '@storybook/vue3';
import { ref } from 'vue';
import EtuPillSearchSelect from '@/components/global/EtuPillSearchSelect.vue';
import { MOCK_STUDENT_PILL_ITEMS } from '../mocks/select-items';
import { canvasLight, canvasLightMaxWidth, CANVAS_WIDTH } from '../helpers/decorators';

const meta = {
  title: 'Глобальные компоненты/EtuPillSearchSelect',
  component: EtuPillSearchSelect,
  tags: ['autodocs'],
  parameters: {
    layout: 'padded',
    backgrounds: { default: 'app' },
    docs: {
      description: {
        component:
          'Селект в виде «таблетки» с поиском и опциональным null-значением (`clearValue`). '
          + 'Поддерживает одиночный и множественный выбор (`multiple`).',
      },
    },
  },
  decorators: [canvasLightMaxWidth(CANVAS_WIDTH.row)],
} satisfies Meta<typeof EtuPillSearchSelect>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Single: Story = {
  name: 'Одиночный выбор',
  render: () => ({
    components: { EtuPillSearchSelect },
    setup() {
      const modelValue = ref<string | null>(null);
      return { modelValue, items: MOCK_STUDENT_PILL_ITEMS };
    },
    template: `
      <div style="padding:12px;background:#f4f6f9;border-radius:12px">
        <EtuPillSearchSelect v-model="modelValue" :items="items" placeholder="Все студенты" />
        <p style="margin-top:10px;font-size:13px;color:#64748b">model: {{ modelValue }}</p>
      </div>
    `,
  }),
};

export const Multiple: Story = {
  name: 'Множественный выбор',
  render: () => ({
    components: { EtuPillSearchSelect },
    setup() {
      const modelValue = ref<string[]>(['1', '3']);
      return { modelValue, items: MOCK_STUDENT_PILL_ITEMS };
    },
    template: `
      <div style="padding:12px;background:#f4f6f9;border-radius:12px">
        <EtuPillSearchSelect
          v-model="modelValue"
          :items="items"
          multiple
          placeholder="Выберите"
        />
        <p style="margin-top:10px;font-size:13px;color:#64748b">model: {{ modelValue.join(', ') }}</p>
      </div>
    `,
  }),
};
