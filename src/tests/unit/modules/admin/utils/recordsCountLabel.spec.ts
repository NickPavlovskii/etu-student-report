import { describe, it, expect } from 'vitest'
import { recordsCountLabel } from '@/modules/admin/utils/recordsCountLabel'

describe('recordsCountLabel', () => {
  it('1, 21, 101 — «запись»', () => {
    expect(recordsCountLabel(1)).toBe('1 запись')
    expect(recordsCountLabel(21)).toBe('21 запись')
  })

  it('2–4, 22 — «записи»', () => {
    expect(recordsCountLabel(2)).toBe('2 записи')
    expect(recordsCountLabel(4)).toBe('4 записи')
    expect(recordsCountLabel(22)).toBe('22 записи')
  })

  it('0, 5, 11–19 — «записей»', () => {
    expect(recordsCountLabel(0)).toBe('0 записей')
    expect(recordsCountLabel(5)).toBe('5 записей')
    expect(recordsCountLabel(11)).toBe('11 записей')
    expect(recordsCountLabel(19)).toBe('19 записей')
  })
})
