import { createRouter, createWebHistory } from 'vue-router'
import HomeView from '../views/HomeView.vue'
import Error404 from '../views/Error404.vue'  // 导入404组件

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
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
    // 添加404路由（必须放在最后）
    {
      path: '/:pathMatch(.*)*',  // 匹配所有路径
      name: 'NotFound',
      component: Error404,
    },
  ],
})

export default router