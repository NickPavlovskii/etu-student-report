import type { Meta, StoryObj } from '@storybook/vue3';
import EtuInfoCard from '@/components/global/EtuInfoCard.vue';
import {
  etuInfoCardColorMocks,
  etuInfoCardDefaultArgs,
} from '../mocks/etu-info-card';

const meta = {
  title: 'Глобальные компоненты/EtuInfoCard',
  component: EtuInfoCard,
  tags: ['autodocs'],
  parameters: {
    docs: {
      description: {
        component:
          'Информационная плитка с иконкой MDI в цветном квадрате и крупным значением. '
          + 'Используется на дашбордах рядом с `EtuStatCard`, но с акцентом на иконку.',
      },
    },
  },
} satisfies Meta<typeof EtuInfoCard>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  name: 'По умолчанию',
  args: { ...etuInfoCardDefaultArgs },
};

export const ColorVariants: Story = {
  name: 'Варианты цвета',
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
