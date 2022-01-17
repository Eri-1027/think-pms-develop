import PAYMENT from '../../constants/payment'
import eventService from '../eventService'
import { createDialog } from '../helpers/createDialog'
import { createValidate } from '../helpers/createValidate'
import { createError } from '../helpers/createError'
import { createStaff } from './createStaff'
import _ from 'lodash'
const _error = createError()
const _dialog = createDialog()
const _staff = createStaff()
const _v = createValidate()

export const createPayment = params => {
  const isFieldEmpty = methods => {
    const isPaymentNote = methods.some(el => el.paymentNote)
    const isPaymentMethods = methods.some(el => el.paymentMethod)
    const isPaymentAmount = methods.some(el => el.paymentAmount)
    return !!(!isPaymentNote && !isPaymentMethods && !isPaymentAmount)
  }

  const isPaid = priceItem => {
    return +priceItem.difference === 0 || +priceItem.difference < 0
  }

  // check if paymentMethod is 1 or 5
  const isPosType = methods => {
    return methods && methods.length && methods[0] !== null
      ? methods[0].paymentMethod === '1' || methods[0].paymentMethod === '5'
      : false
  }

  /**
   * create methods
   */
  const createTempPayment = ({
    temp,
    setting,
    methods
  }) => {
    return Object.assign(
      {},
      temp,
      getTempForMethodsJoin(temp, methods),
      setting)
  }

  /**
   * do
   */
  const doSimplePayment = async (params) => {
    try {
      const tempPay = createTempPayment({
        temp: params.pay.temp,
        setting: params.pay.setting,
        methods: params.pay.methods
      })
      const resultPay = await fetchPostPayment(tempPay)
      if (resultPay.success) {
        return {
          success: resultPay.success,
          message: '收款成功'
        }
      } else {
        return {
          success: false,
          message: resultPay.message
        }
      }
    } catch (err) {
      console.log(err)
    }
  }

  const doComplexPayment = async (params) => {
    try {
      const tempPay = createTempPayment({
        temp: params.pay.temp,
        setting: params.pay.setting,
        methods: params.pay.methods
      })
      const tempPos = params.pos.setting
      const tempTrans = params.trans.setting

      const resultPos = await fetchPostPos(tempPos)
      if (resultPos.success) {
        const resultTrans = await doFetchGetTransactionResultLoop(tempTrans)
        if (resultTrans.success) {
          const resultPay = await fetchPostPayment(tempPay)
          if (resultPay.success) {
            return {
              success: resultPay.success,
              message: '收款成功'
            }
          } else {
            return {
              success: false,
              message: resultPay.message
            }
          }
        } else {
          return {
            success: false,
            message: resultTrans.message
          }
        }
      } else {
        return {
          success: false,
          message: resultPos.message
        }
      }
    } catch (err) {
      console.log(err)
    }
  }

  const doPayment = async (params, type) => {
    if (Object.keys(params)) {
      switch (type) {
        case 'SIMPLE':
          return doSimplePayment(params)
        case 'COMPLEX':
          return doComplexPayment(params)
        default:
          break
      }
    } else {
      console.log(`ERROR:參數不齊全 => params ${params} 或 type ${type}`)
    }
  }

  const request = async (retries, temp) => {
    return new Promise((resolve, reject) => {
      const timer = setInterval(async () => {
        if (retries) {
          const res = await fetchGetTransactionResult(temp)
          const {
            success,
            message
          } = res
          if (success && message === '1') {
            clearInterval(timer)
            resolve({
              success: true,
              message: '交易成功',
              retries
            })
          } else if (message === '0') {
            clearInterval(timer)
            resolve({
              success: true,
              message: '交易失敗',
              retries
            })
          } else {
            retries--
          }
        } else {
          resolve({
            success: false,
            message: '刷卡操作逾時',
            retries
          })
          clearInterval(timer)
        }
      }, 500)
    })
  }

  const doFetchGetTransactionResultLoop = async (temp) => {
    const CREDIT_CARD_REQUEST = 100
    const MOBILE_REQUEST = 600
    // eslint-disable-next-line no-async-promise-executor
    return new Promise(async (resolve, reject) => {
      const number = temp.payment === '1'
        ? CREDIT_CARD_REQUEST
        : MOBILE_REQUEST
      const res = await request(number, temp)
      resolve(res)
    })
  }

  const dispatchDialogByPaymentType = async (type, isShow) => {
    switch (type) {
      case PAYMENT.PAYMENT_CHANGE_ROOM:
        _dialog.setDialog({
          type: 'paymentKeepPrice',
          show: isShow
        })
        break
      case PAYMENT.PAYMENT_INSERT_BOOKING:
        _dialog.setDialog({
          type: 'paymentAfterInsertBooking',
          show: isShow
        })
        break
      case PAYMENT.PAYMENT_INSERT_REST_BOOKING:
        _dialog.setDialog({
          type: 'paymentAfterInsertRestBooking',
          show: isShow
        })
        break
      case PAYMENT.PAYMENT_UNCHECKIN:
        _dialog.setDialog({
          type: 'paymentUnCheckIn',
          show: isShow
        })
        break
      case PAYMENT.PAYMENT_EXTRA_PAYMENT:
        _dialog.setDialog({
          type: 'paymentExtra',
          show: isShow
        })
        break
      case PAYMENT.PAYMENT_CHECKOUT:
        _dialog.setDialog({
          type: 'paymentAfterCheckOut',
          show: isShow
        })
        break
      default:
        break
    }
  }

  /**
   * services
   */
  const fetchPostPayment = async temp => {
    try {
      const res = await eventService.payment(temp)
      if (_v.isSuccess(res)) {
        return {
          success: res.data.success,
          message: '收款成功'
        }
      } else {
        return {
          success: res.data.success,
          message: _error.getErrMsg(res, {
            code: '60001',
            msg: '伺服器錯誤：收款失敗',
            isSystemError: true
          })
        }
      }
    } catch (err) {
      console.log(err)
    }
  }

  // 暫時用 B200 與 B500 判斷，待後端把 api 改完
  const fetchPostPos = async temp => {
    try {
      const REG_DISCONNECTED = new RegExp('目前未連線')
      const REG_COMPLETE = new RegExp('執行完成')

      const res = await eventService.pos(temp)
      if (res.data.code === 'B200' && res.data.fetch.msg.match(REG_COMPLETE) !== null) {
        return {
          success: true,
          message: '卡機呼叫成功'
        }
      } else if (res.data.code === 'B500' && res.data.fetch.msg.match(REG_DISCONNECTED) !== null) {
        return {
          success: false,
          message: '設備目前未連線'
        }
      } else {
        return {
          success: false,
          message: _error.getErrMsg(res, {
            code: '60001',
            msg: '伺服器錯誤：未知的錯誤類型',
            isSystemError: true
          })
        }
      }
    } catch (err) {
      console.log(err)
    }
  }

  const fetchGetTransactionResult = async (temp) => {
    try {
      const res = await eventService.transactionResult(temp)
      if (_v.isSuccess(res)) {
        if (_v.isHasFetch(res)) {
          return {
            success: res.data.success,
            message: res.data.fetch.transactionResult
          }
        } else {
          return {
            success: res.data.success,
            message: _error.getErrMsg(res, {
              code: '60001',
              msg: '伺服器錯誤：無資料回傳',
              isSystemError: true
            })
          }
        }
      } else {
        return {
          success: res.data.success,
          message: _error.getErrMsg(res, {
            code: '60001',
            msg: '伺服器錯誤：未知的錯誤類型',
            isSystemError: true
          })
        }
      }
    } catch (err) {
      console.log(err)
    }
  }

  const getCashStaffItems = async () => {
    const staffs = await _staff.fetchGetAllStaffs()
    return staffs
      .filter(staff => {
        return (
          staff.staffLevel === '1' ||
          staff.staffLevel === '2' ||
          staff.staffLevel === '3'
        )
      })
      .map(staff => {
        return {
          text: staff.staffName,
          value: staff.staffId
        }
      })
  }

  const getCostByPaymentAmount = amount => {
    let cost = 0
    const a = amount.split(',')
    if (a && a.length > 1) {
      for (let i = 0; i < a.length; i++) {
        cost += a[i]
      }
      return cost
    } else {
      cost = +amount
      return cost
    }
  }

  const getInitTempPayment = () => {
    return Object.assign({}, {
      staffId: '',
      paymentType: '',
      paymentMethod: [],
      paymentAmount: [],
      paymentNote: [],
      taxNumber: '',
      bookingId: ''
    })
  }

  const getInitTempPaymentMethods = () => {
    return [
      Object.assign({}, {
        paymentMethod: '',
        paymentAmount: '',
        paymentNote: ''
      })
    ]
  }

  const getFormatDiscount = discounts => {
    return _v.isArrays(discounts)
      ? _.uniq(discounts.split(',')).join(',')
      : ''
  }

  /**
   * format 成後端需要的格式
   * @example ['100','250','400'] -> "100,250,400"
   */
  const getTempForMethodsJoin = (temp, methods) => {
    if (_v.hasProperty(temp) && _v.isArrays(methods)) {
      temp = {
        paymentMethod: [],
        paymentAmount: [],
        paymentNote: []
      }

      methods.forEach(item => {
        temp.paymentMethod.push(item.paymentMethod)
        temp.paymentAmount.push(item.paymentAmount)
        temp.paymentNote.push(item.paymentNote)
      })

      temp = Object.assign(temp, {
        paymentMethod: temp.paymentMethod.join(),
        paymentAmount: temp.paymentAmount.join()
      })

      return temp
    } else {
      return {}
    }
  }

  /**
   * @deprecated
   */
  const getRefByType = (type) => {
    switch (type) {
      case PAYMENT.PAYMENT_INSERT_BOOKING:
      case PAYMENT.PAYMENT_INSERT_REST_BOOKING:
      case PAYMENT.PAYMENT_CHANGE_ROOM:
        return 'paymentInsertBooking'
      case PAYMENT.PAYMENT_CHECKOUT:
      case PAYMENT.PAYMENT_REST_CHECKOUT:
        return 'paymentCheckOut'
      case PAYMENT.PAYMENT_EXTRA_PAYMENT:
        return 'paymentExtraPayment'
      case PAYMENT.PAYMENT_UNCHECKIN:
        return 'paymentUnCheckIn'
    }
  }

  return {
    fetchGetTransactionResult,
    doFetchGetTransactionResultLoop,
    createTempPayment,
    doPayment,
    getCostByPaymentAmount,
    getInitTempPayment,
    getInitTempPaymentMethods,
    getRefByType,
    isPosType,
    isFieldEmpty,
    getFormatDiscount,
    dispatchDialogByPaymentType,
    fetchPostPayment,
    fetchPostPos,
    getCashStaffItems,
    isPaid
  }
}
