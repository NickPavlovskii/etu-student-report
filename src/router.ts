import { createRouter, createWebHistory } from 'vue-router'
import UploadWork from './pages/UploadWork.vue'
import WorksList from './pages/WorksList.vue'

const router = createRouter({
  history: createWebHistory(),
  routes: [
    { path: '/', component: UploadWork },
     { path: '/archive', component: WorksList },
  ],
})

export default router
