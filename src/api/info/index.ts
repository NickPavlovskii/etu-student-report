import type { App } from 'vue';
import { infoAxios } from '../axios';
import type { InfoApi } from '../types';

import authModule from './auth';
import adminModule from './admin';
import analyticsModule from './analytics';
import disciplinesModule from './disciplines';
import teachersModule from './teachers';
import templatesModule from './templates';
import archiveModule from './archive';
import validationModule from './validation';

export {
  JAVA_ILLUSTRATION_TABLE_CRITERIA_KEYS,
  JAVA_TEMPLATE_CRITERIA_DEFAULTS,
} from './javaTemplateCriteriaDefaults';

export const infoApi: InfoApi = {
  axios: infoAxios,
  auth: authModule(infoAxios),
  admin: adminModule(infoAxios),
  analytics: analyticsModule(infoAxios),
  disciplines: disciplinesModule(infoAxios),
  teachers: teachersModule(infoAxios),
  templates: templatesModule(infoAxios),
  archive: archiveModule(infoAxios),
  validation: validationModule(infoAxios),
};

export default {
  install(app: App) {
    app.config.globalProperties.$infoApi = infoApi;
    app.provide('infoApi', infoApi);
  },
};

export type { InfoApi } from '../types';

export type {
  AxiosInstanceGroup,
  ServerConfig,
  AuthModule,
  TeachersModule,
  AdminModule,
  AnalyticsModule,
  DisciplinesModule,
  TemplatesModule,
  ArchiveModule,
  ValidationModule,
  StudyPeriod,
  AnalyticsQueryParams,
  TeacherStatsKpi,
  AdminAnalyticsKpi,
  TeachersSummaryItem,
  DisciplinesTableItem,
  BySemesterRow,
  DisciplineWithTeacherRowDto,
  AdminStatsDto,
  TeacherDto,
  AuditLogEntryDto,
  AuditLogQueryParams,
  TemplateDto,
  TemplateCriteriaDto,
  DownloadFormat,
  ValidationErrorItem,
  ValidationResult,
  ValidateOptions,
  UploadReportPayloadCard,
  ControlScheduleDto,
  UploadReportPayload,
} from '../types';

export const loginByLastName = infoApi.auth.loginByLastName;

export const {
  getAdminStats,
  getAdminTeachers,
  getAdminTeacher,
  updateAdminTeacher,
  getAdminDisciplines,
  getAuditLog,
  rollbackAuditEntry,
} = infoApi.admin;

export const {
  getTeacherStats,
  getTeacherStatsDisciplinesTable,
  getTeacherStatsBySemester,
  getAdminAnalytics,
  getAdminAnalyticsTeachersSummary,
  getAdminAnalyticsDisciplinesTable,
  getAdminAnalyticsBySemester,
  getDepartmentDisciplinesWithTeachers,
} = infoApi.analytics;

export const {
  getDisciplineCards,
  getDiscipline,
  getDisciplineGroups,
  getTeacherGroups,
  getDisciplineStudents,
  getDisciplineReports,
  getDisciplineControls,
  getControlTypesFromApi,
  uploadDisciplineReport,
  uploadDisciplineReportForCard,
  downloadReport,
} = infoApi.disciplines;

export const getDisciplineCard = infoApi.disciplines.getDiscipline;

export const { getTeacherRows, getTeacherDisciplines } = infoApi.teachers;

export const {
  getTemplates,
  getTemplate,
  createTemplate,
  updateTemplate,
  deleteTemplate,
  uploadTitlePageTemplate,
} = infoApi.templates;

export const {
  fetchArchiveReportsForTeacher,
  fetchArchiveReportsAll,
  downloadArchiveReport,
} = infoApi.archive;

export const { validateDocument, validateBatch } = infoApi.validation;
