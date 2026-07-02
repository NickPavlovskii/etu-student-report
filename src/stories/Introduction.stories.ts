import type { Meta, StoryObj } from '@storybook/vue3';

import IntroductionPage from './docs/IntroductionPage.vue';

const meta = {
  title: 'Документация/Введение',
  component: IntroductionPage,
  tags: ['autodocs'],
  parameters: {
    layout: 'fullscreen',
    backgrounds: { default: 'app-dark' },
    docs: {
      description: {
        component: 'Обзор глобальных компонентов ИС "Отчеты" и навигация по Storybook.',
      },
    },
  },
} satisfies Meta<typeof IntroductionPage>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Overview: Story = {
  render: () => ({
    components: { IntroductionPage },
    template: '<IntroductionPage />',
  }),
};
