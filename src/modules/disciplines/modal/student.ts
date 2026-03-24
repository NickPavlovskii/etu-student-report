/**
 * Студент в таблице отчётов по дисциплине.
 */
export interface StudentDto {
  fio?: string;
  Fio?: string;
  studentId?: number;
  student_id?: number;
  iotId?: number;
  iot_id?: number;
  lkId?: number;
  lk_id?: number;
  recordBook?: string;
  record_book?: string;
  gradebook?: string;
  Зачетка?: string;
  [key: string]: unknown;
}
