import { ref, computed, watch } from 'vue';

export function useSemesterFilter(uniqueSemesters) {
  const semester = ref([]);
  const checkAll = ref(false);
  const indeterminate = ref(false);

  watch(
    uniqueSemesters,
    (val) => {
      const shouldSelectAll = val.length > 0 && semester.value.length === 0;
      if (shouldSelectAll) {
        semester.value = [...val];
        checkAll.value = true;
        indeterminate.value = false;
      }
    },
    { immediate: true }
  );

  watch(semester, (val) => {
    checkAll.value = val.length === uniqueSemesters.value.length;
    indeterminate.value = val.length > 0 && !checkAll.value;
  });

  function handleCheckAll(val) {
    semester.value = val ? [...uniqueSemesters.value] : [];
    indeterminate.value = false;
  }

  function clearAllSemesters() {
    semester.value = [];
    checkAll.value = false;
    indeterminate.value = false;
  }

  const isAllSelected = computed(
    () =>
      semester.value.length === uniqueSemesters.value.length &&
      uniqueSemesters.value.length > 0
  );

  return {
    semester,
    checkAll,
    indeterminate,
    isAllSelected,
    handleCheckAll,
    clearAllSemesters,
  };
}
