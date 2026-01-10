export type UserRole = 'teacher' | 'head';

export type User = {
  lastName: string;
  role: UserRole;
  disciplines: string[];
};
