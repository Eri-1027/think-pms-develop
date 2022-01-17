import eventService from '../eventService'
import { createValidate } from '../helpers/createValidate'
const _v = createValidate()

export const createCustomer = () => {
  const fetchGetSearchCustomer = async (temp) => {
    try {
      const res = await eventService.showSearchCustomer(temp)
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

  const fetchGetCustomer = async (temp) => {
    try {
      const res = await eventService.showCustomer(temp)
      if (_v.isSuccess(res)) {
        if (_v.isHasFetch(res)) {
          return {
            pages: res.data.fetch.pages,
            customer: res.data.fetch.customer
          }
        } else {
          return {
            pages: res.data.fetch.pages,
            customer: []
          }
        }
      } else {
        return {
          pages: null,
          customer: []
        }
      }
    } catch (err) {
      console.log(err)
    }
  }

  const fetchGetSearchDateCustomer = async (temp) => {
    try {
      const res = await eventService.showSearchDateCustomer(temp)
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

  const fetchGetSearchDateCustomerAsc = async (temp) => {
    try {
      const res = await eventService.showSearchDateCustomerAsc(temp)
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

  const fetchGetCustomerDetail = async (temp) => {
    try {
      const res = await eventService.showCustomerDetail(temp)
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

  const fetchPutCustomer = async (temp) => {
    try {
      const res = await eventService.updateCustomer(temp)
      return !!_v.isSuccess(res)
    } catch (err) {
      console.log(err)
    }
  }

  const fetchDeleteCustomer = async (temp) => {
    try {
      const res = await eventService.deleteCustomer(temp)
      return !!_v.isSuccess(res)
    } catch (err) {
      console.log(err)
    }
  }

  const fetchGetCustomerHistoryBooking = async (temp) => {
    try {
      const res = await eventService.customerHistoryBooking(temp)
      if (_v.isSuccess(res)) {
        if (_v.isHasFetch(res)) {
          return res.data.fetch.customerHistoryBooking
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

  const createSearchingByOrder = (config) => {
    if (config && config.searchOrder) {
      // 新到舊
      if (config.searchOrder === '0') {
        return fetchGetSearchDateCustomerAsc
      }
      // 舊到新
      if (config.searchOrder === '1') {
        return fetchGetSearchDateCustomer
      }
    }
  }

  return {
    fetchGetSearchCustomer,
    fetchGetCustomer,
    fetchGetSearchDateCustomer,
    createSearchingByOrder,
    fetchGetCustomerDetail,
    fetchPutCustomer,
    fetchDeleteCustomer,
    fetchGetCustomerHistoryBooking
  }
}
