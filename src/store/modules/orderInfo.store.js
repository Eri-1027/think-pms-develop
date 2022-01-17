import Vue from 'vue'
const that = Vue.prototype
const state = () => ({
  bookingId: null,
  bookingDetailId: null,
  dialog: {
    orderInfo: false,
    extraExpense: false,
    extraPayment: false
  },
  tab: '',
  status: '',
  orderInfo: {},
  orders: [],
  payment: {},
  extraExpenses: [],
  selected: []
})

const mutations = {
  SET_BOOKINGID (state, payload) {
    state.bookingId = payload
  },
  SET_BOOKINGDETAILID (state, payload) {
    state.bookingDetailId = payload
  },
  SET_DIALOG (state, { dialog, isShow }) {
    state.dialog[dialog] = isShow
  },
  SET_TAB (state, tab) {
    state.tab = tab
  },
  SET_ORDER_INFO (state, { item, orders }) {
    state.orderInfo = item
    state.orders = orders
  },
  SET_PAYMENT (state, { item }) {
    state.payment = item
  },
  SET_EXTRA_EXPENSES (state, extras) {
    state.extraExpenses = extras
  },
  SET_STATUS (state, status) {
    state.status = status
  },
  SET_ORDER_INFO_KEYCARD (state, { number }) {
    for (let i = 0; i < state.orderInfo.orders.length; i++) {
      that.$set(state.orderInfo.orders[i], 'keycardNumber', number)
    }
  },
  // 移至 room/SET_SELECTED
  SET_SELECTED (state, event) {
    state.selected = event
  },
  // 移至 room/SET_SELECTED
  CLEAR_SELECTED (state) {
    state.selected = []
  }
}

export default {
  namespaced: true,
  state,
  mutations
  // actions
}
