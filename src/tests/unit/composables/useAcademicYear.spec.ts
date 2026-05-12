import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { nextTick } from 'vue';

const STORAGE_KEY = 'academicYear';

describe('useAcademicYear (смена учебного года)', () => {
  beforeEach(() => {
    localStorage.removeItem(STORAGE_KEY);
    vi.resetModules();
  });

  afterEach(() => {
    localStorage.removeItem(STORAGE_KEY);
    vi.resetModules();
  });

  it('при смене года записывает значение в localStorage', async () => {
    const { useAcademicYear } = await import('@/composables/useAcademicYear');
    const { academicYear } = useAcademicYear();

    academicYear.value = '2025-2026';
    await nextTick();

    expect(localStorage.getItem(STORAGE_KEY)).toBe('2025-2026');
  });

  it('читает начальное значение из localStorage и нормализует слэш в дефис', async () => {
    localStorage.setItem(STORAGE_KEY, '2022/2023');
    vi.resetModules();

    const { useAcademicYear } = await import('@/composables/useAcademicYear');
    const { academicYear } = useAcademicYear();

    expect(academicYear.value).toBe('2022-2023');
  });

  it('если в storage пусто — используется год по умолчанию', async () => {
    localStorage.removeItem(STORAGE_KEY);
    vi.resetModules();

    const { useAcademicYear } = await import('@/composables/useAcademicYear');
    const { academicYear } = useAcademicYear();

    expect(academicYear.value).toBe('2024-2025');
  });

  it('не пишет в localStorage пустую строку', async () => {
    const { useAcademicYear } = await import('@/composables/useAcademicYear');
    const { academicYear } = useAcademicYear();

    academicYear.value = '2026-2027';
    await nextTick();
    expect(localStorage.getItem(STORAGE_KEY)).toBe('2026-2027');

    academicYear.value = '';
    await nextTick();
    // watch: if (val) — пустая строка не сохраняется, остаётся предыдущее
    expect(localStorage.getItem(STORAGE_KEY)).toBe('2026-2027');
  });
});
