import type { AxiosInstance } from 'axios';
import type { AddTemplateForm } from '@/modules/settings/modal';

export type ServerConfig = {
  api?: {
    services?: {
      baseUrl?: string;
      infoUrl?: string;
    };
  };
};

export interface AxiosInstanceGroup {
  baseAxios: AxiosInstance;
  infoAxios: AxiosInstance;
}

/** Элемент графика контроля по группе */
export type ControlScheduleDto = {
  groupName: string;
  weekStart: number;
  weekEnd: number;
  controlText: string;
  topics: string[];
};

/** Тело запроса загрузки отчёта по дисциплине */
export type UploadReportPayload = {
  studentId: number;
  groupName: string;
  topic?: string;
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

export type UploadReportPayloadCard = Omit<UploadReportPayload, 'controlType'>;

export type MoodleDisciplineLinkDto = {
  planRowId: number;
  groupName: string;
  controlType: string;
  topic: string;
  academicYear: string;
  moodleUrl: string;
  updatedAt?: string;
  updatedBy?: string;
};

export type PutMoodleDisciplineLinkPayload = {
  groupName: string;
  controlType: string;
  topic: string;
  academicYear: string;
  moodleUrl: string;
  updatedBy: string;
};

// ——— auth ———
export interface AuthModule {
  loginByLastName(lastName: string): Promise<unknown>;
}

// ——— teachers ———
export interface TeachersModule {
  getTeacherRows(lastName: string): Promise<unknown>;
  getTeacherDisciplines(lastName: string): Promise<unknown>;
}

// ——— admin ———
export type AdminStatsDto = {
  teachersCount?: number;
  disciplinesCount?: number;
  groupsCount?: number;
  templatesCount?: number;
  employees?: number;
  disciplines?: number;
  groups?: number;
  templates?: number;
};

export type TeacherDto = {
  lastName: string;
  firstName?: string;
  patronymic?: string;
  fio?: string;
  email?: string;
  role?: string;
  roles?: string[];
  position?: string;
  rank?: string;
  degree?: string;
  disciplinesCount?: number;
  disciplines?: string[];
};

export type AuditLogEntryDto = {
  id: number;
  createdAt: string;
  action: string;
  entityType?: string;
  entityId?: string;
  actor?: string;
  actorFio?: string;
  entityFioResolved?: string;
  details?: string;
  rolledBackAt?: string;
  rolledBackBy?: string;
};

export type AuditLogQueryParams = {
  dateFrom?: string;
  dateTo?: string;
  action?: string;
  actor?: string;
};

/** Строка рабочей программы (teaching_load_csv) и преподаватель по плану / фактически. */
export type DisciplineTeacherAssignmentDto = {
  planRowId: number;
  disciplineName?: string;
  course?: number | string;
  semester?: number | string;
  planLastName?: string;
  planFirstName?: string;
  planPatronymic?: string;
  planTeacherFio?: string;
  actualLastName?: string;
  actualFirstName?: string;
  actualPatronymic?: string;
  actualTeacherFio?: string;
  hasOverride?: boolean;
};

export type UpdateDisciplineTeacherAssignmentRequest = {
  actualLastName: string;
  actualFirstName?: string;
  actualPatronymic?: string;
  updatedBy?: string;
};

export interface AdminModule {
  getAdminStats(academicYear?: string): Promise<AdminStatsDto>;
  getAdminTeachers(search?: string): Promise<TeacherDto[]>;
  getAdminTeacher(lastName: string): Promise<TeacherDto>;
  updateAdminTeacher(
    lastName: string,
    body: { email?: string; role?: string; roles?: string[] },
    actor?: string
  ): Promise<TeacherDto>;
  getAdminDisciplines(): Promise<string[]>;
  getAuditLog(params?: AuditLogQueryParams): Promise<AuditLogEntryDto[]>;
  rollbackAuditEntry(entryId: number, actor?: string): Promise<AuditLogEntryDto>;
  getDisciplineTeacherAssignments(
    search?: string
  ): Promise<DisciplineTeacherAssignmentDto[]>;
  getDisciplineTeacherAssignment(
    planRowId: number
  ): Promise<DisciplineTeacherAssignmentDto>;
  putDisciplineTeacherAssignment(
    planRowId: number,
    body: UpdateDisciplineTeacherAssignmentRequest
  ): Promise<DisciplineTeacherAssignmentDto>;
  deleteDisciplineTeacherAssignment(
    planRowId: number,
    actor?: string
  ): Promise<void>;
}

// ——— analytics ———
export type StudyPeriod =
  | 'academic_year'
  | 'autumn_semester'
  | 'spring_semester';

export type AnalyticsQueryParams = {
  academicYear: string;
  studyPeriod?: StudyPeriod;
};

export type TeacherStatsKpi = {
  expectedCount: number;
  totalWorks: number;
  moodleWorks?: number;
};

export type AdminAnalyticsKpi = {
  totalTeachers?: number;
  expectedCount: number;
  totalWorks: number;
  moodleWorks?: number;
};

export type TeachersSummaryItem = {
  teacherFio?: string;
  teacherLastName?: string;
  disciplinesCount?: number;
  expectedCount: number;
  uploadedCount?: number;
  totalWorks?: number;
  moodleLinksCount?: number;
  moodleUploadedCount?: number;
};

export type DisciplinesTableItem = {
  disciplineName: string;
  groupsCount: number;
  studentsCount: number;
  expectedCount: number;
  uploadedCount: number;
  moodleUploadedCount?: number;
  moodleLinksCount?: number;
};

export type BySemesterRow = {
  course?: number | string;
  semester?: number | string;
  expectedCount: number;
  uploadedCount?: number;
  moodleUploadedCount?: number;
  moodleLinksCount?: number;
  totalWorks?: number;
  groupsCount?: number;
  studentsCount?: number;
};

export type DisciplineWithTeacherRowDto = {
  planRowId?: number;
  disciplineName: string;
  teacherFio: string;
  teacherLastName?: string;
  course?: string | number;
  semester?: string | number;
  educationLevel?: string;
  educationForm?: string;
  lectureHours?: number;
  practiceHours?: number;
  hasExam?: boolean;
  hasPass?: boolean;
  hasPassMark?: boolean;
  groups?: string | string[] | number;
  groupsCount: number;
  studentsCount: number;
  expectedCount: number;
  uploadedCount: number;
  moodleLinksCount?: number;
};

export interface AnalyticsModule {
  getTeacherStats(
    lastName: string,
    params: AnalyticsQueryParams
  ): Promise<TeacherStatsKpi>;
  getTeacherStatsDisciplinesTable(
    lastName: string,
    params: AnalyticsQueryParams
  ): Promise<DisciplinesTableItem[]>;
  getTeacherStatsBySemester(
    lastName: string,
    params: AnalyticsQueryParams
  ): Promise<BySemesterRow[]>;
  getAdminAnalytics(params: AnalyticsQueryParams): Promise<AdminAnalyticsKpi>;
  getAdminAnalyticsTeachersSummary(
    params: AnalyticsQueryParams
  ): Promise<TeachersSummaryItem[]>;
  getAdminAnalyticsDisciplinesTable(
    params: AnalyticsQueryParams
  ): Promise<DisciplinesTableItem[]>;
  getAdminAnalyticsBySemester(
    params: AnalyticsQueryParams
  ): Promise<BySemesterRow[]>;
  getDepartmentDisciplinesWithTeachers(
    params: AnalyticsQueryParams
  ): Promise<DisciplineWithTeacherRowDto[]>;
}

// ——— disciplines ———
export interface DisciplinesModule {
  getDisciplineCards(lastName: string, academicYear?: string): Promise<any>;
  getDiscipline(lastName: string, planRowId: number, academicYear?: string): Promise<any>;
  getDisciplineGroups(
    lastName: string,
    planRowId: number,
    academicYear?: string
  ): Promise<any>;
  getTeacherGroups(lastName: string, academicYear?: string): Promise<any>;
  getDisciplineStudents(
    lastName: string,
    planRowId: number,
    academicYear?: string
  ): Promise<any>;
  getDisciplineReports(
    lastName: string,
    planRowId: number,
    academicYear?: string
  ): Promise<any>;
  getDisciplineControls(
    lastName: string,
    planRowId: number,
    academicYear?: string
  ): Promise<ControlScheduleDto[]>;
  getControlTypesFromApi(
    lastName: string,
    planRowIds: number[],
    academicYear?: string
  ): Promise<string[]>;
  uploadDisciplineReport(
    lastName: string,
    planRowId: number,
    payload: UploadReportPayload
  ): Promise<any>;
  uploadDisciplineReportForCard(
    lastName: string,
    planRowId: number,
    payload: UploadReportPayloadCard
  ): Promise<any>;
  getDisciplineMoodleLinks(
    lastName: string,
    planRowId: number,
    academicYear?: string
  ): Promise<MoodleDisciplineLinkDto[]>;
  putDisciplineMoodleLink(
    lastName: string,
    planRowId: number,
    payload: PutMoodleDisciplineLinkPayload
  ): Promise<MoodleDisciplineLinkDto>;
  deleteDisciplineMoodleLink(
    lastName: string,
    planRowId: number,
    payload: Omit<PutMoodleDisciplineLinkPayload, 'moodleUrl' | 'updatedBy'>
  ): Promise<void>;
  downloadReport(reportId: number): Promise<Blob>;
}

export type TemplateCriteriaDto = {
  fileFormat?: string;
  font?: string;
  fontSize?: string;
  lineSpacing?: string;
  minPages?: string;
  minSources?: string;
  illNumbering?: string;
  figurePosition?: string;
  figureCaption?: string;
  tableTitle?: string;
  tableTitlePlacement?: string;
  tablePosition?: string;
  submissionFormat?: string;
  hasTitlePage?: boolean;
  hasToc?: boolean;
  hasIntroduction?: boolean;
  hasMainPart?: boolean;
  hasConclusion?: boolean;
  hasBibliography?: boolean;
  hasAppendices?: boolean;
  titlePageRequiredStrings?: string[];
};

export type TemplateDto = {
  id?: string | number;
  name: string;
  description?: string;
  criteria?: TemplateCriteriaDto;
  fileFormat?: string;
  font?: string;
  fontSize?: string;
  lineSpacing?: string;
  minPages?: string;
  minSources?: string;
  illNumbering?: string;
  figurePosition?: string;
  figureCaption?: string;
  tableTitle?: string;
  tableTitlePlacement?: string;
  tablePosition?: string;
  submissionFormat?: string;
  hasTitlePage?: boolean;
  hasToc?: boolean;
  hasIntroduction?: boolean;
  hasMainPart?: boolean;
  hasConclusion?: boolean;
  hasBibliography?: boolean;
  hasAppendices?: boolean;
  titlePageRequiredStrings?: string[];
  createdAt?: string;
  updatedAt?: string;
  [key: string]: unknown;
};

export interface TemplatesModule {
  getTemplates(): Promise<TemplateDto[]>;
  getTemplate(id: string | number): Promise<TemplateDto | null>;
  createTemplate(body: TemplateDto): Promise<TemplateDto>;
  updateTemplate(id: string | number, body: TemplateDto): Promise<TemplateDto>;
  deleteTemplate(id: string | number): Promise<void>;
  uploadTitlePageTemplate(id: string | number, file: File): Promise<TemplateDto>;
}

// ——— archive ———
export type DownloadFormat = 'docx' | 'pdf';

export interface ArchiveModule {
  fetchArchiveReportsForTeacher(
    lastName: string,
    academicYear?: string
  ): Promise<unknown>;
  fetchArchiveReportsAll(
    teacherLastName?: string,
    academicYear?: string
  ): Promise<unknown>;
  downloadArchiveReport(
    reportId: number,
    format?: DownloadFormat
  ): Promise<Blob>;
}

// ——— validation ———
export type ValidationErrorItem = {
  code: string;
  title?: string;
  message: string;
  passed: boolean;
  expected?: string;
  actual?: string;
  level?: string;
  location?: string;
  category?: string;
};

export type ValidationResult = {
  valid: boolean;
  percent?: number;
  errorMessage?: string | null;
  criteria?: ValidationErrorItem[];
  errors: ValidationErrorItem[];
  warnings: ValidationErrorItem[];
  annotatedFileBase64?: string;
  annotatedFileName?: string;
};

export type BatchValidationItem = {
  filename: string;
  result: ValidationResult;
};

export type BatchValidationResult = {
  results: BatchValidationItem[];
};

export type ValidateOptions = {
  templateId?: string | number | null;
  template?: Partial<AddTemplateForm> | null;
  annotate?: boolean;
};

export interface ValidationModule {
  validateDocument(
    file: File,
    optionsOrTemplateId?:
      | ValidateOptions
      | Partial<AddTemplateForm>
      | string
      | number
      | null,
    annotateFlag?: boolean
  ): Promise<ValidationResult>;

  validateBatch(
    files: File[],
    options?: ValidateOptions | null
  ): Promise<BatchValidationResult>;
}

export interface InfoApi {
  axios?: AxiosInstance;
  auth: AuthModule;
  admin: AdminModule;
  analytics: AnalyticsModule;
  disciplines: DisciplinesModule;
  teachers: TeachersModule;
  templates: TemplatesModule;
  archive: ArchiveModule;
  validation: ValidationModule;
}
