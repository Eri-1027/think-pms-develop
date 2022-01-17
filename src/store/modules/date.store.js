import Vue from 'vue'
import dayjs from 'dayjs'
Vue.prototype.$date = dayjs
const that = Vue.prototype
const state = () => ({
  currentDay: that.$date().format('YYYY-MM-DD')
})

const mutations = {
  SET_TODAY (state, date) {
    state.currentDay = date
  },
  SET_CURRENT_DAY (state, date) {
    state.currentDay = date
  }
}

const actions = {
  initialDate ({ state, commit }) {
    commit('SET_TODAY', that.$date().format('YYYY-MM-DD'))
    return !!(state.currentDay === that.$date().format('YYYY-MM-DD'))
  }
}

export default {
  namespaced: true,
  state,
  mutations,
  actions
}
