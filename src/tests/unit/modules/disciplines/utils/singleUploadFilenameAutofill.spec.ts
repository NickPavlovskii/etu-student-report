import { describe, expect, it } from 'vitest';
import {
  computeSingleUploadAutofillPatch,
  normalizeAcademicYearForStorage,
} from '@/modules/disciplines/utils/singleUploadFilenameAutofill';

const empty = {
  academicYear: '',
  workType: '',
  workTitle: '',
  topic: '',
};

describe('singleUploadFilenameAutofill', () => {
  describe('normalizeAcademicYearForStorage', () => {
    it('слэши в дефисы', () => {
      expect(normalizeAcademicYearForStorage('2024/2025')).toBe('2024-2025');
    });
  });

  describe('computeSingleUploadAutofillPatch', () => {
    it('вытаскивает учебный год из имени', () => {
      const patch = computeSingleUploadAutofillPatch(
        'Иванов_Математика_ЛР_2024-2025.docx',
        [],
        [],
        empty
      );
      expect(patch.academicYear).toBe('2024-2025');
    });

    it('подбирает вид контроля по 3-й части после _', () => {
      const patch = computeSingleUploadAutofillPatch(
        'Фамилия_Дисциплина_практическая работа_тема.docx',
        ['Практическая работа', 'ЛР'],
        [],
        empty
      );
      expect(patch.workType).toBe('Практическая работа');
    });

    it('четвёртая часть — название, только если workTitle пустой', () => {
      const patch = computeSingleUploadAutofillPatch(
        'a_b_ЛР_Моё название.docx',
        ['ЛР'],
        [],
        empty
      );
      expect(patch.workTitle).toBe('Моё название');
    });

    it('не перезаписывает непустой workTitle', () => {
      const patch = computeSingleUploadAutofillPatch(
        'a_b_ЛР_ignored.docx',
        ['ЛР'],
        [],
        { ...empty, workTitle: 'Уже есть' }
      );
      expect(patch.workTitle).toBeUndefined();
    });

    it('тема по шаблону «тема: …»', () => {
      const topics = ['Алгоритмы сортировки', 'Другая'];
      const patch = computeSingleUploadAutofillPatch(
        'file_2024-2025_тема: Алгоритмы сортировки.docx',
        [],
        topics,
        empty
      );
      expect(patch.topic).toBe('Алгоритмы сортировки');
    });

    it('не меняет topic, если уже заполнен', () => {
      const patch = computeSingleUploadAutofillPatch(
        'x_тема: Новая.docx',
        [],
        ['Новая'],
        { ...empty, topic: 'Старая' }
      );
      expect(patch.topic).toBeUndefined();
    });
  });
});
