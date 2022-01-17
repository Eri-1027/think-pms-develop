const state = () => ({
  price: null,
  payments: null,
  difference: null,
  bookingId: '',
  bookingDetailId: '',
  bookingNumber: ''
})

const mutations = {
  SET_PRICE_ITEM (state, payload) {
    const {
      price,
      payments,
      difference,
      bookingId,
      bookingDetailId,
      bookingNumber
    } = payload
    state.price = price
    state.payments = payments
    state.difference = difference
    state.bookingId = bookingId
    state.bookingDetailId = bookingDetailId
    state.bookingNumber = bookingNumber
  },
  SET_PRICE_ITEM_DIFFERENCE (state, payload) {
    state.difference = payload
  }
}

export default {
  namespaced: true,
  state,
  mutations
}
