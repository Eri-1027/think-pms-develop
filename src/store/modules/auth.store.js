/**
 * 登入相關
 */
import { createAuth } from '../../utils/create/createAuth'
const _auth = createAuth()

const authInfo = JSON.parse(localStorage.getItem('auth-info')) || {}
const token = authInfo
  ? authInfo.token
  : null
const isLogin = authInfo
  ? authInfo.success
  : false

const state = () => ({
  token,
  isLogin,
  status: '',
  hasLoadedOnce: false
})

const mutations = {
  SET_AUTH_INFO (state, { token, success }) {
    localStorage.setItem('auth-info', JSON.stringify({
      token,
      success
    }))
    state.token = token
    state.isLogin = success
    state.hasLoadedOnce = true
  },
  AUTH_ERROR (state) {
    state.status = 'error'
    state.hasLoadedOnce = true
  },
  DELETE_AUTH_INFO (state) {
    state.token = ''
    state.isLogin = false
  }
}

const actions = {
  async removeItemHandler ({ commit }) {
    localStorage.removeItem('auth-info')
    localStorage.removeItem('user-info')
    localStorage.removeItem('hotel-info')
    localStorage.removeItem('duty-info')
    commit('DELETE_AUTH_INFO')
    return true
  },
  /**
   *
   * @param {string} payload.token
   * @param {boolean} payload.success
   * @returns {boolean}
   */
  async setAuthInfo ({ commit, state }, payload) {
    commit('SET_AUTH_INFO', payload)
    return !!state.token && state.isLogin
  },
  /**
   *
   * @param {object} payload.JWT.jwt // token
   * @param {object} payload.fetch // url, hotelId, staff
   * @param {boolean} payload.success
   * @retruns {boolean}
   */
  async setInfo ({ rootState, dispatch }, { payload }) {
    console.log(payload)
    // console.log(payload.JWT.jwt)
    try {
      const auth = await dispatch('setAuthInfo', {
        token: payload.JWT.jwt,
        success: payload.success
      })
      const hotel = await dispatch(
        'hotel/setHotelInfo',
        {
          url: payload.fetch.url,
          hotelId: payload.fetch.hotelId
        },
        { root: true }
      )
      const user = await dispatch(
        'user/setUserInfo',
        { staff: payload.fetch.staff[0] },
        { root: true }
      )

      const result = Promise.all([
        auth,
        hotel,
        user
      ])

      return result
        ? !!rootState.auth.token && rootState.hotel.hotelId
        : false
    } catch (err) {
      console.log(err)
    }
  },
  /**
   * 登入請求
   * @param {string} account // 帳號
   * @param {string} password // 密碼
   * @returns {object}
   */
  async authRequest ({ dispatch }, { account, password }) {
    try {
      const result = await _auth.fetchPostUserLogin({
        account,
        password
      })

      if (result) {
        console.log(result)
        return await dispatch('setInfo', result)
          ? {
            success: true,
            message: 'success'
          }
          : {
            success: false,
            message: 'false' // 原本是false
          }
      } else {
        return {
          success: false,
          message: 'failed'
        }
      }
    } catch (err) {
      console.log(err)
    }
  },
  /**
   * 登出
   * @returns {boolean}
   */
  async authLogout ({ dispatch }) {
    try {
      const success = await dispatch('removeItemHandler')
      return !!success
    } catch (err) {
      console.log(err)
    }
  }
}

const getters = {
  isAuthenticated: state => !!state.token,
  authStatus: state => state.status
}

export default {
  namespaced: true,
  state,
  mutations,
  actions,
  getters
}
