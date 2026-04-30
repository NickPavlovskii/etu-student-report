import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import AnalyticsWidgetExportActions from '@/modules/analytics/components/AnalyticsWidgetExportActions.vue'

const vuetifyStubs = {
  'v-tooltip': {
    template: '<div class="v-tooltip-stub"><slot name="activator" /></div>',
  },
  'v-btn': {
    inheritAttrs: false,
    template: '<button type="button" v-bind="$attrs"><slot /></button>',
  },
  'v-icon': { template: '<span class="v-icon-stub" />' },
}

describe('AnalyticsWidgetExportActions', () => {
  it('в режиме таблицы показывает только Excel', () => {
    const w = mount(AnalyticsWidgetExportActions, {
      props: { chartPngDisabled: true },
      global: { stubs: vuetifyStubs },
    })

    expect(w.find('[aria-label="Скачать таблицу в Excel"]').exists()).toBe(true)
    expect(w.find('[aria-label="Скачать график как PNG"]').exists()).toBe(false)
  })

  it('в режиме графика показывает только PNG', () => {
    const w = mount(AnalyticsWidgetExportActions, {
      props: { chartPngDisabled: false },
      global: { stubs: vuetifyStubs },
    })

    expect(w.find('[aria-label="Скачать таблицу в Excel"]').exists()).toBe(false)
    expect(w.find('[aria-label="Скачать график как PNG"]').exists()).toBe(true)
  })

  it('эмитит exportExcel в режиме таблицы', async () => {
    const w = mount(AnalyticsWidgetExportActions, {
      props: { chartPngDisabled: true },
      global: { stubs: vuetifyStubs },
    })

    await w.find('[aria-label="Скачать таблицу в Excel"]').trigger('click')
    expect(w.emitted('exportExcel')).toHaveLength(1)
  })

  it('эмитит exportChartPng в режиме графика', async () => {
    const w = mount(AnalyticsWidgetExportActions, {
      props: { chartPngDisabled: false },
      global: { stubs: vuetifyStubs },
    })

    await w.find('[aria-label="Скачать график как PNG"]').trigger('click')
    expect(w.emitted('exportChartPng')).toHaveLength(1)
  })
})
