
import StatCard from './StatCard.vue'


const components = [
  { name: 'stat-card', component: StatCard },

]

export default {
  install(app) {
    components.forEach(({ name, component }) => {
      app.component(name, component)
    })
  },
}
