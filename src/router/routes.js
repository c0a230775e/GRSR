const routes = [
  {
    path: '/',
    component: () => import('@/layouts/MainLayout.vue'),
    children: [
      { path: '', component: () => import('@/pages/CommonPage.vue') },
      { path: 'admin', component: () => import('@/pages/AdminPage.vue') },
      { path: 'complete', component: () => import('@/pages/CompletePage.vue') },
      { path: 'calendar', component: () => import('@/pages/CalendarPage.vue') }
      // { path: 'admin/setup', component: () => import('@/pages/AdminSetupPage.vue')}
    ]
  },

  {
    path: '/:catchAll(.*)*',
    component: () => import('@/pages/ErrorNotFound.vue')
  }
]

export default routes
