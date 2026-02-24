import EtuStatCard from './EtuStatCard.vue'
import EtuButton from './EtuButton.vue'
import EtuTeaLoader from './EtuTeaLoader.vue'
import EtuLoadingPage from './EtuLoadingPage.vue'

const components = [
  { name: 'etu-stat-card', component: EtuStatCard },
  { name: 'etu-button', component: EtuButton },
  { name: 'etu-tea-loader', component: EtuTeaLoader },
  { name: 'etu-loading-page', component: EtuLoadingPage },
]

export default {
  install(app) {
    components.forEach(({ name, component }) => {
      app.component(name, component)
    })
  },
}
