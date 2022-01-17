import eventService from '../eventService'
import { createValidate } from '../helpers/createValidate'
import cloneDeep from 'lodash/cloneDeep'
const _v = createValidate()
export const createArrangementCell = () => {
  /** private */
  const getBasicRooms = async () => {
    try {
      const res = await eventService.showRoomsStatus()
      if (_v.isSuccess(res)) {
        if (_v.isHasFetch(res)) {
          return res.data.fetch.showRoomsNumber
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
  const getComplexRooms = async () => {
    try {
      const res = await eventService.showRoom()
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
  const getMergeRooms = (basicRooms, complexRooms) => {
    // complexRooms got undefined
    const merge = cloneDeep(basicRooms)
    return merge.map((basic) => {
      complexRooms.forEach((complex) => {
        if (complex.roomNumber === basic.roomNumber) {
          basic.roomAccommodate = complex.roomAccommodate
        }
      })
      return basic
    })
  }
  const getSortMergeRooms = (merge) => {
    return merge.sort((a, b) => {
      return +a.roomNumber - +b.roomNumber
    })
  }
  /** public */
  const getCell = async () => {
    try {
      const basicRooms = await getBasicRooms()
      const complexRooms = await getComplexRooms()
      const result = await Promise.all([basicRooms, complexRooms])
      if (result) {
        const merge = await getMergeRooms(basicRooms, complexRooms)
        return getSortMergeRooms(merge)
      }
    } catch (err) {
      console.log(err)
    }
  }

  return {
    getCell
  }
}
