import { describe, it, expect } from 'vitest'
import {
  aggregateDisciplinesTableFromPlan,
  aggregateTeachersSummaryFromPlan,
  buildTeacherDetailBlocks,
  teacherCardsResponseToArray,
} from '@/modules/analytics/utils/analyticsScope'

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

  it('aggregateDisciplinesTableFromPlan sums moodleLinksCount', () => {
    const rows = [
      {
        disciplineName: 'System Engineering',
        expectedCount: 20,
        uploadedCount: 12,
        moodleLinksCount: 5,
        groupsCount: 1,
        studentsCount: 18,
      },
      {
        disciplineName: 'System Engineering',
        expectedCount: 10,
        uploadedCount: 6,
        moodleLinksCount: 3,
        groupsCount: 1,
        studentsCount: 12,
      },
    ] as any

    const out = aggregateDisciplinesTableFromPlan(rows)
    expect(out).toEqual([
      {
        disciplineName: 'System Engineering',
        expectedCount: 30,
        uploadedCount: 18,
        moodleLinksCount: 8,
        groupsCount: 2,
        studentsCount: 30,
      },
    ])
  })

  it('aggregateTeachersSummaryFromPlan exposes moodleLinksCount', () => {
    const rows = [
      {
        disciplineName: 'SE',
        teacherFio: 'Иванов И.И.',
        expectedCount: 20,
        uploadedCount: 10,
        moodleLinksCount: 4,
      },
      {
        disciplineName: 'Math',
        teacherFio: 'Иванов И.И.',
        expectedCount: 30,
        uploadedCount: 18,
        moodleLinksCount: 7,
      },
    ] as any

    const out = aggregateTeachersSummaryFromPlan(rows)
    expect(out[0]).toMatchObject({
      teacherFio: 'Иванов И.И.',
      expectedCount: 50,
      uploadedCount: 28,
      moodleLinksCount: 11,
      disciplinesCount: 2,
    })
  })

  it('buildTeacherDetailBlocks carries moodle counts', () => {
    const rows = [
      {
        disciplineName: 'SE',
        teacherFio: 'Иванов И.И.',
        expectedCount: 20,
        uploadedCount: 10,
        moodleLinksCount: 4,
        groups: ['0370'],
      },
      {
        disciplineName: 'Math',
        teacherFio: 'Иванов И.И.',
        expectedCount: 10,
        uploadedCount: 8,
        moodleLinksCount: 2,
        groups: ['0371'],
      },
    ] as any

    const out = buildTeacherDetailBlocks(rows)
    expect(out[0]).toMatchObject({
      teacher: 'Иванов И.И.',
      plan: 30,
      uploaded: 18,
      moodle: 6,
    })
    expect(out[0]?.children?.[0]).toHaveProperty('moodle')
  })
})
