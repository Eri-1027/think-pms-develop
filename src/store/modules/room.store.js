const state = () => ({
  selected: []
})

const mutations = {
  SET_SELECTED (state, payload) {
    state.selected = payload
  }
}

export default {
  namespaced: true,
  state,
  mutations
}
