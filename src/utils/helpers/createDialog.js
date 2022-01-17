import store from '../../store'
import Vue from 'vue'
const that = Vue.prototype

/**
 * 創建彈窗物件
 * @module createDialog
 * @function
 * @returns {object}
 */
export function createDialog () {
  /**
   * Set a dialog
   * @memberof createDialog
   * @param { boolean } params.autoClose 是否自動關閉彈窗
   * @param { string } params.type 參考 store/modules/dialog state 的 map
   * @param { string } params.msg 彈窗需要展示訊息
   * @param { boolean } params.show 彈窗顯示與隱藏
   * @param { object | array } params.payload 是否需要傳遞 data
   * @param  {string | number } params.time 彈窗持久時間（此功能尚未開發完成）
   * @public
   * @returns {void}
   */
  async function setDialog (params) {
    const { autoClose, type, msg, show, payload, time } = params
    if (autoClose) {
      return await store.dispatch('dialog/setDialog', {
        type,
        msg,
        time,
        show: true
      })
    } else {
      store.commit('dialog/SET_DIALOG', {
        type,
        msg,
        show,
        payload
      })
      return true
    }
  }

  /**
   * 彈窗打開前，先執行 $emit 事件
   *
   * @see setDialog
   * @public
   */
  async function beforeSetDialog ({ initAction }, params) {
    const { autoClose, type, msg, show, payload, time } = params
    that.$bus.$emit(`init-${initAction}`)
    if (autoClose) {
      return store.dispatch('dialog/setDialog', {
        type,
        msg,
        time,
        show: true
      })
    } else {
      store.commit('dialog/SET_DIALOG', {
        type,
        msg,
        show,
        payload
      })
      return true
    }
  }
  /**
   * 彈窗關閉後，執行 $emit 事件
   *
   * @see setDialog
   * @public
   */
  async function afterSetDialog (params, { afterAction }) {
    const { autoClose, type, msg, show, payload, time } = params
    that.$bus.$emit(afterAction)
    if (autoClose) {
      return store.dispatch('dialog/setDialog', {
        type,
        msg,
        time,
        show: true
      })
    } else {
      store.commit('dialog/SET_DIALOG', {
        type,
        msg,
        show,
        payload
      })
      return true
    }
  }
  return {
    setDialog,
    beforeSetDialog,
    afterSetDialog
  }
}
