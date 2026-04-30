import { describe, it, expect } from 'vitest'
import {
  ADD_TEMPLATE_FONT_OPTIONS,
  ADD_TEMPLATE_FONT_SIZE_OPTIONS,
  ADD_TEMPLATE_ILL_NUMBERING_OPTIONS,
} from '@/modules/settings/constants/addTemplateModalOptions'

describe('addTemplateModalOptions (настройки шаблона)', () => {
  it('списки шрифтов и размеров не пустые', () => {
    expect(ADD_TEMPLATE_FONT_OPTIONS.length).toBeGreaterThan(0)
    expect(ADD_TEMPLATE_FONT_SIZE_OPTIONS.length).toBeGreaterThan(0)
    expect(ADD_TEMPLATE_FONT_OPTIONS).toContain('Arial')
  })

  it('нумерация иллюстраций — ожидаемые варианты', () => {
    expect(ADD_TEMPLATE_ILL_NUMBERING_OPTIONS).toContain('Сквозная')
    expect(ADD_TEMPLATE_ILL_NUMBERING_OPTIONS).toContain('По разделам')
  })
})
