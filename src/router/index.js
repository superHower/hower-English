import { createRouter, createWebHashHistory } from 'vue-router'
import HomeView from '../views/HomeView.vue'

const router = createRouter({
  history: createWebHashHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: '背默单词',
      meta: {
        title: '默写页面',
      },
      component: HomeView,
    },
    {
      path: '/about',
      name: '错误单词',
      meta: {
        title: '错误单词',
      },
      component: () => import('../views/AboutView.vue'),
    },
    {
      path: '/log',
      name: '日志记录',
      meta: {
        title: '日志记录',
      },
      component: () => import('../views/LogView.vue'),
    },
  ],
})

export default router
