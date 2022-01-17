import ROOM_STATUS from '../../constants/roomStatus'
import eventService from '../eventService'
import dayjs from 'dayjs'
import { createValidate } from '../helpers/createValidate'
const _v = createValidate()
export const createCardsDailySchedule = () => {
  /**
   * 該房間訂單的預計`退房日`剛好在今天
   * @param {object} item 卡片資訊
   */
  const isExpectCheckOutIsToday = async item => {
    return dayjs(item.expectedCheckOutTime).format('YYYY-MM-DD') === dayjs().format('YYYY-MM-DD')
  }

  /**
   * 該房間訂單的預計`入住日`剛好在今天
   * @param {object} item 卡片資訊
   */
  const isExpectCheckInIsToday = async item => {
    return dayjs(item.expectedCheckInTime).format('YYYY-MM-DD') === dayjs().format('YYYY-MM-DD')
  }

  /**
   *
   */
  const fetchGetRoomsNumber = async () => {
    try {
      const res = await eventService.showRoom()
      if (_v.isSuccess(res)) {
        if (_v.isHasFetch(res)) {
          return res.data.fetch.rooms
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
   * 取得該訂單的下一筆訂單資訊
   * @param {string} roomId
   * @param {string} bookingId
   */
  const fetchGetNextOrderItem = async ({
    roomId,
    bookingId
  }) => {
    try {
      const res = await eventService.showNextOrder({
        roomId,
        bookingId
      })
      if (_v.isSuccess(res)) {
        if (_v.isHasFetch(res)) {
          if (res.data.fetch.nextOrder) {
            return res.data.fetch.nextOrder === '無'
              ? {}
              : res.data.fetch.nextOrder
          } else {
            return {}
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
  /**
   * 給定選取日期，取得當天所有房間狀態
   * @param {object} temp // { date: '2021-1-14' }
   */
  const fetchGetSpecificCards = async (temp) => {
    try {
      const res = await eventService.showSpecificCards(temp)
      if (_v.isSuccess(res)) {
        if (_v.isHasFetch(res)) {
          return _v.isArrays(res.data.fetch.showCards)
            ? res.data.fetch.showCards
            : []
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
   * 前者退房時間與後者入住時間在同一天（不能有 4-4 的狀態）
   * @param {object} prev
   * @param {object} next
   */
  const isLinked = (prev, next) => {
    const prevCheckOut = this.$date(prev.expectedCheckOutTime).format('YYYY-MM-DD')
    const nextCheckIn = this.$date(next.expectedCheckInTime).format('YYYY-MM-DD')

    // 判斷是否前者為休息後者不為休息
    return prev.roomStatus === '4' && next.roomStatus === '4'
      ? false
      : prevCheckOut === nextCheckIn
  }

  /**
   * 合法的混合狀態
   * @param {*} mergeStatus
   * @example
   * // 0-4 is legally
   * // 6-6 is illegal
   */
  const isLegalMerge = (mergeStatus) => {
    switch (mergeStatus) {
      case ROOM_STATUS.UNCHECKIN_REST_KEY:
      case ROOM_STATUS.REST_UNCHECKIN_KEY:
      case ROOM_STATUS.REST_RESERVE_KEY:
      case ROOM_STATUS.CHECKIN_UNCHECKIN_KEY:
      case ROOM_STATUS.UNCLEAN_UNCHECKIN_KEY:
      case ROOM_STATUS.CLEANING_UNCHECKIN_KEY:
        return true
      default:
        return false
    }
  }

  /**
   * 將原始房間狀態改為混合房間狀態
   * 假使一間未入住房間有撈到下一筆訂單，狀態為休息，則將狀態 0 改為 0-4
   * @param {array} specifics
   */
  const getModify = async (specifics) => {
    if (_v.isArrays(specifics)) {
      // 確保不會一下出現休訂，一下出現訂
      specifics = specifics.sort((a, b) => {
        return a.roomStatus - b.roomStatus
      })

      const result = await Promise.all(specifics.map(async (bar) => {
        const nextItem = await fetchGetNextOrderItem({
          roomId: bar.roomId,
          bookingId: bar.bookingId
        })
        if (nextItem && nextItem.bookingDetailId) {
          const newStatus = `${bar.roomStatus}-${nextItem.roomStatus}`

          if (isLegalMerge(newStatus)) {
            bar.roomStatus = newStatus
          }
        }
        return bar
      }))

      return _v.isArrays(result)
        ? result
        : []
    } else {
      return []
    }
  }

  /**
   * 如果資料有混合狀態，return merges（混合狀態的 cards）；
   * 反之，return rooms（空房間 cards）
   * @param {array} emptyRooms // 空房資料
   * @param {array} specificsRooms // 訂單資料
   * @returns {array}
   */
  const getMergeCards = async (emptyRooms, specificsRooms) => {
    if (_v.isArrays(emptyRooms)) {
      const merges = await getModify(specificsRooms)
      return (_v.isArrays(merges))
        ? merges
        : emptyRooms
    } else {
      return emptyRooms
    }
  }

  /**
   * 在 roomNumbers 找到相同的 roomId，將對應的 modifiers 塞進去，並返回一個新的陣列
   * @param {array}   // 房間
   * @param {array} modifiers // 混合狀態房間
   * @returns {array}
   */
  const fillMergesToEmptyRooms = (roomNumbers, modifiers) => {
    return _v.isArrays(modifiers)
      ? roomNumbers.map(room => {
        modifiers.forEach(modifier => {
          if (modifier.roomId === room.roomId) {
            room = {
              roomId: room.roomId,
              roomNumber: room.roomNumber,
              bookingId: modifier.bookingId,
              bookingDetailId: modifier.bookingDetailId,
              bookingNumber: modifier.bookingNumber,
              customerId: modifier.customerId,
              customerName: modifier.customerName,
              expectedCheckInTime: modifier.expectedCheckInTime,
              expectedCheckOutTime: modifier.expectedCheckOutTime,
              roomStatus: modifier.roomStatus
            }
          }
        })
        if (room.roomStatus === undefined) {
          room = {
            roomId: room.roomId,
            roomNumber: room.roomNumber,
            bookingId: '',
            bookingDetailId: '',
            bookingNumber: '',
            customerId: '',
            customerName: '',
            expectedCheckInTime: '',
            expectedCheckOutTime: '',
            roomStatus: '5'
          }
        }

        return room
      })
      : []
  }

  /**
   *
   * @param {array} roomNumbers
   * @param {array} modifiers
   */
  const getDisplayCards = (roomNumbers, modifiers) => {
    let displayCards = []
    if (_v.isArrays(roomNumbers)) {
      const filled = fillMergesToEmptyRooms(roomNumbers, modifiers)
      if (_v.isArrays(filled)) {
        filled.forEach(fill => {
          if (displayCards.length === 0) {
            displayCards.push([fill])
          } else {
            let isExist = false
            displayCards.forEach(row => {
              if (
                row[0].roomNumber[0] === fill.roomNumber[0] &&
                row[0].roomNumber.length === fill.roomNumber.length
              ) {
                row.push(fill)
                isExist = true
              }
            })
            if (!isExist) {
              displayCards.push([fill])
            }
          }
        })

        displayCards = displayCards.sort((a, b) => (+a[0].roomNumber) - (+b[0].roomNumber))
        displayCards.forEach(row => {
          row = row.sort((a, b) => (+a.roomNumber) - (+b.roomNumber))
        })

        return displayCards
      }
    }
  }
  return {
    fetchGetNextOrderItem,
    fetchGetRoomsNumber,
    fetchGetSpecificCards,
    isExpectCheckOutIsToday,
    isExpectCheckInIsToday,
    getDisplayCards,
    getMergeCards,
    isLinked
  }
}
