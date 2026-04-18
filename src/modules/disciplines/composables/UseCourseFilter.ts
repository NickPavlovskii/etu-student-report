import { ref, computed, watch } from 'vue';

export function useCourseFilter(uniqueCourses: any) {
  const course = ref<(number | string)[]>([]);
  const checkAll = ref(false);
  const indeterminate = ref(false);

  watch(
    uniqueCourses,
    (val: (number | string)[]) => {
      if (!val.length) {
        course.value = [];
        checkAll.value = false;
        indeterminate.value = false;
        return;
      }
      const allowed = new Set(val);
      const kept = course.value.filter((c) => allowed.has(c));
      if (
        kept.length === course.value.length &&
        kept.length > 0 &&
        val.length > kept.length
      ) {
        course.value = [...val];
        return;
      }
      if (kept.length === course.value.length && kept.length > 0) {
        return;
      }
      if (kept.length > 0) {
        course.value = kept;
      } else {
        course.value = [...val];
      }
    },
    { immediate: true }
  );

  watch(course, (val) => {
    checkAll.value = val.length === uniqueCourses.value.length;
    indeterminate.value = val.length > 0 && !checkAll.value;
  });

  function handleCheckAll(val: boolean) {
    course.value = val ? [...uniqueCourses.value] : [];
    indeterminate.value = false;
  }

  function clearAllCourses() {
    course.value = [];
    checkAll.value = false;
    indeterminate.value = false;
  }

  const isAllSelected = computed(
    () =>
      course.value.length === uniqueCourses.value.length &&
      uniqueCourses.value.length > 0
  );

  return {
    course,
    checkAll,
    indeterminate,
    isAllSelected,
    handleCheckAll,
    clearAllCourses,
  };
}

