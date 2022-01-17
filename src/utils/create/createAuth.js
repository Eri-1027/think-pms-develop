import { createValidate } from '../helpers/createValidate'
// import { createError } from '../helpers/createError'
import eventService from '../eventService'
// import isArray from 'lodash/isArray'
// import isString from 'lodash/isString'
// import pick from 'lodash/pick'
const _v = createValidate()
// const _error = createError()

export const createAuth = () => {
  const fetchPostUserLogin = async (temp) => {
    const res = await eventService.userLogin(temp)
    console.log(temp)
    if (_v.isSuccess(res)) {
      if (_v.isHasFetch(res)) {
        if (!res.data.JWT.jwt) {
          return {
            success: false,
            message: '找不到 Token'
          }
        }
        if (!res.data.fetch.hotelId) {
          return {
            success: false,
            message: '找不到 hotelId'
          }
        }
        if (!res.data.fetch.staff.length) {
          return {
            success: false,
            message: '找不到 staff'
          }
        }
        return {
          success: true,
          payload: res.data

        }
      } else {
        return {
          success: false,
          payload: null
        }
      }
    } else {
      return {
        success: false,
        payload: null
      }
    }
  }
  return {
    fetchPostUserLogin
  }
}
