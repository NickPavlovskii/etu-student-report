import { http } from './http';

export async function loginByLastName(lastName: string) {
  const { data } = await http.get('/auth/login', {
    params: { lastName },
  });
  return data;
}
