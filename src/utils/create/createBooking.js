import { createValidate } from '../helpers/createValidate'
import { createPayment } from './createPayment'
import { createRoomType } from './createRoomType'
import { createError } from '../helpers/createError'
import eventService from '../eventService'
import isArray from 'lodash/isArray'
import isString from 'lodash/isString'
import pick from 'lodash/pick'
const _v = createValidate()
const _payment = createPayment()
const _roomType = createRoomType()
const _error = createError()

export const createBooking = () => {
  /**
   * 手機、身分證、護照，導入使用者資料
   */
  const fetchGetCustomerByCheck = async (temp) => {
    const res = await eventService.checkCustomer(temp)
    if (_v.isSuccess(res)) {
      if (_v.isHasFetch(res)) {
        return res.data.fetch.customer
      } else {
        return []
      }
    } else {
      return []
    }
  }

  const fetchGetRoomNumber = async data => {
    try {
      const res = await eventService.getRoomNumber(data)
      console.log(data)
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

  const fetchPostDiscountAndType = async data => {
    try {
      const res = await eventService.showDiscountAndType(data)
      if (_v.isSuccess(res)) {
        if (_v.isHasFetch(res)) {
          return res.data.fetch.discounts
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

  const fetchPostBooking = async temp => {
    try {
      const res = await eventService.insertBooking(temp)
      if (_v.isSuccess(res)) {
        if (_v.isHasFetch(res)) {
          return {
            bookingId: res.data.fetch.bookingId,
            bookingNumber: res.data.fetch.bookingNumber
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
   * 表單驗證全部
   */
  const validatePostBookingAll = async (temp) => {
    return _v.validate(temp)
  }

  /**
   * 表單驗證部分
   */
  const validatePostBookingPart = async (temp, parts) => {
    return _v.validate(temp, parts)
  }

  /**
   * 新增訂單後的初始化收款（每筆訂單新增後都會紀錄一筆空的付款資料）
   */
  const doPaymentInitBooking = async (bookingId) => {
    const success = await _payment.fetchPostPayment({
      staffId: '0',
      paymentType: '7',
      paymentMethod: '4',
      paymentAmount: '0',
      paymentNote: [],
      taxNumber: '',
      bookingId
    })
    return success
  }

  const getFetchGetRoomNumberTemp = async (roomTypes, { checkInTime, checkOutTime }) => {
    return isArray(roomTypes)
      ? {
        roomTypeId: roomTypes.map(el => el.roomTypeId), // must be array
        roomTypeName: roomTypes.map(el => el.roomTypeName), // must be array
        fromDate: checkInTime,
        endDate: checkOutTime
      }
      : {}
  }

  const getTempFetchPostAutoArrange = async (bookingId, tempBooking) => {
    if (_v.isPlainObject(tempBooking) && _v.hasProperty(tempBooking)) {
      return {
        bookingId,
        roomTypeId: tempBooking.roomType
          .map(el => el.roomTypeId)
          .join(','),
        fromDate: tempBooking.expectedCheckInTime,
        endDate: tempBooking.expectedCheckOutTime
      }
    } else {
      return {}
    }
  }

  const fetchPostAutoArrange = async temp => {
    try {
      const res = await eventService.automaticArrangingRoomNumber(temp)
      if (_v.isSuccess(res)) {
        if (_v.isHasFetch(res)) {
          return {
            success: true,
            message: '自動排房成功',
            roomNumbers: res.data.fetch.message
          }
        } else {
          return {
            success: false,
            message: _error.getErrMsg(res, {
              code: '60001',
              msg: '錯誤：自動排房失敗',
              isSystemError: true
            })
          }
        }
      } else {
        return {
          success: false,
          message: _error.getErrMsg(res, {
            code: '60001',
            msg: '錯誤：自動排房失敗',
            isSystemError: true
          })
        }
      }
    } catch (err) {
      console.log(err)
    }
  }

  const getAvailableRoomNumbers = async ({
    checkInTime,
    checkOutTime
  }) => {
    const roomTypes = await _roomType.fetchGetRoomTypes()
    if (isArray(roomTypes)) {
      const temp = await getFetchGetRoomNumberTemp(roomTypes,
        { checkInTime, checkOutTime })
      const numbers = await fetchGetRoomNumber(temp)
      return isString(numbers) && numbers !== ''
        ? numbers
        : ''
    } else {
      return ''
    }
  }

  const getLegalAvailableRoomNumbers = async ({
    checkInTime,
    checkOutTime
  }) => {
    const result = await getAvailableRoomNumbers({
      checkInTime,
      checkOutTime
    })
    if (result) {
      const roomNumbers = result.split(',')
      if (roomNumbers[roomNumbers.length] === '') {
        roomNumbers.splice(roomNumbers.length, 1)
      }
      return roomNumbers.slice(0, roomNumbers.length)
    }
  }

  const getAvailableDiscounts = async () => {
    let discounts = []
    const roomTypes = await _roomType.fetchGetRoomTypes()
    const roomTypeIds = roomTypes.map(el => el.roomTypeId)
    if (!roomTypes.length) throw new Error('roomTypes.length got empty')
    for (let i = 0; i < roomTypes.length; i++) {
      const data = { roomTypeId: roomTypeIds[i] }
      const result = await fetchPostDiscountAndType(data)
      if (!result) {
        discounts = []
      } else {
        discounts = discounts.concat(result)
      }
    }
    return discounts
  }

  const getItemsRoomType = async ({ checkInTime, checkOutTime }) => {
    const roomNumbers = await getLegalAvailableRoomNumbers({ checkInTime, checkOutTime })
    const discounts = await getAvailableDiscounts()
    const result = await Promise.all([roomNumbers, discounts])
    if (!result.length) return
    const roomTypes = await _roomType.fetchGetRoomTypes()
    const roomTypeItems = roomTypes.map((el, index) => {
      return {
        roomTypeId: el.roomTypeId,
        roomTypeName: el.roomTypeName,
        roomTypeNumber: roomNumbers[index],
        discount: [],
        roomAccommodate: el.roomAccommodate
      }
    })

    const newDiscountData = discounts.map((el, index) => {
      if (el.discountFor) {
        el.discountFor = el.discountFor.split(',') // change "1,2,2,3" to ["1","2","2","3"]
        if (!el.discountFor[el.discountFor.length]) {
          el.discountFor.splice(el.discountFor.length, 1)
          return el
        }
        if (!el.discountFor[index]) {
          el.discountFor.splice(index, 1)
          return el
        }
      }
      return el
    })

    newDiscountData.forEach(el => {
      roomTypeItems.forEach(el2 => {
        el.discountFor.forEach(el3 => {
          if (el3 === el2.roomTypeId) {
            el2.discount.push({
              text: el.discountName,
              value: el.discountId
            })
          }
        })
      })
    })
    return roomTypeItems
  }

  const getTempRoomType = data => {
    return data.map(el => {
      el = pick(el, ['roomTypeId'])
      el.roomTypeNumber = '0'
      return el
    })
  }

  const getTempDiscountId = len => {
    const newDiscountId = []
    for (let i = 0; i < len; i++) {
      newDiscountId[i] = '0'
    }
    return newDiscountId
  }

  const dispatchActions = async (type, bookingId, tempBooking) => {
    if (type === 'HAND_ARRANGE') {
      return {
        success: true,
        message: '手動排房成功'
      }
    }
    if (type === 'AUTO_ARRANGE') {
      const temp = await getTempFetchPostAutoArrange(bookingId, tempBooking)
      const res = await fetchPostAutoArrange(temp)
      const {
        success,
        message,
        roomNumbers
      } = res
      if (res) {
        return {
          success,
          message,
          roomNumbers
        }
      } else {
        return {
          success,
          message
        }
      }
    }
  }

  const getInitTempBooking = (tempBooking) => {
    return Object.assign({}, tempBooking, {
      expectedCheckInTime: '',
      expectedCheckOutTime: '',
      stayingDay: '',
      numberOfPeople: '',
      bookingNote: '',
      roomType: [],
      discountId: [],
      roomStatus: '0',
      customerName: '',
      customerGender: '',
      customerPhone: '',
      customerEmail: '',
      customerNationality: '',
      customerIdNumber: '',
      customerPassportNumber: '',
      count: ''
    })
  }

  return {
    fetchPostBooking,
    fetchGetCustomerByCheck,
    getTempRoomType,
    getTempDiscountId,
    getItemsRoomType,
    dispatchActions,
    validatePostBookingAll,
    validatePostBookingPart,
    doPaymentInitBooking,
    getInitTempBooking
  }
}
