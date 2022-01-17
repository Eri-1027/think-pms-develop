import eventService from '../eventService'
import dayjs from 'dayjs'
import { createValidate } from '../helpers/createValidate'
import { createError } from '../helpers/createError'
const _v = createValidate()
const _error = createError()

export const createDiscount = () => {
  const isPermanent = (item) => {
    return item.discountStartDate === '' || item.discountEndDate === ''
  }

  const isEmptyDate = (discount) => {
    return (
      discount.discountStartDate === '0000-00-00' ||
      discount.discountEndDate === '0000-00-00'
    )
  }

  // service
  const fetchGetDiscount = async () => {
    try {
      const res = await eventService.showDiscount()
      if (_v.isSuccess(res)) {
        if (_v.isHasFetch(res)) {
          return {
            success: true,
            discounts: res.data.fetch.discounts,
            message: ''
          }
        } else {
          return {
            success: false,
            discounts: [],
            message: '沒有資料'
          }
        }
      } else {
        return {
          success: false,
          discounts: [],
          message: _error.getErrMsg(res, {
            code: '60001',
            msg: '伺服器錯誤：未知的錯誤訊息',
            isSystemError: true
          })
        }
      }
    } catch (err) {
      console.log(err)
    }
  }

  const fetchPostDiscount = async (temp) => {
    try {
      const res = await eventService.insertDiscount(temp)
      if (_v.isSuccess(res)) {
        return {
          success: res.data.success,
          message: '新增成功'
        }
      } else {
        return {
          success: res.data.success,
          message: _error.getErrMsg(res, {
            code: '60001',
            msg: '伺服器錯誤：未知的錯誤訊息',
            isSystemError: true
          })
        }
      }
    } catch (err) {
      console.log(err)
    }
  }

  const fetchPutDiscount = async (temp) => {
    try {
      const res = await eventService.updateDiscount(temp)
      if (_v.isSuccess(res)) {
        return {
          success: res.data.success,
          message: '更新成功'
        }
      } else {
        return {
          success: res.data.success,
          message: _error.getErrMsg(res, {
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

  const fetchDeleteDiscount = async (temp) => {
    try {
      const res = await eventService.deleteDiscount(temp)
      if (_v.isSuccess(res)) {
        return {
          success: res.data.success,
          message: '刪除成功'
        }
      } else {
        return {
          success: res.data.success,
          message: _error.getErrMsg(res, {
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

  const getInitTempDiscount = () => {
    return JSON.parse(JSON.stringify({
      discountName: '',
      discountDescription: '',
      salesChannel: [],
      discountType: '',
      discountPercentage: '',
      discountCustomize: '',
      discountStartDate: dayjs().format('YYYY-MM-DD'),
      discountEndDate: '',
      discountFor: [],
      discountEnable: true
    }))
  }

  const getValidDiscountDate = (discount) => {
    if (discount && (discount.discountStartDate || discount.discountEndDate)) {
      discount.discountStartDate = ''
      discount.discountEndDate = ''
    }
    return discount
  }

  const getArrayed = (item) => {
    if (item.discountFor) {
      if (typeof item.discountFor === 'string') {
        item.discountFor = item.discountFor.split(',')
      }
    } else {
      item.discountFor = []
    }
    return item
  }

  const getDiscounts = data => {
    // need change `0000-00-00`, discountEnable
    return data && data.length
      ? data.map(discount => {
        if (isEmptyDate(discount)) {
          discount = getValidDiscountDate(discount)
        }
        discount = getArrayed(discount)
        return discount
      })
      : []
  }

  // 取得新增專案的適用房型選項
  const getRoomTypeItems = data => {
    if (data && data.length) {
      const set = new Set(data.map(el => el.roomTypeName))
      const newFetchData = Array
        .from(set)
        .map(el => {
          return {
            roomTypeName: el,
            roomTypeId: null
          }
        })
      data.forEach(el => {
        newFetchData.forEach(el2 => {
          if (el2.roomTypeName === el.roomTypeName) {
            el2.roomTypeId = el.roomTypeId
          }
        })
      })
      return newFetchData
    } else {
      return []
    }
  }

  return {
    fetchGetDiscount,
    fetchPostDiscount,
    fetchPutDiscount,
    fetchDeleteDiscount,
    getInitTempDiscount,
    isPermanent,
    getDiscounts,
    getRoomTypeItems
  }
}
