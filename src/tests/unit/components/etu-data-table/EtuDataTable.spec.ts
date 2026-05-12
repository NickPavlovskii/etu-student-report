import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import EtuDataTable from '@/components/global/etu-data-table/EtuDataTable.vue'
import { columns, type EtuDataTableRow } from './EtuDataTable.spec.constants'

type Row = EtuDataTableRow

const rows: Row[] = [{ id: 1, title: 'Отчет', status: 'Проверка' }]

describe('EtuDataTable', () => {
  it('renders rows data', () => {
    const wrapper = mount(EtuDataTable, {
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
    const wrapper = mount(EtuDataTable, {
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
    const wrapper = mount(EtuDataTable, {
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
