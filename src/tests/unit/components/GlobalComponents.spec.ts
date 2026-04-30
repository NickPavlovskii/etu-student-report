import { describe, expect, it, vi } from 'vitest'
import { shallowMount } from '@vue/test-utils'
import EtuInfoCard from '@/components/global/EtuInfoCard.vue'
import EtuLabelChip from '@/components/global/EtuLabelChip.vue'
import EtuLoadingPage from '@/components/global/EtuLoadingPage.vue'
import EtuPageHeader from '@/components/global/EtuPageHeader.vue'
import EtuPillSearchSelect from '@/components/global/EtuPillSearchSelect.vue'
import EtuSearchableSelect from '@/components/global/EtuSearchableSelect.vue'
import EtuStatCard from '@/components/global/EtuStatCard.vue'
import EtuTeaLoader from '@/components/global/EtuTeaLoader.vue'

vi.mock('@/api/axiosLoading', () => ({
  beginGlobalAxiosOverlaySuppression: vi.fn(),
  endGlobalAxiosOverlaySuppression: vi.fn(),
}))

const stubs = {
  'v-card': { template: '<div><slot /></div>' },
  'v-chip': true,
  'v-icon': true,
  'v-menu': true,
  'v-text-field': true,
  'v-list': true,
  'v-list-item': true,
  'v-list-item-title': true,
  Transition: false,
  'el-card': { template: '<div><slot /></div>' },
  'etu-tea-loader': true,
}

describe('Global components smoke tests', () => {
  it('renders EtuInfoCard and shows text value', () => {
    const wrapper = shallowMount(EtuInfoCard, {
      props: { title: 'Всего', value: 12, icon: 'mdi-chart-box' },
      global: { stubs },
    })
    expect(wrapper.text()).toContain('Всего')
    expect(wrapper.text()).toContain('12')
  })

  it('renders EtuLabelChip and emits click', async () => {
    const wrapper = shallowMount(EtuLabelChip, {
      props: { label: 'Тег', clickable: true },
      global: { stubs },
    })
    await wrapper.trigger('click')
    expect(wrapper.emitted('click')).toBeTruthy()
  })

  it('renders EtuLoadingPage with custom text', () => {
    const wrapper = shallowMount(EtuLoadingPage, {
      props: { text: 'Подождите' },
      global: { stubs },
    })
    expect(wrapper.text()).toContain('Подождите')
  })

  it('renders EtuPageHeader with slots', () => {
    const wrapper = shallowMount(EtuPageHeader, {
      props: { title: 'Заголовок', subtitle: 'Подзаголовок' },
      slots: { right: '<button>Action</button>', default: '<div>extra</div>' },
      global: { stubs },
    })
    expect(wrapper.text()).toContain('Заголовок')
    expect(wrapper.text()).toContain('Подзаголовок')
    expect(wrapper.text()).toContain('extra')
  })

  it('renders EtuPillSearchSelect and emits update:modelValue', async () => {
    const wrapper = shallowMount(EtuPillSearchSelect, {
      props: { modelValue: null, items: [{ title: 'A', value: 'a' }] },
      global: { stubs },
    })
    wrapper.vm.$emit('update:modelValue', 'a')
    await wrapper.vm.$nextTick()
    expect(wrapper.emitted('update:modelValue')).toBeTruthy()
  })

  it('renders EtuSearchableSelect and emits update:modelValue', async () => {
    const wrapper = shallowMount(EtuSearchableSelect, {
      props: {
        modelValue: null,
        items: [{ title: 'Преподаватель', value: 1 }],
      },
      global: { stubs },
    })
    wrapper.vm.$emit('update:modelValue', 1)
    await wrapper.vm.$nextTick()
    expect(wrapper.emitted('update:modelValue')).toBeTruthy()
  })

  it('renders EtuStatCard with formatted unit', () => {
    const wrapper = shallowMount(EtuStatCard, {
      props: { title: 'Работ', value: 7, unit: 'шт' },
      global: { stubs },
    })
    expect(wrapper.text()).toContain('Работ')
    expect(wrapper.text()).toContain('7 шт')
  })

  it('renders EtuTeaLoader overlay state', () => {
    const wrapper = shallowMount(EtuTeaLoader, {
      props: { overlay: true, loading: true, label: 'Загрузка' },
      global: { stubs },
    })
    expect(wrapper.text()).toContain('Загрузка')
  })
})
