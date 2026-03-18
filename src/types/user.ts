export interface User {
  lastName?: string;
  firstName?: string;
  patronymic?: string;
  fioShort?: string;
  department?: string;
  position?: string | null;
  rank?: string;
  degree?: string;
  /** Код роли: TEACHER | ADMIN (или несколько через запятую) */
  role?: string;
  /** Подпись для интерфейса: "Преподаватель" | "Администратор" или "Преподаватель / Администратор" */
  roleDisplay?: string;
}
