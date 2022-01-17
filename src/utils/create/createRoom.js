import ROOM_STATUS from '../../constants/roomStatus'
import PAYMENT from '../../constants/payment'
import eventService from '../eventService'
import { createValidate } from '../helpers/createValidate'
import dayjs from 'dayjs'
const _v = createValidate()

export const createRoom = () => {
  // service
  const fetchGetCardDetail = async ({ bookingDetailId }) => {
    try {
      const res = await eventService.showCardsDetail({
        bookingDetailId
      })

      if (_v.isSuccess(res)) {
        if (_v.isHasFetch(res)) {
          return res.data.fetch.showCards
        } else {
          return []
        }
      } else {
        return []
      }
    } catch (err) {
      console.log(err)
    }
  }

  const fetchGetCleaningList = async () => {
    try {
      const res = await eventService.showCleaningList()

      if (_v.isSuccess(res)) {
        if (_v.isHasFetch(res)) {
          return res.data.fetch.showCleaningList
        } else {
          return []
        }
      } else {
        return []
      }
    } catch (err) {
      console.log(err)
    }
  }

  const fetchGetEmptyCardDetail = async ({ roomId }) => {
    try {
      const res = await eventService.showEmptyCardsDetail({ roomId })

      if (_v.isSuccess(res)) {
        if (_v.isHasFetch) {
          return res.data.fetch.showEmptyCards
        } else {
          return []
        }
      } else {
        return []
      }
    } catch (err) {
      console.log(err)
    }
  }

  /**
   *
   * @param {*} temp
   * @returns object contains props `success`(required) and `msg`(if false)
   */
  const fetchPostCheckIn = async temp => {
    try {
      const res = await eventService.checkIn(temp)
      if (_v.isSuccess(res)) {
        return {
          success: res.data.success,
          message: '入住成功'
        }
      } else {
        if (
          res.data.fetch.checkInMessage ===
          'error: this room cant be check in right now.'
        ) {
          const message =
            '入住失敗。有房間尚未退房或處於「待清潔、清潔中」的狀態，請先確定該房間狀態再進行入住'
          return {
            success: res.data.success,
            message
          }
        } else {
          return {
            success: res.data.success,
            message: '入住失敗'
          }
        }
      }
    } catch (err) {
      console.log(err)
    }
  }
  /**
   *
   * @param {*} temp
   * @returns object contains props `success`(required) and `msg`(if false)
   */
  const fetchPostCheckOut = async temp => {
    try {
      const res = await eventService.checkOut(temp)
      if (_v.isSuccess(res)) {
        return {
          success: res.data.success,
          message: '退房成功'
        }
      } else {
        return {
          success: res.data.success,
          message: '退房失敗'
        }
      }
    } catch (err) {
      console.log(err)
    }
  }

  const fetchPostCancelCheckIn = async temp => {
    try {
      const res = await eventService.cancelCheckIn(temp)
      if (_v.isSuccess(res)) {
        return {
          success: res.data.success,
          message: '取消入住成功'
        }
      } else {
        return {
          success: res.data.success,
          message: '取消入住失敗'
        }
      }
    } catch (err) {
      console.log(err)
    }
  }

  // utils
  // 拿超過時間的時間單位，比方超過 31 分鐘，拿到 1 小時
  /**
   *
   * @param { string } unit 時間單位
   * @param { object } target 該房間物件
   */
  const getTempAddPrice = (unit, target) => {
    const now = dayjs()
    const ckOut = dayjs(target.expectedCheckOutTime).format(
      'YYYY-MM-DD HH:mm:ss'
    )
    const dM = now.diff(ckOut, unit)
    return dM % 60 > 30 ? Math.floor(dM / 60) + 1 : Math.floor(dM / 60)
  }

  const createNameActionByStatus = roomStatus => {
    if (roomStatus) {
      switch (roomStatus) {
        case ROOM_STATUS.UNCHECKIN_KEY:
        case ROOM_STATUS.UNCHECKIN_REST_KEY:
        case ROOM_STATUS.CHECKIN_KEY:
        case ROOM_STATUS.RESERVE_KEY:
        case ROOM_STATUS.CHECKIN_UNCHECKIN_KEY:
        case ROOM_STATUS.RESERVE_UNCHECKIN_KEY:
        case ROOM_STATUS.REST_KEY:
        case ROOM_STATUS.REST_UNCHECKIN_KEY:
          return 'actionGetBookingDetails'
        case ROOM_STATUS.UNCLEAN_KEY:
        case ROOM_STATUS.UNCLEAN_UNCHECKIN_KEY:
          return 'actionGetUnCleanRoomDetails'
        case ROOM_STATUS.CLEANING_KEY:
        case ROOM_STATUS.CLEANING_UNCHECKIN_KEY:
          return 'actionGetCleanedRoomDetail'
        case ROOM_STATUS.CHECKOUT_KEY:
          return 'actionGetEmptyRoomInfo'
        default:
          break
      }
    }
  }

  const createNameDialogByStatus = roomStatus => {
    if (roomStatus) {
      switch (roomStatus) {
        case ROOM_STATUS.UNCHECKIN_KEY:
        case ROOM_STATUS.UNCHECKIN_REST_KEY:
          return 'unCheckIn'
        case ROOM_STATUS.CHECKIN_KEY:
        case ROOM_STATUS.CHECKIN_UNCHECKIN_KEY:
          return 'checkIn'
        case ROOM_STATUS.UNCLEAN_KEY:
        case ROOM_STATUS.UNCLEAN_UNCHECKIN_KEY:
          return 'checkOut'
        case ROOM_STATUS.CLEANING_KEY:
        case ROOM_STATUS.CLEANING_UNCHECKIN_KEY:
          return 'cleaning'
        case ROOM_STATUS.REST_KEY:
        case ROOM_STATUS.REST_UNCHECKIN_KEY:
          return 'rest'
        case ROOM_STATUS.CHECKOUT_KEY:
          return 'cleaned'
        case ROOM_STATUS.RESERVE_KEY:
        case ROOM_STATUS.RESERVE_UNCHECKIN_KEY:
          return 'reserve'
        case ROOM_STATUS.CANCEL_KEY:
          return 'cancel'
        default:
          break
      }
    }
  }

  const hasSpecificStatus = (rooms, status) => {
    const collectExists = () => {
      const exists = []
      rooms.forEach(room => {
        status.forEach(s => {
          if (s === room.roomStatus) {
            if (!exists.some(el => el === s)) {
              exists.push(s)
            }
          }
        })
      })
      return exists.length > 0
    }
    return rooms && rooms.length && status && status.length
      ? collectExists()
      : false
  }

  const createAfterPaymentFnByType = type => {
    switch (type) {
      case PAYMENT.PAYMENT_CHECKOUT:
      case PAYMENT.PAYMENT_REST_CHECKOUT:
        return 'handleClickCheckOut'
      case PAYMENT.PAYMENT_UNCHECKIN:
        return 'handleClickCheckIn'
      case PAYMENT.PAYMENT_EXTRA_PAYMENT:
        return 'setOrderInfoItem'
      default:
        return null
    }
  }

  /**
   * 取得入住的 temp 資料
   * @param {array} item 需要入住的房間資料
   */
  const getTempCheckIn = item => {
    if (_v.isArrays(item)) {
      const bookingDetailId = item
        .map(el => {
          return el.roomStatus === '0'
            ? el.bookingDetailId
            : ''
        })
        .filter(el => el !== undefined)

      const roomId = item
        .map(el => {
          return el.roomStatus === '0'
            ? el.roomId
            : ''
        })
        .filter(el => el !== undefined)

      const roomTypeId = item
        .map(el => {
          return el.roomStatus === '0'
            ? el.roomTypeId
            : ''
        })
        .filter(el => el !== undefined)

      return {
        roomId,
        roomTypeId,
        checkOut: dayjs(item[0].expectedCheckOutTime).format('YYYY-MM-DD'),
        bookingDetailId
      }
    } else {
      return null
    }
  }

  return {
    fetchGetCardDetail,
    fetchGetCleaningList,
    fetchGetEmptyCardDetail,
    fetchPostCheckIn,
    fetchPostCheckOut,
    fetchPostCancelCheckIn,
    getTempAddPrice,
    createNameActionByStatus,
    createNameDialogByStatus,
    hasSpecificStatus,
    createAfterPaymentFnByType,
    getTempCheckIn
  }
}
