import Vue from 'vue'
import isArray from 'lodash/isArray'
import isEmpty from 'lodash/isEmpty'
import isString from 'lodash/isString'
import isNumber from 'lodash/isNumber'
const that = Vue.prototype
export const createValidate = () => {
  /**
   * roomActions
   */
  // 判斷操作是否合法
  const isActionNotLegally = (actionType, selects) => {
    if (actionType && typeof actionType === 'string') {
      const isActionTypenNotExist = isArray(selects)
        ? selects.every(el => el.roomStatus !== actionType)
        : false
      const isUnArranged = isArray(selects)
        ? selects.every(el => el.roomNumber === null)
        : false
      const IS_EMPTY = isArray(selects) && isEmpty(selects)
      return isActionTypenNotExist || isUnArranged || IS_EMPTY
    } else {
      return false
    }
  }

  // 取得操作不合法類別
  const getErrorActionType = (actionType, selects) => {
    // 狀態錯誤
    // 資料為空
    // 資料尚未排房
    let type
    if (isString(actionType)) {
      const isActionTypenNotExist = isArray(selects)
        ? selects.every(el => el.roomStatus !== actionType)
        : false
      const isUnArranged = isArray(selects)
        ? selects.every(el => el.roomNumber === null)
        : false
      const IS_EMPTY = isArray(selects) && isEmpty(selects)
      if (isActionTypenNotExist) {
        type = 'ACTION_NOT_EXIST'
      }
      if (isUnArranged) {
        type = 'UNARRANGED'
      }
      if (IS_EMPTY) {
        type = 'EMPTY'
      }
      return type
    } else {
      return 'UNKNOW'
    }
  }

  const getMessageByActionType = (type) => {
    switch (type) {
      case 'ACTION_NOT_EXIST':
        return '該房間狀態無法進行此操作'
      case 'UNARRANGED':
        return '請先至房號安排進行排房'
      case 'EMPTY':
        return '請先勾選房號再進行此操作'
      default:
        break
    }
  }
  /**
   * checkCustomer
   */
  const isPhone = phone => {
    return isString(phone) || isNumber(phone)
      ? isString(phone)
        ? phone.length === 10
        : phone.toString().length === 10
      : false
  }

  const isIdNumber = id => {
    return isString(id) || isNumber(id)
      ? isString(id)
        ? id.length === 10
        : id.toString().length === 10
      : false
  }
  /**
   * insertBooking
   */
  const isAtLeastOne = props => {
    return props[0] !== '' || props[1] !== '' || props[2] !== ''
  }

  const isRequired = async prop => {
    return !!prop
  }

  const isEqualNumber = async (item, max) => {
    return item && max && isString(item) && isNumber(max)
      ? item.length < max || item.length === max
      : false
  }

  const validateStatusGeneral = async (temp, parts) => {
    let v1, v2, v3, v4, v5, v6, v7
    const isParts = part => {
      return parts && parts.length
        ? parts.some(el => el === part)
        : true
    }

    if (isParts('v1')) {
      v1 = await isRequired(temp.expectedCheckInTime)
      if (v1) {
        clearErrorsByRef('ibDatePickerCheckIn')
      } else {
        setErrorsByRef('ibDatePickerCheckIn', '入住日期為必填')
      }
    }

    if (isParts('v2')) {
      v2 = await isRequired(temp.expectedCheckOutTime)
      if (v2) {
        clearErrorsByRef('ibDatePickerCheckOut')
      } else {
        setErrorsByRef('ibDatePickerCheckOut', '退房日期為必填')
      }
    }

    if (isParts('v3')) {
      v3 = await isRequired(temp.customerName)
      if (v3) {
        clearErrorsByRef('ibCustomerName')
      } else {
        setErrorsByRef('ibCustomerName', '旅客姓名為必填')
      }
    }

    if (isParts('v4')) {
      v4 = await isRequired(temp.numberOfPeople)
      if (v4) {
        clearErrorsByRef('ibNumberOfPeople')
      } else {
        setErrorsByRef('ibNumberOfPeople', '入住人數為必填')
      }
    }

    if (isParts('v5')) {
      v5 = await isAtLeastOne([
        temp.customerIdNumber,
        temp.customerPassportNumber,
        temp.customerPhone
      ])

      if (v5) {
        clearErrorsByRef('ibCustomerIdNumber')
        clearErrorsByRef('ibCustomerPhoneNumber')
        clearErrorsByRef('ibCustomerPassportNumber')
      } else {
        setErrorsByRef(
          'ibCustomerPhoneNumber',
          '電話、身分證或護照號碼至少一個必填'
        )
        setErrorsByRef(
          'ibCustomerIdNumber',
          '電話、身分證或護照號碼至少一個必填'
        )
        setErrorsByRef(
          'ibCustomerPassportNumber',
          '電話、身分證或護照號碼至少一個必填'
        )
      }
    }

    if (isParts('v6')) {
      if (temp.customerIdNumber) {
        v6 = await isEqualNumber(temp.customerIdNumber, 10)
        if (v6) {
          clearErrorsByRef('ibCustomerIdNumber')
        } else {
          setErrorsByRef('ibCustomerIdNumber', '錯誤的身份證格式')
        }
      }
    }

    if (isParts('v7')) {
      if (temp.customerPhone) {
        v7 = await isEqualNumber(temp.customerPhone, 10)
        if (v7) {
          clearErrorsByRef('ibCustomerPhoneNumber')
        } else {
          setErrorsByRef('ibCustomerPhoneNumber', '錯誤的電話格式')
        }
      }
    }

    const errors = []
    if (parts && parts.length) {
      parts.forEach(el => {
        if (el !== undefined && el === false) {
          errors.push(el)
        }
      })
    } else {
      return v1 && v2 && v3 && v4 && v5
    }

    return errors.length === 0
  }

  const validateStatusReserve = async (temp, parts) => {
    const v1 = await isRequired(temp.expectedCheckInTime)
    if (!v1) {
      setErrorsByRef('ibDatePickerCheckIn', '入住日期為必填')
    } else {
      clearErrorsByRef('ibDatePickerCheckIn')
    }
    const v2 = await isRequired(temp.expectedCheckOutTime)
    if (!v2) {
      setErrorsByRef('ibDatePickerCheckOut', '退房日期為必填')
    } else {
      clearErrorsByRef('ibDatePickerCheckOut')
    }
    return v1 && v2
  }

  const validate = (temp, parts) => {
    switch (temp.roomStatus) {
      case '0':
        return validateStatusGeneral(temp, parts)
      case '6':
        return validateStatusReserve(temp, parts)
      default:
        break
    }
  }

  const isValidRoomType = async (temp, field) => {
    const types = this[temp][field].map(type => type.roomTypeNumber)
    return types.some(type => type !== '0')
  }

  const setErrorsByRef = (ref, msg) => {
    if (ref && msg) {
      that.$bus.$emit('set-errors-by-ref', { ref, msg })
    }
  }

  const clearErrorsByRef = ref => {
    if (ref) {
      that.$bus.$emit('clear-errors-by-ref', ref)
    }
  }

  /**
   * globally
   */
  const isSuccess = res => {
    return !!res.data.success
  }

  const isHasFetch = res => {
    return res.data.fetch !== null && res.data.fetch.toString() === '[object Object]'
      ? Object.keys(res.data.fetch).length > 0
      : false
  }

  const isHasProps = async (props, data) => {
    const validData = Object.keys(data) && Object.keys(data).length
    const validProp = Array.isArray(props) && props.length
    if (validData) {
      if (validProp) {
        const exists = []
        const lists = Object.keys(data)
        const result = await Promise.all(
          lists.map(async el => {
            if (!lists.findIndex(idx => idx === el)) {
              exists.push(el)
            }
            return el
          })
        )
        if (result && result.length) {
          console.log(result)
          if (exists.length) {
            return false
          } else {
            return true
          }
        } else {
          return false
        }
      } else {
        console.log('need props option')
        return false
      }
    }
  }

  const isArrays = data => {
    return Array.isArray(data) && data && data.length
  }

  const hasProperty = obj => {
    return !!(Object.keys(obj) && Object.keys(obj).length)
  }

  const isPlainObject = obj => {
    return obj !== null && obj.toString() === '[object Object]'
  }

  /**
   * payment
   */
  const isRef = (ref) => {
    return typeof ref === 'string' && ref
  }

  return {
    isPhone,
    isIdNumber,
    isSuccess,
    isHasFetch,
    isHasProps,
    isArrays,
    isPlainObject,
    hasProperty,
    validate,
    isValidRoomType,
    isRef,
    isActionNotLegally,
    getErrorActionType,
    getMessageByActionType
  }
}
