export const etuStatCardWithIconArgs = {
  title: 'Активные работы',
  value: 24,
  icon: 'mdi-file-document-outline',
  color: 'blue' as const,
};

export const etuStatCardWithUnitArgs = {
  title: 'Средний балл',
  value: 4.52,
  unit: 'балла',
  color: 'green' as const,
  icon: 'mdi-chart-line',
};

export const etuStatCardColorMocks = [
  { title: 'Синий', value: 1, color: 'blue' as const, icon: 'mdi-information' },
  { title: 'Зелёный', value: 2, color: 'green' as const, icon: 'mdi-check' },
  {
    title: 'Фиолетовый',
    value: 3,
    color: 'purple' as const,
    icon: 'mdi-star',
  },
  {
    title: 'Оранжевый',
    value: 4,
    color: 'orange' as const,
    icon: 'mdi-alert',
  },
  { title: 'Серый', value: 5, color: 'gray' as const, icon: 'mdi-minus' },
] as const;
