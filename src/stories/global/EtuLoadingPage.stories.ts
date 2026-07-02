import type { Meta, StoryObj } from '@storybook/vue3';
import EtuLoadingPage from '@/components/global/EtuLoadingPage.vue';
import { ETU_LOADING_PAGE_DEFAULT_TEXT } from '../mocks/etu-loading-page';
import { canvasFullBleed } from '../helpers/decorators';

const meta = {
  title: 'Глобальные компоненты/EtuLoadingPage',
  component: EtuLoadingPage,
  tags: ['autodocs'],
  parameters: {
    layout: 'fullscreen',
    backgrounds: { default: 'app' },
    docs: {
      description: {
        component:
          'Полноэкранный экран загрузки: `etu-tea-loader` и подпись. При монтировании вызывает '
          + '`beginGlobalAxiosOverlaySuppression`, чтобы не дублировать глобальный axios-оверлей.',
      },
    },
  },
  decorators: [canvasFullBleed],
} satisfies Meta<typeof EtuLoadingPage>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Fullscreen: Story = {
  name: 'Полноэкранно',
  args: {
    text: ETU_LOADING_PAGE_DEFAULT_TEXT,
  },
};
