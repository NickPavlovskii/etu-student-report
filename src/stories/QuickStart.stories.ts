import type { Meta, StoryObj } from '@storybook/vue3';

import QuickStartPage from './docs/QuickStartPage.vue';

const meta = {
  title: 'Документация/Быстрый старт',
  component: QuickStartPage,
  tags: ['autodocs'],
  parameters: {
    layout: 'fullscreen',
    backgrounds: { default: 'app-dark' },
    docs: {
      description: {
        component: 'Команды запуска приложения, Storybook и глобальной регистрации компонентов.',
      },
    },
  },
} satisfies Meta<typeof QuickStartPage>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Guide: Story = {
  render: () => ({
    components: { QuickStartPage },
    template: '<QuickStartPage />',
  }),
};
