import type { UploadReportPayload, UploadReportPayloadCard } from '../types';

/** Поля FormData для POST отчёта по дисциплине (одиночная и массовая загрузка файла). */
export function buildDisciplineReportFormData(payload: UploadReportPayload): FormData {
  const form = new FormData();
  form.append('studentId', String(payload.studentId));
  form.append('groupName', payload.groupName);
  form.append('topic', payload.topic ?? '');
  form.append('controlType', payload.controlType);
  form.append('workType', payload.workType);
  form.append('workTitle', payload.workTitle);
  form.append('academicYear', payload.academicYear);
  form.append('autoCheck', String(payload.autoCheck));
  form.append(
    'check',
    payload.check === null || payload.check === undefined ? '' : String(payload.check)
  );
  form.append('status', payload.status);
  form.append('uploadedBy', payload.uploadedBy);
  if (payload.moodleUrl) {
    form.append('moodleUrl', payload.moodleUrl);
  }
  form.append('storageType', payload.storageType ?? 'file');
  if (payload.file) {
    form.append('file', payload.file);
  }
  return form;
}

/** FormData для загрузки с карточки (без поля controlType). */
export function buildDisciplineReportCardFormData(payload: UploadReportPayloadCard): FormData {
  const form = new FormData();
  form.append('studentId', String(payload.studentId));
  form.append('groupName', payload.groupName);
  form.append('topic', payload.topic ?? '');
  form.append('workType', payload.workType);
  form.append('workTitle', payload.workTitle);
  form.append('academicYear', payload.academicYear);
  form.append('autoCheck', String(payload.autoCheck));
  form.append(
    'check',
    payload.check === null || payload.check === undefined ? '' : String(payload.check)
  );
  form.append('status', payload.status);
  form.append('uploadedBy', payload.uploadedBy);
  if (payload.moodleUrl) {
    form.append('moodleUrl', payload.moodleUrl);
  }
  form.append('storageType', payload.storageType ?? 'file');
  if (payload.file) {
    form.append('file', payload.file);
  }
  return form;
}
