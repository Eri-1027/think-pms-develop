import eventService from '../eventService'
import dayjs from 'dayjs'
import ROOM_STATUS from '../../constants/roomStatus'
import { createValidate } from '../helpers/createValidate'
const _v = createValidate()

export const createRooms = () => {
  // service

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
          return res.data.fetch.nextOrder === '無'
            ? false
            : res.data.fetch.nextOrder
        } else {
          return false
        }
      } else {
        return false
      }
    } catch (err) {
      console.log(err)
    }
  }

  const fetchGetSpecificCards = async (temp) => {
    try {
      const res = await this.$eventService.showSpecificCards(temp)
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

  // check
  const isExpectCheckOutIsToday = async item => {
    return dayjs(item.expectedCheckOutTime).format('YYYY-MM-DD') === dayjs.format('YYYY-MM-DD')
  }

  const isExpectCheckInIsToday = async item => {
    return dayjs(item.expectedCheckInTime).format('YYYY-MM-DD') === dayjs.format('YYYY-MM-DD')
  }

  const isLegalMergeStatus = (mergeStatus) => {
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

  // get set
  const getSortRoomsByStatus = (data) => {
    return _v.isArrays(data)
      ? data.sort((a, b) => a.roomStatus - b.roomStatus)
      : []
  }

  const setNewStatusLoop = async (data) => {
    const result = await Promise.all(data.map(async item => {
      const nextItem = await fetchGetNextOrderItem({
        roomId: item.roomId,
        bookingId: item.bookingId
      })
      if (nextItem && nextItem.bookingDetailId) {
        const newStatus = `${item.roomStatus}-${nextItem.roomStatus}`
        if (isLegalMergeStatus(newStatus)) {
          item.roomStatus = newStatus
        }
      }
      return item
    }))
    return _v.isArrays(result)
      ? result
      : []
  }

  const getRoomModify = async (specifics) => {
    if (_v.isArrays(specifics)) {
      specifics = getSortRoomsByStatus(specifics)
      return await setNewStatusLoop(specifics)
    } else {
      return []
    }
  }

  const getRoomsByPropsRequired = async (rooms) => {
    const roomConfig = {
      roomId: '',
      roomNumber: '',
      bookingId: '',
      bookingDetailId: '',
      bookingNumber: '',
      customerId: '',
      customerName: '',
      expectedCheckInTime: '',
      expectedCheckOutTime: '',
      roomStatus: '5'
    }
    return (_v.isArrays(rooms))
      ? rooms.map(room => Object.assign(roomConfig, room))
      : []
  }

  const getMergeCards = async (rooms, specifics) => {
    if (_v.isArrays(rooms)) {
      specifics = getRoomsByPropsRequired(specifics)
      rooms = getRoomsByPropsRequired(rooms)
      const merges = await getRoomModify(specifics)
      return (_v.isArrays(merges))
        ? merges
        : rooms
    } else {
      return rooms
    }
  }

  const getDisplayCards = (roomNumbers, modifiers) => {
    let displays = []
    if (_v.isArrays(roomNumbers)) {
      for (let i = 0; i < modifiers.length; i++) {
        if (displays.length === 0) {
          displays.push([modifiers[i]])
        } else {
          let isExist = false
          displays.forEach(row => {
            if (
              row[0].roomNumber[0] === modifiers[i].roomNumber[0] &&
                row[0].roomNumber.length === modifiers[i].roomNumber.length
            ) {
              row.push(modifiers[i])
              isExist = true
            }
          })
          if (!isExist) {
            displays.push([modifiers[i]])
          }
        }
      }
      displays = displays.sort((a, b) => +a[0].roomNumber - +b[0].roomNumber)
      displays.forEach(row => {
        row = row.sort((a, b) => +a.roomNumber - +b.roomNumber)
      })
      return displays
    } else {
      return []
    }
  }

  // depreciate
  const isLinked = (prev, next) => {
    const prevCheckOut = dayjs(prev.expectedCheckOutTime).format('YYYY-MM-DD')
    const nextCheckIn = dayjs(next.expectedCheckInTime).format('YYYY-MM-DD')
    return prev.roomStatus === '4' && next.roomStatus !== '4'
      ? true
      : prevCheckOut === nextCheckIn
  }

  return {
    fetchGetNextOrderItem,
    fetchGetRoomsNumber,
    fetchGetSpecificCards,
    isExpectCheckOutIsToday,
    isExpectCheckInIsToday,
    getSortRoomsByStatus,
    getDisplayCards,
    getMergeCards,
    isLinked
  }
}
