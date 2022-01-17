import Vue from 'vue'
import VueRouter from 'vue-router'
import store from '../store'
const TheLogin = () => import('../views/TheLogin/Index')
const TheHome = () => import('../views/TheHome/Index')
const TheDailySchedule = () => import('../views/TheDailySchedule/Index')
const TheRoomArrangement = () => import('../views/TheRoomArrangement/Index')
const TheCustomerInfo = () => import('../views/TheCustomerInfo/Index')
const TheDailyReport = () => import('../views/TheDailyReport/Index')
const TheOrderList = () => import('../views/TheOrderList/Index')
const ThePayment = () => import('../views/ThePayment/Index')
const TheStaff = () => import('../views/TheStaff/Index')
const TheRoomType = () => import('../views/TheRoomType/Index')
const TheDiscount = () => import('../views/TheDiscount/Index')
const TheExtraExpense = () => import('../views/TheExtraExpense/Index')
Vue.use(VueRouter)

const ifNotAuthenticated = (to, from, next) => {
  if (!store.getters['auth/isAuthenticated']) {
    next()
    return
  }
  next()
}

const ifAuthenticated = (to, from, next) => {
  if (store.getters['auth/isAuthenticated']) {
    next()
    return
  }
  next('/login')
}

const routes = [
  {
    path: '*',
    component: () => import(/* webpackChunkName: "404" */'../views/404.vue')
  },
  {
    path: '/',
    redirect: {
      path: '/login'
    },
    meta: { layout: TheLogin }
  },
  {
    path: '/login',
    name: 'TheLogin',
    component: TheLogin,
    beforeEnter: ifNotAuthenticated
  },
  {
    path: '/admin/:hotel',
    component: TheHome,
    beforeEnter: ifAuthenticated,
    children: [
      {
        path: '',
        name: 'TheDailySchedule',
        component: TheDailySchedule,
        meta: { layout: 'default' }
      },
      {
        path: 'roomarrangement',
        name: 'TheRoomArrangement',
        component: TheRoomArrangement,
        meta: { layout: 'default' }
      },
      {
        path: 'customerinfo',
        name: 'TheCustomerInfo',
        component: TheCustomerInfo
      },
      {
        path: 'dailyreport',
        name: 'TheDailyReport',
        component: TheDailyReport
      },
      {
        path: 'orderlist',
        name: 'TheOrderList',
        component: TheOrderList
      },
      {
        path: 'payment',
        name: 'ThePayment',
        component: ThePayment
      },
      // support
      {
        path: 'staff',
        name: 'TheStaff',
        component: TheStaff
      },
      {
        path: 'roomtype',
        name: 'TheRoomType',
        component: TheRoomType
      },
      {
        path: 'discount',
        name: 'TheDiscount',
        component: TheDiscount
      },
      {
        path: 'extraexpense',
        name: 'TheExtraExpense',
        component: TheExtraExpense
      }
    ]
  }
]

const router = new VueRouter({
  mode: 'hash',
  base: process.env.BASE_URL,
  routes
})

export default router
