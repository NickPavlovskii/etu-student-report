import type { Meta, StoryObj } from '@storybook/vue3';
import { ref } from 'vue';
import EtuSegmentSwitcher from '@/components/global/EtuSegmentSwitcher.vue';
import { canvasLight, canvasLightMaxWidth, CANVAS_WIDTH } from '../helpers/decorators';

const semesterHalfOptions = [
  { value: 'autumn', label: 'Осенний семестр' },
  { value: 'spring', label: 'Весенний семестр' },
];

const studyPeriodOptions = [
  { value: 'academic_year', label: 'Учебный год' },
  { value: 'autumn_semester', label: 'Осенний семестр' },
  { value: 'spring_semester', label: 'Весенний семестр' },
];

const meta = {
  title: 'Глобальные компоненты/EtuSegmentSwitcher',
  component: EtuSegmentSwitcher,
  tags: ['autodocs'],
  parameters: {
    layout: 'padded',
    backgrounds: { default: 'app' },
    docs: {
      description: {
        component:
          'Переключатель сегментов (pill toggle). Принимает `options: { value, label }[]` и `v-model`. '
          + 'Режим `compact` — для 3+ пунктов на узкой ширине.',
      },
    },
  },
  argTypes: {
    compact: { control: 'boolean' },
    ariaLabel: { control: 'text' },
  },
  decorators: [canvasLight],
} satisfies Meta<typeof EtuSegmentSwitcher>;

export default meta;
type Story = StoryObj<typeof meta>;

export const TwoOptions: Story = {
  name: 'Два варианта (семестры)',
  render: () => ({
    components: { EtuSegmentSwitcher },
    setup() {
      const modelValue = ref('autumn');
      return { modelValue, options: semesterHalfOptions };
    },
    template: `
      <div style="padding:16px;background:#f8fafc;border-radius:12px">
        <EtuSegmentSwitcher
          v-model="modelValue"
          :options="options"
          aria-label="Полугодие семестра"
        />
        <p style="margin-top:12px;font-size:13px;color:#64748b">model: {{ modelValue }}</p>
      </div>
    `,
  }),
};

export const ThreeOptionsCompact: Story = {
  name: 'Три варианта (compact)',
  decorators: [canvasLightMaxWidth(CANVAS_WIDTH.compact)],
  render: () => ({
    components: { EtuSegmentSwitcher },
    setup() {
      const modelValue = ref('academic_year');
      return { modelValue, options: studyPeriodOptions };
    },
    template: `
      <div style="padding:16px;background:#f8fafc;border-radius:12px;max-width:420px">
        <EtuSegmentSwitcher
          v-model="modelValue"
          :options="options"
          compact
          aria-label="Период: учебный год или семестр"
        />
        <p style="margin-top:12px;font-size:13px;color:#64748b">model: {{ modelValue }}</p>
      </div>
    `,
  }),
};

export const Interactive: Story = {
  name: 'Интерактивный (controls)',
  args: {
    modelValue: 'a',
    options: [
      { value: 'a', label: 'Вариант A' },
      { value: 'b', label: 'Вариант B' },
      { value: 'c', label: 'Вариант C' },
    ],
    compact: false,
    ariaLabel: 'Выбор варианта',
  },
  render: (args) => ({
    components: { EtuSegmentSwitcher },
    setup() {
      const modelValue = ref(args.modelValue);
      return { args, modelValue };
    },
    template: `
      <div style="padding:16px;background:#f8fafc;border-radius:12px">
        <EtuSegmentSwitcher
          v-model="modelValue"
          :options="args.options"
          :compact="args.compact"
          :aria-label="args.ariaLabel"
        />
        <p style="margin-top:12px;font-size:13px;color:#64748b">model: {{ modelValue }}</p>
      </div>
    `,
  }),
};
