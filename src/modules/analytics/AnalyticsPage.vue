<template>
  <etu-loading-page v-if="loading" />
  <v-container
    v-else
    fluid
    class="page"
  >
    <etu-page-header
      icon="mdi-chart-box-outline"
      title="Аналитика по работам"
      icon-color="#2563eb"
      icon-bg-color="#eff6ff"
      :subtitle="headerSubtitle"
    >
      <template #right>
        <analytics-study-period-switcher v-model="studyPeriod" />
      </template>
    </etu-page-header>

    <div
      v-if="canSeeAll"
      class="scope-switcher-wrap"
    >
      <div
        class="scope-switcher"
        data-analytics-scope-tabs
        role="tablist"
        aria-label="Режим аналитики"
      >
        <button
          type="button"
          role="tab"
          :aria-selected="scopeMode === 'personal'"
          :class="[
            'scope-tab',
            { 'scope-tab--active': scopeMode === 'personal' },
          ]"
          @click="scopeMode = 'personal'"
        >
          <v-icon
            size="20"
            class="scope-tab-icon"
          >
            mdi-account-outline
          </v-icon>
          Моя аналитика
        </button>
        <button
          type="button"
          role="tab"
          :aria-selected="scopeMode === 'department'"
          :class="[
            'scope-tab',
            { 'scope-tab--active': scopeMode === 'department' },
          ]"
          @click="scopeMode = 'department'"
        >
          <v-icon
            size="20"
            class="scope-tab-icon"
          >
            mdi-briefcase-outline
          </v-icon>
          Аналитика кафедры
        </button>
      </div>
      <p class="scope-hint">{{ scopeHint }}</p>
    </div>

    <v-alert
      v-if="error"
      type="error"
      variant="tonal"
      class="mb-4"
      closable
    >
      {{ error }}
    </v-alert>

    <template v-if="displayKpi">
      <v-card
        class="kpi-hero"
        elevation="0"
      >
        <div class="kpi-hero__icon">
          <v-icon
            size="32"
            color="primary"
          >
            mdi-upload-outline
          </v-icon>
        </div>
        <div class="kpi-hero__body">
          <div class="kpi-hero__title">Загружено работ</div>
          <div class="kpi-hero__value">
            {{ displayKpi.totalWorks }} из {{ displayKpi.expectedCount }}
          </div>
          <div class="kpi-hero__track">
            <div
              class="kpi-hero__fill"
              :style="{ width: uploadPlanPct + '%' }"
            />
          </div>
          <div class="kpi-hero__foot">{{ uploadPlanPct }}% от общего плана</div>
        </div>
      </v-card>

      <v-row
        dense
        class="widgets-row"
        align="stretch"
      >
        <v-col cols="12">
          <v-card
            class="widget-card"
            elevation="0"
          >
            <div class="widget-head">
              <div class="widget-head__left">
                <v-icon
                  size="22"
                  class="widget-head__ico"
                >
                  mdi-school-outline
                </v-icon>
                <div>
                  <h3 class="widget-title">Загрузки по дисциплинам</h3>
                  <p class="widget-sub">
                    {{ disciplinesWidgetHint }}
                  </p>
                </div>
              </div>
              <v-btn-toggle
                v-model="viewDisciplines"
                class="view-toggle view-toggle--pill"
                data-analytics-view-toggle
                density="comfortable"
                variant="flat"
                mandatory
              >
                <v-btn
                  value="table"
                  size="small"
                >
                  <v-icon start>mdi-table-large</v-icon>
                  Таблица
                </v-btn>
                <v-btn
                  value="chart"
                  size="small"
                >
                  <v-icon start>mdi-chart-bar</v-icon>
                  График
                </v-btn>
              </v-btn-toggle>
            </div>
            <div class="widget-body widget-body--toggle-view">
              <template
                v-if="
                  viewDisciplines === 'chart' && disciplinesTableForScope.length
                "
              >
                <div class="widget-body__scroll">
                  <analytics-v-bar-chart
                    :items="disciplineBars"
                    :chart-height="200"
                  />
                </div>
                <analytics-table-pagination
                  v-model:page="disciplinesPagination.page"
                  :page-count="disciplinesPagination.pageCount"
                  :total="disciplinesPagination.total"
                  :range-label="disciplinesPagination.rangeLabel"
                />
              </template>
              <template
                v-else-if="
                  disciplinesTableForScope.length && viewDisciplines !== 'chart'
                "
              >
                <div class="widget-body__scroll">
                  <template v-if="disciplinesUsePlanDetailTable">
                    <div class="table-scroll table-scroll--plan-detail">
                      <etu-data-table
                        scrollable
                        wrap-class="analytics-etu-dt"
                        table-class="analytics-table--detail analytics-table--plan-detail"
                        :columns="disciplinesPlanTableColumns"
                        :rows="disciplinesPagination.pagedItems"
                        :show-skeleton="false"
                      >
                        <template #tbody>
                          <tr
                            v-for="row in disciplinesPagination.pagedItems"
                            :key="detailRowKey(row)"
                          >
                            <td class="cell-discipline">
                              {{ row.disciplineName }}
                            </td>
                            <td class="cell-person">
                              {{
                                row.teacherFio?.trim() ||
                                row.teacherLastName?.trim() ||
                                '—'
                              }}
                            </td>
                            <td class="cell-th-num cell-muted">
                              {{ row.course ?? '—' }}
                            </td>
                            <td class="cell-th-num cell-muted">
                              {{ row.semester ?? '—' }}
                            </td>
                            <td class="cell-groups">
                              <template
                                v-for="g in formatGroupsForDisplay(row.groups)"
                                :key="detailRowKey(row) + '-' + g"
                              >
                                <span class="grp-tag grp-tag--plan">
                                  {{ planRowGroupChipLabel(g) }}
                                </span>
                              </template>
                              <span
                                v-if="
                                  !formatGroupsForDisplay(row.groups).length
                                "
                                class="cell-empty-dash"
                              >
                                —
                              </span>
                            </td>
                            <td class="cell-th-num">{{ row.studentsCount }}</td>
                            <td class="cell-upload-prog-wrap">
                              <div class="cell-upload-prog">
                                <div class="cell-upload-prog__label">
                                  {{
                                    uploadedSlashExpected(
                                      row.uploadedCount,
                                      row.expectedCount
                                    )
                                  }}
                                </div>
                                <div class="cell-upload-prog__track">
                                  <div
                                    :class="
                                      uploadProgFillClasses(
                                        row.uploadedCount,
                                        row.expectedCount
                                      )
                                    "
                                    :style="{
                                      width:
                                        progressPct(
                                          row.uploadedCount,
                                          row.expectedCount
                                        ) + '%',
                                    }"
                                  />
                                </div>
                              </div>
                            </td>
                          </tr>
                          <tr
                            v-if="disciplinesTableForScope.length"
                            class="row-total"
                          >
                            <td colspan="6">Итого</td>
                            <td class="cell-upload-prog-wrap">
                              <div class="cell-upload-prog">
                                <div class="cell-upload-prog__label">
                                  {{
                                    uploadedSlashExpected(
                                      totalsDisciplines.up,
                                      totalsDisciplines.plan
                                    )
                                  }}
                                </div>
                                <div class="cell-upload-prog__track">
                                  <div
                                    :class="
                                      uploadProgFillClasses(
                                        totalsDisciplines.up,
                                        totalsDisciplines.plan
                                      )
                                    "
                                    :style="{
                                      width:
                                        progressPct(
                                          totalsDisciplines.up,
                                          totalsDisciplines.plan
                                        ) + '%',
                                    }"
                                  />
                                </div>
                              </div>
                            </td>
                          </tr>
                        </template>
                      </etu-data-table>
                    </div>
                  </template>
                  <template v-else>
                    <etu-data-table
                      wrap-class="analytics-etu-dt"
                      table-class="analytics-table"
                      :columns="disciplinesSimpleTableColumns"
                      :rows="disciplinesPagination.pagedItems"
                      :show-skeleton="false"
                    >
                      <template #tbody>
                        <tr
                          v-for="row in disciplinesPagination.pagedItems"
                          :key="detailRowKey(row)"
                        >
                          <td>{{ row.disciplineName }}</td>
                          <td>{{ row.groupsCount }}</td>
                          <td>{{ row.studentsCount }}</td>
                          <td class="cell-upload-prog-wrap">
                            <div class="cell-upload-prog">
                              <div class="cell-upload-prog__label">
                                {{
                                  uploadedSlashExpected(
                                    row.uploadedCount,
                                    row.expectedCount
                                  )
                                }}
                              </div>
                              <div class="cell-upload-prog__track">
                                <div
                                  :class="
                                    uploadProgFillClasses(
                                      row.uploadedCount,
                                      row.expectedCount
                                    )
                                  "
                                  :style="{
                                    width:
                                      progressPct(
                                        row.uploadedCount,
                                        row.expectedCount
                                      ) + '%',
                                  }"
                                />
                              </div>
                            </div>
                          </td>
                        </tr>
                        <tr
                          v-if="disciplinesTableForScope.length"
                          class="row-total"
                        >
                          <td colspan="3">Итого</td>
                          <td class="cell-upload-prog-wrap">
                            <div class="cell-upload-prog">
                              <div class="cell-upload-prog__label">
                                {{
                                  uploadedSlashExpected(
                                    totalsDisciplines.up,
                                    totalsDisciplines.plan
                                  )
                                }}
                              </div>
                              <div class="cell-upload-prog__track">
                                <div
                                  :class="
                                    uploadProgFillClasses(
                                      totalsDisciplines.up,
                                      totalsDisciplines.plan
                                    )
                                  "
                                  :style="{
                                    width:
                                      progressPct(
                                        totalsDisciplines.up,
                                        totalsDisciplines.plan
                                      ) + '%',
                                  }"
                                />
                              </div>
                            </div>
                          </td>
                        </tr>
                      </template>
                    </etu-data-table>
                  </template>
                </div>
                <analytics-table-pagination
                  v-model:page="disciplinesPagination.page"
                  :page-count="disciplinesPagination.pageCount"
                  :total="disciplinesPagination.total"
                  :range-label="disciplinesPagination.rangeLabel"
                />
              </template>
              <p
                v-else
                class="widget-empty"
              >
                Нет данных по дисциплинам за этот учебный год
              </p>
            </div>
          </v-card>
        </v-col>
      </v-row>

      <template v-if="showDepartmentStats">
        <v-row
          dense
          class="widgets-row widgets-row--dept-pair"
          align="stretch"
        >
          <v-col
            cols="12"
            lg="6"
          >
            <v-card
              class="widget-card"
              elevation="0"
            >
              <div class="widget-head">
                <div class="widget-head__left">
                  <v-icon
                    size="22"
                    class="widget-head__ico"
                  >
                    mdi-account-group-outline
                  </v-icon>
                  <div>
                    <h3 class="widget-title">Загрузки по группам</h3>
                    <p class="widget-sub">Оценка по группам</p>
                  </div>
                </div>
                <v-btn-toggle
                  v-model="viewGroups"
                  class="view-toggle view-toggle--pill"
                  data-analytics-view-toggle
                  density="comfortable"
                  variant="flat"
                  mandatory
                >
                  <v-btn
                    value="table"
                    size="small"
                  >
                    <v-icon start>mdi-table-large</v-icon>
                    Таблица
                  </v-btn>
                  <v-btn
                    value="chart"
                    size="small"
                  >
                    <v-icon start>mdi-chart-bar</v-icon>
                    График
                  </v-btn>
                </v-btn-toggle>
              </div>
              <div
                class="widget-body widget-body--toggle-view widget-body--paired-col"
              >
                <template v-if="viewGroups === 'chart' && groupRows.length">
                  <div class="widget-body__scroll">
                    <analytics-horizontal-bar-chart
                      :rows="groupHorizontalBarRows"
                    />
                  </div>
                  <analytics-table-pagination
                    v-model:page="groupsPagination.page"
                    :page-count="groupsPagination.pageCount"
                    :total="groupsPagination.total"
                    :range-label="groupsPagination.rangeLabel"
                  />
                </template>
                <template
                  v-else-if="viewGroups === 'table' && groupRows.length"
                >
                  <div class="widget-body__scroll">
                    <etu-data-table
                      wrap-class="analytics-etu-dt"
                      table-class="analytics-table"
                      :columns="groupsTableColumns"
                      :rows="groupsPagination.pagedItems"
                      :show-skeleton="false"
                    >
                      <template #tbody>
                        <tr
                          v-for="row in groupsPagination.pagedItems"
                          :key="row.label"
                        >
                          <td>{{ row.label }}</td>
                          <td class="cell-upload-prog-wrap">
                            <div class="cell-upload-prog">
                              <div class="cell-upload-prog__label">
                                {{
                                  uploadedSlashExpected(row.uploaded, row.plan)
                                }}
                              </div>
                              <div class="cell-upload-prog__track">
                                <div
                                  :class="
                                    uploadProgFillClasses(
                                      row.uploaded,
                                      row.plan
                                    )
                                  "
                                  :style="{
                                    width:
                                      progressPct(row.uploaded, row.plan) + '%',
                                  }"
                                />
                              </div>
                            </div>
                          </td>
                        </tr>
                        <tr class="row-total">
                          <td>Итого</td>
                          <td class="cell-upload-prog-wrap">
                            <div class="cell-upload-prog">
                              <div class="cell-upload-prog__label">
                                {{
                                  uploadedSlashExpected(
                                    totalsGroups.up,
                                    totalsGroups.plan
                                  )
                                }}
                              </div>
                              <div class="cell-upload-prog__track">
                                <div
                                  :class="
                                    uploadProgFillClasses(
                                      totalsGroups.up,
                                      totalsGroups.plan
                                    )
                                  "
                                  :style="{
                                    width:
                                      progressPct(
                                        totalsGroups.up,
                                        totalsGroups.plan
                                      ) + '%',
                                  }"
                                />
                              </div>
                            </div>
                          </td>
                        </tr>
                      </template>
                    </etu-data-table>
                  </div>
                  <analytics-table-pagination
                    v-model:page="groupsPagination.page"
                    :page-count="groupsPagination.pageCount"
                    :total="groupsPagination.total"
                    :range-label="groupsPagination.rangeLabel"
                  />
                </template>
                <p
                  v-else
                  class="widget-empty"
                >
                  Нет данных по группам (нужны план-строки с указанием групп)
                </p>
              </div>
            </v-card>
          </v-col>

          <v-col
            cols="12"
            lg="6"
          >
            <v-card
              class="widget-card"
              elevation="0"
            >
              <div class="widget-head">
                <div class="widget-head__left">
                  <v-icon
                    size="22"
                    class="widget-head__ico"
                  >
                    mdi-account-tie-outline
                  </v-icon>
                  <div>
                    <h3 class="widget-title">Загрузки по преподавателям</h3>
                    <p class="widget-sub">Сводка по преподавателям кафедры</p>
                  </div>
                </div>
                <v-btn-toggle
                  v-model="viewTeachers"
                  class="view-toggle view-toggle--pill"
                  data-analytics-view-toggle
                  density="comfortable"
                  variant="flat"
                  mandatory
                >
                  <v-btn
                    value="table"
                    size="small"
                  >
                    <v-icon start>mdi-table-large</v-icon>
                    Таблица
                  </v-btn>
                  <v-btn
                    value="chart"
                    size="small"
                  >
                    <v-icon start>mdi-chart-bar</v-icon>
                    График
                  </v-btn>
                </v-btn-toggle>
              </div>
              <div
                class="widget-body widget-body--toggle-view widget-body--paired-col"
              >
                <template
                  v-if="
                    viewTeachers === 'chart' && teachersSummaryForScope.length
                  "
                >
                  <div class="widget-body__scroll">
                    <analytics-horizontal-bar-chart
                      :rows="teacherChartBarRows"
                    />
                  </div>
                  <analytics-table-pagination
                    v-model:page="teachersPagination.page"
                    :page-count="teachersPagination.pageCount"
                    :total="teachersPagination.total"
                    :range-label="teachersPagination.rangeLabel"
                  />
                </template>
                <template
                  v-else-if="
                    viewTeachers === 'table' && teachersSummaryForScope.length
                  "
                >
                  <div class="widget-body__scroll">
                    <etu-data-table
                      wrap-class="analytics-etu-dt"
                      table-class="analytics-table"
                      :columns="teachersTableColumns"
                      :rows="teachersPagination.pagedItems"
                      :show-skeleton="false"
                    >
                      <template #tbody>
                        <tr
                          v-for="row in teachersPagination.pagedItems"
                          :key="teacherKey(row)"
                        >
                          <td>
                            <div class="teacher-cell">
                              <div
                                class="teacher-avatar"
                                :style="{
                                  background: avatarColor(teacherName(row)),
                                }"
                              >
                                {{ initials(teacherName(row)) }}
                              </div>
                              <span>{{ teacherName(row) }}</span>
                            </div>
                          </td>
                          <td>{{ row.disciplinesCount ?? '—' }}</td>
                          <td class="cell-upload-prog-wrap">
                            <div class="cell-upload-prog">
                              <div class="cell-upload-prog__label">
                                {{
                                  uploadedSlashExpected(
                                    teacherUploadedNum(row),
                                    num(row.expectedCount)
                                  )
                                }}
                              </div>
                              <div class="cell-upload-prog__track">
                                <div
                                  :class="
                                    uploadProgFillClasses(
                                      teacherUploadedNum(row),
                                      num(row.expectedCount)
                                    )
                                  "
                                  :style="{
                                    width:
                                      progressPct(
                                        teacherUploadedNum(row),
                                        num(row.expectedCount)
                                      ) + '%',
                                  }"
                                />
                              </div>
                            </div>
                          </td>
                        </tr>
                        <tr class="row-total">
                          <td colspan="2">Итого</td>
                          <td class="cell-upload-prog-wrap">
                            <div class="cell-upload-prog">
                              <div class="cell-upload-prog__label">
                                {{
                                  uploadedSlashExpected(
                                    totalsTeachers.up,
                                    totalsTeachers.plan
                                  )
                                }}
                              </div>
                              <div class="cell-upload-prog__track">
                                <div
                                  :class="
                                    uploadProgFillClasses(
                                      totalsTeachers.up,
                                      totalsTeachers.plan
                                    )
                                  "
                                  :style="{
                                    width:
                                      progressPct(
                                        totalsTeachers.up,
                                        totalsTeachers.plan
                                      ) + '%',
                                  }"
                                />
                              </div>
                            </div>
                          </td>
                        </tr>
                      </template>
                    </etu-data-table>
                  </div>
                  <analytics-table-pagination
                    v-model:page="teachersPagination.page"
                    :page-count="teachersPagination.pageCount"
                    :total="teachersPagination.total"
                    :range-label="teachersPagination.rangeLabel"
                  />
                </template>
                <p
                  v-else
                  class="widget-empty"
                >
                  Нет данных по преподавателям за этот учебный год
                </p>
              </div>
            </v-card>
          </v-col>
        </v-row>
      </template>

      <v-row
        dense
        class="widgets-row"
        align="stretch"
      >
        <v-col cols="12">
          <v-card
            class="widget-card"
            elevation="0"
          >
            <div class="widget-head">
              <div class="widget-head__left">
                <v-icon
                  size="22"
                  class="widget-head__ico"
                >
                  mdi-calendar-month-outline
                </v-icon>
                <div>
                  <h3 class="widget-title">Загрузки по семестрам</h3>
                </div>
              </div>
              <v-btn-toggle
                v-model="viewSemesters"
                class="view-toggle view-toggle--pill"
                data-analytics-view-toggle
                density="comfortable"
                variant="flat"
                mandatory
              >
                <v-btn
                  value="table"
                  size="small"
                >
                  <v-icon start>mdi-table-large</v-icon>
                  Таблица
                </v-btn>
                <v-btn
                  value="chart"
                  size="small"
                >
                  <v-icon start>mdi-chart-bar</v-icon>
                  График
                </v-btn>
              </v-btn-toggle>
            </div>
            <div class="widget-body widget-body--toggle-view">
              <template
                v-if="viewSemesters === 'chart' && bySemesterForScope.length"
              >
                <div class="widget-body__scroll">
                  <analytics-v-bar-chart
                    :items="semesterBars"
                    :chart-height="200"
                  />
                </div>
                <analytics-table-pagination
                  v-model:page="semesterPagination.page"
                  :page-count="semesterPagination.pageCount"
                  :total="semesterPagination.total"
                  :range-label="semesterPagination.rangeLabel"
                />
              </template>
              <template
                v-else-if="
                  bySemesterForScope.length && viewSemesters !== 'chart'
                "
              >
                <div class="widget-body__scroll">
                  <etu-data-table
                    scrollable
                    wrap-class="analytics-etu-dt analytics-etu-dt--semesters"
                    table-class="analytics-table--semesters"
                    :columns="semesterTableColumns"
                    :rows="semesterPagination.pagedItems"
                    :show-skeleton="false"
                  >
                    <template #tbody>
                      <tr
                        v-for="row in semesterPagination.pagedItems"
                        :key="semesterDataTableItemKey(row)"
                      >
                        <td class="cell-sem-num">{{ row.course ?? '—' }}</td>
                        <td class="cell-sem-num">{{ row.semester ?? '—' }}</td>
                        <td class="cell-upload-prog-wrap">
                          <div class="cell-upload-prog">
                            <div class="cell-upload-prog__label">
                              {{
                                uploadedSlashExpected(
                                  numSemUpload(row),
                                  row.expectedCount
                                )
                              }}
                            </div>
                            <div class="cell-upload-prog__track">
                              <div
                                :class="
                                  uploadProgFillClasses(
                                    numSemUpload(row),
                                    row.expectedCount
                                  )
                                "
                                :style="{
                                  width:
                                    progressPct(
                                      numSemUpload(row),
                                      row.expectedCount
                                    ) + '%',
                                }"
                              />
                            </div>
                          </div>
                        </td>
                      </tr>
                      <tr class="row-total">
                        <td colspan="2">Итого</td>
                        <td class="cell-upload-prog-wrap">
                          <div class="cell-upload-prog">
                            <div class="cell-upload-prog__label">
                              {{
                                uploadedSlashExpected(
                                  totalsSemesters.up,
                                  totalsSemesters.plan
                                )
                              }}
                            </div>
                            <div class="cell-upload-prog__track">
                              <div
                                :class="
                                  uploadProgFillClasses(
                                    totalsSemesters.up,
                                    totalsSemesters.plan
                                  )
                                "
                                :style="{
                                  width:
                                    progressPct(
                                      totalsSemesters.up,
                                      totalsSemesters.plan
                                    ) + '%',
                                }"
                              />
                            </div>
                          </div>
                        </td>
                      </tr>
                    </template>
                  </etu-data-table>
                </div>
                <analytics-table-pagination
                  v-model:page="semesterPagination.page"
                  :page-count="semesterPagination.pageCount"
                  :total="semesterPagination.total"
                  :range-label="semesterPagination.rangeLabel"
                />
              </template>
              <p
                v-else
                class="widget-empty"
              >
                Нет данных по семестрам за этот учебный год
              </p>
            </div>
          </v-card>
        </v-col>

        <v-col
          v-if="showDepartmentStats && teacherDetailBlocks.length"
          cols="12"
        >
          <v-card
            class="widget-card"
            elevation="0"
          >
            <div class="widget-head widget-head--simple">
              <div class="widget-head__left">
                <v-icon
                  size="22"
                  class="widget-head__ico"
                >
                  mdi-file-tree-outline
                </v-icon>
                <div>
                  <h3 class="widget-title">Детализация по преподавателям</h3>
                  <p class="widget-sub">
                    {{ teacherTreeWidgetHint }}
                  </p>
                </div>
              </div>
              <v-btn-toggle
                v-model="viewTeacherTree"
                class="view-toggle view-toggle--pill"
                data-analytics-view-toggle
                density="comfortable"
                variant="flat"
                mandatory
              >
                <v-btn
                  value="table"
                  size="small"
                >
                  <v-icon start>mdi-table-large</v-icon>
                  Таблица
                </v-btn>
                <v-btn
                  value="chart"
                  size="small"
                >
                  <v-icon start>mdi-chart-bar</v-icon>
                  График
                </v-btn>
              </v-btn-toggle>
            </div>
            <div class="widget-body widget-body--toggle-view">
              <template
                v-if="viewTeacherTree === 'chart' && teacherDetailBlocks.length"
              >
                <div class="widget-body__scroll">
                  <analytics-horizontal-bar-chart :rows="teacherTreeBarRows" />
                </div>
                <analytics-table-pagination
                  v-model:page="teacherTreePagination.page"
                  :page-count="teacherTreePagination.pageCount"
                  :total="teacherTreePagination.total"
                  :range-label="teacherTreePagination.rangeLabel"
                />
              </template>
              <template
                v-else-if="
                  teacherDetailBlocks.length && viewTeacherTree !== 'chart'
                "
              >
                <div class="widget-body__scroll">
                  <etu-data-table
                    :columns="teacherTreeTableColumns"
                    :rows="[]"
                    :show-skeleton="false"
                    scrollable
                    wrap-class="analytics-etu-dt"
                    table-class="tree-table tree-table--fixed analytics-table--detail"
                  >
                    <template #tbody>
                      <template
                        v-for="block in teacherTreePagination.pagedItems"
                        :key="block.teacher"
                      >
                        <tr
                          class="tree-row tree-row--parent"
                          @click="toggleTeacherExpand(block.teacher)"
                        >
                          <td class="tree-col-chev">
                            <v-icon size="20">
                              {{ teacherTreeChevronIcon(block.teacher) }}
                            </v-icon>
                          </td>
                          <td class="tree-col-name">
                            <strong>{{ block.teacher }}</strong>
                            <span class="tree-meta">
                              · {{ block.children.length }} дисц.
                            </span>
                          </td>
                          <td class="tree-col-groups tree-col-groups--parent" />
                          <td class="tree-col-upload cell-upload-prog-wrap">
                            <div
                              class="cell-upload-prog cell-upload-prog--tree"
                            >
                              <div class="cell-upload-prog__label">
                                {{
                                  uploadedSlashExpected(
                                    block.uploaded,
                                    block.plan
                                  )
                                }}
                              </div>
                              <div class="cell-upload-prog__track">
                                <div
                                  :class="
                                    uploadProgFillClasses(
                                      block.uploaded,
                                      block.plan
                                    )
                                  "
                                  :style="{
                                    width:
                                      progressPct(block.uploaded, block.plan) +
                                      '%',
                                  }"
                                />
                              </div>
                            </div>
                          </td>
                        </tr>
                        <tr
                          v-for="ch in visibleTeacherChildRows(block)"
                          :key="
                            block.teacher +
                            ch.disciplineName +
                            String(ch.planRowId)
                          "
                          class="tree-row tree-row--child"
                        >
                          <td class="tree-col-chev" />
                          <td class="tree-col-name tree-child-name">
                            {{ ch.disciplineName }}
                          </td>
                          <td class="tree-col-groups">
                            <span
                              v-for="g in ch.groupTags"
                              :key="g"
                              class="grp-tag grp-tag--plan"
                            >
                              {{ planRowGroupChipLabel(g) }}
                            </span>
                          </td>
                          <td class="tree-col-upload cell-upload-prog-wrap">
                            <div
                              class="cell-upload-prog cell-upload-prog--tree"
                            >
                              <div class="cell-upload-prog__label">
                                {{
                                  uploadedSlashExpected(ch.uploaded, ch.plan)
                                }}
                              </div>
                              <div class="cell-upload-prog__track">
                                <div
                                  :class="
                                    uploadProgFillClasses(ch.uploaded, ch.plan)
                                  "
                                  :style="{
                                    width:
                                      progressPct(ch.uploaded, ch.plan) + '%',
                                  }"
                                />
                              </div>
                            </div>
                          </td>
                        </tr>
                      </template>
                    </template>
                  </etu-data-table>
                </div>
                <analytics-table-pagination
                  v-model:page="teacherTreePagination.page"
                  :page-count="teacherTreePagination.pageCount"
                  :total="teacherTreePagination.total"
                  :range-label="teacherTreePagination.rangeLabel"
                />
              </template>
              <p
                v-else
                class="widget-empty"
              >
                Нет данных для графика
              </p>
            </div>
          </v-card>
        </v-col>
      </v-row>
    </template>
  </v-container>
</template>

<script setup lang="ts">
  import { ref, computed, onMounted, watch, toValue } from 'vue';
  import { useRouter } from 'vue-router';
  import { useUser } from '@/composables/useUser';
  import { useAcademicYear } from '@/composables/useAcademicYear';
  import type {
    TeachersSummaryItem,
    BySemesterRow,
    DisciplineWithTeacherRowDto,
    StudyPeriod,
  } from '@/api/info';
  import { useAnalytics } from './composables/useAnalytics';
  import type {
    ScopeMode,
    AnalyticsDisciplineTableRow,
    AnalyticsViewMode,
    VBarItem,
  } from './model';
  import {
    semesterTableColumns,
    groupsTableColumns,
    teachersTableColumns,
    disciplinesSimpleTableColumns,
    disciplinesPlanTableColumns,
    teacherTreeTableColumns,
  } from './components/constants/columns';
  import {
    filterByStudyPeriod,
    aggregateDisciplinesTableFromPlan,
    aggregateTeachersSummaryFromPlan,
    buildPersonalDisciplinesTableFromCards,
    planRowsToDisciplineWidgetRows,
    disciplineTableItemsToWidgetRows,
  } from './utils/analyticsScope';
  import AnalyticsStudyPeriodSwitcher from './components/AnalyticsStudyPeriodSwitcher.vue';
  import AnalyticsVBarChart from './components/AnalyticsVBarChart.vue';
  import AnalyticsHorizontalBarChart from './components/AnalyticsHorizontalBarChart.vue';
  import AnalyticsTablePagination from './components/AnalyticsTablePagination.vue';
  import { useTablePagination } from './composables/useTablePagination';

  const router = useRouter();
  const { user, canSeeAll } = useUser();
  const { academicYear } = useAcademicYear();

  const academicYearForDisplay = computed(() =>
    academicYear.value.replace(/\//g, '-').replace(/-/g, '–').trim()
  );

  const scopeMode = ref<ScopeMode>('personal');
  const viewDisciplines = ref<AnalyticsViewMode>('table');
  const viewGroups = ref<AnalyticsViewMode>('table');
  const viewTeachers = ref<AnalyticsViewMode>('table');
  const viewSemesters = ref<AnalyticsViewMode>('table');
  const viewTeacherTree = ref<AnalyticsViewMode>('table');

  const expandedTeachers = ref<Set<string>>(new Set());

  const scopeHint = computed(() =>
    scopeMode.value === 'department'
      ? 'Сводка по кафедре: все преподаватели и группы.'
      : 'Только ваши дисциплины и группы.'
  );

  const studyPeriod = ref<StudyPeriod>('academic_year');

  function studyPeriodShortLabel(p: StudyPeriod): string {
    switch (p) {
      case 'autumn_semester':
        return 'осенний семестр';
      case 'spring_semester':
        return 'весенний семестр';
      default:
        return 'весь учебный год';
    }
  }

  const headerSubtitle = computed(
    () =>
      `План и факт: ${studyPeriodShortLabel(studyPeriod.value)}, год ${academicYearForDisplay.value}.`
  );

  const disciplinesWidgetHint = computed(() => {
    if (studyPeriod.value === 'academic_year') {
      return 'Сколько работ загружено из плана за учебный год.';
    }
    return `Сколько работ загружено из плана за ${studyPeriodShortLabel(studyPeriod.value)}.`;
  });

  const teacherTreeWidgetHint = computed(() => {
    if (studyPeriod.value === 'academic_year') {
      return 'План и факт по преподавателю за выбранный учебный год.';
    }
    return `План и факт по преподавателю за ${studyPeriodShortLabel(studyPeriod.value)}.`;
  });

  const {
    loading,
    error,
    loadAll,
    kpi,
    disciplinesTable,
    bySemester,
    teachersSummary,
    disciplinesWithTeachers,
    teacherDisciplineCards,
    showDepartmentStats,
  } = useAnalytics({
    academicYear,
    scopeMode,
    studyPeriod,
  });

  const disciplinesWithTeachersFiltered = computed(() =>
    filterByStudyPeriod(disciplinesWithTeachers.value, studyPeriod.value)
  );

  const disciplinesPlanDetailRows = computed(
    (): AnalyticsDisciplineTableRow[] => {
      if (
        !showDepartmentStats.value ||
        disciplinesWithTeachers.value.length === 0
      ) {
        return [];
      }
      return planRowsToDisciplineWidgetRows(
        disciplinesWithTeachersFiltered.value
      );
    }
  );

  const disciplinesUsePlanDetailTable = computed(
    () => disciplinesPlanDetailRows.value.length > 0
  );

  const disciplinesSimpleTableForScope = computed(() => {
    const period = studyPeriod.value;
    if (showDepartmentStats.value && disciplinesWithTeachers.value.length > 0) {
      if (disciplinesUsePlanDetailTable.value) return [];
      return aggregateDisciplinesTableFromPlan(
        disciplinesWithTeachersFiltered.value
      );
    }
    if (!showDepartmentStats.value && period !== 'academic_year') {
      return buildPersonalDisciplinesTableFromCards(
        teacherDisciplineCards.value,
        period,
        disciplinesTable.value,
        filterByStudyPeriod(bySemester.value, period)
      );
    }
    return disciplinesTable.value;
  });

  const disciplinesTableForScope = computed(
    (): AnalyticsDisciplineTableRow[] => {
      if (disciplinesUsePlanDetailTable.value) {
        return disciplinesPlanDetailRows.value;
      }
      return disciplineTableItemsToWidgetRows(
        disciplinesSimpleTableForScope.value
      );
    }
  );

  const bySemesterForScope = computed(() =>
    filterByStudyPeriod(bySemester.value, studyPeriod.value)
  );

  const teachersSummaryForScope = computed((): TeachersSummaryItem[] => {
    if (showDepartmentStats.value && disciplinesWithTeachers.value.length > 0) {
      return aggregateTeachersSummaryFromPlan(
        filterByStudyPeriod(disciplinesWithTeachers.value, studyPeriod.value)
      );
    }
    return teachersSummary.value;
  });

  const displayKpi = computed(() => {
    const rows = disciplinesTableForScope.value;
    const period = studyPeriod.value;
    if (rows.length > 0) {
      let expectedCount = 0;
      let totalWorks = 0;
      for (const r of rows) {
        expectedCount += Number(r.expectedCount) || 0;
        totalWorks += Number(r.uploadedCount) || 0;
      }
      return {
        expectedCount,
        totalWorks,
        totalTeachers: kpi.value?.totalTeachers,
      };
    }
    if (!showDepartmentStats.value && period !== 'academic_year') {
      return {
        expectedCount: 0,
        totalWorks: 0,
        totalTeachers: undefined,
      };
    }
    return kpi.value;
  });

  const disciplinesPagination = useTablePagination(disciplinesTableForScope);
  const semesterPagination = useTablePagination(bySemesterForScope);
  const teachersPagination = useTablePagination(teachersSummaryForScope);

  const uploadPlanPct = computed(() => {
    if (!displayKpi.value || displayKpi.value.expectedCount <= 0) return 0;
    return Math.min(
      100,
      Math.round(
        (displayKpi.value.totalWorks / displayKpi.value.expectedCount) * 100
      )
    );
  });

  function clip(s: string, max = 22) {
    const t = (s ?? '').trim();
    if (t.length <= max) return t;
    return `${t.slice(0, max - 1)}…`;
  }

  function splitGroups(raw: unknown): string[] {
    if (raw == null) return [];
    if (Array.isArray(raw)) {
      return raw.flatMap((item) => splitGroups(item));
    }
    const s = String(raw).trim();
    if (!s) return [];
    return s
      .split(/[,;]/)
      .map((x) => x.trim())
      .filter(Boolean);
  }

  function formatGroupsForDisplay(raw: unknown): string[] {
    if (raw == null) return [];
    if (Array.isArray(raw)) {
      return raw.flatMap((item) => formatGroupsForDisplay(item));
    }
    if (typeof raw === 'number') return [String(raw)];
    const s = String(raw).trim();
    if (!s) return [];
    if (s.startsWith('[')) {
      try {
        const parsed = JSON.parse(s) as unknown;
        if (Array.isArray(parsed)) {
          return parsed
            .map((x) => (x == null ? '' : String(x).trim()))
            .filter(Boolean);
        }
      } catch {
        /* как обычная строка */
      }
    }
    return splitGroups(s);
  }

  function normalizeGroupDigits(raw: string): string {
    const t = raw.trim();
    if (!/^\d+$/.test(t)) return t;
    return t.padStart(4, '0');
  }

  function planRowGroupChipLabel(g: string): string {
    const t = g.trim();
    if (!/^\d+$/.test(t)) return t;
    return `Гр. ${normalizeGroupDigits(t)}`;
  }

  function aggregateGroupsFromDetail(
    rows: DisciplineWithTeacherRowDto[]
  ): VBarItem[] {
    const map = new Map<string, { plan: number; uploaded: number }>();
    for (const row of rows) {
      const gList = formatGroupsForDisplay(row.groups);
      if (gList.length === 0) continue;
      const p = row.expectedCount / gList.length;
      const u = row.uploadedCount / gList.length;
      for (const g of gList) {
        const key = /^\d+$/.test(g.trim()) ? normalizeGroupDigits(g) : g.trim();
        const cur = map.get(key) ?? { plan: 0, uploaded: 0 };
        cur.plan += p;
        cur.uploaded += u;
        map.set(key, cur);
      }
    }
    return [...map.entries()]
      .map(([raw, v]) => {
        const plan = Math.round(v.plan);
        const uploaded = Math.round(v.uploaded);
        const label = /^\d+$/.test(raw)
          ? `Гр. ${normalizeGroupDigits(raw)}`
          : raw;
        return {
          label,
          shortLabel: clip(label, 8),
          plan,
          uploaded,
        };
      })
      .sort((a, b) => b.plan - a.plan);
  }

  const groupRows = computed(() =>
    aggregateGroupsFromDetail(
      filterByStudyPeriod(disciplinesWithTeachers.value, studyPeriod.value)
    )
  );

  const groupsPagination = useTablePagination(groupRows, 7);

  const groupHorizontalBarRows = computed(() =>
    toValue(groupsPagination.pagedItems).map((row) => ({
      key: row.label,
      title: row.label,
      plan: row.plan,
      uploaded: row.uploaded,
    }))
  );

  function disciplineBarLabel(row: AnalyticsDisciplineTableRow): string {
    const t = row.teacherFio?.trim() || row.teacherLastName?.trim() || '';
    if (!t || t === '—') return row.disciplineName;
    return `${row.disciplineName} · ${t}`;
  }

  const disciplineBars = computed((): VBarItem[] =>
    toValue(disciplinesPagination.pagedItems).map((r) => {
      const label = disciplineBarLabel(r);
      return {
        label,
        shortLabel: clip(label, 22),
        plan: r.expectedCount,
        uploaded: r.uploadedCount,
      };
    })
  );

  const semesterBars = computed((): VBarItem[] =>
    toValue(semesterPagination.pagedItems).map((r) => {
      const c = r.course ?? '—';
      const s = r.semester ?? '—';
      const label = `К${c}, с${s}`;
      return {
        label,
        shortLabel: label,
        plan: r.expectedCount,
        uploaded: numSemUpload(r),
      };
    })
  );

  const teacherDetailBlocks = computed(() => {
    const map = new Map<
      string,
      {
        plan: number;
        uploaded: number;
        children: Array<{
          disciplineName: string;
          planRowId?: number;
          plan: number;
          uploaded: number;
          groupTags: string[];
        }>;
      }
    >();
    for (const row of filterByStudyPeriod(
      disciplinesWithTeachers.value,
      studyPeriod.value
    )) {
      const t = row.teacherFio?.trim() || row.teacherLastName?.trim() || '';
      if (!t) continue;
      if (!map.has(t)) {
        map.set(t, { plan: 0, uploaded: 0, children: [] });
      }
      const b = map.get(t)!;
      b.plan += row.expectedCount;
      b.uploaded += row.uploadedCount;
      b.children.push({
        disciplineName: row.disciplineName,
        planRowId: row.planRowId,
        plan: row.expectedCount,
        uploaded: row.uploadedCount,
        groupTags: formatGroupsForDisplay(row.groups),
      });
    }
    return [...map.entries()]
      .map(([teacher, v]) => ({
        teacher,
        plan: v.plan,
        uploaded: v.uploaded,
        pct: v.plan
          ? Math.min(100, Math.round((v.uploaded / v.plan) * 100))
          : 0,
        children: v.children.sort((a, b) =>
          a.disciplineName.localeCompare(b.disciplineName)
        ),
      }))
      .sort((a, b) => b.plan - a.plan);
  });

  const teacherTreePagination = useTablePagination(teacherDetailBlocks);

  function semesterDataTableItemKey(row: BySemesterRow) {
    return `sem-${String(row.course ?? '')}-${String(row.semester ?? '')}`;
  }

  const teacherChartBarRows = computed(() =>
    toValue(teachersPagination.pagedItems).map((row) => ({
      key: teacherKey(row),
      title: teacherName(row),
      plan: num(row.expectedCount),
      uploaded: teacherUploadedNum(row),
    }))
  );

  const teacherTreeBarRows = computed(() =>
    toValue(teacherTreePagination.pagedItems).map((block) => ({
      key: block.teacher,
      title: block.teacher,
      plan: block.plan,
      uploaded: block.uploaded,
    }))
  );

  function toggleTeacherExpand(teacher: string) {
    const next = new Set(expandedTeachers.value);
    if (next.has(teacher)) next.delete(teacher);
    else next.add(teacher);
    expandedTeachers.value = next;
  }

  function totalsFrom(rows: Array<{ plan: number; up: number }>): {
    plan: number;
    up: number;
    pct: number;
  } {
    let plan = 0;
    let up = 0;
    for (const r of rows) {
      plan += r.plan;
      up += r.up;
    }
    const pct = plan ? Math.min(100, Math.round((up / plan) * 100)) : 0;
    return { plan, up, pct };
  }

  const totalsDisciplines = computed(() =>
    totalsFrom(
      disciplinesTableForScope.value.map((r) => ({
        plan: r.expectedCount,
        up: r.uploadedCount,
      }))
    )
  );

  const totalsGroups = computed(() =>
    totalsFrom(groupRows.value.map((r) => ({ plan: r.plan, up: r.uploaded })))
  );

  const totalsTeachers = computed(() =>
    totalsFrom(
      teachersSummaryForScope.value.map((r) => ({
        plan: num(r.expectedCount),
        up: teacherUploadedNum(r),
      }))
    )
  );

  const totalsSemesters = computed(() =>
    totalsFrom(
      bySemesterForScope.value.map((r) => ({
        plan: r.expectedCount,
        up: numSemUpload(r),
      }))
    )
  );

  function progressPct(uploaded: number, plan: number) {
    if (!plan || plan <= 0) return 0;
    return Math.min(100, Math.round((uploaded / plan) * 100));
  }

  function progressClass(uploaded: number, plan: number) {
    const p = progressPct(uploaded, plan);
    if (p >= 80) return 'prog__fill--high';
    if (p >= 45) return 'prog__fill--mid';
    return 'prog__fill--low';
  }

  function uploadProgFillClasses(uploaded: number, plan: number) {
    return [
      'prog__fill',
      'cell-upload-prog__fill',
      progressClass(uploaded, plan),
    ];
  }

  function teacherTreeChevronIcon(teacherKey: string) {
    return expandedTeachers.value.has(teacherKey)
      ? 'mdi-chevron-down'
      : 'mdi-chevron-right';
  }

  function visibleTeacherChildRows<
    T extends { teacher: string; children: readonly unknown[] },
  >(block: T) {
    return expandedTeachers.value.has(block.teacher) ? [...block.children] : [];
  }

  function uploadedSlashExpected(
    uploaded: number | null | undefined,
    expected: number | null | undefined
  ) {
    const e =
      typeof expected === 'number' && !Number.isNaN(expected) ? expected : NaN;
    if (!Number.isFinite(e) || e < 0) return '—';
    const u =
      typeof uploaded === 'number' && !Number.isNaN(uploaded) ? uploaded : null;
    if (u === null) return `— / ${e}`;
    return `${u} / ${e}`;
  }

  function num(v: number | undefined | null) {
    return typeof v === 'number' && !Number.isNaN(v) ? v : 0;
  }

  function numSemUpload(row: BySemesterRow) {
    return num(row.uploadedCount ?? row.totalWorks);
  }

  function teacherName(row: TeachersSummaryItem) {
    return row.teacherFio ?? row.teacherLastName ?? '—';
  }

  function teacherKey(row: TeachersSummaryItem) {
    return `${teacherName(row)}-${row.disciplinesCount ?? ''}-${row.expectedCount}`;
  }

  function teacherUploadedNum(row: TeachersSummaryItem) {
    const v = row.uploadedCount ?? row.totalWorks;
    return typeof v === 'number' ? v : 0;
  }

  function detailRowKey(row: AnalyticsDisciplineTableRow) {
    return [
      row.planRowId,
      row.disciplineName,
      row.teacherFio,
      row.course,
      row.semester,
    ].join('-');
  }

  function initials(name: string) {
    if (!name) return '—';
    const parts = name.trim().split(/\s+/);
    const a = parts[0];
    const b = parts[1];
    if (parts.length >= 2 && a && b) {
      const c0 = a[0];
      const c1 = b[0];
      if (c0 && c1) return (c0 + c1).toUpperCase();
    }
    return name.slice(0, 2).toUpperCase() || '—';
  }

  const avatarColors = ['#6366f1', '#8b5cf6', '#ec4899', '#0ea5e9'];
  function avatarColor(name: string) {
    let h = 0;
    for (let i = 0; i < (name ?? '').length; i++)
      h += (name ?? '').charCodeAt(i);
    return avatarColors[Math.abs(h) % avatarColors.length];
  }

  onMounted(async () => {
    if (user.value?.lastName || canSeeAll.value) {
      await loadAll();
    } else {
      router.push('/auth');
    }
  });

  watch(showDepartmentStats, (dept) => {
    if (dept) {
      expandedTeachers.value = new Set(
        teacherDetailBlocks.value.slice(0, 5).map((b) => b.teacher)
      );
    } else {
      expandedTeachers.value = new Set();
    }
  });

  watch(teacherDetailBlocks, (blocks) => {
    if (!showDepartmentStats.value || !blocks.length) return;
    if (expandedTeachers.value.size === 0) {
      expandedTeachers.value = new Set(
        blocks.slice(0, 5).map((b) => b.teacher)
      );
    }
  });
</script>

<style scoped>
  .page {
    background: #f5f6f8;
    padding: 28px 30px 50px;
    min-height: 100%;
  }

  .scope-switcher-wrap {
    margin: 4px 0 22px;
    padding: 0 4px;
  }
  .scope-switcher {
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    gap: 8px;
  }
  .scope-tab {
    display: inline-flex;
    align-items: center;
    gap: 10px;
    padding: 10px 22px;
    border-radius: 999px;
    border: none;
    background: #f1f5f9;
    color: #64748b;
    font-size: 15px;
    font-weight: 500;
    cursor: pointer;
    transition:
      background 0.2s,
      color 0.2s,
      box-shadow 0.2s;
    box-shadow: none;
  }
  .scope-tab:hover:not(.scope-tab--active) {
    color: #475569;
    background: #e2e8f0;
  }
  .scope-tab--active {
    background: #1e293b;
    color: #fff;
    box-shadow:
      0 2px 10px rgba(30, 41, 59, 0.35),
      0 1px 3px rgba(15, 23, 42, 0.2);
  }
  .scope-switcher[data-analytics-scope-tabs]
    .scope-tab:not(.scope-tab--active)
    :deep(.scope-tab-icon) {
    flex-shrink: 0;
    color: #94a3b8;
    transition: color 0.2s;
  }
  .scope-switcher[data-analytics-scope-tabs]
    .scope-tab--active
    :deep(.scope-tab-icon) {
    flex-shrink: 0;
    color: #fff;
    transition: color 0.2s;
  }
  .scope-switcher[data-analytics-scope-tabs]
    .scope-tab:hover:not(.scope-tab--active)
    :deep(.scope-tab-icon) {
    flex-shrink: 0;
    color: #64748b;
    transition: color 0.2s;
  }
  .scope-hint {
    margin: 10px 0 0;
    font-size: 13px;
    color: #6b7280;
    line-height: 1.45;
    max-width: 520px;
  }

  .kpi-hero {
    display: flex;
    align-items: flex-start;
    gap: 20px;
    padding: 22px 24px;
    border-radius: 16px;
    border: 1px solid #e5e7eb;
    background: #fff;
    box-shadow: 0 1px 3px rgba(0, 0, 0, 0.06);
    margin-bottom: 22px;
  }
  .kpi-hero__icon {
    width: 56px;
    height: 56px;
    border-radius: 14px;
    background: #eff6ff;
    display: flex;
    align-items: center;
    justify-content: center;
    flex-shrink: 0;
  }
  .kpi-hero__title {
    font-size: 14px;
    color: #6b7280;
    margin-bottom: 4px;
  }
  .kpi-hero__value {
    font-size: 26px;
    font-weight: 700;
    color: #111827;
    margin-bottom: 12px;
  }
  .kpi-hero__track {
    height: 12px;
    background: #f3f4f6;
    border-radius: 6px;
    overflow: hidden;
    max-width: 420px;
  }
  .kpi-hero__fill {
    height: 100%;
    border-radius: 6px;
    background: linear-gradient(90deg, #818cf8, #6366f1);
    transition: width 0.4s ease;
  }
  .kpi-hero__foot {
    margin-top: 8px;
    font-size: 13px;
    color: #6b7280;
  }

  .widgets-row {
    margin-top: 0;
  }
  .widgets-row :deep(.v-col) {
    display: flex;
    flex-direction: column;
    align-self: stretch;
  }

  .widgets-row :deep(.v-col > .widget-card) {
    flex: 1 1 auto;
    width: 100%;
    min-height: 100%;
  }

  .widget-card {
    border-radius: 16px;
    border: 1px solid #e5e7eb;
    background: #fff;
    box-shadow: 0 1px 3px rgba(0, 0, 0, 0.06);
    padding: 20px 22px 22px;
    flex: 1 1 auto;
    align-self: stretch;
    display: flex;
    flex-direction: column;
    min-width: 0;
    width: 100%;
    box-sizing: border-box;
  }
  .widget-head {
    display: flex;
    align-items: flex-start;
    justify-content: space-between;
    gap: 16px;
    flex-wrap: wrap;
    flex-shrink: 0;
    margin-bottom: 16px;
  }
  .widget-head--simple {
    align-items: center;
  }
  .widget-head__left {
    display: flex;
    gap: 12px;
    align-items: flex-start;
    min-width: 0;
  }
  .widget-head__ico {
    color: #6366f1;
    margin-top: 2px;
  }
  .widget-title {
    margin: 0;
    font-size: 17px;
    font-weight: 600;
    color: #111827;
  }
  .widget-sub {
    margin: 4px 0 0;
    font-size: 13px;
    color: #6b7280;
  }
  .view-toggle {
    flex-shrink: 0;
  }
  .view-toggle:not(.view-toggle--pill) :deep(.v-btn) {
    text-transform: none;
    letter-spacing: normal;
    font-weight: 500;
  }

  .v-btn-toggle.view-toggle--pill[data-analytics-view-toggle] {
    display: inline-flex;
    flex-wrap: nowrap;
    align-items: stretch;
    gap: 0;
    max-width: 100%;
    height: auto;
    min-height: 0;
    padding: 3px;
    background: #f0f2f5;
    border: none;
    border-radius: 999px;
    box-shadow: none;
    overflow: visible;
    overflow-x: visible;
  }
  .v-btn-toggle.view-toggle--pill[data-analytics-view-toggle] > :deep(.v-btn) {
    flex: 1 1 0;
    min-width: 0;
    border-radius: 999px;
    min-height: 34px;
    padding-inline: 14px;
    border: none;
    box-shadow: none;
    letter-spacing: 0.04em;
    text-transform: uppercase;
    font-weight: 500;
    font-size: 11px;
    background: transparent;
    color: #595959;
  }
  .v-btn-toggle.view-toggle--pill[data-analytics-view-toggle]
    > :deep(.v-btn .v-icon) {
    color: currentColor;
    opacity: 0.85;
    font-size: 18px;
  }
  .v-btn-toggle.view-toggle--pill[data-analytics-view-toggle]
    > :deep(.v-btn:hover:not(.v-btn--active):not(.v-btn--selected)) {
    background: rgba(0, 0, 0, 0.04);
    color: #434343;
  }
  .v-btn-toggle.view-toggle--pill[data-analytics-view-toggle]
    > :deep(.v-btn.v-btn--active),
  .v-btn-toggle.view-toggle--pill[data-analytics-view-toggle]
    > :deep(.v-btn.v-btn--selected) {
    background: #fff;
    color: #1890ff;
    box-shadow:
      0 1px 4px rgba(15, 23, 42, 0.1),
      0 1px 2px rgba(15, 23, 42, 0.06);
  }
  .v-btn-toggle.view-toggle--pill[data-analytics-view-toggle]
    > :deep(.v-btn.v-btn--active .v-icon),
  .v-btn-toggle.view-toggle--pill[data-analytics-view-toggle]
    > :deep(.v-btn.v-btn--selected .v-icon) {
    color: #1890ff;
    opacity: 1;
  }
  .v-btn-toggle.view-toggle--pill[data-analytics-view-toggle]
    > :deep(.v-btn.v-btn--active .v-btn__overlay),
  .v-btn-toggle.view-toggle--pill[data-analytics-view-toggle]
    > :deep(.v-btn.v-btn--selected .v-btn__overlay) {
    opacity: 0;
  }
  .widget-body {
    flex: 1 1 auto;
    display: flex;
    flex-direction: column;
    width: 100%;
  }
  .widget-body--toggle-view {
    display: flex;
    flex-direction: column;
  }
  .widget-body--paired-col {
    flex: 1 1 auto;
    min-height: 0;
  }
  .widget-body--paired-col > .analytics-pager {
    margin-top: auto;
    flex-shrink: 0;
  }
  .widget-body--paired-col > .widget-empty {
    margin-top: auto;
  }

  .widget-body__scroll {
    box-sizing: border-box;
    overflow-y: visible;
    overflow-x: auto;
    flex-shrink: 0;
    width: 100%;
  }
  .widget-body--paired-col > .widget-body__scroll {
    flex: 1 1 auto;
    min-height: 0;
    flex-shrink: 1;
  }
  .widget-body :deep(.etu-dt-wrap) {
    flex-shrink: 0;
  }
  .widget-body > .analytics-pager {
    margin-top: auto;
    flex-shrink: 0;
  }
  .widget-body--toggle-view > .analytics-pager {
    margin-top: 12px;
  }
  .widget-empty {
    margin: 8px 0 0;
    color: #9ca3af;
    font-size: 14px;
  }

  .analytics-etu-dt :deep(.analytics-table) {
    font-size: 14px;
  }
  .analytics-etu-dt--semesters :deep(.analytics-table--semesters) {
    table-layout: fixed;
    width: 100%;
  }
  .analytics-etu-dt--semesters :deep(.cell-sem-num) {
    text-align: center;
    white-space: nowrap;
    color: #4b5563;
    font-variant-numeric: tabular-nums;
  }
  .analytics-etu-dt--semesters :deep(.cell-upload-prog-wrap) {
    width: 100%;
    text-align: left;
    vertical-align: middle;
  }
  .analytics-etu-dt--semesters :deep(.cell-upload-prog) {
    display: block;
    width: 100%;
    max-width: none;
    min-width: 0;
    box-sizing: border-box;
    vertical-align: middle;
  }
  .analytics-etu-dt--semesters :deep(.cell-upload-prog__label) {
    text-align: left;
    margin-bottom: 6px;
  }
  .analytics-etu-dt--semesters :deep(.cell-upload-prog__track) {
    height: 8px;
    width: 100%;
  }
  .analytics-table--dense {
    font-size: 12px;
    white-space: nowrap;
  }

  .analytics-etu-dt :deep(.analytics-table:not(.analytics-table--detail)) th {
    font-weight: 600;
    color: #374151;
    background: #f9fafb;
  }

  .analytics-etu-dt
    :deep(.etu-dt-table.analytics-table tbody tr:not(.row-total)) {
    min-height: 64px;
  }
  .analytics-etu-dt
    :deep(.etu-dt-table.analytics-table tbody tr:not(.row-total) td) {
    vertical-align: middle;
  }
  .cell-wrap {
    white-space: normal;
    max-width: 220px;
  }
  .cell-num {
    font-weight: 600;
  }
  .cell-num--up {
    color: #2563eb;
  }
  .cell-uploaded-of {
    font-variant-numeric: tabular-nums;
    white-space: nowrap;
  }
  .cell-upload-prog-wrap {
    text-align: right;
    vertical-align: middle;
  }
  .cell-upload-prog {
    display: inline-block;
    min-width: 132px;
    max-width: 240px;
    width: 100%;
    vertical-align: middle;
  }
  .cell-upload-prog--tree {
    min-width: 108px;
    max-width: 168px;
  }
  .cell-upload-prog__label {
    font-size: 12px;
    font-weight: 500;
    color: #4b5563;
    font-variant-numeric: tabular-nums;
    white-space: nowrap;
    text-align: right;
    line-height: 1.25;
    margin-bottom: 5px;
  }
  .cell-upload-prog__track {
    height: 6px;
    background: #e5e7eb;
    border-radius: 999px;
    overflow: hidden;
  }
  .row-total {
    font-weight: 600;
    background: #f9fafb;
  }
  .row-total td {
    border-top: 2px solid #e5e7eb;
  }

  .cell-upload-prog__track .prog__fill {
    min-width: 0;
    border-radius: 999px;
  }
  .prog__fill {
    height: 100%;
    transition: width 0.3s ease;
  }
  .prog__fill--high {
    background: #10b981;
  }
  .prog__fill--mid {
    background: #6366f1;
  }
  .prog__fill--low {
    background: #f59e0b;
  }

  .teacher-cell {
    display: flex;
    align-items: center;
    gap: 12px;
  }
  .teacher-avatar {
    width: 36px;
    height: 36px;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    color: white;
    font-size: 12px;
    font-weight: 600;
    flex-shrink: 0;
  }

  .table-scroll {
    overflow-x: auto;
    margin: 0 -4px;
  }
  .table-scroll--plan-detail {
    margin: 0;
    border-radius: 14px;
    border: 1px solid #e2e8f0;
    background: #fff;
    box-shadow: 0 1px 2px rgba(15, 23, 42, 0.04);
  }

  .analytics-etu-dt
    :deep(table.etu-dt-table.analytics-table--detail thead th) {
    background: linear-gradient(180deg, #f8fafc 0%, #f1f5f9 100%);
    color: #64748b;
    font-size: 11px;
    font-weight: 700;
    text-transform: uppercase;
    letter-spacing: 0.055em;
    padding: 13px 16px;
    border-bottom: 1px solid #e2e8f0;
    white-space: nowrap;
  }
  .analytics-etu-dt :deep(.analytics-table--detail) .cell-th-num {
    text-align: center;
    width: 1%;
  }
  .analytics-etu-dt :deep(.analytics-table--detail) tbody td {
    padding: 14px 16px;
    vertical-align: top;
    color: #334155;
    border-bottom: 1px solid #f1f5f9;
    transition: background 0.12s ease;
  }
  .analytics-etu-dt :deep(.analytics-table--detail) tbody tr:hover td {
    background: #f8fafc;
  }
  .analytics-etu-dt :deep(.analytics-table--detail) tbody tr:last-child td {
    border-bottom: none;
  }

  .analytics-etu-dt :deep(.analytics-table--plan-detail) {
    font-size: 14px;
  }
  .analytics-etu-dt :deep(.analytics-table--plan-detail) .cell-discipline {
    font-weight: 600;
    color: #0f172a;
    max-width: min(320px, 36vw);
    line-height: 1.5;
  }
  .analytics-etu-dt :deep(.analytics-table--plan-detail) .cell-person {
    color: #475569;
    max-width: 220px;
    line-height: 1.45;
  }
  .analytics-etu-dt :deep(.analytics-table--plan-detail) .cell-muted {
    color: #64748b;
    font-variant-numeric: tabular-nums;
  }
  .analytics-etu-dt :deep(.analytics-table--plan-detail) .cell-groups {
    min-width: 120px;
    max-width: 360px;
    line-height: 1.6;
  }
  .analytics-etu-dt :deep(.analytics-table--plan-detail) .cell-empty-dash {
    color: #94a3b8;
  }
  .grp-tag--plan {
    display: inline-block;
    font-size: 11px;
    font-weight: 600;
    padding: 4px 11px;
    margin: 2px 6px 2px 0;
    border-radius: 999px;
    background: #eef2ff;
    color: #4338ca;
    border: 1px solid #e0e7ff;
  }

  .analytics-etu-dt :deep(table.tree-table--fixed) {
    table-layout: fixed;
    width: 100%;
  }
  .analytics-etu-dt :deep(th.tree-col-chev),
  .analytics-etu-dt :deep(td.tree-col-chev) {
    width: 44px;
    max-width: 44px;
    padding-left: 10px;
    padding-right: 6px;
    text-align: center;
    vertical-align: middle;
  }
  .analytics-etu-dt :deep(th.tree-col-name),
  .analytics-etu-dt :deep(td.tree-col-name) {
    min-width: 0;
    text-align: left;
    vertical-align: middle;
    word-wrap: break-word;
    overflow-wrap: break-word;
  }
  .analytics-etu-dt :deep(th.tree-col-groups),
  .analytics-etu-dt :deep(td.tree-col-groups) {
    width: 26%;
    min-width: 148px;
    vertical-align: middle;
    text-align: left;
  }
  .analytics-etu-dt :deep(td.tree-col-groups--parent) {
    text-align: center;
    color: #94a3b8;
    font-weight: 500;
  }
  .analytics-etu-dt :deep(th.tree-col-upload),
  .analytics-etu-dt :deep(td.tree-col-upload) {
    width: 172px;
    min-width: 172px;
    text-align: right;
    vertical-align: middle;
  }

  .analytics-etu-dt
    :deep(.tree-table.analytics-table--detail)
    .tree-row--parent {
    cursor: pointer;
    background: #f8fafc;
  }
  .analytics-etu-dt
    :deep(
      table.tree-table.analytics-table--detail
        tbody
        tr.tree-row--parent:hover
        > td
    ) {
    background: #f1f5f9;
  }
  .analytics-etu-dt
    :deep(.tree-table.analytics-table--detail)
    .tree-row--child
    td {
    background: #fff;
  }
  .analytics-etu-dt
    :deep(.tree-table.analytics-table--detail)
    .tree-row--parent
    td {
    font-weight: 500;
    color: #0f172a;
    border-bottom: 1px solid #e2e8f0;
  }
  .analytics-etu-dt
    :deep(
      table.tree-table.analytics-table--detail
        td.tree-col-name.tree-child-name
    ) {
    font-size: 13px;
    color: #4b5563;
    font-weight: 400;
    padding-left: 6px;
  }
  .tree-meta {
    font-size: 12px;
    color: #9ca3af;
    font-weight: 400;
  }
  .grp-tag {
    display: inline-block;
    font-size: 11px;
    padding: 2px 8px;
    margin: 2px 4px 2px 0;
    border-radius: 6px;
    background: #f3f4f6;
    color: #6b7280;
  }
</style>
