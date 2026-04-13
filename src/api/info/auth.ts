import type { AxiosInstance } from 'axios';
import type { AuthModule } from '../types';

export default function authModule(api: AxiosInstance): AuthModule {
  return {
    async loginByLastName(lastName: string) {
      const { data } = await api.get('/auth/login', {
        params: { lastName },
      });
      return data;
    },
  };
}
