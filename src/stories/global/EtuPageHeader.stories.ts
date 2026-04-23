import type { Meta, StoryObj } from '@storybook/vue3';
import EtuButton from '@/components/global/EtuButton.vue';
import EtuPageHeader from '@/components/global/EtuPageHeader.vue';
import { etuButtonStoryArgs } from '../mocks/etu-button';
import {
  etuPageHeaderBasicArgs,
  etuPageHeaderWithActionsContent,
} from '../mocks/etu-page-header';

const meta = {
  title: 'Глобальные компоненты/EtuPageHeader',
  component: EtuPageHeader,
  tags: ['autodocs'],
  parameters: {
    docs: {
      description: {
        component:
          'Шапка страницы на `v-card`: заголовок, подзаголовок, опциональная иконка и слот `right` '
          + 'для кнопок/фильтров. Слот по умолчанию — дополнительный блок под шапкой.',
      },
    },
  },
} satisfies Meta<typeof EtuPageHeader>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Basic: Story = {
  name: 'Базовый',
  args: { ...etuPageHeaderBasicArgs },
};

export const WithRightSlot: Story = {
  name: 'Слот справа',
  render: () => ({
    components: { EtuPageHeader, EtuButton },
    setup() {
      return {
        header: etuPageHeaderWithActionsContent,
        exportBtn: etuButtonStoryArgs.pageHeaderExport,
        refreshBtn: etuButtonStoryArgs.pageHeaderRefresh,
      };
    },
    template: `
      <EtuPageHeader
        :title="header.title"
        :subtitle="header.subtitle"
        :icon="header.icon"
      >
        <template #right>
          <div style="display:flex;gap:10px;flex-wrap:wrap">
            <EtuButton v-bind="exportBtn" />
            <EtuButton v-bind="refreshBtn" />
          </div>
        </template>
      </EtuPageHeader>
    `,
  }),
};
