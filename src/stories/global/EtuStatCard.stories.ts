import type { Meta, StoryObj } from '@storybook/vue3';
import EtuStatCard from '@/components/global/EtuStatCard.vue';
import {
  etuStatCardColorMocks,
  etuStatCardWithIconArgs,
  etuStatCardWithUnitArgs,
} from '../mocks/etu-stat-card';
import { canvasLight, canvasLightMaxWidth, CANVAS_WIDTH } from '../helpers/decorators';

const meta = {
  title: 'Глобальные компоненты/EtuStatCard',
  component: EtuStatCard,
  tags: ['autodocs'],
  parameters: {
    layout: 'padded',
    backgrounds: { default: 'app' },
    docs: {
      description: {
        component:
          'Карточка метрики на базе `el-card`: заголовок, крупное значение и опциональная иконка MDI. '
          + 'Цветовая схема задаётся пропом `color`.',
      },
    },
  },
  decorators: [canvasLight],
} satisfies Meta<typeof EtuStatCard>;

export default meta;
type Story = StoryObj<typeof meta>;

export const WithIcon: Story = {
  name: 'С иконкой',
  args: { ...etuStatCardWithIconArgs },
};

export const WithUnit: Story = {
  name: 'С единицей измерения',
  args: { ...etuStatCardWithUnitArgs },
};

export const AllColors: Story = {
  name: 'Все цвета',
  decorators: [canvasLightMaxWidth(CANVAS_WIDTH.section)],
  render: () => ({
    components: { EtuStatCard },
    setup() {
      return { cards: etuStatCardColorMocks };
    },
    template: `
      <div style="display:grid;grid-template-columns:repeat(auto-fill,minmax(220px,1fr));gap:16px">
        <EtuStatCard
          v-for="c in cards"
          :key="c.title"
          :title="c.title"
          :value="c.value"
          :color="c.color"
          :icon="c.icon"
        />
      </div>
    `,
  }),
};
