import { createValidate } from '../helpers/createValidate'
import { createError } from '../helpers/createError'
import eventService from '../eventService'
import dayjs from 'dayjs'
const _v = createValidate()
const _error = createError()

export const createBookingRest = () => {
  const getInitTempRestBooking = (tempRestBooking) => {
    return Object.assign({}, tempRestBooking, {
      totalPrice: '',
      roomTypeId: '',
      roomId: '',
      hours: ''
    })
  }

  const getRestAvailableHour = () => {
    const today = dayjs().format('YYYY-MM-DD')
    const lastHour = dayjs(today)
      .add('1', 'day')
      .format('YYYY-MM-DD 12:00:00')
    const diff = dayjs(lastHour).diff(dayjs(), 'hours')
    return diff + 1
  }

  const fetchGetRoomType = async () => {
    try {
      const res = await eventService.showRoomType()
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

  const fetchGetHoursDefault = async ({ roomTypeId }) => {
    try {
      const res = await eventService.showHourDefault({ roomTypeId })
      if (_v.isSuccess(res)) {
        if (_v.isHasFetch(res)) {
          return res.data.fetch.hours
        } else {
          return ''
        }
      } else {
        return ''
      }
    } catch (err) {
      console.log(err)
    }
  }

  const getRestRoomTypeItems = async () => {
    const roomTypes = await fetchGetRoomType()
    if (roomTypes && roomTypes.length) {
      return roomTypes.map(el => {
        return {
          text: el.roomTypeName,
          value: el.roomTypeId
        }
      })
    }
  }

  const fetchGetRestPrice = async data => {
    try {
      const res = await eventService.showRestPrice(data)
      if (_v.isSuccess(res)) {
        if (_v.isHasFetch(res)) {
          return res.data.fetch.price
        } else {
          return ''
        }
      } else {
        return ''
      }
    } catch (err) {
      console.log(err)
    }
  }

  const fetchGetRoomNumbers = async (temp) => {
    try {
      const res = await eventService.showRestBookingRoom(temp)
      if (_v.isSuccess(res)) {
        if (_v.isHasFetch(res)) {
          return res.data.fetch.number
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

  const fetchPostRestBooking = async temp => {
    try {
      const res = await eventService.insertRestBooking(temp)
      if (_v.isSuccess(res)) {
        if (_v.isHasFetch(res)) {
          return {
            success: res.data.success,
            bookingId: res.data.fetch.bookingId,
            message: '新增成功'
          }
        } else {
          return {
            success: res.data.success,
            bookingId: '',
            message: _error.getErrMsg(res, {
              code: '50001',
              msg: '伺服器錯誤：無法取得訂單ID',
              isSystemError: true
            })
          }
        }
      } else {
        return {
          success: res.data.success,
          bookingId: '',
          message: _error.getErrMsg(res, {
            code: '60001',
            msg: '未知的錯誤',
            isSystemError: true
          })
        }
      }
    } catch (err) {
      console.log(err)
    }
  }

  const getRestRoomNumberItems = data => {
    return data && data.length
      ? data.map(el => {
        return {
          text: el.roomNumber,
          value: el.roomId
        }
      })
      : []
  }

  const getHours = (defaultHours, selectHours) => {
    let tempHours = defaultHours
    if (defaultHours > selectHours) {
      tempHours = selectHours
    } else if (defaultHours < selectHours) {
      tempHours = defaultHours + selectHours
    }
    return tempHours
  }

  return {
    getInitTempRestBooking,
    getRestAvailableHour,
    getRestRoomTypeItems,
    fetchGetRoomType,
    fetchGetHoursDefault,
    fetchGetRestPrice,
    fetchGetRoomNumbers,
    fetchPostRestBooking,
    getRestRoomNumberItems,
    getHours
  }
}
