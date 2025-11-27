import { createRouter, createWebHistory } from 'vue-router'
import { useUserStore } from '@/stores/user'
import Home from '@/views/Home.vue'
import ProductList from '@/views/ProductList.vue'
import ProductDetail from '@/views/ProductDetail.vue'
import Cart from '@/views/Cart.vue'
import Checkout from '@/views/Checkout.vue'
import Login from '@/views/Login.vue'
import OrderList from '@/views/OrderList.vue'
import OrderDetail from '@/views/OrderDetail.vue'
import SeriesList from '@/views/series/SeriesList.vue'
import SeriesDetail from '@/views/series/SeriesDetail.vue'
import UIDemo from '@/views/UIDemo.vue'

const routes = [
  {
    path: '/',
    name: 'Home',
    component: Home,
    meta: { title: '首页' }
  },
  {
    path: '/ui-demo',
    name: 'UIDemo',
    component: UIDemo,
    meta: { title: 'UI 组件演示' }
  },
  {
    path: '/series',
    name: 'SeriesList',
    component: SeriesList,
    meta: { title: '系列' }
  },
  {
    path: '/series/:slug',
    name: 'SeriesDetail',
    component: SeriesDetail,
    meta: { title: '系列详情' }
  },
  {
    path: '/products',
    name: 'ProductList',
    component: ProductList,
    meta: { title: '产品列表' }
  },
  {
    path: '/products/:id',
    name: 'ProductDetail',
    component: ProductDetail,
    meta: { title: '产品详情' }
  },
  {
    path: '/cart',
    name: 'Cart',
    component: Cart,
    meta: { title: '购物车', requiresAuth: true }
  },
  {
    path: '/checkout',
    name: 'Checkout',
    component: Checkout,
    meta: { title: '结算', requiresAuth: true }
  },
  {
    path: '/login',
    name: 'Login',
    component: Login,
    meta: { title: '登录' }
  },
  {
    path: '/register',
    redirect: { name: 'Login' },
    meta: { title: '登录' }
  },
  {
    path: '/orders',
    name: 'OrderList',
    component: OrderList,
    meta: { title: '我的订单', requiresAuth: true }
  },
  {
    path: '/orders/:id',
    name: 'OrderDetail',
    component: OrderDetail,
    meta: { title: '订单详情', requiresAuth: true }
  },
  // Legal Pages
  {
    path: '/legal/shipping',
    name: 'ShippingPolicy',
    component: () => import('@/views/legal/ShippingPolicy.vue'),
    meta: { title: '配送说明' }
  },
  {
    path: '/legal/returns',
    name: 'ReturnsPolicy',
    component: () => import('@/views/legal/ReturnsPolicy.vue'),
    meta: { title: '退换货政策' }
  },
  {
    path: '/legal/privacy',
    name: 'PrivacyPolicy',
    component: () => import('@/views/legal/PrivacyPolicy.vue'),
    meta: { title: '隐私政策' }
  },
  {
    path: '/legal/terms',
    name: 'TermsOfService',
    component: () => import('@/views/legal/TermsOfService.vue'),
    meta: { title: '用户服务协议' }
  },
  {
    path: '/legal/after-sales',
    name: 'AfterSales',
    component: () => import('@/views/legal/AfterSales.vue'),
    meta: { title: '售后服务说明' }
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes,
  scrollBehavior() {
    return { top: 0 }
  }
})

// 路由守卫
router.beforeEach((to, from, next) => {
  const userStore = useUserStore()
  
  // 设置页面标题
  document.title = `${to.meta.title} - Vela` || 'Vela'
  
  // 检查是否需要认证
  if (to.meta.requiresAuth && !userStore.isAuthenticated) {
    next({ name: 'Login', query: { redirect: to.fullPath } })
  } else {
    next()
  }
})

export default router
