import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import EtuButton from '@/components/global/EtuButton.vue'

describe('EtuButton', () => {
  it('renders title text', () => {
    const wrapper = mount(EtuButton, {
      props: { title: 'Сохранить' },
      global: {
        stubs: {
          'v-btn': {
            template: '<button><slot /><slot name="prepend" /><slot name="append" /></button>',
          },
        },
      },
    })

    expect(wrapper.text()).toContain('Сохранить')
  })

  it('renders prepend icon image when prependIcon passed', () => {
    const wrapper = mount(EtuButton, {
      props: {
        title: 'Скачать',
        prependIcon: '/icon.svg',
      },
      global: {
        stubs: {
          'v-btn': {
            template: '<button><slot name="prepend" /><slot /><slot name="append" /></button>',
          },
        },
      },
    })

    const image = wrapper.find('img.icon--prepend')
    expect(image.exists()).toBe(true)
    expect(image.attributes('src')).toBe('/icon.svg')
  })

  it('emits click event', async () => {
    const wrapper = mount(EtuButton, {
      props: { title: 'Click me' },
      global: {
        stubs: {
          'v-btn': {
            emits: ['click'],
            template: '<button @click="$emit(\'click\', $event)"><slot /></button>',
          },
        },
      },
    })

    await wrapper.find('button').trigger('click')
    expect(wrapper.emitted('click')).toHaveLength(1)
  })
})
