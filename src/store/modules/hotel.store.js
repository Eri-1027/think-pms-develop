const {
  hotelId,
  url
} = JSON.parse(localStorage.getItem('hotel-info')) || []
const state = () => ({
  status: '',
  hotelId,
  url
})

const mutations = {
  SET_HOTEL_INFO (state, { url, hotelId }) {
    localStorage.setItem('hotel-info', JSON.stringify({ url, hotelId }))
    state.hotelId = hotelId
    state.url = url
  },
  DELETE_HOTEL_INFO (state, payload) {
    localStorage.removeItem('hotel-info')
    state.hotelId = ''
    state.url = ''
  }
}

const actions = {
  setHotelInfo ({ commit, state }, payload) {
    commit('SET_HOTEL_INFO', {
      url: payload.url,
      hotelId: payload.hotelId
    })
    return !!state.hotelId && state.url
  }
}

export default {
  namespaced: true,
  state,
  mutations,
  actions
}
