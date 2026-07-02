import type { Meta, StoryObj } from '@storybook/vue3';
import EtuDataTable from '@/components/global/etu-data-table/EtuDataTable.vue';
import {
  ETU_DATA_TABLE_EMPTY_TEXT,
  ETU_DATA_TABLE_MOCK_COLUMNS,
  ETU_DATA_TABLE_MOCK_ROWS,
} from '../mocks/etu-data-table';
import { canvasLightMaxWidth, CANVAS_WIDTH } from '../helpers/decorators';

const meta = {
  title: 'Глобальные компоненты/EtuDataTable',
  component: EtuDataTable,
  tags: ['autodocs'],
  parameters: {
    layout: 'padded',
    backgrounds: { default: 'app' },
    docs: {
      description: {
        component:
          'Семантическая таблица с сортировкой по колонкам, слотами `cell-*`, состоянием загрузки '
          + '(скелетон) и пустым состоянием. Внешний вид настраивается CSS-переменными `--etu-dt-*`.',
      },
    },
  },
  decorators: [canvasLightMaxWidth(CANVAS_WIDTH.table)],
} satisfies Meta<typeof EtuDataTable>;

export default meta;
type Story = StoryObj<typeof meta>;

export const WithData: Story = {
  name: 'С данными',
  args: {
    columns: ETU_DATA_TABLE_MOCK_COLUMNS,
    rows: ETU_DATA_TABLE_MOCK_ROWS,
    rowKey: 'id',
    loading: false,
    shadow: true,
  },
};

export const Loading: Story = {
  name: 'Загрузка (скелетон)',
  args: {
    columns: ETU_DATA_TABLE_MOCK_COLUMNS,
    rows: [],
    loading: true,
    showSkeleton: true,
    skeletonRows: 4,
    shadow: true,
  },
};

export const Empty: Story = {
  name: 'Пусто',
  args: {
    columns: ETU_DATA_TABLE_MOCK_COLUMNS,
    rows: [],
    loading: false,
    emptyText: ETU_DATA_TABLE_EMPTY_TEXT,
    shadow: true,
  },
};
