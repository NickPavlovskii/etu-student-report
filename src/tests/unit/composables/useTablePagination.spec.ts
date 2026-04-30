import { describe, it, expect } from 'vitest'
import { ref, nextTick } from 'vue'
import { useTablePagination } from '@/composables/useTablePagination'

describe('useTablePagination', () => {
  it('slices items by page and pageSize', () => {
    const items = ref([1, 2, 3, 4, 5, 6, 7])
    const p = useTablePagination(items, 3)

    expect(p.pagedItems).toEqual([1, 2, 3])
    expect(p.rangeLabel).toBe('1–3 из 7')

    p.page = 2
    expect(p.pagedItems).toEqual([4, 5, 6])
    expect(p.rangeLabel).toBe('4–6 из 7')

    p.page = 3
    expect(p.pagedItems).toEqual([7])
    expect(p.rangeLabel).toBe('7–7 из 7')
  })

  it('resets page to 1 when total shrinks', async () => {
    const items = ref([1, 2, 3, 4, 5, 6, 7])
    const p = useTablePagination(items, 3)
    p.page = 3
    items.value = [1, 2]
    await nextTick()

    expect(p.page).toBe(1)
    expect(p.pagedItems).toEqual([1, 2])
    expect(p.rangeLabel).toBe('1–2 из 2')
  })

  it('clamps page when pageCount drops below current page', async () => {
    const items = ref([1, 2, 3, 4, 5, 6])
    const p = useTablePagination(items, 3)
    p.page = 2
    items.value = [1]
    await nextTick()

    expect(p.page).toBe(1)
    expect(p.pageCount).toBe(1)
  })

  it('returns empty range when no items', () => {
    const items = ref<number[]>([])
    const p = useTablePagination(items, 6)

    expect(p.rangeLabel).toBe('')
    expect(p.pagedItems).toEqual([])
    expect(p.pageCount).toBe(1)
  })
})
