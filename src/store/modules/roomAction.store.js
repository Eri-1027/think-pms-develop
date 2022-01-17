/**
 * 當日房況 Card、房號安排 Bar 點擊跳出彈窗會用到的資料
 */
const state = () => ({
  priceItem: {},
  cardItem: {},
  cashStaffItems: [],
  cleaningStaffItems: [],
  cleaningCardsItem: {}
})

const mutations = {
  SET_CARD_ITEM (state, payload) {
    state.cardItem = payload
  },
  SET_CLEANING_CARDS_ITEM (state, payload) {
    state.cleaningCardsItem = payload
  },
  SET_CLEANED_CARD_ITEM (state, payload) {
    state.cleanedCardItem = payload
  },
  SET_CASH_STAFF_ITEMS (state, payload) {
    state.cleaningStaffItems = payload
  },
  SET_CLEANING_STAFF_ITEMS (state, payload) {
    state.cleaningStaffItems = payload
  }
}

export default {
  namespaced: true,
  state,
  // actions,
  // getters,
  mutations
}
