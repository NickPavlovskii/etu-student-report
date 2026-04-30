export interface User {
  lastName?: string;
  firstName?: string;
  patronymic?: string;
  fioShort?: string;
  department?: string;
  position?: string | null;
  rank?: string;
  degree?: string;
  role?: string;
  /** Если бэкенд отдаёт роли отдельным массивом — учитывается вместе с `role`. */
  roles?: string[];
  roleDisplay?: string;
}
