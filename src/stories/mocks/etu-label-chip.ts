export const etuLabelChipPresetMocks = [
  { preset: 'blue' as const, label: 'Черновик' },
  { preset: 'green' as const, label: 'Принято' },
  { preset: 'orange' as const, label: 'На проверке' },
  { preset: 'red' as const, label: 'Отклонено' },
  { preset: 'gray' as const, label: 'Архив' },
] as const;

export const etuLabelChipCounterCloseArgs = {
  label: 'Фильтры',
  preset: 'purple' as const,
  counter: 3,
  closable: true,
  variant: 'inline' as const,
};

export const etuLabelChipVariantArgs = {
  label: 'Группа 101',
  preset: 'teal' as const,
  variant: 'chip' as const,
  prependIcon: 'mdi-account-multiple',
  size: 'md' as const,
};

export const etuLabelChipClickableDotArgs = {
  label: 'Онлайн',
  clickable: true,
  dot: true,
  dotColor: '#22c55e',
  preset: 'gray' as const,
  size: 'sm' as const,
};
