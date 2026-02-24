import { http } from './http';

export async function getTeacherRows(lastName: string) {
  const { data } = await http.get(`/teachers/${encodeURIComponent(lastName)}`);
  return data;
}

export async function getTeacherDisciplines(lastName: string) {
  const { data } = await http.get(
    `/teachers/${encodeURIComponent(lastName)}/disciplines`
  );
  return data;
}
