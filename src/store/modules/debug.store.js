const state = () => ({
  debug:
  process.env.VUE_APP_CUSTOM_MODE === 'PROD_TESTING' ||
  process.env.VUE_APP_CUSTOM_MODE === 'DEV_TESTING'
})

const getters = {
  version: state => state.debug
    ? `版本：${process.env.VUE_APP_PMS_VERSION}`
    : undefined
}

export default {
  namespaced: true,
  state,
  getters
}
