import { describe, expect, it } from 'vitest';
import type { BatchValidationResult, ValidationResult } from '@/api/types';
import {
  applyBatchValidationToRowsMutable,
  normalizeBatchFileKey,
} from '@/modules/disciplines/utils/batchValidationMap';

function vr(partial: Partial<ValidationResult> = {}): ValidationResult {
  return {
    valid: true,
    errors: [],
    warnings: [],
    ...partial,
  };
}

describe('batchValidationMap', () => {
  describe('normalizeBatchFileKey', () => {
    it('нижний регистр и только basename', () => {
      expect(normalizeBatchFileKey('C:\\Docs\\Report.DOCX')).toBe('report.docx');
      expect(normalizeBatchFileKey('folder/sub/File.PDF')).toBe('file.pdf');
    });

    it('trim пробелов', () => {
      expect(normalizeBatchFileKey('  Name.docx  ')).toBe('name.docx');
    });
  });

  describe('applyBatchValidationToRowsMutable', () => {
    it('сопоставляет по имени файла', () => {
      const f1 = new File([], 'A.docx');
      const f2 = new File([], 'B.docx');
      const rows = [
        { file: f1, validation: null as ValidationResult | null | undefined },
        { file: f2, validation: null as ValidationResult | null | undefined },
      ];
      const res: BatchValidationResult = {
        results: [
          { filename: 'B.docx', result: vr({ percent: 10 }) },
          { filename: 'A.docx', result: vr({ percent: 90 }) },
        ],
      };
      applyBatchValidationToRowsMutable(res, rows);
      expect(rows[0].validation?.percent).toBe(90);
      expect(rows[1].validation?.percent).toBe(10);
    });

    it('fallback по индексу, если имя не совпало', () => {
      const f1 = new File([], 'only.docx');
      const rows = [{ file: f1, validation: null as ValidationResult | null | undefined }];
      const res: BatchValidationResult = {
        results: [{ filename: 'unknown.docx', result: vr({ percent: 55 }) }],
      };
      applyBatchValidationToRowsMutable(res, rows);
      expect(rows[0].validation?.percent).toBe(55);
    });

    it('пустой results — validation null', () => {
      const f = new File([], 'x.docx');
      const rows = [{ file: f, validation: vr({ percent: 1 }) }];
      applyBatchValidationToRowsMutable({ results: [] }, rows);
      expect(rows[0].validation).toBeNull();
    });
  });
});
