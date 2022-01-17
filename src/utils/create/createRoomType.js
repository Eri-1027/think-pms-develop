import eventService from '../eventService'
import { createValidate } from '../helpers/createValidate'
import { createError } from '../helpers/createError'
import { createUtils } from '../helpers/createUtils'
import _ from 'lodash'
const _error = createError()
const _utils = createUtils()
export const createRoomType = () => {
  /* ------------------------------------ *\
    ROOM_TYPE
  \* ------------------------------------ */
  // service
  const fetchGetRoomTypes = async () => {
    try {
      const res = await eventService.showRoomType()
      const _v = createValidate()
      if (_v.isSuccess(res)) {
        if (_v.isHasFetch(res)) {
          return _utils.getResponseModified(['roomAddable'], 'TO_BOOLEAN', res.data.fetch.rooms)
        } else {
          return []
        }
      } else {
        _error.log()
        return []
      }
    } catch (err) {
      console.log(err)
    }
  }

  const fetchGetRooms = async () => {
    try {
      const res = await eventService.showRoom()
      const _v = createValidate()
      if (_v.isSuccess(res)) {
        if (_v.isHasFetch(res)) {
          return res.data.fetch.rooms
        } else {
          return []
        }
      } else {
        if (_error.isHasCode()) {
          const type = _error.getCodeType()
          _error.log(type)
        } else {
          _error.log()
        }
      }
    } catch (err) {
      console.log(err)
    }
  }

  const fetchPostRoomType = async (temp) => {
    try {
      const res = await eventService.insertRoomType(temp)
      const _v = createValidate()
      if (_v.isSuccess(res)) {
        return { success: res.data.success }
      } else {
        return { success: false, message: _error.getErrMsg(res) }
      }
    } catch (err) {
      console.log(err)
    }
  }

  const fetchPutRoomType = async (temp) => {
    try {
      const res = await eventService.updateRoomType(temp)
      const _v = createValidate()
      if (_v.isSuccess(res)) {
        return { success: res.data.success }
      } else {
        return { success: false, message: _error.getErrMsg(res) }
      }
    } catch (err) {
      console.log(err)
    }
  }

  const fetchDeleteRoomType = async (temp) => {
    try {
      const res = await eventService.deleteRoomType(temp)
      const _v = createValidate()
      if (_v.isSuccess(res)) {
        return res.data.success
      } else {
        return false
      }
    } catch (err) {
      console.log(err)
    }
  }

  const fetchPostPhoto = async (temp) => {
    try {
      const res = await eventService.insertPhoto(temp)
      const _v = createValidate()
      if (_v.isSuccess(res)) {
        return res.data.success
      } else {
        return false
      }
    } catch (err) {
      console.log(err)
    }
  }

  // private
  const getRoomTypesPropSplit = (props, items, split) => {
    items.forEach((item) => {
      props.forEach(prop => {
        if (typeof item[prop] === 'string') {
          item[prop] = item[prop].split(split)
        }
      })
    })
    return items
  }

  const getRoomTypesSetNewProp = (roomTypes, propName) => {
    return roomTypes && roomTypes.length
      ? roomTypes.map(roomType => {
        roomType[`${propName}`] = []
        return roomType
      })
      : []
  }

  const getRoomTypesSetRoomToProp = (roomTypes, rooms) => {
    if (roomTypes && roomTypes.length && rooms && rooms.length) {
      roomTypes.forEach(roomType => {
        rooms.forEach(room => {
          if (room.roomTypeId === roomType.roomTypeId) {
            roomType.roomItem.push({
              roomId: room.roomId,
              roomNumber: room.roomNumber
            })
          }
        })
      })
      return roomTypes
    } else {
      return []
    }
  }

  const getRoomTypesSort = (roomTypes) => {
    return roomTypes && roomTypes.length
      ? roomTypes.sort((a, b) => {
        if (a.roomItem.length && b.roomItem.length) {
          return (+a.roomItem[0].roomNumber) - (+b.roomItem[0].roomNumber)
        } if (a.roomItem.length === 0 && b.roomItem.length === 0) {
          return -1
        }
      })
      : []
  }

  // public
  const getRoomTypes = async () => {
    // 拿基本房型
    const stage1 = await fetchGetRoomTypes()
    if (stage1 && stage1.length) {
      const stage2 = await getRoomTypesPropSplit(['weekdayDays', 'weekendDays'], stage1, ',')
      const stage3 = await fetchGetRooms()
      const stage4 = await Promise.all([stage2, stage3])
      if (stage4[0] && stage4[1] && stage4[0].length && stage4[1].length) {
        const stage5 = await getRoomTypesSetNewProp(stage2, 'roomItem')
        if (stage5 && stage5.length) {
          const stage6 = getRoomTypesSetRoomToProp(stage5, stage3)
          if (stage6 && stage6.length) {
            return getRoomTypesSort(stage6)
              ? getRoomTypesSort(stage6)
              : []
          } else {
            console.log('stage6 empty')
          }
        } else {
          console.log('stage5 empty')
        }
      } else {
        console.log('stage2 or stage3 empty')
      }
    } else {
      console.log('stage1 empty')
    }
  }

  const getWeekdayDays = (weekendDays) => {
    const fullDays = ['0', '1', '2', '3', '4', '5', '6']
    return _.difference(fullDays, weekendDays)
  }

  /* ------------------------------------ *\
    ROOM_NUMBER
  \* ------------------------------------ */
  return {
    fetchGetRoomTypes,
    fetchPostRoomType,
    fetchPutRoomType,
    fetchDeleteRoomType,
    fetchGetRooms,
    fetchPostPhoto,
    getRoomTypes,
    getWeekdayDays
  }
}
