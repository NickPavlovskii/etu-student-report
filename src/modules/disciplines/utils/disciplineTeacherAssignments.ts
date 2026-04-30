import type { DisciplineTeacherAssignmentDto } from '@/api/types';

export function normTeacherLast(s: string | null | undefined): string {
  return (s ?? '').trim().toLowerCase();
}

export function effectiveActualLastName(
  a: DisciplineTeacherAssignmentDto
): string {
  const act = (a.actualLastName ?? '').trim();
  if (act) {
    return act;
  }
  return (a.planLastName ?? '').trim();
}

function fioFromParts(
  ln?: string | null,
  fn?: string | null,
  pat?: string | null
): string {
  const p = [ln, fn, pat].filter((x) => (x ?? '').trim()).join(' ');
  return p || '—';
}

export function planTeacherFioFromAssignment(
  a: DisciplineTeacherAssignmentDto | undefined
): string {
  if (!a) {
    return '';
  }
  const f = (a.planTeacherFio ?? '').trim();
  if (f) {
    return f;
  }
  const parts = fioFromParts(
    a.planLastName,
    a.planFirstName,
    a.planPatronymic
  );
  return parts === '—' ? '' : parts;
}

export function assignmentDisplayFio(
  a: DisciplineTeacherAssignmentDto
): string {
  const fromActual = (a.actualTeacherFio ?? '').trim();
  if (fromActual) {
    return fromActual;
  }
  const aFio = fioFromParts(
    a.actualLastName,
    a.actualFirstName,
    a.actualPatronymic
  );
  if (aFio !== '—') {
    return aFio;
  }
  const planFio = (a.planTeacherFio ?? '').trim();
  if (planFio) {
    return planFio;
  }
  return fioFromParts(a.planLastName, a.planFirstName, a.planPatronymic);
}

export function reportApiLastNameForPlanRow(
  a: DisciplineTeacherAssignmentDto | undefined,
  viewerLastName: string
): string {
  const me = normTeacherLast(viewerLastName);
  if (!a) {
    return viewerLastName;
  }
  const planLn = (a.planLastName ?? '').trim();
  const eff = effectiveActualLastName(a);
  if (me && normTeacherLast(eff) === me && planLn && normTeacherLast(planLn) !== me) {
    return planLn;
  }
  return viewerLastName;
}

export function assignmentByPlanRowId(
  list: DisciplineTeacherAssignmentDto[] | null | undefined
): Map<number, DisciplineTeacherAssignmentDto> {
  const m = new Map<number, DisciplineTeacherAssignmentDto>();
  for (const a of list ?? []) {
    const id = Number(a.planRowId);
    if (Number.isFinite(id) && id > 0) {
      m.set(id, a);
    }
  }
  return m;
}
