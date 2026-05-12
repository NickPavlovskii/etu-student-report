import { describe, expect, it } from 'vitest';
import type { ReportDto } from '@/modules/disciplines/modal/reports';
import {
  computeUploadedMoodleWorkSlots,
  computeUploadedWorkSlots,
} from '@/modules/disciplines/utils/disciplineWorksPlan';

describe('disciplineWorksPlan', () => {
  describe('computeUploadedMoodleWorkSlots', () => {
    it('считает уникальные пары student+topic только для Moodle', () => {
      const reports: ReportDto[] = [
        {
          id: 1,
          planRowId: 1,
          studentId: 10,
          groupName: 'G',
          teacherLastName: 'T',
          topic: 'A',
          workType: 'ПР',
          workTitle: 'w',
          academicYear: '2024-2025',
          uploadDate: null,
          version: 0,
          check: null,
          status: 'В Moodle',
          uploadedBy: 'x',
          fileName: '',
          storageType: 'moodle',
        },
        {
          id: 2,
          planRowId: 1,
          studentId: 10,
          groupName: 'G',
          teacherLastName: 'T',
          topic: 'B',
          workType: 'ПР',
          workTitle: 'w',
          academicYear: '2024-2025',
          uploadDate: null,
          version: 0,
          check: null,
          status: 'Загружен',
          uploadedBy: 'x',
          fileName: 'f.docx',
          storageType: 'file',
        },
        {
          id: 3,
          planRowId: 1,
          studentId: 11,
          groupName: 'G',
          teacherLastName: 'T',
          topic: 'A',
          workType: 'ПР',
          workTitle: 'w',
          academicYear: '2024-2025',
          uploadDate: null,
          version: 0,
          check: null,
          status: 'В Moodle',
          uploadedBy: 'x',
          fileName: '',
          storageType: 'moodle',
        },
      ];
      expect(computeUploadedWorkSlots(reports)).toBe(3);
      expect(computeUploadedMoodleWorkSlots(reports)).toBe(2);
    });
  });
});
