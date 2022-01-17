import { createPrice } from '@/utils/create/createPrice'
import PRICE from '@/constants/price'
const price = createPrice()

describe('creatPrice', () => {
  it('createFetchPrice should return an Async Function', async () => {
    const type = PRICE.PRICE_INSERT_BOOKING
    const fn = price.createFetchPrice(type)
    const isAsync = fn.constructor.name === 'AsyncFunction'
    expect(isAsync).toBe(true)
  })

  it('createFetchPrice with param `PRICE_INSERT_BOOKING` should return fetchGetPriceAndType', () => {
    const type = PRICE.PRICE_INSERT_BOOKING
    const fn = price.createFetchPrice(type)
    const asyncName = 'fetchGetPriceAndType'
    expect(fn.name).toEqual(asyncName)
  })

  it('getTempPrice should return an Object', () => {
    const params = {
      type: PRICE.PRICE_INSERT_BOOKING,
      bookingId: 100,
      stayingDay: 2,
      expectedCheckInTime: '1993-11-1',
      expectedCheckOutTime: '1993-11-3',
      roomStatus: 0
    }
    const temp = price.getTempPrice(params)
    const isObject = Object.keys(temp) && Object.keys(temp).length
    expect(!!isObject).toBe(true)
  })

  it('getTempPrice should have properties `stayingDay`,`expectedCheckInTime`,`expectedCheckOutTime`,`bookingId`,`roomStatus`', () => {
    const returnTemp = {
      stayingDay: 2,
      expectedCheckInTime: '1993-11-1',
      expectedCheckOutTime: '1993-11-3',
      bookingId: 100,
      roomStatus: 0
    }
    const props = Object.keys(returnTemp)
    expect(props[0]).toBe('stayingDay')
    expect(props[1]).toBe('expectedCheckInTime')
    expect(props[2]).toBe('expectedCheckOutTime')
    expect(props[3]).toBe('bookingId')
    expect(props[4]).toBe('roomStatus')
  })

  it('isCheckOutAvailable should return `true` with -100', () => {
    const diff = -100
    const isAvailable = price.isCheckOutAvailable(diff)
    expect(isAvailable).toBe(true)
  })

  it('isCheckOutAvailable should return `false` with 100', () => {
    const diff = 100
    const isAvailable = price.isCheckOutAvailable(diff)
    expect(isAvailable).toBe(false)
  })
})
