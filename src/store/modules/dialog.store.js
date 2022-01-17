const state = () => ({
  map: {
    // component
    createPayment: false, // 新增收款
    // globally
    animationGIF: false,
    success: false,
    failed: false,
    failedWithCode: false,
    confirmNotify: false,
    // home
    logOut: false,
    showNotification: false,
    // view thePayment
    selectDutyStaff: false,
    dutyShiftDetail: false,
    particularReportDetail: false,
    // payment
    payment: false,
    paymentAfterInsertBooking: false,
    paymentAfterInsertRestBooking: false,
    paymentAfterCheckOut: false,
    paymentUnCheckIn: false,
    paymentKeepPrice: false,
    paymentExtra: false,
    // layout-default
    multiCleanOption: false,
    chooseCheckOutRoomToClean: false,
    insertOption: false,
    insertGeneralBooking: false,
    insertRestBooking: false,
    customerListOfInsertBooking: false,
    unCheckIns: false,
    unCheckInGetRoomCard: false,
    unCheckInConfirmCustomer: false,
    // dailySchedule
    keycard: false,
    reminder: false,
    // dailySchedule > card detail
    unCheckIn: false,
    checkIn: false,
    checkOut: false,
    cleaned: false, // 空
    cleaning: false,
    rest: false,
    reserve: false,
    // dailySchedule > card actions
    changeRoom: false,
    // arrangement
    arrangement: false,
    // customer
    customerDetail: false,
    // orders
    cancelBookingConfirm: false,
    ordersOrderInfo: false,
    ordersExtraExpense: false,
    // support -> roomType
    createRoomType: false,
    createRoomNumber: false,
    confirmDeleteRoomType: false,
    confirmDeleteRoomNumber: false,
    // support -> discount
    createDiscount: false,
    confirmDeleteDiscount: false,
    // support -> extra expense
    createExtraExpense: false,
    confirmDeleteExtraExpense: false,
    // support -> staff
    createStaff: false,
    confirmDeleteStaff: false
  },
  msg: null,
  payload: null
})

const mutations = {
  SET_DIALOG (state, { msg, type, show, payload }) {
    state.map[type] = show
    state.msg = msg
    state.payload = payload
  }
}
const actions = {
  setTimer ({ commit }, payload) {
    const { time } = payload
    return new Promise((resolve) => {
      window.setTimeout(resolve, time, true)
    })
  },
  async setDialog ({ commit, dispatch }, payload) {
    try {
      let {
        msg,
        type,
        time,
        show
      } = payload
      time = time || 2200
      commit('SET_DIALOG', {
        msg,
        type,
        show
      })
      const timeOut = await dispatch('setTimer', { time })
      if (timeOut) {
        commit('SET_DIALOG', {
          msg: null,
          type,
          show: false
        })
        return true
      }
    } catch (err) {
      console.log('settingError', err)
    }
  }
}

export default {
  namespaced: true,
  state,
  mutations,
  actions
}
