import eventService from '../eventService'
import { createValidate } from '../helpers/createValidate'
import { createError } from '../helpers/createError'
import STAFF from '../../constants/staff'
const _error = createError()
export const createStaff = () => {
  const fetchGetAllStaffs = async () => {
    try {
      const res = await eventService.showAllStaff()
      console.log(eventService.showAllStaff())
      const _v = createValidate()
      if (_v.isSuccess(res)) {
        if (_v.isHasFetch(res)) {
          return res.data.fetch.staffs
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
  const fetchGetStaffsForManagement = async (temp) => {
    try {
      const res = await eventService.showStaffForManagement(temp)
      const _v = createValidate()
      if (_v.isSuccess(res)) {
        if (_v.isHasFetch(res)) {
          return res.data.fetch.staffs
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

  const fetchGetStaffsForGeneral = async (temp) => {
    try {
      const res = await eventService.showStaffForNormal(temp)
      const _v = createValidate()
      if (_v.isSuccess(res)) {
        if (_v.isHasFetch(res)) {
          return res.data.fetch.staffs
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

  const fetchPostStaff = async (temp) => {
    try {
      const res = await eventService.insertStaff(temp)
      const _v = createValidate()
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
            msg: '伺服器錯誤：未知的錯誤類型',
            isSystemError: true
          })
        }
      }
    } catch (err) {
      console.log(err)
    }
  }

  const fetchPutStaff = async (temp) => {
    try {
      const res = await eventService.updateStaff(temp)
      const _v = createValidate()
      if (_v.isSuccess(res)) {
        return {
          success: res.data.success,
          message: '修改成功'
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

  const fetchDeleteStaff = async (temp) => {
    try {
      const res = await eventService.deleteStaff(temp)
      const _v = createValidate()
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
            msg: '伺服器錯誤：未知的錯誤訊息',
            isSystemError: true
          })
        }
      }
    } catch (err) {
      console.log(err)
    }
  }
  // 展示於 staff page 的人員資料
  const getStaffsByLevel = (level, staffs) => {
    if (staffs && staffs.length) {
      switch (level) {
        case STAFF.ENGINEER_KEY:
          return staffs
        case STAFF.BOSS_KEY:
        case STAFF.MANAGER_KEY:
          return staffs.filter(staff => staff.value !== STAFF.ENGINEER_KEY)
        case STAFF.COUNTER_STAFF_KEY:
        case STAFF.CLEANING_STAFF_KEY:
          return staffs.filter(staff => staff.level !== STAFF.ENGINEER_KEY || staff.level !== STAFF.BOSS_KEY || staff.level !== STAFF.MANAGER_KEY)
        default:
          return []
      }
    }
  }
  // 人員編輯、新增，選單中使用
  const getLegalLevelItemsByUser = (level, items) => {
    if (items && items.length) {
      const items2 = items.filter(staff => staff.value !== STAFF.ENGINEER_KEY)
      const items3 = items.filter(staff => staff.value !== STAFF.ENGINEER_KEY || staff.value !== STAFF.BOSS_KEY || staff.value !== STAFF.MANAGER_KEY)
      switch (level) {
        case STAFF.ENGINEER_KEY:
          return items
        case STAFF.BOSS_KEY:
        case STAFF.MANAGER_KEY:
          return items2
        case STAFF.COUNTER_STAFF_KEY:
        case STAFF.CLEANING_STAFF_KEY:
          return items3
        default:
          return []
      }
    } else {
      return {
        text: '無',
        value: null
      }
    }
  }

  const getStaffItems = (level, staffs) => {
    const filters = staffs.filter(staff => staff.staffLevel === level)
    return staffs && staffs.length
      ? getItemsStaff(filters)
      : []
  }

  const getItemsStaff = (items) => {
    return items && items.length
      ? items.map(item => {
        return {
          text: item.staffName,
          value: item.staffId
        }
      })
      : [
        {
          text: '無',
          value: null
        }
      ]
  }

  return {
    fetchGetAllStaffs,
    fetchPostStaff,
    fetchPutStaff,
    fetchDeleteStaff,
    fetchGetStaffsForManagement,
    fetchGetStaffsForGeneral,
    getStaffsByLevel,
    getLegalLevelItemsByUser,
    getStaffItems,
    getItemsStaff
  }
}
