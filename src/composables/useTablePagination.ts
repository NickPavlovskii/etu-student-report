import {
  ref,
  computed,
  watch,
  toValue,
  reactive,
  type MaybeRefOrGetter,
} from 'vue';

const DEFAULT_PAGE_SIZE = 6;

export function useTablePagination<T>(
  items: MaybeRefOrGetter<T[]>,
  pageSize: number = DEFAULT_PAGE_SIZE
) {
  const page = ref(1);
  const ps = pageSize;

  const list = computed(() => {
    const raw = toValue(items);
    return Array.isArray(raw) ? raw : [];
  });
  const total = computed(() => list.value.length);
  const pageCount = computed(() =>
    Math.max(1, Math.ceil(total.value / ps))
  );

  watch(total, () => {
    page.value = 1;
  });

  watch(pageCount, (pc) => {
    if (page.value > pc) page.value = pc;
    if (page.value < 1) page.value = 1;
  });

  const pagedItems = computed(() => {
    const arr = list.value;
    const p = page.value;
    const start = (p - 1) * ps;
    return arr
      .slice(start, start + ps)
      .filter((item): item is T => item != null);
  });

  const rangeLabel = computed(() => {
    if (total.value === 0) return '';
    const start = (page.value - 1) * ps + 1;
    const end = Math.min(page.value * ps, total.value);
    return `${start}–${end} из ${total.value}`;
  });

  return reactive({
    page,
    pageCount,
    pagedItems,
    total,
    rangeLabel,
  });
}
