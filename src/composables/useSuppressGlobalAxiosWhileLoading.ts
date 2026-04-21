import { onScopeDispose, watch, type ComputedRef, type Ref } from 'vue';
import {
  beginGlobalAxiosOverlaySuppression,
  endGlobalAxiosOverlaySuppression,
} from '@/api/axiosLoading';

/**
 * Пока `loading === true`, не показываем глобальный axios-оверлей в App.vue —
 * чтобы не дублировать индикатор с локальным (таблица, вкладка админки и т.д.).
 */
export function useSuppressGlobalAxiosWhileLoading(
  loading: Ref<boolean> | ComputedRef<boolean>
): void {
  let suppressed = false;

  watch(
    () => loading.value,
    (active, wasActive) => {
      if (active) {
        beginGlobalAxiosOverlaySuppression();
        suppressed = true;
      } else if (wasActive === true) {
        endGlobalAxiosOverlaySuppression();
        suppressed = false;
      }
    },
    { immediate: true }
  );

  onScopeDispose(() => {
    if (suppressed) {
      endGlobalAxiosOverlaySuppression();
      suppressed = false;
    }
  });
}
