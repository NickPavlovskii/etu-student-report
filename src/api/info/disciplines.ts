import type { AxiosInstance } from 'axios';
import type {
  ControlScheduleDto,
  DisciplinesModule,
  PutMoodleDisciplineLinkPayload,
  UploadReportPayload,
  UploadReportPayloadCard,
} from '../types';
import {
  buildDisciplineReportCardFormData,
  buildDisciplineReportFormData,
} from './disciplineReportFormData';

export default function disciplinesModule(api: AxiosInstance): DisciplinesModule {
  async function getDisciplineControlsInner(
    lastName: string,
    planRowId: number,
    academicYear?: string
  ): Promise<ControlScheduleDto[]> {
    const params = academicYear ? { academicYear } : {};
    const { data } = await api.get(
      `/teachers/${encodeURIComponent(lastName)}/discipline/${planRowId}/controls`,
      { params }
    );
    return data;
  }

  return {
    async getDisciplineCards(lastName: string, academicYear?: string) {
      const params = academicYear ? { academicYear } : {};
      const { data } = await api.get(
        `/teachers/${encodeURIComponent(lastName)}/disciplines/cards`,
        { params }
      );
      return data;
    },
    async getDiscipline(lastName: string, planRowId: number, academicYear?: string) {
      const params = academicYear ? { academicYear } : {};
      const { data } = await api.get(
        `/teachers/${encodeURIComponent(lastName)}/discipline/${planRowId}`,
        { params }
      );
      return data;
    },
    async getDisciplineGroups(
      lastName: string,
      planRowId: number,
      academicYear?: string
    ) {
      const params = academicYear ? { academicYear } : {};
      const { data } = await api.get(
        `/teachers/${encodeURIComponent(lastName)}/discipline/${planRowId}/groups`,
        { params }
      );
      return data;
    },
    async getTeacherGroups(lastName: string, academicYear?: string) {
      const params = academicYear ? { academicYear } : {};
      const { data } = await api.get(
        `/teachers/${encodeURIComponent(lastName)}/groups`,
        { params }
      );
      return data;
    },
    async getDisciplineStudents(
      lastName: string,
      planRowId: number,
      academicYear?: string
    ) {
      const params = academicYear ? { academicYear } : {};
      const { data } = await api.get(
        `/teachers/${encodeURIComponent(lastName)}/discipline/${planRowId}/students`,
        { params }
      );
      return data;
    },
    async getDisciplineReports(
      lastName: string,
      planRowId: number,
      academicYear?: string
    ) {
      const params = academicYear ? { academicYear } : {};
      const { data } = await api.get(
        `/teachers/${encodeURIComponent(lastName)}/discipline/${planRowId}/reports`,
        { params }
      );
      return data;
    },
    getDisciplineControls: getDisciplineControlsInner,
    async getControlTypesFromApi(
      lastName: string,
      planRowIds: number[],
      academicYear?: string
    ): Promise<string[]> {
      const seen = new Set<string>();
      const year = academicYear;
      for (const id of planRowIds) {
        try {
          const controls = await getDisciplineControlsInner(lastName, id, year);
          for (const c of controls ?? []) {
            const t = String(c?.controlText ?? '').trim();
            if (t) seen.add(t);
          }
        } catch {
          // ignore failed discipline
        }
      }
      return [...seen].sort((a, b) => a.localeCompare(b));
    },
    async uploadDisciplineReport(
      lastName: string,
      planRowId: number,
      payload: UploadReportPayload
    ) {
      const form = buildDisciplineReportFormData(payload);

      const { data } = await api.post(
        `/teachers/${encodeURIComponent(lastName)}/discipline/${planRowId}/reports`,
        form,
        { headers: { 'Content-Type': undefined } as any }
      );
      return data;
    },
    async uploadDisciplineReportForCard(
      lastName: string,
      planRowId: number,
      payload: UploadReportPayloadCard
    ) {
      const form = buildDisciplineReportCardFormData(payload);

      const { data } = await api.post(
        `/teachers/${encodeURIComponent(lastName)}/discipline/${planRowId}/reports`,
        form,
        { headers: { 'Content-Type': 'multipart/form-data' } }
      );
      return data;
    },
    async getDisciplineMoodleLinks(
      lastName: string,
      planRowId: number,
      academicYear?: string
    ) {
      const params = academicYear ? { academicYear } : {};
      const { data } = await api.get(
        `/teachers/${encodeURIComponent(lastName)}/discipline/${planRowId}/moodle-links`,
        { params }
      );
      return data;
    },
    async putDisciplineMoodleLink(
      lastName: string,
      planRowId: number,
      payload: PutMoodleDisciplineLinkPayload
    ) {
      const { data } = await api.put(
        `/teachers/${encodeURIComponent(lastName)}/discipline/${planRowId}/moodle-links`,
        payload
      );
      return data;
    },
    async deleteDisciplineMoodleLink(
      lastName: string,
      planRowId: number,
      payload: {
        groupName: string;
        controlType: string;
        topic: string;
        academicYear: string;
      }
    ) {
      await api.delete(
        `/teachers/${encodeURIComponent(lastName)}/discipline/${planRowId}/moodle-links`,
        { params: payload }
      );
    },
    async downloadReport(reportId: number): Promise<Blob> {
      const res = await api.get(`/reports/${reportId}/download`, {
        responseType: 'blob',
      });
      return res.data;
    },
  };
}
