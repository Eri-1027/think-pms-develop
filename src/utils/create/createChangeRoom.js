import eventService from '../eventService'
import { createError } from '../helpers/createError'
import { createValidate } from '../helpers/createValidate'
import { createUtils } from '../helpers/createUtils'
const _v = createValidate()
const _utils = createUtils()
const _error = createError()

export const createChangeRoom = () => {
  const fetchGetRoomTypes = async () => {
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

  const fetchGetRoomNumbers = async (temp) => {
    try {
      const res = await eventService.showSpecificRoomNumber(temp)
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

  const fetchGetDiscountAndType = async (temp) => {
    try {
      const res = await eventService.showDiscountAndType(temp)
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

  const fetchPostChangeRoom = async (temp) => {
    try {
      const res = await eventService.changeRoom(temp)
      if (_v.isSuccess(res)) {
        if (_v.isHasFetch(res)) {
          // 多加這行判斷，是因為 後端 把 api 回傳錯誤訊息塞在 roomNumber
          if (!isNaN(+res.data.fetch.roomNumber)) {
            return {
              success: res.data.success,
              message: '換房成功',
              roomNumber: res.data.fetch.roomNumber
            }
          } else {
            return {
              success: false,
              message: _error.getErrMsg(res, {
                code: '60001',
                msg: '房型操作失敗，此房間已住人',
                isSystemError: false
              })
            }
          }
        } else {
          return {
            success: false,
            messasge: '伺服器錯誤：沒有回傳資料'
          }
        }
      } else {
        return {
          success: false,
          message: _error.getErrMsg(res, {
            code: '60001',
            msg: '未知錯誤類型',
            isSystemError: false
          })
        }
      }
    } catch (err) {
      console.log(err)
    }
  }

  const getRestRoomTypeItems = async (data) => {
    return data && data.length
      ? data.map(el => {
        return {
          text: el.roomTypeName,
          value: el.roomTypeId
        }
      })
      : []
  }

  const getRoomNumberItems = async (data) => {
    return data && data.length
      ? _utils.getSortedByProp(data.map(el => {
        return {
          text: el.roomNumber,
          value: el.roomId
        }
      }), 'text', true)
      : []
  }

  const getDiscountItems = async (data) => {
    return data && data.length
      ? data.map(el => {
        return {
          text: el.discountName,
          value: el.discountId
        }
      })
      : []
  }
  return {
    fetchGetRoomTypes,
    fetchGetRoomNumbers,
    fetchGetDiscountAndType,
    fetchPostChangeRoom,
    getRestRoomTypeItems,
    getRoomNumberItems,
    getDiscountItems
  }
}
