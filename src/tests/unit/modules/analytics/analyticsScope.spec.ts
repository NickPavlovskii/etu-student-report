import { describe, it, expect } from 'vitest'
import { teacherCardsResponseToArray } from '@/modules/analytics/utils/analyticsScope'

describe('analyticsScope business rules', () => {
  it('teacherCardsResponseToArray extracts cards from supported response shapes', () => {
    expect(teacherCardsResponseToArray([{ id: 1 }])).toEqual([{ id: 1 }])
    expect(teacherCardsResponseToArray({ data: [{ id: 2 }] })).toEqual([{ id: 2 }])
    expect(teacherCardsResponseToArray({ items: [{ id: 3 }] })).toEqual([{ id: 3 }])
    expect(teacherCardsResponseToArray({ data: { cards: [{ id: 4 }] } })).toEqual([{ id: 4 }])
  })

  it('returns empty array for unsupported payloads', () => {
    expect(teacherCardsResponseToArray(null)).toEqual([])
    expect(teacherCardsResponseToArray({})).toEqual([])
    expect(teacherCardsResponseToArray({ data: { value: 1 } })).toEqual([])
  })
})
