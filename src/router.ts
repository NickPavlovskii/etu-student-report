import { createRouter, createWebHistory } from 'vue-router';

const routes = [
  {
    path: '/',
    name: 'Home',
    meta: { requiresAuth: true, layout: 'main' },
    redirect: '/disciplines',
  },
  {
    path: '/auth',
    name: 'auth',
    meta: { requiresAuth: false, layout: 'default' },
    component: () => import('@/modules/auth/AuthSelectPage.vue'),
  },
  {
    path: '/login',
    name: 'login',
    meta: { requiresAuth: false, layout: 'default' },
    component: () => import('@/modules/auth/LoginPage.vue'),
  },
  {
    path: '/EtuLogin',
    redirect: '/etu-login',
  },
  {
    path: '/etu-login',
    name: 'etuLogin',
    meta: { requiresAuth: false, layout: 'default' },
    component: () => import('@/modules/auth/EtuLoginPage.vue'),
  },
  {
    path: '/uploadWork',
    redirect: '/disciplines',
  },
  {
    path: '/disciplines',
    name: 'disciplines',
    meta: { requiresAuth: true, layout: 'main' },
    component: () => import('@/modules/disciplines/DisciplinesPage.vue'),
  },
  {
    path: '/discipline/:id',
    name: 'discipline',
    meta: { requiresAuth: true, layout: 'main' },
    component: () => import('@/modules/disciplines/DisciplinePage.vue'),
  },
  {
    path: '/archive',
    name: 'archive',
    meta: { requiresAuth: true, layout: 'main' },
    component: () => import('@/modules/archive/ArchivePage.vue'),
  },
  {
    path: '/analytics',
    name: 'analytics',
    meta: { requiresAuth: true, layout: 'main' },
    component: () => import('@/modules/analytics/AnalyticsPage.vue'),
  },
  {
    path: '/settings',
    name: 'settings',
    meta: { requiresAuth: true, layout: 'main' },
    component: () => import('@/modules/settings/SettingsPage.vue'),
  },
  {
    path: '/admin',
    name: 'admin',
    meta: { requiresAuth: true, layout: 'main' },
    component: () => import('@/modules/admin/AdminPage.vue'),
  },
  {
    path: '/:pathMatch(.*)*',
    name: 'notFound',
    meta: { requiresAuth: true, layout: 'main' },
    redirect: '/disciplines',
  },
];

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes,
});

router.beforeEach((to, _from, next) => {
  const user = localStorage.getItem('user');
  const requiresAuth = to.matched.some((record) => record.meta.requiresAuth);
  if (requiresAuth) {
    if (user) {
      next();
    } else {
      next('/auth');
    }
  } else {
    next();
  }
});

export default router;
