import Vue from 'vue'

const TDatePicker = () => import('@/components/TDatePicker')
const TDialogConfirm = () => import('@/components/TDialogConfirm')
const TDialogPayment = () => import('@/components/TDialogPayment')
const PaginationDate = () => import('@/components/PaginationDate')
const TCardUnCheckIn = () => import('@/components/TCardUnCheckIn')
const TSvgDialogConfirmIcon = () => import('@/components/TSvgDialogConfirmIcon')
const TSignAnimation = () => import('@/components/TSignAnimation')
const TMobileCard = () => import('@/components/TMobileCard')

Vue.component('TDatePicker', TDatePicker)
Vue.component('TDialogConfirm', TDialogConfirm)
Vue.component('TDialogPayment', TDialogPayment)
Vue.component('PaginationDate', PaginationDate)
Vue.component('TCardUnCheckIn', TCardUnCheckIn)
Vue.component('TSvgDialogConfirmIcon', TSvgDialogConfirmIcon)
Vue.component('TSignAnimation', TSignAnimation)
Vue.component('TMobileCard', TMobileCard)
