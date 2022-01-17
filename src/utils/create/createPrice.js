import PRICE from '../../constants/price'
import eventService from '../eventService'
import { createValidate } from '../helpers/createValidate'
const _v = createValidate()

export const createPrice = () => {
  // helpers
  const isPriceItem = async (props, payload) => {
    if (_v.hasProperty(payload)) {
      const validate = createValidate()
      return _v.isArrays(props)
        ? await validate.isHasProps(props, payload)
        : await validate.isHasProps([
          'price',
          'payment',
          'difference',
          'bookingId',
          'bookingNumber'
        ], payload)
    } else {
      return false
    }
  }

  const createFetchPrice = (type) => {
    switch (type) {
      case PRICE.PRICE_INSERT_BOOKING:
      case PRICE.PRICE_INSERT_REST_BOOKING:
        return fetchGetPriceAndType
      case PRICE.PRICE_CHANGE_ROOM:
        return fetchGetNewPrice
      // case PRICE.PRICE_ADD_REST:
      //   return fetchGetAddRestPrice
      case PRICE.PRICE_UPDATE_TOTAL:
        return fetchGetUpdateTotalPrice
      case PRICE.PRICE_UNCHECKIN:
      case PRICE.PRICE_UNCHECKIN_CARD_DETAIL:
      case PRICE.PRICE_RESERVE_CARD_DETAIL:
      case PRICE.PRICE_CHECKIN_CARD_DETAIL:
      case PRICE.PRICE_REST_CARD_DETAIL:
      case PRICE.PRICE_CHECKOUT:
      case PRICE.PRICE_REST_CHECKOUT:
      case PRICE.PRICE_EXTRA_PAYMENT:
      case PRICE.PRICE_ORDER_INFO:
      case PRICE.PRICE_ORDER_INFO_PAYMENT:
        return fetchGetBillAmount
      default:
        break
    }
  }

  const getTempPrice = (config) => {
    switch (config.type) {
      case PRICE.PRICE_INSERT_BOOKING:
        return {
          stayingDay: config.stayingDay,
          expectedCheckInTime: config.expectedCheckInTime,
          expectedCheckOutTime: config.expectedCheckOutTime,
          bookingId: config.bookingId,
          roomStatus: config.roomStatus
        }
      case PRICE.PRICE_INSERT_REST_BOOKING:
        return {
          roomTypeId: config.roomTypeId,
          roomId: config.roomId,
          hours: config.hours,
          roomStatus: config.roomStatus,
          bookingId: config.bookingId
        }
      case PRICE.PRICE_CHANGE_ROOM:
        return {
          bookingId: config.bookingId,
          stayingDay: config.stayingDay,
          expectedCheckInTime: config.expectedCheckInTime,
          expectedCheckOutTime: config.expectedCheckOutTime,
          roomTypeId: config.roomTypeId,
          discountId: config.discountId,
          originalPrice: config.originalPrice,
          keepPrice: config.keepPrice,
          roomStatus: config.roomStatus
        }
      // case PRICE.PRICE_ADD_REST:
      //   return {
      //     bookingId: config.bookingId,
      //     bookingDetailId: config.bookingDetailId,
      //     roomTypeId: config.roomTypeId,
      //     hours: config.hours
      //   }
      case PRICE.PRICE_UPDATE_TOTAL:
        return {
          bookingId: config.bookingId,
          price: config.price
        }
      case PRICE.PRICE_UNCHECKIN:
      case PRICE.PRICE_UNCHECKIN_CARD_DETAIL:
      case PRICE.PRICE_RESERVE_CARD_DETAIL:
      case PRICE.PRICE_CHECKIN_CARD_DETAIL:
      case PRICE.PRICE_REST_CARD_DETAIL:
      case PRICE.PRICE_CHECKOUT:
      case PRICE.PRICE_EXTRA_PAYMENT:
      case PRICE.PRICE_ORDER_INFO:
      case PRICE.PRICE_ORDER_INFO_PAYMENT:
        return {
          bookingId: config.bookingId
        }
      case PRICE.PRICE_REST_CHECKOUT:
        return {
          bookingId: config.bookingId,
          bookingDetailId: config.bookingDetailId
        }
      default:
        break
    }
  }

  // 計算休息超時總額
  const getRestAddPrice = ({ item, extraHour }) => {
    return item && item.restPerHour !== null
      ? extraHour * +item.restPerHour
      : 0
  }

  const fetchGetBillAmount = async (temp) => {
    try {
      const res = await eventService.showBillAmount(temp)
      console.log(res)
      if (_v.isSuccess(res)) {
        if (_v.isHasFetch(res)) {
          return {
            discounts: res.data.fetch.discounts,
            price: res.data.fetch.price,
            payments: res.data.fetch.payments,
            difference: res.data.fetch.difference
          }
        } else {
          return {}
        }
      } else {
        return {}
      }
    } catch (err) {
      console.log(err)
    }
  }

  const fetchGetPriceAndType = async (temp) => {
    try {
      const res = await eventService.showPriceAndType(temp)
      if (_v.isSuccess(res)) {
        if (_v.isHasFetch(res)) {
          return {
            discounts: res.data.fetch.discounts,
            price: res.data.fetch.price,
            payments: res.data.fetch.payments,
            difference: res.data.fetch.difference
          }
        } else {
          return {}
        }
      } else {
        return {}
      }
    } catch (err) {
      console.log(err)
    }
  }

  //  v0.2.0-beta.2 depreciate
  const fetchGetNewPrice = async (temp) => {
    try {
      const res = await eventService.showNewPrice(temp)
      if (_v.isSuccess(res)) {
        if (_v.isHasFetch(res)) {
          return {
            discounts: null,
            price: res.data.fetch.price,
            payments: res.data.fetch.payments,
            difference: res.data.fetch.difference
          }
        } else {
          return {}
        }
      } else {
        return {}
      }
    } catch (err) {
      console.log(err)
    }
  }

  // 這名字取不好，照理說要改資料庫資料應該要是 update
  const fetchGetUpdateTotalPrice = async (temp) => {
    try {
      const res = await eventService.updateTotalPrice(temp)
      if (_v.isSuccess(res)) {
        if (_v.isHasFetch(res)) {
          return {
            discounts: null,
            price: null,
            payments: null,
            difference: res.data.fetch.difference
          }
        } else {
          return {}
        }
      } else {
        return {}
      }
    } catch (err) {
      console.log(err)
    }
  }

  const fetchGetAddRestPrice = async (temp) => {
    try {
      const res = await eventService.addRestPrice(temp)
      if (_v.isSuccess(res)) {
        if (_v.isHasFetch(res)) {
          return {
            discounts: null,
            price: res.data.fetch.messenge,
            payments: null,
            difference: null
          }
        } else {
          return {}
        }
      } else {
        return {}
      }
    } catch (err) {
      console.log(err)
    }
  }

  const fetchCancelRestPrice = async (temp) => {
    try {
      const res = await eventService.cancelRestPrice(temp)
      if (_v.isSuccess(res)) {
        if (_v.isHasFetch(res)) {
          return {
            discounts: null,
            price: res.data.fetch.messenge,
            payments: null,
            difference: null
          }
        } else {
          return {}
        }
      } else {
        return {}
      }
    } catch (err) {
      console.log(err)
    }
  }

  const getPrice = async (config) => {
    const fn = createFetchPrice(config.type)
    const temp = getTempPrice(config)
    const res = await fn(temp)
    return res
  }

  return {
    isPriceItem,
    createFetchPrice,
    getTempPrice,
    getRestAddPrice,
    fetchGetBillAmount,
    fetchGetPriceAndType,
    fetchGetNewPrice,
    fetchGetUpdateTotalPrice,
    fetchGetAddRestPrice,
    fetchCancelRestPrice,
    getPrice
  }
}
