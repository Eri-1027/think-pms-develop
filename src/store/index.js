import Vue from 'vue'
import Vuex from 'vuex'
import auth from './modules/auth.store'
import loading from './modules/loading.store'
import dialog from './modules/dialog.store'
import user from './modules/user'
import hotel from './modules/hotel.store'
import date from './modules/date.store'
import orderInfo from './modules/orderInfo.store'
import payment from './modules/payment.store'
import price from './modules/price.store'
import print from './modules/print.store'
import booking from './modules/booking.store'
import debug from './modules/debug.store'
import changeRoom from './modules/changeRoom.store'
import room from './modules/room.store'
import roomAction from './modules/roomAction.store'

Vue.use(Vuex)

const actions = {
  async initialState ({ dispatch }) {
    await dispatch('date/initialDate')
  }
}

export default new Vuex.Store({
  actions,
  modules: {
    auth,
    loading,
    dialog,
    user,
    hotel,
    date,
    orderInfo,
    payment,
    price,
    print,
    booking,
    debug,
    changeRoom,
    room,
    roomAction
  }
})
