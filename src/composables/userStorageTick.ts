import { ref } from 'vue';

/** Счётчик для пересчёта computed, завязанных на `localStorage` user (в той же вкладке он не «реактивен»). */
export const userStorageTick = ref(0);

export function bumpUserStorageTick(): void {
  userStorageTick.value += 1;
}
