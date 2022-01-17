/**
 * 透過 api 回傳 data，產生統一 format 過的錯誤訊息
 */
import { createValidate } from './createValidate'
const _v = createValidate()

export const createError = () => {
  /**
   * 是否有錯誤代碼
   */
  const _isHasCode = res => {
    return !!res.data.code
  }

  /**
   * 是否有屬性符合 /essage/？
   */
  const _isHasMessage = res => {
    const regexMessage = /essage/
    const exists = []
    Object
      .keys(res.data.fetch)
      .forEach(prop => {
        if (regexMessage.test(prop)) {
          exists.push(prop)
        }
      })
    return _v.isArrays(exists)
  }

  /**
   * 是否 http 回傳 200？
   */
  const _isHttpStatus200 = (res) => {
    return _v.isPlainObject(res)
      ? res.status === 200
      : false
  }

  /**
   * 是否提供客製化錯誤訊息？
   * @example
   * // { code: '60001', msg: '伺服器錯誤：收款失敗', isSystemError: true }
   */
  const _isHasCustom = custom => {
    return _v.isPlainObject(custom) && custom.code && custom.msg
  }

  /**
   *
   * @param {string} code
   * @param {string} msg
   * @param {boolean} isSystemError 是否為系統錯誤，像是「操作失敗（比方排房不成功，因為該房間已住人）」這類型 `不` 算是系統錯誤。所以為 false
   */
  const getMsgCodePreFormat = (code, msg, isSystemError) => {
    return isSystemError
      ? `${code} ${msg}`
      : msg
  }

  const getMsgByCode = res => {
    const regex1 = /10001/
    const regex2 = /20001/
    const regex3 = /30001/
    const regex4 = /40001/
    const code = res.data.code
    let message = ''
    if (regex1.test(code)) {
      message = getMsgCodePreFormat(code, '參數遺漏', true)
    } else if (regex2.test(code)) {
      message = getMsgCodePreFormat(code, '操作失敗', false)
    } else if (regex3.test(code)) {
      message = getMsgCodePreFormat(code, '驗證錯誤', true)
    } else if (regex4.test(code)) {
      message = getMsgCodePreFormat(code, '卡機錯誤', true)
    }
    return message
  }

  const getCode = res => {
    return res.data.code
      ? res.data.code
      : ''
  }

  // 最好的情況是請後端把所有錯誤回傳的 message 統ㄧ命名。如果無法，就看以下這條：
  // 平常可以蒐集後端的錯誤回傳 message 名稱，放到 case 裡面。
  const getMsgByFetchMsg = res => {
    const regexMessage = /essage/
    const messages = []
    Object
      .keys(res.data.fetch)
      .forEach(prop => {
        if (regexMessage.test(prop)) {
          messages.push({
            code: getCode(res),
            codeDescription: getMsgByCode(res),
            message: res.data.fetch[prop]
          })
        }
      })
    if (_v.isArrays(messages)) {
      // 將新發現的 res.data.fetch['/message/'] 寫到 case 好作判斷
      // 我可能會再增加一個 module 負責整理這些 message 類型。
      switch (messages[0].message) {
        // 房價與專案
        case 'error: discountName repeat':
          return getMsgDetails(messages[0], '專案名稱重複')
        // 自動排房
        case 'error: this room has been arranged':
          return getMsgDetails(messages[0], '該房間已經被使用')
        case 'error: automatic arrange failed':
          return getMsgDetails(messages[0], '自動排房失敗')
        case 'connection error':
          return getMsgDetails(messages[0], '連線錯誤')
        default:
          return '未知的錯誤類型'
      }
    }
  }

  /**
   * @example 20001 操作失敗：自動排房失敗
   */
  const getMsgDetails = (messageObj, customName) => {
    return `${messageObj.code} ${messageObj.codeDescription} : ${customName}`
  }

  const getMsgByCustom = custom => {
    const {
      code,
      msg,
      isSystemError
    } = custom
    return getMsgCodePreFormat(code, msg, isSystemError)
  }

  // Public
  // 先判斷 api 回傳的 res 有沒有可用的錯誤資訊，沒有則給予客製化錯誤訊息
  /**
   *
   * @param {object} res api response
   * @param {object} custom custom config（若沒有錯誤代碼或錯誤訊息，則給予客製化錯誤訊息）
   */
  const getErrMsg = (res, custom) => {
    const isHasCode = _isHasCode(res)
    const isHttpStatus200 = _isHttpStatus200(res)
    const isHasBothCodeAndMessage = _isHasCode(res) && _isHasMessage(res)
    const isCustom = _isHasCustom(custom)

    if (isHttpStatus200) {
      // 從後端拿錯誤訊息
      if (isHasBothCodeAndMessage) {
        return getMsgByFetchMsg(res)
      }
      // 從後端拿錯誤代碼
      if (isHasCode && !isHasBothCodeAndMessage) {
        return getMsgByCode(res)
      }
      if (isCustom) {
        return getMsgByCustom(custom)
      }
    } else {
      return getMsgByFetchMsg(res)
    }
  }

  return {
    getErrMsg
  }
}
