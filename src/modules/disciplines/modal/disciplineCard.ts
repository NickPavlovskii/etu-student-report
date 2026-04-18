/** DTO карточки дисциплины с API (поддержка camelCase и snake_case). */
export interface DisciplineCardDto {
  planRowId?: number;
  plan_row_id?: number;
  disciplineName?: string;
  discipline_name?: string;
  course?: string | null;
  semester?: string | null;
  hasExam?: boolean;
  has_exam?: boolean;
  hasPassMark?: boolean;
  has_pass_mark?: boolean;
  hasPass?: boolean;
  has_pass?: boolean;
  groupsCount?: number;
  groups_count?: number;
  educationForm?: string | null;
  education_form?: string | null;
  educationLevel?: string | null;
  education_level?: string | null;
}

export interface DisciplineAggregate {
  CodeRow: number;
  planRowIds: number[];
  Discipline: string;
  Course: string | null;
  Semester: string | null;
  hasExam: boolean;
  hasPassMark: boolean;
  hasPass: boolean;
  groupsCount: number;
  educationForm: string | null;
  educationLevel: string | null;
}

export interface DisciplineListRow {
  CodeRow: number;
  _key: string;
  Discipline: string;
  Course: string | null;
  Semester: string | null;
  semester?: string | number | null;
  course?: string | number | null;
  Assessment: string;
  groupsCount: number;
  groups: string[];
  loadedCount: number;
  totalStudents: number;
  uploadedWorks: number;
  expectedWorksTotal: number;
  loaded: string;
  progress: number;
  educationForm: string | null;
  educationLevel: string | null;
  teacherFio?: string;
}
