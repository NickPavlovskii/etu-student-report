import { describe, it, expect } from 'vitest'
import { disciplineCountLabel } from '@/modules/admin/utils/disciplineCountLabel'

describe('disciplineCountLabel', () => {
  it('склоняет «дисциплина» для 1 и 21', () => {
    expect(disciplineCountLabel(1)).toBe('1 дисциплина')
    expect(disciplineCountLabel(21)).toBe('21 дисциплина')
  })

  it('склоняет «дисциплины» для 2–4 (кроме 11–14)', () => {
    expect(disciplineCountLabel(2)).toBe('2 дисциплины')
    expect(disciplineCountLabel(4)).toBe('4 дисциплины')
  })

  it('склоняет «дисциплин» для 0, 5, 11–14', () => {
    expect(disciplineCountLabel(0)).toBe('0 дисциплин')
    expect(disciplineCountLabel(5)).toBe('5 дисциплин')
    expect(disciplineCountLabel(11)).toBe('11 дисциплин')
    expect(disciplineCountLabel(14)).toBe('14 дисциплин')
  })
})
