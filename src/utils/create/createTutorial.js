import eventService from '../eventService'
import { createValidate } from '../helpers/createValidate'
// import { createError } from '../helpers/createError'
const _v = createValidate()
export const createTutorial = () => {
  const fetchGetTutorialStatus = async (temp) => {
    try {
      const res = await eventService.checkTutorial(temp)
      if (_v.isSuccess(res)) {
        if (_v.isHasFetch(res)) {
          const status = res.data.fetch.checkTutorial
          return !!(status && status === '1')
        } else {
          return false
        }
      } else {
        return false
      }
    } catch (err) {
      console.log(err)
    }
  }
  return {
    fetchGetTutorialStatus
  }
}
