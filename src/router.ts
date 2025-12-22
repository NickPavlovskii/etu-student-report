import { createRouter, createWebHistory } from 'vue-router'
import Login from './pages/Login.vue'
import UploadWork from './pages/UploadWork.vue'
import WorksList from './pages/WorksList.vue'
import DisciplinePage from './pages/DisciplinePage.vue'
import AuthSelect from './pages/AuthSelect.vue'
import EtuLogin from './pages/EtuLogin.vue'

const router = createRouter({
  history: createWebHistory(),
  routes: [
    { path: '/auth', component: AuthSelect },
    { path: '/login', component: Login },
    { path: '/EtuLogin', component: EtuLogin },
    { path: '/uploadWork', component: UploadWork },
    { path: '/discipline/:id', component: DisciplinePage },
    { path: '/archive', component: WorksList },
  ],
})

export default router
