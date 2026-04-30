import { describe, it, expect } from 'vitest'
import { ref, nextTick } from 'vue'
import { useCourseFilter } from '@/modules/disciplines/composables/UseCourseFilter'

describe('useCourseFilter', () => {
  it('при появлении списка курсов выбирает все значения', async () => {
    const uniqueCourses = ref<number[]>([1, 2, 3])
    const { course, checkAll, indeterminate } = useCourseFilter(uniqueCourses)
    await nextTick()

    expect(course.value).toEqual([1, 2, 3])
    expect(checkAll.value).toBe(true)
    expect(indeterminate.value).toBe(false)
  })

  it('при очистке списка курсов сбрасывает выбор и «выбрать всё»', async () => {
    const uniqueCourses = ref<number[]>([1, 2])
    const { course, checkAll } = useCourseFilter(uniqueCourses)
    await nextTick()
    uniqueCourses.value = []
    await nextTick()

    expect(course.value).toEqual([])
    expect(checkAll.value).toBe(false)
  })

  it('handleCheckAll(true) выбирает все текущие курсы', async () => {
    const uniqueCourses = ref<number[]>([10, 20])
    const { course, handleCheckAll, checkAll } = useCourseFilter(uniqueCourses)
    await nextTick()
    course.value = []
    await nextTick()

    handleCheckAll(true)
    expect(course.value).toEqual([10, 20])
    expect(checkAll.value).toBe(true)
  })

  it('clearAllCourses сбрасывает состояние', async () => {
    const uniqueCourses = ref<number[]>([1, 2, 3])
    const { course, clearAllCourses, checkAll, indeterminate } =
      useCourseFilter(uniqueCourses)
    await nextTick()

    clearAllCourses()
    expect(course.value).toEqual([])
    expect(checkAll.value).toBe(false)
    expect(indeterminate.value).toBe(false)
  })

  it('isAllSelected отражает полный выбор', async () => {
    const uniqueCourses = ref<number[]>([1, 2])
    const { course, isAllSelected } = useCourseFilter(uniqueCourses)
    await nextTick()
    expect(isAllSelected.value).toBe(true)

    course.value = [1]
    await nextTick()
    expect(isAllSelected.value).toBe(false)
  })
})
