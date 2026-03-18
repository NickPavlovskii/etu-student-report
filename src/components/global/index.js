import EtuStatCard from './EtuStatCard.vue'
import EtuButton from './EtuButton.vue'
import EtuTeaLoader from './EtuTeaLoader.vue'
import EtuLoadingPage from './EtuLoadingPage.vue'
import EtuPageHeader from './EtuPageHeader.vue'
import EtuInfoCard from './EtuInfoCard.vue'
import DisciplineCard from './DisciplineCard.vue'

const components = [
  { name: 'etu-stat-card', component: EtuStatCard },
  { name: 'etu-button', component: EtuButton },
  { name: 'etu-tea-loader', component: EtuTeaLoader },
  { name: 'etu-loading-page', component: EtuLoadingPage },
  { name: 'etu-page-header', component: EtuPageHeader },
  { name: 'etu-info-card', component: EtuInfoCard },
  { name: 'etu-discipline-card', component: DisciplineCard },
]

export default {
  install(app) {
    components.forEach(({ name, component }) => {
      app.component(name, component)
    })
  },
}
