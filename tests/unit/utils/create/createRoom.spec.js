import { createRoom } from '../../../../src/utils/create/createRoom'
import dayjs from 'dayjs'
const _room = createRoom()

describe('createRoom', () => {
  const specificRooms = [
    {
      bookingDetailId: '3192',
      bookingId: '1960',
      bookingNumber: 'B7E4B1111F30001',
      customerId: '217',
      customerName: 'Rich',
      expectedCheckInTime: '2020-11-17 15:00:00',
      expectedCheckOutTime: '2020-11-20 12:00:00',
      hotelId: '39',
      roomId: '332',
      roomNumber: '000',
      roomStatus: '0'
    },
    {
      bookingDetailId: '3193',
      bookingId: '1960',
      bookingNumber: 'B7E4B1111F30001',
      customerId: '217',
      customerName: 'Rich',
      expectedCheckInTime: '2020-11-17 15:00:00',
      expectedCheckOutTime: '2020-11-20 12:00:00',
      hotelId: '39',
      roomId: '333',
      roomNumber: '003',
      roomStatus: '2'
    },
    {
      bookingDetailId: '3149',
      bookingId: '1936',
      bookingNumber: 'B7E4B105261B003',
      customerId: null,
      customerName: null,
      expectedCheckInTime: '2020-11-16 17:38:27',
      expectedCheckOutTime: '2020-11-16 18:38:27',
      hotelId: '39',
      roomId: '337',
      roomNumber: '101',
      roomStatus: '3'
    }
  ]
  it('createFnByName should return function by `checkIn`', async () => {
    const fn = await _room.createFnByName('checkIn')
    expect(typeof fn).toBe('function')
  })

  it('createFnByName should return `fetchPostCheckIn` by `checkIn`', async () => {
    const fn = await _room.createFnByName('checkIn')
    expect(fn.name).toBe('fetchPostCheckIn')
  })

  it('createFnByName should return null by `check`', async () => {
    const fn = await _room.createFnByName('check')
    expect(fn).toBe(null)
  })

  it('getTempBodyWithRules should return optTemp', async () => {
    const settings = {
      svParams: ['bookingDetailId', 'roomId', 'roomTypeId', 'expectedCheckOutTime'],
      fnGetParamsBody: [0, 0, 0, (t) => dayjs(t).format('YYYY-MM-DD')],
      newPropsName: [0, 0, 0, 'checkOut'],
      booking: {
        bookingDetailId: 1111,
        roomId: 222,
        roomTypeId: 33,
        expectedCheckOutTime: '2020-11-11 10:10:10'
      }
    }
    const optTemp = {
      bookingDetailId: 1111,
      roomId: 222,
      roomTypeId: 33,
      checkOut: '2020-11-11'
    }
    const body = await _room.getTempBodyWithRules(settings)
    expect(body).toStrictEqual(optTemp)
  })

  it('getTempBody should return optTemp', async () => {
    const settings = {
      svParams: ['prop1', 'prop2', 'prop3'],
      booking: {
        prop1: 1,
        prop2: 2,
        prop3: 3
      }
    }
    const optTemp = {
      prop1: 1,
      prop2: 2,
      prop3: 3
    }
    const body = await _room.getTempBody(settings)
    expect(body).toStrictEqual(optTemp)
  })

  for (let i = 0; i < specificRooms.length; i += 1) {
    it(`specificRooms ${i} should have propperties (roomStatus)`, () => {
      expect(specificRooms[i]).toHaveProperty('roomStatus')
    })
  }

  it('hasSpecificStatus contains status 2 should return true', () => {
    const isExist = _room.hasSpecificStatus(specificRooms, ['2'])
    expect(isExist).toBe(true)
  })

  it('hasSpecificStatus contains status 5 should return false', () => {
    const isExist = _room.hasSpecificStatus(specificRooms, ['5'])
    expect(isExist).toBe(false)
  })
})
