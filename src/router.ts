import { createRouter, createWebHistory,  type RouteRecordRaw } from 'vue-router'

import DashboardView from './pages/DashboardPage.vue'
import DemoView from './pages/DemoPage.vue'
import { useSession } from './lib/auth-client'

const routes: RouteRecordRaw[]  = [
  {
    path: '/dashboards/:username',
    name: 'dashboard',
    component: DashboardView,
    props: true,
  },
  {
    path: '/auth',
    name: 'auth',
    component: () => import('./pages/AuthPage.vue'),
  },
  {
    path: '/',
    component: DashboardView,
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
  { path: '/demo', component: DemoView },
]

export const router = createRouter({
  history: createWebHistory(),
  routes,
})