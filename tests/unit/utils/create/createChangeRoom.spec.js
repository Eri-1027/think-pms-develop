import { createChangeRoom } from '@/utils/create/createChangeRoom'
const changeRoom = createChangeRoom()
describe('createChangeRoom', () => {
  const fetchRoomTypes = [
    {
      roomTypeId: '82',
      roomTypeName: '雪山小山屋',
      roomAddable: '1',
      roomAccommodate: '2',
      restPrice: '900',
      restHourDefault: '1',
      restPerHour: '450',
      weekdayPrice: '3000',
      weekendPrice: '4500',
      weekdayDays: '0,1,2,3,4',
      weekendDays: '5,6',
      roomDescription: '雪山這麼美不去嗎？',
      roomImage: '',
      hotelId: '39'
    },
    {
      roomTypeId: '83',
      roomTypeName: '北大武山小山屋',
      roomAddable: '1',
      roomAccommodate: '3',
      restPrice: '3000',
      restHourDefault: '2',
      restPerHour: '1500',
      weekdayPrice: '4000',
      weekendPrice: '4500',
      weekdayDays: '0,1,2,3,4',
      weekendDays: '5,6',
      roomDescription: '',
      roomImage: '',
      hotelId: '39'
    },
    {
      roomTypeId: '84',
      roomTypeName: '排雲山莊',
      roomAddable: '1',
      roomAccommodate: '10',
      restPrice: '3000',
      restHourDefault: '3',
      restPerHour: '1000',
      weekdayPrice: '4000',
      weekendPrice: '4500',
      weekdayDays: '0,1,2,3,4',
      weekendDays: '5,6',
      roomDescription: '',
      roomImage: '',
      hotelId: '39'
    }
  ]
  const fetchRoomNumbers = [
    {
      roomId: '332',
      roomNumber: '000',
      roomTypeId: '82',
      hotelId: '39'
    },
    {
      roomId: '334',
      roomNumber: '002',
      roomTypeId: '82',
      hotelId: '39'
    },
    {
      roomId: '335',
      roomNumber: '001',
      roomTypeId: '82',
      hotelId: '39'
    },
    {
      roomId: '336',
      roomNumber: '004',
      roomTypeId: '82',
      hotelId: '39'
    }
  ]
  const fetchDiscountAndType = {
    type: [
      {
        roomTypeId: '82',
        roomTypeName: '雪山小山屋',
        roomAddable: '1',
        roomAccommodate: '2',
        restPrice: '900',
        restHourDefault: '1',
        restPerHour: '450',
        weekdayPrice: '3000',
        weekendPrice: '4500',
        weekdayDays: '0,1,2,3,4',
        weekendDays: '5,6',
        roomDescription: '雪山這麼美不去嗎？',
        roomImage: '',
        hotelId: '39'
      }
    ],
    discounts: [
      {
        discountId: '27',
        discountName: '八折優惠',
        discountDescription: '',
        salesChannel: 'all',
        discountType: '0',
        discountPercentage: '8',
        discountCustomize: '',
        discountStartDate: '2020-09-01',
        discountEndDate: '3000-12-31',
        discountFor: '82,83,84',
        discountEnable: '1',
        hotelId: '39'
      },
      {
        discountId: '28',
        discountName: '全年 7 折',
        discountDescription: '打 7 折',
        salesChannel: 'all',
        discountType: '0',
        discountPercentage: '7',
        discountCustomize: '',
        discountStartDate: '0000-00-00',
        discountEndDate: '3000-12-31',
        discountFor: '82,83,84',
        discountEnable: '1',
        hotelId: '39'
      }
    ]
  }
  const roomTypeItems = [
    { text: '雪山小山屋', value: '82' },
    { text: '北大武山小山屋', value: '83' },
    { text: '排雲山莊', value: '84' }
  ]
  const roomNumberItems = [
    { text: '000', value: '332' },
    { text: '002', value: '334' },
    { text: '001', value: '335' },
    { text: '004', value: '336' }
  ]
  const discountItems = [
    { text: '八折優惠', value: '27' },
    { text: '全年 7 折', value: '28' }
  ]

  for (let i = 0; i < fetchRoomTypes.length; i += 1) {
    it(`fetchRoomTypes ${i} should have propperties (roomTypeId and roomTypeName)`, () => {
      expect(fetchRoomTypes[i]).toHaveProperty('roomTypeId')
      expect(fetchRoomTypes[i]).toHaveProperty('roomTypeName')
    })
  }

  for (let i = 0; i < fetchRoomNumbers.length; i += 1) {
    it(`fetchRoomNumbers ${i} should have propperties (roomId and roomNumber)`, () => {
      expect(fetchRoomNumbers[i]).toHaveProperty('roomId')
      expect(fetchRoomNumbers[i]).toHaveProperty('roomNumber')
    })
  }

  for (let i = 0; i < fetchDiscountAndType.discounts.length; i += 1) {
    it(`fetchDiscountAndType.discounts ${i} should have propperties (discountId and discountName)`, () => {
      expect(fetchDiscountAndType.discounts[i]).toHaveProperty('discountId')
      expect(fetchDiscountAndType.discounts[i]).toHaveProperty('discountName')
    })
  }

  it('getRestRoomTypeItems should return array and have propperties (text and value)', async () => {
    const items = await changeRoom.getRestRoomTypeItems(fetchRoomTypes)
    expect(items).toEqual(roomTypeItems)
  })

  it('getRoomNumberItems should return array and have propperties (text and value)', async () => {
    const items = await changeRoom.getRoomNumberItems(fetchRoomNumbers)
    expect(items).toEqual(roomNumberItems)
  })

  it('getDiscountItems should return array and have propperties (text and value)', async () => {
    const items = await changeRoom.getDiscountItems(fetchDiscountAndType.discounts)
    expect(items).toEqual(discountItems)
  })
})
