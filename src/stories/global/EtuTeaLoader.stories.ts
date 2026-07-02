import type { Meta, StoryObj } from '@storybook/vue3';
import EtuTeaLoader from '@/components/global/EtuTeaLoader.vue';
import { etuTeaLoaderOverlayStoryArgs } from '../mocks/etu-tea-loader';
import { canvasLight, canvasLightMaxWidth, CANVAS_WIDTH } from '../helpers/decorators';

const meta = {
  title: 'Глобальные компоненты/EtuTeaLoader',
  component: EtuTeaLoader,
  tags: ['autodocs'],
  parameters: {
    layout: 'padded',
    backgrounds: { default: 'app' },
    docs: {
      description: {
        component:
          'Анимированный «чайник» из SVG (`tea.svg`). Режим без `overlay` — встраиваемый блок; '
          + 'с `overlay` и `loading` — полупрозрачная подложка поверх родителя с `position: relative`.',
      },
    },
  },
  decorators: [canvasLight],
} satisfies Meta<typeof EtuTeaLoader>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Inline: Story = {
  name: 'Встроенный',
  args: {
    overlay: false,
    loading: false,
  },
};

export const Overlay: Story = {
  name: 'Оверлей в контейнере',
  decorators: [canvasLightMaxWidth(CANVAS_WIDTH.compact)],
  render: (args) => ({
    components: { EtuTeaLoader },
    setup() {
      return { args };
    },
    template: `
      <div style="position:relative;height:220px;border:1px dashed #cbd5e1;border-radius:12px;background:#fff">
        <p style="padding:16px;margin:0;color:#64748b">Контент под оверлеем</p>
        <EtuTeaLoader v-bind="args" />
      </div>
    `,
  }),
  args: { ...etuTeaLoaderOverlayStoryArgs },
};
