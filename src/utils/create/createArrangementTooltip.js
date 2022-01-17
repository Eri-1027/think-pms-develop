import eventService from '../eventService'
import ROOM_STATUS from '@/constants/roomStatus'
import { createValidate } from '../helpers/createValidate'
const _v = createValidate()
export const createArrangementTooltip = () => {
  // const tooltips = []
  /** private */
  const getCardDetail = async (card) => {
    try {
      if (card && _v.hasProperty(card)) {
        const temp = { bookingDetailId: card.bookingDetailId }
        const res = await eventService.showCardsDetail(temp)
        if (_v.isSuccess(res)) {
          if (_v.isHasFetch(res)) {
            return res.data.fetch.showCards[0]
          } else {
            return {}
          }
        } else {
          return {}
        }
      }
    } catch (err) {
      console.log(err)
    }
  }
  const isHasNextOrder = async ({ originItem }) => {
    try {
      const isValidRoomStatus = (item) => {
        if (item) {
          switch (item.roomStatus) {
            case ROOM_STATUS.UNCHECKIN_KEY:
            case ROOM_STATUS.UNCHECKIN_REST_KEY:
            case ROOM_STATUS.CHECKIN_KEY:
            case ROOM_STATUS.REST_KEY:
            case ROOM_STATUS.REST_UNCHECKIN_KEY:
            case ROOM_STATUS.REST_RESERVE_KEY:
            case ROOM_STATUS.CHECKIN_UNCHECKIN_KEY:
            case ROOM_STATUS.UNCLEAN_UNCHECKIN_KEY:
            case ROOM_STATUS.CLEANING_UNCHECKIN_KEY:
              return true
            default:
              return false
          }
        } else {
          return false
        }
      }
      const nextOrder = await getNextOrderItem({ originItem }) !== null
        ? await getNextOrderItem({ originItem })
        : null
      return !!(
        isValidRoomStatus(originItem) && isValidRoomStatus(nextOrder)
      )
    } catch (err) {
      console.log(err)
    }
  }
  const fetchGetNextOrder = async (temp) => {
    try {
      const res = await eventService.showNextOrder(temp)
      if (_v.isSuccess(res)) {
        if (_v.isHasFetch(res)) {
          if (res.data.fetch.nextOrder) {
            if (res.data.fetch.nextOrder !== '無') {
              return res.data.fetch.nextOrder
            }
            if (res.data.fetch.nextOrder === '無') {
              return null
            }
          }
        } else {
          return null
        }
      } else {
        return null
      }
    } catch (err) {
      console.log(err)
    }
  }
  const getNextOrderItem = async ({ originItem }) => {
    try {
      const temp = {
        roomId: originItem.roomId,
        bookingId: originItem.bookingId
      }
      const next = await fetchGetNextOrder(temp)
      return next
        ? await getCardDetail(next)
        : null
    } catch (err) {
      console.log(err)
    }
  }
  /** public */
  const getTooltips = async (barItem) => {
    try {
      const tooltips = []
      if (validTooltip(barItem)) {
        if (barItem.roomStatus === '4-0') {
          tooltips[0] = await getCardDetail(barItem.prev)
          tooltips[1] = await getCardDetail(barItem)
          return tooltips
        }
        if (barItem.roomStatus === '0-4') {
          tooltips[0] = await getCardDetail(barItem)
          tooltips[1] = await getCardDetail(barItem.next)
          return tooltips
        }
        if (barItem.roomStatus === '1-0') {
          tooltips[0] = await getCardDetail(barItem.prev)
          tooltips[1] = await getCardDetail(barItem)
          return tooltips
        }
        if (barItem.roomStatus === '2-0') {
          tooltips[0] = await getCardDetail(barItem)
          return tooltips
        }
        if (barItem.roomStatus === '3-0') {
          tooltips[0] = await getCardDetail(barItem)
          return tooltips
        }
        if (isHasNextOrder({ originItem: barItem })) {
          tooltips[0] = await getCardDetail(barItem)
          tooltips[1] = await getNextOrderItem({ originItem: barItem })
          return tooltips
        }
        if (!isHasNextOrder({ originItem: barItem })) {
          tooltips[0] = await getCardDetail(barItem)
          return tooltips
        }
      }
      if (!validTooltip(barItem)) {
        console.log('invalid tooltip item')
        return []
      }
    } catch (err) {
      console.log(err)
    }
  }
  const validTooltip = (item) => {
    switch (item.roomStatus) {
      case ROOM_STATUS.UNCHECKIN_KEY:
      case ROOM_STATUS.CHECKIN_KEY:
      case ROOM_STATUS.REST_KEY:
      case ROOM_STATUS.UNCHECKIN_DOUBLE_KEY:
      case ROOM_STATUS.UNCHECKIN_REST_KEY:
      case ROOM_STATUS.UNCHECKIN_RESERVE_KEY:
      case ROOM_STATUS.CHECKIN_UNCHECKIN_KEY:
      case ROOM_STATUS.CHECKIN_RESERVE_KEY:
      case ROOM_STATUS.REST_UNCHECKIN_KEY:
      case ROOM_STATUS.REST_RESERVE_KEY:
      case ROOM_STATUS.RESERVE_UNCHECKIN_KEY:
      case ROOM_STATUS.UNCLEAN_UNCHECKIN_KEY:
      case ROOM_STATUS.CLEANING_UNCHECKIN_KEY:
        return true
      default:
        return false
    }
  }
  return {
    getTooltips,
    validTooltip
  }
}
