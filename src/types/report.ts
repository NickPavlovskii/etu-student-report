export type Report = {
  studentId: number;
  topic: string;
  uploadDate: string;
  version: number;
  check: number | null;
  url: string;
  group: string;
  discipline: string;
  workType: string;
  workTitle: string;
  status?: 'checked' | 'pending' | 'error'; 
};
