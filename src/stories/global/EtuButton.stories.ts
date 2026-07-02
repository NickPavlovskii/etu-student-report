import type { Meta, StoryObj } from '@storybook/vue3';
import EtuButton from '@/components/global/EtuButton.vue';
import { etuButtonStoryArgs } from '../mocks/etu-button';
import { canvasLightMaxWidth, CANVAS_WIDTH } from '../helpers/decorators';

const meta = {
  title: 'Глобальные компоненты/EtuButton',
  component: EtuButton,
  tags: ['autodocs'],
  parameters: {
    layout: 'padded',
    backgrounds: { default: 'app' },
    docs: {
      description: {
        component:
          'Обертка над `v-btn` с фиксированными скруглениями и стилем «карточной» кнопки. '
          + 'Поддерживает текст `title`, иконки-картинки `prependIcon` / `appendIcon` (URL) и кастомные цвета.',
      },
    },
  },
  argTypes: {
    border: { description: 'Рамка: `true` — outlined, `false` — flat' },
    bgColor: { description: 'Фон кнопки (CSS color)' },
    color: { description: 'Цвет текста' },
    borderColor: { description: 'Цвет рамки (при border)' },
    width: { description: 'Ширина, например `100%` или `200px`' },
    prependIcon: {
      description: 'URL картинки слева от текста (`<img>` в слоте prepend)',
    },
    appendIcon: {
      description: 'URL картинки справа от текста',
    },
  },
  decorators: [canvasLightMaxWidth(CANVAS_WIDTH.compact)],
} satisfies Meta<typeof EtuButton>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  name: 'По умолчанию',
  args: { ...etuButtonStoryArgs.default },
};

export const FilledPrimary: Story = {
  name: 'Заливка без рамки',
  args: { ...etuButtonStoryArgs.filledPrimary },
};

export const Narrow: Story = {
  name: 'Узкая',
  args: { ...etuButtonStoryArgs.narrow },
};

export const WithIcon: Story = {
  name: 'С иконкой слева',
  args: { ...etuButtonStoryArgs.withPrependIcon },
};
