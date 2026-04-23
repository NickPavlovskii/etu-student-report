export const etuInfoCardDefaultArgs = {
  title: 'Студентов',
  value: 128,
  icon: 'mdi-account-group',
  color: 'blue' as const,
};

export const etuInfoCardColorMocks = [
  { title: 'Синий', value: '12', icon: 'mdi-school', color: 'blue' as const },
  {
    title: 'Зелёный',
    value: '8',
    icon: 'mdi-check-decagram',
    color: 'green' as const,
  },
  {
    title: 'Фиолетовый',
    value: '3',
    icon: 'mdi-chart-box',
    color: 'purple' as const,
  },
  {
    title: 'Оранжевый',
    value: '5',
    icon: 'mdi-clock-alert',
    color: 'orange' as const,
  },
] as const;
