const state = () => ({
  isLoading: false,
  fullPage: true
})

const mutations = {
  SET_LOADING (state, payload) {
    console.log(payload)
    state.isLoading = payload
  }
}

export default {
  namespaced: true,
  state,
  mutations
}
