const state = () => ({
  orderInfo: false,
  dailyReport: false
})

const mutations = {
  SET_PRINT_SHOW (state, payload) {
    const {
      name,
      show
    } = payload
    switch (name) {
      case 'ORDER_INFO':
        state.orderInfo = show
        break
      case 'DAILY_REPORT':
        state.dailyReport = show
        break
    }
  }
}

export default {
  namespaced: true,
  state,
  mutations
}
