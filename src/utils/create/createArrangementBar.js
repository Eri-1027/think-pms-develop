import eventService from '../eventService'
import { convert } from '../dataTypeConvert'
import ROOM_STATUS from '@/constants/roomStatus'
import dayjs from 'dayjs'
import { createValidate } from '../helpers/createValidate'
const _v = createValidate()
export const createArrangementBar = () => {
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
            if (res.data.fetch.nextOrder !== '無') {
              return res.data.fetch.nextOrder
            }
            if (res.data.fetch.nextOrder === '無') {
              return {}
            }
          }
        } else {
          return {}
        }
      }
    } catch (err) {
      console.log(err)
    }
  }
  const isLinked = (prev, next) => {
    const prevCheckOut = dayjs(prev.expectedCheckOutTime)
      .format('YYYY-MM-DD')
    const nextCheckIn = dayjs(next.expectedCheckInTime)
      .format('YYYY-MM-DD')
    const prevCheckIn = dayjs(prev.expectedCheckInTime)
      .format('YYYY-MM-DD')
    if (
      prev.roomStatus === '4' &&
      prevCheckIn === nextCheckIn &&
      next.roomStatus !== '4'
    ) {
      return true
    }
    // 特殊狀況
    return prevCheckOut === nextCheckIn
  }
  const fetchGetRoomStatusSpecificDate = async (temp) => {
    try {
      const res = await eventService.showRoomsStatusSpecificDate(
        temp
      )
      if (_v.isSuccess(res)) {
        if (_v.isHasFetch(res)) {
          return convert.transAfterRes(
            res.data.fetch.showRoomsNumber,
            'paymentStatus'
          )
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
  const getDropBar = (data) => {
    return data.map((bar) => {
      return {
        bookingId: bar.bookingId,
        bookingDetailId: bar.bookingDetailId,
        bookingNumber: bar.bookingNumber,
        bookingNote: bar.bookingNote,
        customerName: bar.customerName,
        customerId: bar.customerId,
        customerGender: bar.customerGender,
        customerEmail: bar.customerEmail,
        customerPhone: bar.customerBar,
        expectedCheckInTime: bar.expectedCheckInTime,
        expectedCheckOutTime: bar.expectedCheckOutTime,
        roomId: bar.roomId,
        roomNumber: bar.roomNumber,
        roomStatus: bar.roomStatus,
        roomTypeId: bar.roomTypeId,
        stayingDay: bar.stayingDay
      }
    })
  }
  const getFilledBar = async (data) => {
    const tags = await setTagForProcess(data)
    if (tags && _v.isArrays(tags.trash)) {
      const cleaned = data.filter((e) => {
        return tags.trash.indexOf(e.bookingDetailId) === -1
      })
      return cleaned &&
            cleaned.length &&
            tags &&
            tags.unProcess &&
            tags.unProcess.length
        ? cleaned.map((bar) => {
          tags.unProcess.forEach((item) => {
            if (item.bookingDetailId === bar.bookingDetailId) {
              bar.roomStatus = item.roomStatus
              if (bar.roomStatus === '0-4') {
                bar.next = item.next
              }
              if (bar.roomStatus === '4-0' || bar.roomStatus === '4-6') {
                bar.prev = item.prev
              }
              if (
                bar.roomStatus === '1-0' ||
                bar.roomStatus === '2-0' ||
                bar.roomStatus === '3-0'
              ) {
                bar.prev = item.prev
              }
            }
          })
          return bar
        })
        : cleaned
    } else {
      return data
    }
  }
  const setTagForProcess = async (data) => {
    try {
      const trash = [] // 準備剔除於陣列
      const unProcess = [] // 準備加上新狀態

      const result = await Promise.all(
        data.map(async (bar, idx, ary) => {
          const nextItem = await fetchGetNextOrderItem({
            roomId: bar.roomId,
            bookingId: bar.bookingId
          })
          if (nextItem && nextItem.bookingDetailId) {
            if (bar.roomStatus === ROOM_STATUS.UNCHECKIN_REST_KEY) {
              bar.next = nextItem
              trash.push(nextItem.bookingDetailId)
            }

            if (bar.roomStatus === ROOM_STATUS.REST_UNCHECKIN_KEY) {
              trash.push(bar.bookingDetailId)
              unProcess.push({
                bookingDetailId: nextItem.bookingDetailId,
                roomStatus: ROOM_STATUS.REST_UNCHECKIN_KEY,
                prev: bar
              })
            }

            if (bar.roomStatus === ROOM_STATUS.REST_RESERVE_KEY) {
              trash.push(bar.bookingDetailId)
              unProcess.push({
                bookingDetailId: nextItem.bookingDetailId,
                roomStatus: ROOM_STATUS.REST_RESERVE_KEY,
                prev: bar
              })
            }

            if (bar.roomStatus === ROOM_STATUS.CHECKIN_UNCHECKIN_KEY) {
              trash.push(bar.bookingDetailId)
              unProcess.push({
                bookingDetailId: nextItem.bookingDetailId,
                roomStatus: ROOM_STATUS.CHECKIN_UNCHECKIN_KEY,
                prev: bar
              })
            }
            if (bar.roomStatus === ROOM_STATUS.UNCLEAN_UNCHECKIN_KEY) {
              trash.push(bar.bookingDetailId)
              unProcess.push({
                bookingDetailId: nextItem.bookingDetailId,
                roomStatus: ROOM_STATUS.UNCLEAN_UNCHECKIN_KEY,
                prev: bar
              })
            }
            if (bar.roomStatus === ROOM_STATUS.CLEANING_UNCHECKIN_KEY) {
              trash.push(bar.bookingDetailId)
              unProcess.push({
                bookingDetailId: nextItem.bookingDetailId,
                roomStatus: ROOM_STATUS.CLEANING_UNCHECKIN_KEY,
                prev: bar
              })
            }
            return bar
          }
        })
      )
      return result
        ? { trash, unProcess }
        : { trash: [], unProcess: [] }
    } catch (err) {
      console.log(err)
    }
  }
  const getRoomStatusModiferBar = async (data) => {
    try {
      const result = await Promise.all(
        data.map(async (bar, idx, ary) => {
          const nextItem = await fetchGetNextOrderItem({
            roomId: bar.roomId,
            bookingId: bar.bookingId
          })

          if (nextItem && nextItem.bookingDetailId) {
            const isLink = isLinked(bar, nextItem)
            const newStatus = `${bar.roomStatus}-${nextItem.roomStatus}`

            const isLegalMerge = (mergeStatus) => {
              switch (mergeStatus) {
                case ROOM_STATUS.UNCHECKIN_REST_KEY:
                case ROOM_STATUS.REST_UNCHECKIN_KEY:
                case ROOM_STATUS.REST_RESERVE_KEY:
                  // case ROOM_STATUS.CHECKIN_UNCHECKIN_KEY:
                  // case ROOM_STATUS.UNCLEAN_UNCHECKIN_KEY:
                  // case ROOM_STATUS.CLEANING_UNCHECKIN_KEY:
                  return true
                default:
                  return false
              }
            }

            const isLegal = isLegalMerge(newStatus)

            if (isLink && isLegal) {
              bar.roomStatus = newStatus
            }
          }
          if (idx === ary.length - 1) {
            return true
          }
          return bar
        })
      )
      if (result && result.length) {
        return data
      }
    } catch (err) {
      console.log(err)
    }
  }
  return {
    getDropBar,
    getRoomStatusModiferBar,
    fetchGetRoomStatusSpecificDate,
    setTagForProcess,
    getFilledBar
  }
}
