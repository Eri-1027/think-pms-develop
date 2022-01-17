import eventService from '../../utils/eventService'

const staff = JSON.parse(localStorage.getItem('user-info')) || []
const dutyId = JSON.parse(localStorage.getItem('duty-info')) || ''
const tutorialStatus = JSON.parse(localStorage.getItem('tutorial-info')) || null
const state = () => ({
  status: '',
  staff,
  dutyId,
  tutorialStatus
})

const mutations = {
  SET_DUTY_ID (state, payload) {
    localStorage.setItem('duty-info', JSON.stringify(payload))
    state.dutyId = payload
  },
  SET_USER_INFO (state, payload) {
    localStorage.setItem('user-info', JSON.stringify(payload.staff))
    state.staff = payload.staff
  },
  SET_TUTORIAL_STATUS (state, payload) {
    localStorage.setItem('tutorial-info', JSON.stringify(payload))
    state.tutorialStatus = payload
  },
  UPDATE_DUTY_ID (state, payload) {
    localStorage.setItem('duty-info', JSON.stringify(payload))
    state.dutyId = payload
  },
  DELETE_DUTY_ID (state, payload) {
    state.dutyId = ''
  },
  DELETE_USER_INFO (state, payload) {
    state.staff = {}
  }
}

const actions = {
  async setUserInfo ({ commit, state }, payload) {
    commit('SET_USER_INFO', { staff: payload.staff })
    return !!state.staff !== {}
  },
  async fetchCheckTutorial ({ commit }) {
    const res = await eventService.auth.checkTutorial()
    if (res.data.fetch) {
      return res.data.fetch.checkTutorial
    }
    return res
  },
  async tutorialHandler ({ commit, dispatch, rootState }) {
    const status = await dispatch('fetchCheckTutorial')
    if (status === '0' || status === '1') {
      commit('SET_TUTORIAL_STATUS', status)
    }
  }
}

const getters = {
  getStaff: state => state.staff,
  isProfileLoaded: state => !!state.staff.staffName
}

export default {
  namespaced: true,
  state,
  actions,
  getters,
  mutations
}
