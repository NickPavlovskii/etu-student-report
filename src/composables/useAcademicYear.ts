import { ref, watch } from 'vue';

const STORAGE_KEY = 'academicYear';
const DEFAULT_YEAR = '2024-2025';

function normalizeYear(v: string): string {
  return v.replace(/\//g, '-');
}

const stored = typeof localStorage !== 'undefined'
  ? localStorage.getItem(STORAGE_KEY) || DEFAULT_YEAR
  : DEFAULT_YEAR;
const academicYear = ref<string>(normalizeYear(stored));

watch(
  academicYear,
  (val) => {
    if (typeof localStorage !== 'undefined' && val) {
      localStorage.setItem(STORAGE_KEY, val);
    }
  },
  { immediate: false }
);

export function useAcademicYear() {
  return {
    academicYear,
  };
}
