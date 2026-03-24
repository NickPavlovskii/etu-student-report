import EtuStatCard from './EtuStatCard.vue'
import EtuButton from './EtuButton.vue'
import EtuTeaLoader from './EtuTeaLoader.vue'
import EtuSearchableSelect from './EtuSearchableSelect.vue'
import EtuLoadingPage from './EtuLoadingPage.vue'
import EtuPageHeader from './EtuPageHeader.vue'
import EtuInfoCard from './EtuInfoCard.vue'
import EtuLabelChip from './EtuLabelChip.vue'
import EtuDataTable from './etu-data-table/EtuDataTable.vue'
import EtuPillSearchSelect from './EtuPillSearchSelect.vue'

const components = [
  { name: 'etu-stat-card', component: EtuStatCard },
  { name: 'etu-button', component: EtuButton },
  { name: 'etu-tea-loader', component: EtuTeaLoader },
  { name: 'etu-searchable-select', component: EtuSearchableSelect },
  { name: 'etu-loading-page', component: EtuLoadingPage },
  { name: 'etu-page-header', component: EtuPageHeader },
  { name: 'etu-info-card', component: EtuInfoCard },
  { name: 'etu-label-chip', component: EtuLabelChip },
  { name: 'etu-data-table', component: EtuDataTable },
  { name: 'etu-pill-search-select', component: EtuPillSearchSelect },
]

export default {
  install(app) {
    components.forEach(({ name, component }) => {
      app.component(name, component)
    })
  },
}
