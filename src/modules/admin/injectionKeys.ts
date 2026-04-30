import type { InjectionKey } from 'vue';
import { useAdminUsers } from './composables/useAdminUsers';
import { useAdminDisciplines } from './composables/useAdminDisciplines';
import type { AdminDisciplineCardItem } from './model';
import { useAdminAudit } from './composables/useAdminAudit';
import { useAdminDisciplineAssignments } from './composables/useAdminDisciplineAssignments';

export type AdminUsersContext = ReturnType<typeof useAdminUsers>;
export type AdminDisciplinesContext = ReturnType<typeof useAdminDisciplines>;
export type AdminAuditContext = ReturnType<typeof useAdminAudit>;
export type AdminAssignmentsContext = ReturnType<
  typeof useAdminDisciplineAssignments
>;

export const adminUsersKey: InjectionKey<AdminUsersContext> =
  Symbol('adminUsers');
export const adminDisciplinesKey: InjectionKey<AdminDisciplinesContext> =
  Symbol('adminDisciplines');
export const adminAuditKey: InjectionKey<AdminAuditContext> =
  Symbol('adminAudit');
export const adminAssignmentsKey: InjectionKey<AdminAssignmentsContext> =
  Symbol('adminAssignments');

export const adminOpenDisciplineKey: InjectionKey<
  (item: AdminDisciplineCardItem) => void | Promise<void>
> = Symbol('adminOpenDiscipline');
