import { createRouter, createWebHistory,  type RouteRecordRaw } from 'vue-router'

import { useSession } from './lib/auth-client'

const routes: RouteRecordRaw[]  = [
  {
    path: '/dashboards/:username',
    name: 'dashboard',
    component: () => import('./pages/DashboardPage.vue'),
    props: true,
  },
  {
    path: '/auth',
    name: 'auth',
    component: () => import('./pages/AuthPage.vue'),
  },
  {
    path: '/',
    component: () => import('./pages/DashboardPage.vue'),
    beforeEnter: (_to, _from, next) => {
      const session = useSession();
      const name = session.value.data?.user?.name;
      if (name) {
        next({ name: 'dashboard', params: { username: name } });
      } else {
        next({ name: 'auth' }); // important: resolve navigation when no session
      }
    },
  },
  { path: '/demo', component: () => import('./pages/DemoPage.vue') },
  { path: '/calendar', component: () => import('./pages/CalendarPage.vue') },
]

export const router = createRouter({
  history: createWebHistory(),
  routes,
})