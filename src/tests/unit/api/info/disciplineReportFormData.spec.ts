import { describe, expect, it } from 'vitest';
import {
  buildDisciplineReportCardFormData,
  buildDisciplineReportFormData,
} from '@/api/info/disciplineReportFormData';
import type { UploadReportPayload, UploadReportPayloadCard } from '@/api/types';

const file = new File(['x'], 'work.docx', { type: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' });

describe('disciplineReportFormData', () => {
  const basePayload: UploadReportPayload = {
    studentId: 374285,
    groupName: '2372',
    topic: 'Тема 1',
    controlType: 'Контроль',
    workType: 'Практическая работа',
    workTitle: 'Название',
    academicYear: '2024-2025',
    autoCheck: true,
    check: 88,
    status: 'Загружен',
    uploadedBy: 'Иванов И.И.',
    file,
    moodleUrl: '',
    storageType: 'file',
  };

  describe('buildDisciplineReportFormData (одиночная / массовая загрузка файла)', () => {
    it('кладёт все ожидаемые поля и файл', () => {
      const form = buildDisciplineReportFormData(basePayload);
      expect(form.get('studentId')).toBe('374285');
      expect(form.get('groupName')).toBe('2372');
      expect(form.get('topic')).toBe('Тема 1');
      expect(form.get('controlType')).toBe('Контроль');
      expect(form.get('workType')).toBe('Практическая работа');
      expect(form.get('workTitle')).toBe('Название');
      expect(form.get('academicYear')).toBe('2024-2025');
      expect(form.get('autoCheck')).toBe('true');
      expect(form.get('check')).toBe('88');
      expect(form.get('status')).toBe('Загружен');
      expect(form.get('uploadedBy')).toBe('Иванов И.И.');
      expect(form.get('storageType')).toBe('file');
      expect(form.get('file')).toBeInstanceOf(File);
    });

    it('check null/undefined — пустая строка', () => {
      const form = buildDisciplineReportFormData({
        ...basePayload,
        check: null,
        file: undefined,
      });
      expect(form.get('check')).toBe('');
      expect(form.get('file')).toBeNull();
    });

    it('moodleUrl добавляется только если truthy', () => {
      const without = buildDisciplineReportFormData({ ...basePayload, moodleUrl: '' });
      expect(without.get('moodleUrl')).toBeNull();

      const withUrl = buildDisciplineReportFormData({
        ...basePayload,
        moodleUrl: 'https://moodle.example/course',
      });
      expect(withUrl.get('moodleUrl')).toBe('https://moodle.example/course');
    });

    it('autoCheck false сериализуется строкой', () => {
      const form = buildDisciplineReportFormData({ ...basePayload, autoCheck: false });
      expect(form.get('autoCheck')).toBe('false');
    });
  });

  describe('buildDisciplineReportCardFormData (загрузка с карточки)', () => {
    const cardPayload: UploadReportPayloadCard = {
      studentId: 1,
      groupName: '0370',
      topic: '',
      workType: 'ЛР',
      workTitle: 'Работа',
      academicYear: '2023-2024',
      autoCheck: false,
      check: null,
      status: 'Загружен',
      uploadedBy: 'user',
      storageType: 'file',
      file,
    };

    it('не содержит controlType', () => {
      const form = buildDisciplineReportCardFormData(cardPayload);
      expect(form.get('controlType')).toBeNull();
      expect(form.get('workType')).toBe('ЛР');
      expect(form.get('studentId')).toBe('1');
    });
  });
});
