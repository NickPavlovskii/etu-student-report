import type { Ref } from 'vue';
import { computed } from 'vue';
import type { ControlScheduleDto, ReportDto } from '../modal/reports';
import type { StudentInGroupRow } from '../modal/uploadWorkModal';
import {
  buildTopicRowCountByGroup,
  computeExpectedWorksTotal,
  computeUploadedWorkSlots,
} from '../utils/disciplineWorksPlan';

export type DisciplineWorksStats = { uploaded: number; total: number };

export function useDisciplineWorksStats(
  studentsByGroup: Ref<Record<string, StudentInGroupRow[]>>,
  reports: Ref<ReportDto[]>,
  controls: Ref<ControlScheduleDto[]>,
  visibleControlTypes?: Ref<string[] | undefined>,
  displayedTopicsByControlType?: Ref<Record<string, string[] | undefined>>
) {
  const topicRowCountByGroup = computed<Record<string, number>>(() =>
    buildTopicRowCountByGroup(
      controls.value ?? [],
      visibleControlTypes?.value,
      displayedTopicsByControlType?.value
    )
  );

  const disciplineWorksStats = computed<DisciplineWorksStats>(() => {
    const total = computeExpectedWorksTotal(
      studentsByGroup.value as Record<string, unknown[]>,
      topicRowCountByGroup.value
    );
    const uploaded = computeUploadedWorkSlots(reports.value ?? []);
    return { uploaded, total };
  });

  return { disciplineWorksStats };
}
