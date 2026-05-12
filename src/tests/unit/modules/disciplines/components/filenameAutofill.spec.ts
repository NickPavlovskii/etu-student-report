import { describe, expect, it } from 'vitest';
import type { DisciplineControlRow, StudentInGroupRow } from '@/modules/disciplines/modal/uploadWorkModal';
import type { AutofillContext } from '@/modules/disciplines/components/filenameAutofill';
import {
  controlTextsForGroup,
  extractFullStemTitle,
  parseFilename,
  topicsForGroupAndWorkTypePure,
} from '@/modules/disciplines/components/filenameAutofill';

const YEAR_OK = '2024-2025';

function ctxWithStudents(studentsByGroup: Record<string, StudentInGroupRow[]>): AutofillContext {
  return {
    groups: ['2372'],
    controls: [
      {
        groupName: '2372',
        controlText: 'Практическая работа',
        topics: [
          'Задача классификации Линейные классификаторы',
          'Задача классификации Деревья решений',
        ],
      },
    ] satisfies DisciplineControlRow[],
    studentsByGroup,
    academicYearWhitelist: new Set([YEAR_OK]),
  };
}

describe('filenameAutofill', () => {
  describe('extractFullStemTitle', () => {
    it('убирает расширение и сохраняет подчёркивания', () => {
      const name = '2372_374285_Практическая_работа_2024-2025.docx';
      expect(extractFullStemTitle(name)).toBe('2372_374285_Практическая_работа_2024-2025');
    });

    it('пустая строка — пустой результат', () => {
      expect(extractFullStemTitle('')).toBe('');
    });
  });

  describe('controlTextsForGroup', () => {
    it('фильтрует виды контроля по группе', () => {
      const controls: DisciplineControlRow[] = [
        { groupName: 'A', controlText: 'КР' },
        { groupName: 'B', controlText: 'ЛР' },
      ];
      expect(controlTextsForGroup(controls, 'A')).toEqual(['КР']);
      expect(controlTextsForGroup(controls, '')).toEqual(['КР', 'ЛР']);
    });
  });

  describe('topicsForGroupAndWorkTypePure', () => {
    it('без вида контроля возвращает fallback', () => {
      const controls: DisciplineControlRow[] = [
        { groupName: '2372', controlText: 'Практическая работа', topics: ['Тема 1'] },
      ];
      expect(topicsForGroupAndWorkTypePure(controls, '2372', '', ['Общая'])).toEqual(['Общая']);
    });

    it('с видом контроля — темы из строки настроек', () => {
      const controls: DisciplineControlRow[] = [
        { groupName: '2372', controlText: 'Практическая работа', topics: ['Тема 1', 'Тема 2'] },
      ];
      const got = topicsForGroupAndWorkTypePure(
        controls,
        '2372',
        'Практическая работа',
        []
      );
      expect(got).toEqual(['Тема 1', 'Тема 2']);
    });
  });

  describe('parseFilename', () => {
    const students: Record<string, StudentInGroupRow[]> = {
      '2372': [
        { studentId: 374285, fio: 'Студент А' },
        { studentId: 386731, fio: 'Студент Б' },
      ],
    };

    const ctx = ctxWithStudents(students);

    it('два «идентичных по шаблону» имени дают полный stem в workTitle и разных студентов', () => {
      const a =
        '2372_374285_Практическая_работа_Задача_классификации_Линейные_классификаторы_2024-2025.docx';
      const b =
        '2372_386731_Практическая_работа_Задача_классификации_Деревья_решений_2024-2025.docx';

      const pa = parseFilename(a, ctx);
      const pb = parseFilename(b, ctx);

      expect(pa.workTitle).toBe(extractFullStemTitle(a));
      expect(pb.workTitle).toBe(extractFullStemTitle(b));
      expect(pa.workTitle.length).toBeGreaterThan(0);
      expect(pb.workTitle.length).toBeGreaterThan(0);

      expect(pa.studentId).toBe(374285);
      expect(pb.studentId).toBe(386731);
      expect(pa.group).toBe('2372');
      expect(pb.group).toBe('2372');
      expect(pa.academicYear).toBe(YEAR_OK);
      expect(pb.academicYear).toBe(YEAR_OK);
      expect(pa.workType).toBe('Практическая работа');
      expect(pb.workType).toBe('Практическая работа');
      expect(pa.topic).toBe('Задача классификации Линейные классификаторы');
      expect(pb.topic).toBe('Задача классификации Деревья решений');
    });

    it('учебный год со слэшем нормализуется при совпадении с whitelist', () => {
      const name = '2372_374285_Практическая_работа_2024/2025.docx';
      const p = parseFilename(name, ctx);
      expect(p.academicYear).toBe(YEAR_OK);
    });

    it('номер в имени совпадает с зачёткой — возвращается studentId из списка', () => {
      const byBook: Record<string, StudentInGroupRow[]> = {
        '2372': [{ studentId: 9001, recordBook: '386731', fio: 'По зачётке' }],
      };
      const c = ctxWithStudents(byBook);
      const name = '2372_386731_Отчет_2024-2025.docx';
      const p = parseFilename(name, c);
      expect(p.studentId).toBe(9001);
    });

    it('без второго токена-студента workTitle всё равно полный stem', () => {
      const p = parseFilename('2372_only_2024-2025.docx', ctx);
      expect(p.workTitle).toBe('2372_only_2024-2025');
      expect(p.studentId).toBeNull();
    });
  });
});
