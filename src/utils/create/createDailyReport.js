import eventService from '../eventService'
import { createValidate } from '../helpers/createValidate'
import { createError } from '../helpers/createError'
import dayjs from 'dayjs'
const _v = createValidate()
const _error = createError()
export const createDailyReport = () => {
  // service
  const fetchGetDailyReport = async (temp) => {
    try {
      const res = await eventService.showDailyReport(temp)
      console.log(res)
      if (_v.isSuccess(res)) {
        if (_v.isHasFetch(res)) {
          return {
            pages: res.data.fetch.pages,
            dailyReport: res.data.fetch.dailyReport,
            dailyPayment: res.data.fetch.dailyPayment,
            dailyDifference: res.data.fetch.dailyDifference,
            dailyPrice: res.data.fetch.dailyPrice,
            dailyPaymentPriceAndType: res.data.fetch.dailyPaymentPriceAndType
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

  const fetchGetParticularDailyReport = async (temp) => {
    try {
      const res = await eventService.showParticularDailyReport(temp)
      console.log(res)
      if (_v.isSuccess(res)) {
        if (_v.isHasFetch(res)) {
          return {
            success: res.data.success || true,
            pages: res.data.fetch.pages,
            dailyReport: res.data.fetch.dailyReport,
            dailyPayment: res.data.fetch.dailyPayment,
            dailyDifference: res.data.fetch.dailyDifference,
            dailyPrice: res.data.fetch.dailyPrice,
            dailyPaymentPriceAndType: res.data.fetch.dailyPaymentPriceAndType
          }
        } else {
          return {
            success: false,
            message: '沒有資料'
          }
        }
      } else {
        return {
          success: true,
          message: _error.getErrMsg({
            code: '60001',
            msg: '伺服器錯誤：未知的錯誤類型',
            isSystemError: true
          })
        }
      }
    } catch (err) {
      console.log(err)
    }
  }

  const fetchGetDailyReportBothDate = async (temp) => {
    try {
      const res = await eventService.showDailyReportBothDate(temp)
      console.log(res)
      if (_v.isSuccess(res)) {
        if (_v.isHasFetch(res)) {
          return {
            pages: res.data.fetch.pages,
            dailyReport: res.data.fetch.dailyReport,
            dailyPayment: res.data.fetch.dailyPayment,
            dailyDifference: res.data.fetch.dailyDifference,
            dailyPrice: res.data.fetch.dailyPrice,
            dailyPaymentPriceAndType: res.data.fetch.dailyPaymentPriceAndType
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

  const fetchGetDailyReportBothDateAll = async (temp) => {
    try {
      const res = await eventService.showDailyReportBothDateAll(temp)
      console.log(res)
      if (_v.isSuccess(res)) {
        if (_v.isHasFetch(res)) {
          return {
            pages: res.data.fetch.pages,
            dailyReport: res.data.fetch.dailyReport,
            dailyPayment: res.data.fetch.dailyPayment,
            dailyDifference: res.data.fetch.dailyDifference,
            dailyPrice: res.data.fetch.dailyPrice,
            dailyPaymentPriceAndType: res.data.fetch.dailyPaymentPriceAndType
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

  const isRepeat = (bookingNumber, exists) => {
    return exists.length
      ? exists.some(el => el === bookingNumber)
      : false
  }

  const getSortDailyReport = (data) => {
    const newFetchData = []
    data.forEach(rawItem => {
      if (typeof dayjs(rawItem.paymentDatetime).format('YYYY/MM/DD') === 'string') {
        if (newFetchData.length === 0) {
          newFetchData.push([rawItem])
        } else {
          let isExist = false
          newFetchData.forEach(row => {
            if (dayjs(row[0].paymentDatetime).format('YYYY/MM/DD') === dayjs(rawItem.paymentDatetime).format('YYYY/MM/DD')) {
              row.push(rawItem)
              isExist = true
            }
          })
          if (!isExist) {
            newFetchData.push([rawItem])
          }
        }
      }
    })
    return newFetchData
  }

  const getDailyReportByAction = async (actionType, temp) => {
    const actions = new Map([
      ['page-created', fetchGetDailyReport], // TheDailyReport 頁面初始化時
      ['date', fetchGetParticularDailyReport],
      ['both-date', fetchGetDailyReportBothDate],
      ['both-date-all', fetchGetDailyReportBothDateAll]
    ])
    const action = actions.get(actionType)
    const fetchDailyReport = await action(temp)
    const merge = await getMergeDailyReport(fetchDailyReport.dailyReport)
    if (merge.length) {
      return await getSortDailyReport(merge)
    }
  }

  const getRepeatBookingNumber = (data) => {
    const bookingNumber = data.map(el => el.bookingNumber)
    return bookingNumber.filter((el, idx, arr) => {
      return arr.indexOf(el) !== idx
    })
  }

  const getSetBookingNumber = (data) => {
    return data.filter((element, index, arr) => {
      return arr.indexOf(element) === index
    })
  }
  // required
  const getMergeDailyReport = async (data) => {
    const repeatBookingNumbers = getRepeatBookingNumber(data)
    const setBookingNumbers = getSetBookingNumber(repeatBookingNumbers)
    const exists = []

    const tagExistItems = data.map((booking, index) => {
      setBookingNumbers.forEach(number => {
        if (booking.bookingNumber === number) {
          if (isRepeat(booking.bookingNumber, exists)) {
            booking.isRepeat = true
            return booking
          } else {
            booking.isRepeat = false
            exists.push(booking.bookingNumber)
            return booking
          }
        }
      })
      return booking
    })
    const drop = tagExistItems.map((el, index) => {
      if (!el.isRepeat) {
        el.paymentTypes = []
        el.paymentMethods = []
        el.paymentAmounts = []
        return el
      }
    }).filter(el => {
      return el
        ? el.bookingNumber
        : false
    })

    drop.map(el => {
      data.forEach(booking => {
        if (booking.bookingNumber === el.bookingNumber) {
          el.paymentTypes.push(booking.paymentType)
          el.paymentMethods.push(booking.paymentMethod)
          el.paymentAmounts.push(booking.paymentAmount)
          return el
        }
      })
    })
    return drop
  }

  return {
    fetchGetDailyReport,
    fetchGetParticularDailyReport,
    fetchGetDailyReportBothDate,
    fetchGetDailyReportBothDateAll,
    getSortDailyReport,
    getDailyReportByAction,
    getMergeDailyReport,
    getRepeatBookingNumber
  }
}
