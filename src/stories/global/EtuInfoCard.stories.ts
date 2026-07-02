import type { Meta, StoryObj } from '@storybook/vue3';
import EtuInfoCard from '@/components/global/EtuInfoCard.vue';
import {
  etuInfoCardColorMocks,
  etuInfoCardDefaultArgs,
} from '../mocks/etu-info-card';
import { canvasLightMaxWidth, CANVAS_WIDTH } from '../helpers/decorators';

const meta = {
  title: 'Глобальные компоненты/EtuInfoCard',
  component: EtuInfoCard,
  tags: ['autodocs'],
  parameters: {
    layout: 'padded',
    backgrounds: { default: 'app' },
    docs: {
      description: {
        component:
          'Информационная плитка с иконкой MDI в цветном квадрате и крупным значением. '
          + 'Используется на дашбордах рядом с `EtuStatCard`, но с акцентом на иконку.',
      },
    },
  },
  decorators: [canvasLightMaxWidth(CANVAS_WIDTH.card)],
} satisfies Meta<typeof EtuInfoCard>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  name: 'По умолчанию',
  args: { ...etuInfoCardDefaultArgs },
};

export const ColorVariants: Story = {
  name: 'Варианты цвета',
  decorators: [canvasLightMaxWidth(CANVAS_WIDTH.section)],
  render: () => ({
    components: { EtuInfoCard },
    setup() {
      return { cards: etuInfoCardColorMocks };
    },
    template: `
      <div style="display:grid;grid-template-columns:repeat(auto-fill,minmax(260px,1fr));gap:16px">
        <EtuInfoCard
          v-for="c in cards"
          :key="c.title"
          :title="c.title"
          :value="c.value"
          :icon="c.icon"
          :color="c.color"
        />
      </div>
    `,
  }),
};
