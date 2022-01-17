import eventService from '../eventService'
import { createValidate } from '../helpers/createValidate'
const _v = createValidate()
export const createUnCheckIn = () => {
  const fetchGetUnCheckIn = async () => {
    try {
      const res = await eventService.showUnCheckIn()
      if (_v.isSuccess(res)) {
        if (_v.isHasFetch(res)) {
          return res.data.fetch.unCheckIn
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

  const fetchGetUnCheckInRoomNumbers = async (temp) => {
    try {
      const res = await eventService.showUnCheckInRoomNumber(temp)
      if (_v.isSuccess(res)) {
        if (_v.isHasFetch(res)) {
          return {
            showRoomsNumber: res.data.fetch.showRoomsNumber,
            showRoomsType: res.data.fetch.showRoomsType
          }
        } else {
          return {
            showRoomsNumber: [],
            showRoomsType: []
          }
        }
      } else {
        return {
          showRoomsNumber: [],
          showRoomsType: []
        }
      }
    } catch (err) {
      console.log(err)
    }
  }

  const fetchGetSearchUnCheckIn = async (temp) => {
    try {
      const res = await eventService.searchUnCheckIn(temp)
      if (_v.isSuccess(res)) {
        if (_v.isHasFetch(res)) {
          return res.data.fetch.unCeckIn
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

  const fetchGetParticularCustomer = async (temp) => {
    try {
      const res = await eventService.comfirmParticularCustomer(temp)
      if (_v.isSuccess(res)) {
        if (_v.isHasFetch(res)) {
          return res.data.fetch.customers
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

  const getUnCheckInModified = async (data) => {
    if (data && data.length) {
      return await Promise.all(data.map(async item => {
        const temp = { bookingId: item.bookingId }
        const res = await fetchGetUnCheckInRoomNumbers(temp)
        if (Object.keys(res)) {
          item.roomNumber = res.showRoomsNumber && res.showRoomsNumber.length
            ? res.showRoomsNumber
              .split(',')
              .join(' ')
              .trim()
            : ''
          item.roomType = res.showRoomsType && res.showRoomsType.length
            ? res.showRoomsType
              .split(',')
              .join(' ')
              .trim()
            : ''
        }
        return item
      }))
    }
  }

  const isArrayNull = (ary) => {
    return ary && ary.length
      ? ary.every(el => el === null)
      : false
  }

  /**
 *
 * @param { string } item string only
 * @param { string } ary ex. if item has join type '1-2-3', ary must be '-'
 * @param { string } str ex. if want to get join type '1,2,3', str would be set to ','
 */
  const getStringFormat = (item, [ary, str]) => {
    if (typeof item === 'string') {
      return isArrayNull(item.split(','))
        ? ''
        : item.split(ary).join(str)
    }
  }
  return {
    fetchGetUnCheckIn,
    fetchGetUnCheckInRoomNumbers,
    fetchGetSearchUnCheckIn,
    fetchGetParticularCustomer,
    getUnCheckInModified,
    getStringFormat
  }
}
