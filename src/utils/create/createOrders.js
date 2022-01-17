import eventService from '../eventService'
import { createValidate } from '../helpers/createValidate'
// import { createError } from './createError'
const _v = createValidate()

export const createOrders = () => {
  // 預設一進入畫面的
  const fetchGetOrders = async temp => {
    try {
      const res = await eventService.showOrders(temp)
      if (_v.isSuccess(res)) {
        if (_v.isHasFetch(res)) {
          return {
            page: res.data.fetch.page,
            showOrders: res.data.fetch.showOrders
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

  const fetchGetOrdersByKeywordDateAndType = async temp => {
    try {
      const res = await eventService.showOrdersSearchingBoth(temp)
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

  // 夠過 start, end 還有 type
  const fetchGetOrdersByDateAndType = async temp => {
    try {
      const res = await eventService.showOrdersSearchingDate(temp)
      if (_v.isSuccess(res)) {
        if (_v.isHasFetch(res)) {
          return res.data.fetch.showOrders
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

  // 專門關鍵字用
  const fetchGetOrdersByKeywords = async temp => {
    try {
      const res = await eventService.showOrdersSearching(temp)
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

  const fetchGetOrderDetail = async temp => {
    try {
      const res = await eventService.showOrdersDetail(temp)
      if (_v.isSuccess(res)) {
        if (_v.isHasFetch(res)) {
          return res.data.fetch.showOrders
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

  const getBulbReapetNumber = (ary, key) => {
    const counter = {}
    ary.forEach(el => {
      counter[el] = (counter[el] || 0) + 1
    })
    const val = counter[key]
    if (key === undefined) {
      return counter
    }
    return val === undefined
      ? 0
      : val
  }

  // 將 orders 做上記號，方便彩色的條狀呈現
  const getModifierOrders = async data => {
    try {
      for (let i = 0; i < data.length; i++) {
        let bulbItems = []
        const roomCards = await fetchGetOrderDetail({
          bookingId: data[i].bookingId
        })
        if (roomCards && roomCards.length) {
          bulbItems = roomCards.map(el => {
            return el.roomStatus
          })
          if (bulbItems && bulbItems.length) {
            data[i].bulbItems = []
            data[i].bulbItems[0] = getBulbReapetNumber(bulbItems, '0')
            data[i].bulbItems[1] = getBulbReapetNumber(bulbItems, '1')
            data[i].bulbItems[2] = getBulbReapetNumber(bulbItems, '2')
            data[i].bulbItems[3] = getBulbReapetNumber(bulbItems, '3')
            data[i].bulbItems[4] = getBulbReapetNumber(bulbItems, '4')
            data[i].bulbItems[5] = getBulbReapetNumber(bulbItems, '5')
            data[i].bulbItems[6] = getBulbReapetNumber(bulbItems, '6')
            data[i].bulbItems[7] = getBulbReapetNumber(bulbItems, '7')
          }
        }
      }
      return data
    } catch (err) {
      console.log(err)
    }
  }

  const setOrdersCheckboxStatus = (orders) => {
    return orders && orders.length
      ? orders.map(order => {
        if (Object.keys(order)) {
          if (order.roomNumber === null) {
            order.disabled = true
          }
        }
        return order
      })
      : []
  }

  const getTempSearch = (currentPage, settings) => {
    const {
      fromDate,
      endDate,
      search,
      dateType
    } = settings
    const isOnlyKeywords = () => {
      return !fromDate && !endDate && search
    }
    const isOnlyDate = () => {
      return (fromDate !== '' || endDate !== '') && dateType
    }
    const isBothDateAndKeyword = () => {
      return (fromDate || endDate || search) && dateType
    }
    if (isOnlyKeywords()) {
      return {
        currentPage,
        search
      }
    }
    if (isOnlyDate()) {
      return {
        currentPage,
        dateType,
        fromDate,
        endDate
      }
    }
    if (isBothDateAndKeyword()) {
      return {
        currentPage,
        search,
        dateType,
        fromDate,
        endDate
      }
    }
  }

  /**
   *
   * @param {string} dateType
   * @param {string} fromDate
   * @param {string} endDate
   * @param {string} search
   * @param {string} dateType
   * @returns {function}
   */
  const createSearchOrders = settings => {
    const {
      fromDate,
      endDate,
      search,
      dateType,
      currentDay
    } = settings
    if (!search && !dateType) {
      console.log('dateType is required')
    }
    if (currentDay) {
      const isOnlyKeywords = () => {
        return !fromDate && !endDate && search
      }
      const isOnlyDate = () => {
        return (fromDate !== '' || endDate !== '') && dateType
      }
      const isBothDateAndKeyword = () => {
        return (fromDate || endDate) && search && dateType
      }
      if (isOnlyKeywords()) {
        return fetchGetOrdersByKeywords
      }
      if (isOnlyDate()) {
        return fetchGetOrdersByDateAndType
      }
      if (isBothDateAndKeyword()) {
        return fetchGetOrdersByKeywordDateAndType
      }
    } else {
      console.log('currentDay is required')
    }
  }

  return {
    fetchGetOrdersByKeywordDateAndType,
    fetchGetOrdersByDateAndType,
    fetchGetOrdersByKeywords,
    fetchGetOrders,
    fetchGetOrderDetail,
    getBulbReapetNumber,
    getModifierOrders,
    setOrdersCheckboxStatus,
    getTempSearch,
    createSearchOrders
  }
}
