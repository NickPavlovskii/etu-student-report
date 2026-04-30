export type AuditEntityInput = {
  entityType?: string | null;
  entityId?: string | null;
  action?: string | null;
  actor?: string | null;
  actorFio?: string | null;
  entityFioResolved?: string | null;
};

export type AuditDetailsContext = {
  action?: string;
  entityType?: string | null;
  entityId?: string | null;
  entityLabel?: string | null;
};
