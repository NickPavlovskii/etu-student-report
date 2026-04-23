import type { Meta, StoryObj } from '@storybook/vue3';
import EtuLabelChip from '@/components/global/EtuLabelChip.vue';
import {
  etuLabelChipClickableDotArgs,
  etuLabelChipCounterCloseArgs,
  etuLabelChipPresetMocks,
  etuLabelChipVariantArgs,
} from '../mocks/etu-label-chip';

const meta = {
  title: 'Глобальные компоненты/EtuLabelChip',
  component: EtuLabelChip,
  tags: ['autodocs'],
  parameters: {
    docs: {
      description: {
        component:
          'Универсальная метка: режим `inline` (кнопка/span) или `chip` (Vuetify). '
          + 'Есть пресеты цвета, размеры `xs`–`lg`, формы, счётчик, `closable`, `clickable`, точка `dot`.',
      },
    },
  },
} satisfies Meta<typeof EtuLabelChip>;

export default meta;
type Story = StoryObj<typeof meta>;

export const PresetInline: Story = {
  name: 'Пресеты (inline)',
  render: () => ({
    components: { EtuLabelChip },
    setup() {
      return { presets: etuLabelChipPresetMocks };
    },
    template: `
      <div style="display:flex;flex-wrap:wrap;gap:8px;align-items:center">
        <EtuLabelChip
          v-for="p in presets"
          :key="p.label"
          :preset="p.preset"
          :label="p.label"
        />
      </div>
    `,
  }),
};

export const WithCounterAndClose: Story = {
  name: 'Счётчик и закрытие',
  args: { ...etuLabelChipCounterCloseArgs },
};

export const ChipVariant: Story = {
  name: 'Вариант chip',
  args: { ...etuLabelChipVariantArgs },
};

export const ClickableDot: Story = {
  name: 'Кликабельная с точкой',
  args: { ...etuLabelChipClickableDotArgs },
};
