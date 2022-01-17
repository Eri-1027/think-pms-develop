import PRICE from '../../constants/price'
import eventService from '../eventService'
import store from '../../store'
import { createValidate } from '../helpers/createValidate'
import { createPrice } from './createPrice'
import { createUtils } from '../helpers/createUtils'
const _v = createValidate()
const _price = createPrice()
const _utils = createUtils()

export const createOrderInfo = () => {
  const initStatus = () => {
    store.commit('orderInfo/SET_STATUS', '')
  }

  const setDialogView = async ({
    type,
    bookingId,
    bookingDetailId
  }) => {
    initStatus()
    await setOrderInfoItem({
      type,
      bookingId,
      bookingDetailId
    })
    store.commit('orderInfo/SET_TAB', type)
  }

  const fetchGetBill = async (temp) => {
    try {
      const res = await eventService.showBill(temp)
      if (_v.isSuccess(res)) {
        if (_v.isHasFetch(res)) {
          return res.data.fetch.bill
        } else {
          return []
        }
      }
    } catch (err) {
      console.log(err)
    }
  }

  const fetchGetOrderDetail = async (temp) => {
    try {
      const res = await eventService.showOrdersDetail(temp)
      if (_v.isSuccess(res)) {
        if (_v.isHasFetch(res)) {
          return res.data.fetch.showOrders
        } else {
          return []
        }
      }
    } catch (err) {
      console.log(err)
    }
  }

  const fetchGetRoomCards = async (temp) => {
    try {
      const res = await eventService.showRoomsCards(temp)
      if (_v.isSuccess(res)) {
        if (_v.isHasFetch(res)) {
          return res.data.fetch.showRoomsCards
        } else {
          return []
        }
      }
    } catch (err) {
      console.log(err)
    }
  }

  const fetchGetExtraExpenseInOrder = async (temp) => {
    try {
      const res = await eventService.showExtraExpenseInOrder(temp)
      if (_v.isSuccess(res)) {
        if (_v.isHasFetch(res)) {
          return res.data.fetch.extraExpenses
        } else {
          return []
        }
      }
    } catch (err) {
      console.log(err)
    }
  }

  const fetchPostExtraExpenseOrder = async (temp) => {
    try {
      const res = await eventService.insertExtraExpenseOrder(temp)
      return !!_v.isSuccess(res)
    } catch (err) {
      console.log(err)
    }
  }

  const fetchDeleteExtraExpenseOrder = async (temp) => {
    try {
      const res = await eventService.deleteExtraExpenseInOrder(temp)
      return !!_v.isSuccess(res)
    } catch (err) {
      console.log(err)
    }
  }

  const fetchGetExtraExpenseItems = async () => {
    try {
      const res = await eventService.showExtraExpenseItems()
      if (_v.isSuccess(res)) {
        if (_v.isHasFetch(res)) {
          return res.data.fetch.extraExpenses
        } else {
          return []
        }
      }
    } catch (err) {
      console.log(err)
    }
  }

  const setOrderInfoItem = async ({
    type,
    bookingId,
    bookingNumber
  }) => {
    if (type === 'ORDER_ORDER_INFO') {
      const orders = await fetchGetOrderDetail({ bookingId })
      // 1. 拿 orders
      const orderInfo = orders[0]
      store.commit('orderInfo/SET_ORDER_INFO', {
        item: orderInfo,
        orders
      })
      // 2. 拿額外消花費
      const extras = await fetchGetExtraExpenseInOrder({ bookingId })
      if (extras && extras.length) {
        store.commit('orderInfo/SET_EXTRA_EXPENSES', extras)
      } else {
        store.commit('orderInfo/SET_EXTRA_EXPENSES', [])
      }
      return true
    }
    if (type === 'ORDER_PAYMENT') {
      if (bookingId) {
        const bills = await fetchGetBill({ bookingId })
        let payment = {
          bills
        }
        const config = {
          type: PRICE.PRICE_ORDER_INFO_PAYMENT,
          bookingId
        }
        const priceItem = await _price.getPrice(config)

        if (priceItem && Object.keys(priceItem)) {
          payment = Object.assign(
            payment,
            _utils.pickProps(priceItem, [
              'price',
              'payments',
              'difference',
              'discounts',
              'bills'
            ]),
            _utils.pickProps(config, [
              'bookingId'
            ]),
            { discounts: priceItem.discounts.replace(/,/gi, ' ') }
          )
          store.commit('orderInfo/SET_PAYMENT', { item: payment })
        }
        return true
      } else {
        console.log('cannot found booking-id')
      }
    }
  }

  return {
    initStatus,
    setDialogView,
    fetchGetBill,
    fetchGetOrderDetail,
    fetchGetRoomCards,
    fetchGetExtraExpenseInOrder,
    fetchGetExtraExpenseItems,
    fetchPostExtraExpenseOrder,
    fetchDeleteExtraExpenseOrder,
    setOrderInfoItem
  }
}
