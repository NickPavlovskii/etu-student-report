/** Склонение числа «N дисциплин» */
export function disciplineCountLabel(n: number): string {
  const abs = Math.abs(n);
  const mod100 = abs % 100;
  const mod10 = abs % 10;

  const form =
    mod100 >= 11 && mod100 <= 14
      ? 'дисциплин'
      : mod10 === 1
        ? 'дисциплина'
        : mod10 >= 2 && mod10 <= 4
          ? 'дисциплины'
          : 'дисциплин';

  return `${n} ${form}`;
}
