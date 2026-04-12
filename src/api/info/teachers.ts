import type { AxiosInstance } from 'axios';
import type { TeachersModule } from '../types';

export default function teachersModule(api: AxiosInstance): TeachersModule {
  return {
    async getTeacherRows(lastName: string) {
      const { data } = await api.get(`/teachers/${encodeURIComponent(lastName)}`);
      return data;
    },
    async getTeacherDisciplines(lastName: string) {
      const { data } = await api.get(
        `/teachers/${encodeURIComponent(lastName)}/disciplines`
      );
      return data;
    },
  };
}
