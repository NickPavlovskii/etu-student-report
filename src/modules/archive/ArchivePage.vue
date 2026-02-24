<template>
  <etu-loading-page v-if="loading" />
  <v-container
    v-else
    fluid
    class="page"
    >
    <div class="page-head">
      <h1 class="title">Архив учебных работ</h1>
      <p class="subtitle">
        Централизованное хранилище всех учебных работ кафедры
      </p>
    </div>

    <archive-filters
      v-model:search="search"
      v-model:filter-discipline="filterDiscipline"
      v-model:filter-group="filterGroup"
      v-model:filter-teacher="filterTeacher"
      v-model:date-from="dateFrom"
      v-model:date-to="dateTo"
      :disciplines="disciplines"
      :groups="groups"
      :teachers="teachers"
      :can-see-all="canSeeAll"
      :count="filteredRows.length"
      @reset="resetFilters"
    />

    <archive-table
      :headers="headers"
      :items="filteredRows"
      :loading="loading"
      :format-date="formatArchiveDate"
      @download="handleDownload"
    />
  </v-container>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { downloadArchiveReport } from '@/api/archive';
import { useUser } from '@/composables/useUser';
import { useDownload } from '@/composables/useDownload';
import ArchiveFilters from './components/ArchiveFilters.vue';
import ArchiveTable from './components/ArchiveTable.vue';
import { useArchive } from './composables/UseArchive';
import { formatArchiveDate } from './utils';
import type { ArchiveReportRow } from '@/types/reports';

const router = useRouter();
const { user } = useUser();
const { downloadBlob } = useDownload();

const search = ref('');
const filterDiscipline = ref('');
const filterGroup = ref('');
const filterTeacher = ref('');
const dateFrom = ref('');
const dateTo = ref('');

const {
  loading,
  loadAll,
  disciplines,
  groups,
  teachers,
  filteredRows,
  headers,
  canSeeAll,
} = useArchive({
  search,
  filterDiscipline,
  filterGroup,
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
  filterTeacher.value = '';
  dateFrom.value = '';
  dateTo.value = '';
}

async function handleDownload(item: ArchiveReportRow) {
  const blob = await downloadArchiveReport(item.id);
  downloadBlob(blob, item.fileName || 'report');
}
</script>

<style scoped>
.page {
  min-height: 100vh;
  background: #f5f6f8;
  padding: 28px 30px 50px;
  position: relative;
}
.page-head {
  margin-top: 8px;
  margin-bottom: 22px;
}
.title {
  margin: 0;
  font-size: 34px;
  line-height: 1.15;
  font-weight: 700;
  color: #111827;
}
.subtitle {
  margin: 10px 0 0;
  font-size: 14px;
  color: #6b7280;
}
</style>
