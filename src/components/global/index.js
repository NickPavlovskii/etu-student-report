
import StatCard from './StatCard.vue'
import EtuButton from './EtuButton.vue'

const components = [
  { name: 'stat-card', component: StatCard },
  { name: 'etu-button', component: EtuButton },
]

export default {
  install(app) {
    components.forEach(({ name, component }) => {
      app.component(name, component)
    })
  },
}
