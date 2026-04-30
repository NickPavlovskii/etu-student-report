import type { StudentDto } from './student';

export type DisciplineUi = {
  Discipline?: string;
  Name?: string;
  Assessment?: string;
};

/** Студент в группе (совпадает с моделью таблицы отчётов по дисциплине) */
export type StudentInGroupRow = StudentDto;

export type UploadWorkPayload = {
  studentId: number;
  groupName: string;
  topic: string;
  controlType: string;
  workType: string;
  workTitle: string;
  academicYear: string;
  autoCheck: boolean;
  check?: number | null;
  status: string;
  uploadedBy: string;
  file?: File;
  moodleUrl?: string;
  storageType?: 'file' | 'moodle';
};

/** Строка настройки вида контроля (группа, темы) */
export type DisciplineControlRow = {
  groupName?: string;
  controlText?: string;
  topics?: unknown;
};

export type UploadWorkModalProps = {
  discipline: DisciplineUi | null;
  groups: string[];
  studentsByGroup: Record<string, StudentInGroupRow[]>;
  topics: string[];
  controls: DisciplineControlRow[];
  assessment: string;
};

/** Доп. поля модалки на странице дисциплины (шаблоны проверки) */
export type UploadWorkModalDisciplineExtraProps = {
  templateId?: string | number | null;
  templateIdByWorkType?: Record<string, string | number>;
};

export type UploadDisciplineModalProps = UploadWorkModalProps &
  UploadWorkModalDisciplineExtraProps;

export const UPLOAD_MODAL_ACCEPT = '.pdf,.doc,.docx';
export const UPLOAD_MODAL_MAX_SIZE_MB = 50;

export type FormColumn = {
  key: string;
  label: string;
  cols: number;
  required?: boolean;
};

export const UPLOAD_MODAL_COLUMNS: FormColumn[] = [
  { key: 'group', label: 'Учебная группа *', cols: 6, required: true },
  { key: 'student', label: 'Студент *', cols: 6, required: true },
  { key: 'discipline', label: 'Дисциплина', cols: 6 },
  { key: 'workType', label: 'Вид контроля *', cols: 6, required: true },
  { key: 'workTitle', label: 'Название работы *', cols: 12, required: true },
  { key: 'topic', label: 'Тема', cols: 12 },
  { key: 'academicYear', label: 'Учебный год', cols: 12 },
];
