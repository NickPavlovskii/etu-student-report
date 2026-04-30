import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import EtuDataTable from '@/components/global/etu-data-table/EtuDataTable.vue'
import type { TableColumn } from '@/components/global/etu-data-table/types'

type Row = { id: number; title: string; status: string }

const columns: TableColumn<Row>[] = [
  { key: 'title', header: 'Название', sortable: true },
  { key: 'status', header: 'Статус' },
]

const rows: Row[] = [{ id: 1, title: 'Отчет', status: 'Проверка' }]

describe('EtuDataTable', () => {
  it('renders rows data', () => {
    const wrapper = mount(EtuDataTable<Row>, {
      props: {
        columns,
        rows,
        rowKey: 'id',
      },
      global: {
        stubs: {
          'v-icon': true,
        },
      },
    })

    expect(wrapper.text()).toContain('Отчет')
    expect(wrapper.text()).toContain('Проверка')
  })

  it('emits sort events when sortable header clicked', async () => {
    const wrapper = mount(EtuDataTable<Row>, {
      props: {
        columns,
        rows,
      },
      global: {
        stubs: {
          'v-icon': true,
        },
      },
    })

    const ths = wrapper.findAll('th')
    await ths[0]!.trigger('click')
    await ths[0]!.trigger('click')

    expect(wrapper.emitted('sort')).toEqual([
      ['title', 'asc'],
      ['title', 'desc'],
    ])
  })

  it('shows empty message when rows are empty and not loading', () => {
    const wrapper = mount(EtuDataTable<Row>, {
      props: {
        columns,
        rows: [],
        loading: false,
        emptyText: 'Нет данных',
      },
      global: {
        stubs: {
          'v-icon': true,
        },
      },
    })

    expect(wrapper.text()).toContain('Нет данных')
  })
})
