import Vue from 'vue'
const state = () => ({
  tempChangeRoom: {
    bookingDetailId: '',
    discountId: '',
    newRoomTypeId: '',
    newRoomNumberId: '',
    newTotalPrice: '',
    finalPrice: ''
  },
  changeRoomItem: {
    newTotalPrice: null,
    finalPrice: null
  },
  discountItems: [],
  keepPrice: '',
  changeRoomNumberItems: [],
  showDiscountError: false,
  price: 0,
  payment: 0,
  difference: 0,
  bookingId: null
})

const mutations = {
  SET_CHANGE_ROOM (state, payload) {
    state.changeRoomItem = payload
  },
  SET_TEMP_CHANGE_ROOM (state, payload) {
    state.tempChangeRoom = payload
  },
  SET_TEMP_CHANGE_ROOM_DISCOUNTID (state, payload) {
    state.tempChangeRoom.discountId = payload
  },
  SET_CHANGE_ROOM_DISCOUNTITEMS (state, payload) {
    state.discountItems = payload
  },
  CLEAR_TEMP_CHANGE_ROOM (state, payload) {
    state.tempChangeRoom.newRoomTypeId = ''
    state.tempChangeRoom.newRoomNumberId = ''
    state.tempChangeRoom.bookingDetailId = ''
    state.tempChangeRoom.discountId = ''
  },
  SET_KEEP_PRICE (state, payload) {
    state.keepPrice = payload
  },
  SET_CHANGE_ROOM_NUMBER_ITEMS (state, payload) {
    state.changeRoomNumberItems = payload
  },
  SET_CHANGE_ROOM_NEW_TOTAL_PRICE (state, payload) {
    Vue.set(state.changeRoomItem, 'newTotalPrice', payload)
  },
  SET_CHANGE_ROOM_FINAL_PRICE (state, payload) {
    Vue.set(state.changeRoomItem, 'finalPrice', payload)
  },
  SET_DISCOUNT_ERROR (state, payload) {
    state.showDiscountError = payload
  },
  SET_CHANGE_ROOM_PRICE (state, payload) {
    state.price = payload
  },
  SET_CHANGE_ROOM_PAYMENT (state, payload) {
    state.payment = payload
  },
  SET_CHANGE_ROOM_DIFFERENCE (state, payload) {
    state.difference = payload
  },
  SET_CHANGE_ROOM_BOOKINGID (state, payload) {
    state.bookingId = payload
  }
}

export default {
  namespaced: true,
  state,
  mutations
}
