import { computed } from 'vue';
import type { AdminDisciplinesContext } from '../injectionKeys';

export function useDisciplinesTabView(d: AdminDisciplinesContext) {
  const isLoading = computed(
    () =>
      d.disciplinesByTeacherLoading.value ||
      d.disciplinesByAllTeachersLoading.value
  );

  const isIdle = computed(
    () => !isLoading.value && !d.disciplineCardItems.value.length
  );

  return {
    isLoading,
    isIdle,
  };
}
