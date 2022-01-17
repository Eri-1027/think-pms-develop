/**
 * 訂單相關
 */
const state = () => ({
  tempMultiClean: {
    staffId: '',
    bookingDetailId: [],
    roomStatus: ''
  },
  type: null,
  status: '',
  select: [],
  staffId: '',
  available: {
    checkout: null,
    cleaning: null
  }
})

const mutations = {
  /**
   * 選擇批量清潔種類
   * @param {string} type // 房間狀態 2（待清潔） 或 3（清潔中）
   */
  SET_TYPE (state, { type }) {
    state.type = type
  },
  /**
   * 批量清潔狀態（e.g. 點選`批量清潔`按鈕、選擇清潔人或是正在選則房間這幾種狀態）
   * @param {string} status
   */
  SET_STATUS (state, { status }) {
    state.status = status
  },
  /**
   * 設定清潔人員 Id
   * @param {string} staffId
   */
  SET_STAFFID (state, { staffId }) {
    state.staffId = staffId
  },
  /**
   * 設定 tempMultiClean
   */
  SET_TEMP (state) {
    state.tempMultiClean.roomStatus = state.type
    state.tempMultiClean.bookingDetailId = state.select
    state.tempMultiClean.staffId = state.staffId
  },
  /**
   * 勾選/取消勾選 整張卡片。
   * @param {*} payload // 點選的卡片資料
   */
  SET_SELECT_ITEM (state, payload) {
    // 將傳進的卡片資訊的 bookingDetailId 存進 id 變數
    const id = payload.bookingDetailId
    // 判斷 目前已選取的項目（在 state.select）
    const isExist = () => {
      return state.select.some(el => el === id)
    }
    // 有發現同樣 Id，就把它刪除，反之放進去
    if (isExist()) {
      const idx = state.select.indexOf(id)
      state.select.splice(idx, 1)
    } else {
      state.select.push(id)
    }
  },
  CLEAR (state) {
    state.status = ''
    state.tempMultiClean.staffId = ''
    state.tempMultiClean.bookingDetailId = []
    state.tempMultiClean.roomStatus = ''
    state.type = null
    state.staffId = ''
    state.select = []
  },
  SET_OPTION_AVAILABLE (state, payload) {
    const {
      checkout,
      cleaning
    } = payload
    state.available.checkout = checkout
    state.available.cleaning = cleaning
  }
}

export default {
  namespaced: true,
  state,
  mutations
  // actions
}
