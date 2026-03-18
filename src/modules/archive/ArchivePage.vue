<template>
  <etu-loading-page v-if="loading" />
  <v-container
    v-else
    fluid
    class="page"
  >
    <etu-page-header
      icon="mdi-archive-outline"
      title="Архив учебных работ"
      subtitle="Централизованное хранилище всех учебных работ кафедры"
    />

    <archive-filters
      v-model:search="search"
      v-model:filter-discipline="filterDiscipline"
      v-model:filter-group="filterGroup"
      v-model:filter-work-type="filterWorkType"
      v-model:filter-teacher="filterTeacher"
      v-model:date-from="dateFrom"
      v-model:date-to="dateTo"
      :disciplines="disciplines"
      :groups="groups"
      :work-types="workTypes"
      :teachers="teachers"
      :can-see-all="canSeeAll"
      :count="filteredRows.length"
      @reset="resetFilters"
    >
      <template #export>
        <div class="export-btn-wrap">
          <etu-button
            title="Экспорт отчёта"
            width="auto"
            :prepend-icon="DOWNLOAD_ICON"
            :bg-color="'white'"
            :color="'#374151'"
            :border-color="'#e5e7eb'"
            :border="true"
            @click="handleExportExcel"
          />
        </div>
      </template>
    </archive-filters>

    <archive-table
      :headers="headers"
      :items="filteredRows"
      :loading="loading"
      :format-date="formatArchiveDate"
      @download="(item, format) => handleDownload(item, format)"
    />
  </v-container>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { downloadArchiveReport } from '@/api/archive';
import { useUser } from '@/composables/useUser';
import { useDownload } from '@/composables/useDownload';
import { useExportExcel } from './composables/useExportExcel';
import ArchiveFilters from './components/ArchiveFilters.vue';
import ArchiveTable from './components/ArchiveTable.vue';
import { useArchive } from './composables/UseArchive';
import { formatArchiveDate } from './utils';
import type { ArchiveReportRow } from '@/types/reports';
import DOWNLOAD_ICON from '@/assets/icons/download.svg';

const router = useRouter();
const { user } = useUser();
const { downloadBlob } = useDownload();
const { exportToExcel } = useExportExcel();

const search = ref('');
const filterDiscipline = ref('');
const filterGroup = ref('');
const filterWorkType = ref('');
const filterTeacher = ref('');
const dateFrom = ref('');
const dateTo = ref('');

const {
  loading,
  loadAll,
  disciplines,
  groups,
  workTypes,
  teachers,
  filteredRows,
  headers,
  canSeeAll,
} = useArchive({
  search,
  filterDiscipline,
  filterGroup,
  filterWorkType,
  filterTeacher,
  dateFrom,
  dateTo,
});

onMounted(async () => {
  const hasAccess = user.value?.lastName || canSeeAll.value;
  if (hasAccess) {
    await loadAll();
  } else {
    router.push('/auth');
  }
});

function resetFilters() {
  search.value = '';
  filterDiscipline.value = '';
  filterGroup.value = '';
  filterWorkType.value = '';
  filterTeacher.value = '';
  dateFrom.value = '';
  dateTo.value = '';
}

async function handleDownload(item: ArchiveReportRow, format?: 'docx' | 'pdf') {
  const blob = await downloadArchiveReport(item.id, format);
  const base = (item.fileName || 'report').replace(/\.(docx?|pdf)$/i, '');
  const ext = format === 'pdf' ? '.pdf' : '.docx';
  downloadBlob(blob, base + ext);
}

function handleExportExcel() {
  exportToExcel(filteredRows.value, canSeeAll.value);
}
</script>

<style scoped>
.page {
  min-height: 100vh;
  background: #f5f6f8;
  padding: 28px 30px 50px;
  position: relative;
}

.export-btn-wrap :deep(.etu-btn) {
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.08);
}

.export-btn-wrap :deep(.etu-btn:hover) {
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.12);
}
</style>
