import type { AxiosInstance } from 'axios';
import { ref } from 'vue';

/** Число незавершённых HTTP-запросов (baseAxios + infoAxios). */
export const axiosPendingCount = ref(0);

/**
 * Пока смонтирован полноэкранный `etu-loading-page`, глобальный axios-оверлей в App не показываем —
 * иначе два чайника и две подписи накладываются (полупрозрачный фон просвечивает).
 */
export const globalAxiosOverlaySuppressCount = ref(0);

export function beginGlobalAxiosOverlaySuppression(): void {
  globalAxiosOverlaySuppressCount.value += 1;
}

export function endGlobalAxiosOverlaySuppression(): void {
  globalAxiosOverlaySuppressCount.value = Math.max(
    0,
    globalAxiosOverlaySuppressCount.value - 1
  );
}

export function attachAxiosLoading(instance: AxiosInstance): void {
  instance.interceptors.request.use(
    (config) => {
      axiosPendingCount.value += 1;
      return config;
    },
    (error) => {
      axiosPendingCount.value = Math.max(0, axiosPendingCount.value - 1);
      return Promise.reject(error);
    }
  );

  instance.interceptors.response.use(
    (response) => {
      axiosPendingCount.value = Math.max(0, axiosPendingCount.value - 1);
      return response;
    },
    (error) => {
      axiosPendingCount.value = Math.max(0, axiosPendingCount.value - 1);
      return Promise.reject(error);
    }
  );
}
