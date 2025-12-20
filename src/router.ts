import { createRouter, createWebHistory } from 'vue-router'
import Login from './pages/Login.vue'
import UploadWork from './pages/UploadWork.vue'
import WorksList from './pages/WorksList.vue'
import DisciplinePage from './pages/DisciplinePage.vue'

const router = createRouter({
  history: createWebHistory(),
  routes: [
    { path: '/', component: Login },
    { path: '/uploadWork', component: UploadWork },
    { path: '/discipline/:id', component: DisciplinePage },
    { path: '/archive', component: WorksList },
  ],
})

export default router
