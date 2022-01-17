import PRICE from '../constants/price'
import { mapState, mapMutations } from 'vuex'
import { mixinInsertBooking } from './insertBooking.mixin'
import { mixinPayment } from './payment.mixin'
import { createPrice } from '../utils/create/createPrice'
import { createChangeRoom } from '../utils/create/createChangeRoom'
import { createDialog } from '../utils/helpers/createDialog'
import { createStaff } from '../utils/create/createStaff'
import { createRoom } from '../utils/create/createRoom'
import { createPayment } from '../utils/create/createPayment'
import { createUtils } from '../utils/helpers/createUtils'
import { createValidate } from '../utils/helpers/createValidate'
import { createFormat } from '../utils/helpers/createFormat'
import { createCardsDailySchedule } from '../utils/create/createCardsDailySchedule'
import _ from 'lodash'
import eventService from '../utils/eventService'

const _room = createRoom()
const _price = createPrice()
const _dialog = createDialog()
const _changeRoom = createChangeRoom()
const _payment = createPayment()
const _utils = createUtils()
const _v = createValidate()
const _format = createFormat()
const _cardsDailySchedule = createCardsDailySchedule()

/**
 * 房間相關操作（如：入住、退房、）
 */
export const mixinRoomActions = {
  mixins: [
    mixinInsertBooking,
    mixinPayment
  ],
  computed: {
    ...mapState({
      multiCleanStatus: state => state.booking.status,
      multiCleanType: state => state.booking.type,
      tempMultiClean: state => state.booking.tempMultiClean,
      tempChangeRoom: state => state.changeRoom.tempChangeRoom,
      changeRoomItem: state => state.changeRoom.changeRoomItem,
      discountItems: state => state.changeRoom.discountItems,
      keepPrice: state => state.changeRoom.keepPrice,
      crBookingId: state => state.changeRoom.bookingId,
      changeRoomNumberItems: state => state.changeRoom.changeRoomNumberItems,
      showDiscountError: state => state.changeRoom.showDiscountError,
      selected: state => state.room.selected
    })
  },
  created () {
    this.$bus.$on('get-new-price-by-discount', payload => {
      if (payload) {
        this['changeRoom/SET_TEMP_CHANGE_ROOM_DISCOUNTID'](payload.discountId)
        this.getNewPrice()
      }
    })
  },
  beforeDestroy () {
    this.$bus.$off('get-changeroom-new-price')
  },
  methods: {
    ...mapMutations([
      'room/SET_SELECTED',
      'price/SET_PRICE_ITEM',
      'booking/SET_TYPE',
      'booking/SET_TEMP',
      'booking/SET_STATUS',
      'booking/SET_STAFFID',
      'booking/SET_SELECT_ITEM',
      'booking/CLEAR',
      'booking/SET_OPTION_AVAILABLE',
      'changeRoom/SET_CHANGE_ROOM',
      'changeRoom/SET_TEMP_CHANGE_ROOM',
      'changeRoom/SET_TEMP_CHANGE_ROOM_DISCOUNTID',
      'changeRoom/SET_CHANGE_ROOM_DISCOUNTITEMS',
      'changeRoom/CLEAR_TEMP_CHANGE_ROOM',
      'changeRoom/SET_KEEP_PRICE',
      'changeRoom/SET_CHANGE_ROOM_NEW_TOTAL_PRICE',
      'changeRoom/SET_CHANGE_ROOM_FINAL_PRICE',
      'changeRoom/SET_CHANGE_ROOM_NUMBER_ITEMS',
      'changeRoom/SET_DISCOUNT_ERROR',
      'changeRoom/SET_CHANGE_ROOM_PRICE',
      'changeRoom/SET_CHANGE_ROOM_PAYMENT',
      'changeRoom/SET_CHANGE_ROOM_DIFFERENCE',
      'changeRoom/SET_CHANGE_ROOM_BOOKINGID'
    ]),
    /* ------------------------------------ *\
       $CARDS
    \* ------------------------------------ */
    // makeCards () {
    //   let displayCards = []
    //   const isExpectCheckOutIsToday = async item => {
    //     return this.$date(item.expectedCheckOutTime).format('YYYY-MM-DD') === this.$date().format('YYYY-MM-DD')
    //   }
    //   const isExpectCheckInIsToday = async item => {
    //     return this.$date(item.expectedCheckInTime).format('YYYY-MM-DD') === this.$date().format('YYYY-MM-DD')
    //   }
    //   const fetchGetRoomsNumber = async () => {
    //     try {
    //       const res = await eventService.showRoom()
    //       if (res.data.success) {
    //         return res.data.fetch.rooms
    //       } else {
    //         return []
    //       }
    //     } catch (err) {
    //       console.log(err)
    //     }
    //   }
    //   const fetchGetNextOrderItem = async ({ roomId, bookingId }) => {
    //     try {
    //       const res = await eventService.showNextOrder({ roomId, bookingId })
    //       if (res.data.fetch.nextOrder) {
    //         if (res.data.fetch.nextOrder !== '無') {
    //           return res.data.fetch.nextOrder
    //         }
    //         if (res.data.fetch.nextOrder === '無') {
    //           return {}
    //         }
    //       } else {
    //         return {}
    //       }
    //     } catch (err) {
    //       console.log(err)
    //     }
    //   }
    //   /**
    //    * 給定選取日期，取得當天所有房間狀態
    //    * @param {object} temp // { date: '2021-1-14' }
    //    */
    //   const fetchGetSpecificCards = async (temp) => {
    //     try {
    //       const res = await eventService.showSpecificCards(temp)
    //       return res.data.success &&
    //       res.data.fetch.showCards &&
    //       res.data.fetch.showCards.length
    //         ? res.data.fetch.showCards
    //         : []
    //     } catch (err) {
    //       console.log(err)
    //     }
    //   }
    //   const isLinked = (prev, next) => {
    //     const prevCheckOut = this.$date(prev.expectedCheckOutTime).format('YYYY-MM-DD')
    //     const nextCheckIn = this.$date(next.expectedCheckInTime).format('YYYY-MM-DD')

    //     if (prev.roomStatus === '4' && next.roomStatus !== '4') {
    //       return true
    //     } else {
    //       return prevCheckOut === nextCheckIn
    //     }
    //   }
    //   const getModify = async (specifics) => {
    //     if (specifics && specifics.length) {
    //       // 確保不會一下出現休訂，一下出現訂
    //       specifics = specifics.sort((a, b) => {
    //         return a.roomStatus - b.roomStatus
    //       })
    //       const result = await Promise.all(specifics.map(async (bar) => {
    //         const nextItem = await fetchGetNextOrderItem({
    //           roomId: bar.roomId,
    //           bookingId: bar.bookingId
    //         })
    //         if (nextItem && nextItem.bookingDetailId) {
    //           const newStatus = `${bar.roomStatus}-${nextItem.roomStatus}`
    //           const isLegalMerge = (mergeStatus) => {
    //             switch (mergeStatus) {
    //               case ROOM_STATUS.UNCHECKIN_REST_KEY:
    //               case ROOM_STATUS.REST_UNCHECKIN_KEY:
    //               case ROOM_STATUS.REST_RESERVE_KEY:
    //               case ROOM_STATUS.CHECKIN_UNCHECKIN_KEY:
    //               case ROOM_STATUS.UNCLEAN_UNCHECKIN_KEY:
    //               case ROOM_STATUS.CLEANING_UNCHECKIN_KEY:
    //                 return true
    //               default:
    //                 return false
    //             }
    //           }
    //           const isLegal = isLegalMerge(newStatus)
    //           if (isLegal) {
    //             bar.roomStatus = newStatus
    //           }
    //         }
    //         return bar
    //       }))
    //       if (result && result.length) {
    //         return result
    //       } else {
    //         return []
    //       }
    //     } else {
    //       return []
    //     }
    //   }
    //   const getMergeCards = async (rooms, specifics) => {
    //     if (rooms && rooms.length) {
    //       const merges = await getModify(specifics)
    //       return (merges && merges.length)
    //         ? merges
    //         : rooms
    //     } else {
    //       return rooms
    //     }
    //   }
    //   const fillMergesToEmptyRooms = (roomNumbers, modifiers) => {
    //     roomNumbers = (modifiers && modifiers.length)
    //       ? roomNumbers.map(room => {
    //         modifiers.forEach(modifier => {
    //           if (modifier.roomId === room.roomId) {
    //             room = {
    //               roomId: room.roomId,
    //               roomNumber: room.roomNumber,
    //               bookingId: modifier.bookingId,
    //               bookingDetailId: modifier.bookingDetailId,
    //               bookingNumber: modifier.bookingNumber,
    //               customerId: modifier.customerId,
    //               customerName: modifier.customerName,
    //               expectedCheckInTime: modifier.expectedCheckInTime,
    //               expectedCheckOutTime: modifier.expectedCheckOutTime,
    //               roomStatus: modifier.roomStatus
    //             }
    //           }
    //         })
    //         return room
    //       })
    //       : []
    //     return (roomNumbers && roomNumbers.length)
    //       ? roomNumbers.map(room => {
    //         if (room.roomStatus === undefined) {
    //           room = {
    //             roomId: room.roomId,
    //             roomNumber: room.roomNumber,
    //             bookingId: '',
    //             bookingDetailId: '',
    //             bookingNumber: '',
    //             customerId: '',
    //             customerName: '',
    //             expectedCheckInTime: '',
    //             expectedCheckOutTime: '',
    //             roomStatus: '5'
    //           }
    //         }
    //         return room
    //       })
    //       : []
    //   }
    //   const getDisplayCards = (roomNumbers, modifierData) => {
    //     if (roomNumbers && roomNumbers.length) {
    //       const filled = fillMergesToEmptyRooms(roomNumbers, modifierData)
    //       if (filled && filled.length) {
    //         for (let i = 0; i < filled.length; i++) {
    //           if (displayCards.length === 0) {
    //             displayCards.push([filled[i]])
    //           } else {
    //             let isExist = false
    //             displayCards.forEach(row => {
    //               if (
    //                 row[0].roomNumber[0] === filled[i].roomNumber[0] &&
    //             row[0].roomNumber.length === filled[i].roomNumber.length
    //               ) {
    //                 row.push(filled[i])
    //                 isExist = true
    //               }
    //             })
    //             if (!isExist) {
    //               displayCards.push([filled[i]])
    //             }
    //           }
    //         }
    //         displayCards = displayCards.sort((a, b) => {
    //           return +a[0].roomNumber - +b[0].roomNumber
    //         })
    //         displayCards.forEach(row => {
    //           row = row.sort((a, b) => {
    //             return +a.roomNumber - +b.roomNumber
    //           })
    //         })
    //         return displayCards
    //       }
    //     }
    //   }
    //   return {
    //     fetchGetNextOrderItem,
    //     fetchGetRoomsNumber,
    //     fetchGetSpecificCards,
    //     isExpectCheckOutIsToday,
    //     isExpectCheckInIsToday,
    //     getDisplayCards,
    //     getMergeCards,
    //     isLinked
    //   }
    // },
    /**
     * 取得當日房況卡片
     */
    async getCardsHandler () {
      this.roomsNumber = await _cardsDailySchedule.fetchGetRoomsNumber()
      this.specificCards = await _cardsDailySchedule.fetchGetSpecificCards({
        date: this.$date(this.currentDay).format('YYYY-MM-DD')
      })
      const result = await Promise.all([
        this.roomsNumber,
        this.specificCards
      ])

      if (result && result.length) {
        if (this.roomsNumber && this.roomsNumber.length) {
          const merges = await _cardsDailySchedule.getMergeCards(this.roomsNumber, this.specificCards)
          this.displayCardData = _cardsDailySchedule.getDisplayCards(this.roomsNumber, merges)
          return this.displayCardData
        } else {
          return []
        }
      }
    },
    /* ------------------------------------ *\
       $ROOM_ACTIONS
    \* ------------------------------------ */
    makeRoomActions () {
      const reset = (ref, fn) => {
        window.setTimeout(() => {
          this.$refs[ref].reset()
          if (fn) fn()
        }, 100)
      }
      const setNextOrder = async item => {
        const handler = this.makeCards()
        const nextOrderItem = await handler.fetchGetNextOrderItem({
          roomId: item.roomId,
          bookingId: item.bookingId
        })
        if (nextOrderItem) {
          this.$set(this.cleaningCardsItem, 'bookingNote', nextOrderItem.bookingNote)
          this.$set(this.cleaningCardsItem, 'nextBookingSection', `${this.$date(nextOrderItem.expectedCheckInTime).format(
                'YYYY/MM/DD'
              )} - ${this.$date(nextOrderItem.expectedCheckOutTime).format(
                'YYYY/MM/DD'
              )}`)
        }
      }
      return {
        reset,
        setNextOrder
      }
    },
    // 訂、住、休、保
    // action 開頭 function 留在 view，其餘抽象到 createRoom
    async actionGetBookingDetails (item) {
      try {
        const data = { bookingDetailId: item.bookingDetailId }
        const card = await _room.fetchGetCardDetail(data)
        const fetchData = this._$dataTypeConvert.transAfterRes(
          card,
          ['customerEnable', 'roomAddable', 'paymentStatus']
        )

        this.cardItem = fetchData[0]
        // 2. 取得卡片上顯示價格
        const config = {
          type: PRICE.PRICE_REST_CARD_DETAIL, // 先暫時用 PRICE_REST_CARD_DETAIL代替四種卡片（0,1,4,6）
          bookingId: item.bookingId,
          bookingDetailId: item.bookingDetailId
        }
        const priceItem = await _price.getPrice(config)
        priceItem.price = priceItem.price
          ? priceItem.price
          : 0
        priceItem.payments = priceItem.payments
          ? priceItem.payments
          : 0
        priceItem.difference = priceItem.difference
          ? priceItem.difference
          : 0
        if (item.roomStatus === '4' || item.roomStatus === '4-0') {
          const extraHour = _room.getTempAddPrice('minute', item)
          if (extraHour > 0) {
            const restAddPrice = _price.getRestAddPrice({ item: fetchData[0], extraHour })
            const newRPrice = restAddPrice + priceItem.price
            const newRDifference = newRPrice - priceItem.payments
            this.$set(this.cardItem, 'restOverPrice', newRPrice)
            this.$set(this.cardItem, 'restOverDifference', newRDifference)
          }
        }
        this.$set(this.priceItem, 'price', priceItem.price)
        this.$set(this.priceItem, 'payments', priceItem.payments)
        this.$set(this.priceItem, 'difference', priceItem.difference)
        this.$set(this.priceItem, 'bookingId', item.bookingId)
        this.$set(this.priceItem, 'bookingDetailId', item.bookingDetailId)
        this['price/SET_PRICE_ITEM'](this.priceItem)
        this.cashStaffItems = await _payment.getCashStaffItems()
        const fn = _room.createNameDialogByStatus(item.roomStatus)
        _dialog.setDialog({
          type: fn,
          show: true
        })
      } catch (err) {
        console.log(err)
      }
    },
    async actionGetUnCleanRoomDetails (item) {
      const response = await _room.fetchGetCleaningList()
      if (response.length) {
        const _staff = createStaff()
        const items = _staff.getStaffItems('4', response)
        this.cleaningStaffItems = items
      }

      const regex = /^2/

      if (regex.test(item.roomStatus)) {
        this.$set(this.cleaningCardsItem, 'bookingDetailId', item.bookingDetailId)
        this.$set(this.cleaningCardsItem, 'bookingNote', '無')
        this.$set(this.cleaningCardsItem, 'nextBookingSection', '沒有資訊')
        if (item.roomStatus !== '2') {
          const roomActions = this.makeRoomActions()
          roomActions.setNextOrder(item)
        }
      }
      const fn = _room.createNameDialogByStatus(item.roomStatus)
      _dialog.setDialog({
        type: fn,
        show: true
      })
    },
    async actionGetCleanedRoomDetail (item) {
      try {
        this.cleaningCardsItem = item

        const regex = /^3/
        if (regex.test(item.roomStatus)) {
          this.$set(this.cleaningCardsItem, 'bookingNote', '無')
          this.$set(this.cleaningCardsItem, 'nextBookingSection', '沒有資訊')
          if (item.roomStatus !== '3') {
            const roomActions = this.makeRoomActions()
            roomActions.setNextOrder(item)
          }
        }

        const fn = _room.createNameDialogByStatus(item.roomStatus)
        _dialog.setDialog({
          type: fn,
          show: true
        })
      } catch (err) {
        console.log(err)
      }
    },
    async actionGetEmptyRoomInfo (item) {
      try {
        const card = await _room.fetchGetEmptyCardDetail({ roomId: item.roomId })
        this.cleanedCardItem = card
        const fn = _room.createNameDialogByStatus(item.roomStatus)
        _dialog.setDialog({
          type: fn,
          show: true
        })
      } catch (err) {
        console.log(err)
      }
    },
    /**
     * 取得房間詳細資訊彈窗
     * @param {object} item 該筆房間資訊
     */
    handleClickGetCardDetail: _.debounce(async function (item) {
      try {
        if (this.multiCleanStatus === 'CHOOSE_ROOM') {
          this.handleClickSetMultiCleanItem(item)
          return
        } else {
          const fn = _room.createNameActionByStatus(item.roomStatus)
          this[fn](item)
        }
      } catch (err) {
        console.log(err)
      }
    }, 100),
    /**
     * 關閉房間詳細資訊彈窗
     * @param {object} type 彈窗總類
     */
    handleClickCloseCardDetail: _.debounce(function (type) {
      _dialog.setDialog({
        type,
        show: false
      })
      // clear card item
    }, 100),
    /**
     * 入住
     */
    handleClickCheckIn: _.debounce(async function (item) {
      _dialog.setDialog({
        type: 'unCheckIn',
        show: false
      })
      const isNotLegally = _v.isActionNotLegally('0', item)
      if (isNotLegally) {
        const type = _v.getErrorActionType('0', item)
        const message = _v.getMessageByActionType(type)
        _dialog.setDialog({
          autoClose: true,
          msg: message,
          type: 'failed'
        })
        return
      }
      item = item.filter(el => el.roomStatus === '0')
      if (item && item.length) {
        const temp = _room.getTempCheckIn(item)
        const {
          success,
          message
        } = await _room.fetchPostCheckIn(temp)
        let displayRoom = item.map(el => el.roomNumber)
        displayRoom = _format.getDotsAppendBySplit(displayRoom, 3, ',')

        if (success) {
          await _dialog.setDialog({
            autoClose: true,
            msg: message,
            type: 'success'
          })
          await _dialog.setDialog({
            autoClose: true,
            msg: `房號為：${displayRoom}`,
            type: 'keycard'
          })
          _dialog.setDialog({
            type: 'unCheckIn',
            show: false
          })
          this.$bus.$emit('change')
        } else {
          await _dialog.setDialog({
            msg: message,
            type: 'confirmNotify',
            show: true
          })
        }
      }
    }, 100),
    /**
     * 退房
     */
    handleClickCheckOut: _.debounce(async function (item) {
      await _dialog.setDialog({
        type: 'rest',
        show: false
      })
      await _dialog.setDialog({
        type: 'checkIn',
        show: false
      })
      const isNotLegally = _v.isActionNotLegally(item[0].roomStatus, item)
      if (isNotLegally) {
        const type = _v.getErrorActionType('4', item)
        const message = _v.getMessageByActionType(type)
        _dialog.setDialog({
          autoClose: true,
          msg: message,
          type: 'failed'
        })
        return
      }
      if (item && Array.isArray(item)) {
        const generals = (this.selected && this.selected.length)
          ? this.selected.filter(el => el.roomStatus === '1')
          : item.filter(el => el.roomStatus === '1')
        const rests = item.filter(el => el.roomStatus === '4' || el.roomStatus === '4-0')
        let config
        let checkOutItems = []
        if (generals && generals.length) {
          config = {
            type: PRICE.PRICE_CHECKOUT,
            bookingId: item[0].bookingId,
            roomStatus: '1'
          }
          checkOutItems = generals
        }
        if (rests && rests.length) {
          config = {
            type: PRICE.PRICE_REST_CHECKOUT,
            bookingId: item[0].bookingId,
            roomStatus: '4'
          }
          checkOutItems = rests
        }
        this['room/SET_SELECTED'](checkOutItems)
        let priceItem = await _price.getPrice(config)
        priceItem = _utils.pickProps(Object.assign(item[0], priceItem), [
          'bookingId',
          'bookingDetailId',
          'bookingNumber',
          'price',
          'difference',
          'payments'
        ])

        this['price/SET_PRICE_ITEM'](priceItem)
        if (_payment.isPaid(priceItem)) {
          const bookingId = this.selected[0].bookingId
          const bookingDetailId = this.selected
            .map(el => el.bookingDetailId)
            .filter(el => el !== undefined)

          const temp = {
            bookingId,
            bookingDetailId
          }

          const {
            success,
            message
          } = await _room.fetchPostCheckOut(temp)
          if (success) {
            await _dialog.setDialog({
              autoClose: true,
              msg: '退房成功',
              type: 'success'
            })
          } else {
            await _dialog.setDialog({
              autoClose: true,
              msg: message,
              type: 'success'
            })
          }
          this.$bus.$emit('change')
          this['room/SET_SELECTED']([])
        } else {
          await _dialog.setDialog({
            type: 'paymentAfterCheckOut',
            show: true
          })
        }
      }
    }, 100),
    getRestOverHours (item) {
      const now = this.$date()
      const target = this.$date(item.expectedCheckOutTime)
        ? this.$date(item.expectedCheckOutTime)
        : null
      if (!target) return undefined
      const diffUnix = now.unix() - target.unix()
      const unit = 0.5
      let hours = 0
      for (let i = 0; i < 23; i++) {
        if (diffUnix / 3600 > unit + i && diffUnix / 3600 < unit + (i + 1)) {
          hours = i + 1
        }
      }
      return hours
    },
    async handleClickCleaning (item) {
      const res = await this.$refs.cardCheckOut.validate()
      if (!res) return
      try {
        const data = {
          bookingDetailId: item.bookingDetailId,
          cleaningStaffId: item.cleaningStaffId
        }
        const res = await eventService.cleaning(data)
        if (res.data.success) {
          console.log(res)
          await _dialog.setDialog({
            type: 'checkOut',
            show: false
          })
          await _dialog.setDialog({
            autoClose: true,
            msg: '開始清潔',
            type: 'success'
          })
          this.$bus.$emit('init-temp-cleaning')
          this.$bus.$emit('change')
        }
      } catch (err) {
        console.log(err)
      }
    },
    async handleClickCleaned (item) {
      try {
        const data = {
          bookingDetailId: item.bookingDetailId
        }
        const res = await eventService.cleaned(data)
        if (res.data.success) {
          const success = await _dialog.setDialog({
            type: 'cleaning',
            show: false
          })
          if (success) {
            await _dialog.setDialog({
              autoClose: true,
              msg: '清掃完成',
              type: 'success'
            })
            this.getCardsHandler()
          }
        }
      } catch (err) {
        console.log(err)
      }
    },
    async handleClickCancelBooking (item) {
      try {
        if (item && item.bookingId) {
          const data = {
            bookingId: item.bookingId
          }
          const res = await eventService.cancel(data)
          if (res.data.success) {
            if (this.dialogReserve) {
              await _dialog.setDialog({
                type: 'reserve',
                show: false
              })
            }
            if (this.dialogUnCheckIn) {
              await _dialog.setDialog({
                type: 'unCheckIn',
                show: false
              })
            }
            if (this.dialogCancelBookingConfirm) {
              await _dialog.setDialog({
                type: 'cancelBookingConfirm',
                show: false
              })
            }
            this.$bus.$emit('change')
          }
        }
      } catch (err) {
        console.log(err)
      }
    },
    async handleCancelCheckIn (item) {
      try {
        const isNotLegally = _v.isActionNotLegally('1', item)
        if (isNotLegally) {
          const type = _v.getErrorActionType('1', item)
          const message = _v.getMessageByActionType(type)
          _dialog.setDialog({
            autoClose: true,
            msg: message,
            type: 'failed'
          })
          return
        }
        if (Array.isArray(item) && item.length) {
          const bookingDetailId = item.map(el => {
            if (el.roomStatus === '1') {
              return el.bookingDetailId
            }
          }).filter(el => el !== undefined)
          const temp = {
            bookingDetailId
          }
          const {
            success,
            message
          } = await _room.fetchPostCancelCheckIn(temp)
          if (success) {
            _dialog.setDialog({
              type: 'checkIn',
              show: false
            })
            await _dialog.setDialog({
              autoClose: true,
              msg: message,
              type: 'success'
            })
          } else {
            _dialog.setDialog({
              type: 'checkIn',
              show: false
            })
            await _dialog.setDialog({
              autoClose: true,
              msg: message,
              type: 'failed'
            })
          }
          this.$bus.$emit('change')
        }
      } catch (err) {
        console.log(err)
      }
    },
    /* ------------------------------------ *\
      $CHANGE ROOM
    \* ------------------------------------ */
    async handleClickShowDialogChangeRoom ({ item }) {
      const list = [
        'unCheckIn',
        'checkIn',
        'rest',
        'reserve'
      ]
      await Promise.all(list.map(async el => {
        if (this[`dialog${el.charAt(0).toUpperCase() + el.slice(1)}`]) {
          _dialog.setDialog({
            type: el,
            show: false
          })
          return true
        } else {
          return false
        }
      }))

      const temp = { bookingId: item.bookingId }
      const priceItem = await _price.fetchGetBillAmount(temp)

      this['changeRoom/SET_CHANGE_ROOM_PRICE'](priceItem.price)
      this['changeRoom/SET_CHANGE_ROOM_PAYMENT'](priceItem.payments)
      this['changeRoom/SET_CHANGE_ROOM_DIFFERENCE'](priceItem.difference)
      this['changeRoom/SET_CHANGE_ROOM_BOOKINGID'](item.bookingId)

      this['changeRoom/SET_CHANGE_ROOM'](item)
      const rooms = await _changeRoom.fetchGetRoomTypes()
      if (rooms && rooms.length) {
        const changeRoomItems = await _changeRoom.getRestRoomTypeItems(rooms)
        this.roomTypeRestItems = changeRoomItems
      }

      // clear tempChangeRoom
      this['changeRoom/CLEAR_TEMP_CHANGE_ROOM']()
      this['changeRoom/SET_KEEP_PRICE']('')

      await _dialog.setDialog({
        type: 'changeRoom',
        show: true
      })
    },
    async getNumberAndDiscoutByRoomType () {
      const tempNumber = {
        roomTypeId: this.tempChangeRoom.newRoomTypeId,
        fromDate: this.$date(this.changeRoomItem.expectedCheckInTime).format(
          'YYYY-MM-DD'
        ),
        endDate: this.$date(this.changeRoomItem.expectedCheckOutTime).format(
          'YYYY-MM-DD'
        ),
        roomId: this.changeRoomItem.roomId
      }
      const tempDiscount = {
        roomTypeId: this.tempChangeRoom.newRoomTypeId
      }

      const fetchs = await Promise.all([
        await _changeRoom.fetchGetRoomNumbers(tempNumber),
        await _changeRoom.fetchGetDiscountAndType(tempDiscount)
      ])
      if (fetchs && fetchs.length) {
        let discountItems

        if (fetchs[0] !== null) {
          const changeRoomNumberItems = await _changeRoom.getRoomNumberItems(fetchs[0])
          this['changeRoom/SET_CHANGE_ROOM_NUMBER_ITEMS'](changeRoomNumberItems)
        }

        if (fetchs[1] !== null) {
          discountItems = await _changeRoom.getDiscountItems(fetchs[1])
          if (discountItems && discountItems.length) {
            discountItems.unshift({
              text: '無使用專案',
              value: ''
            })
            this['changeRoom/SET_CHANGE_ROOM_DISCOUNTITEMS'](discountItems)
          }
        } else {
          discountItems.push({
            text: '無使用專案',
            value: ''
          })
          this['changeRoom/SET_CHANGE_ROOM_DISCOUNTITEMS'](discountItems)
        }
      }
    },
    setkeepPrice (isKeep) {
      const isTypeAndNumberAlreadySet =
        this.tempChangeRoom.newRoomTypeId !== '' &&
        this.tempChangeRoom.newRoomNumberId !== ''

      if (isTypeAndNumberAlreadySet) {
        this['changeRoom/SET_KEEP_PRICE'](
          isKeep === '0'
            ? isKeep
            : '1'
        )
      } else {
        this['changeRoom/SET_DISCOUNT_ERROR'](true)
        this['changeRoom/SET_KEEP_PRICE'](null)
      }
    },
    async getNewPrice () {
      const priceItemOrigin = await _price.fetchGetBillAmount({
        bookingId: this.changeRoomItem.bookingId
      })

      this['changeRoom/SET_DISCOUNT_ERROR'](false)

      const config = {
        type: PRICE.PRICE_CHANGE_ROOM,
        bookingId: this.changeRoomItem.bookingId,
        stayingDay: this.changeRoomItem.stayingDay,
        expectedCheckInTime: this.changeRoomItem.expectedCheckInTime,
        expectedCheckOutTime: this.changeRoomItem.expectedCheckOutTime,
        roomTypeId: this.tempChangeRoom.newRoomTypeId,
        discountId: this.tempChangeRoom.discountId,
        originalPrice: priceItemOrigin.price, // 原始價位
        keepPrice: this.keepPrice, // 是否保留
        roomStatus: this.changeRoomItem.roomStatus
      }
      let priceItem = await _price.getPrice(config)

      if (priceItem && Object.keys(priceItem)) {
        const config = {
          type: PRICE.PRICE_UPDATE_TOTAL,
          bookingId: this.bookingId,
          price: priceItem.price
        }
        const price = createPrice()
        const updatePriceItem = await price.getPrice(config)
        priceItem = Object.assign(
          _utils.pickProps(priceItem, [
            'price',
            'payments',
            'difference'
          ]),
          {
            bookingId: this.changeRoomItem.bookingId,
            bookingDetailId: this.changeRoomItem.bookingDetailId,
            bookingNumber: this.changeRoomItem.bookingNumber,
            difference: updatePriceItem.difference
          })

        // 別急
        this['price/SET_PRICE_ITEM'](priceItem)
      }
    },
    async showDialogAfterChangeRoom () {
      // 先取得價格，確認是否已收款，避免已收款卻再次開啟彈窗
      const param = {
        type: PRICE.PRICE_ORDER_INFO_PAYMENT,
        bookingId: this.crBookingId
      }
      const priceItem = await _price.getPrice(param)
      if (!priceItem?.difference) {
        await this.getNewPrice()
        this['changeRoom/SET_TEMP_CHANGE_ROOM_DISCOUNTID']('')

        this.tempPayment = Object.assign(
          { bookingId: this.changeRoomItem.bookingId },
          _payment.getInitTempPayment()
        )
        this.tempPaymentMethods = _payment.getInitTempPaymentMethods()

        this['changeRoom/SET_TEMP_CHANGE_ROOM'](this.tempChangeRoom)
        await _dialog.setDialog({
          type: 'paymentKeepPrice',
          show: true
        })
      }
    },
    handleClickChangeRoom: _.debounce(async function () {
      try {
        const valid = await this.$refs.formChangeRoom.validate()
        if (!valid) return
        const temp = {
          newRoomTypeId: this.tempChangeRoom.newRoomTypeId,
          newRoomNumberId: this.tempChangeRoom.newRoomNumberId,
          bookingDetailId: this.changeRoomItem.bookingDetailId,
          expectedCheckInTime: this.changeRoomItem.expectedCheckInTime,
          expectedCheckOutTime: this.changeRoomItem.expectedCheckOutTime
        }
        const {
          success,
          message,
          roomNumber
        } = await _changeRoom.fetchPostChangeRoom(temp)
        if (success) {
          await _dialog.setDialog({
            type: 'changeRoom',
            show: false
          })
          await _dialog.setDialog({
            autoClose: true,
            msg: message,
            type: 'success'
          })
          await _dialog.setDialog({
            autoClose: true,
            msg: `房號為：${roomNumber}`,
            type: 'keycard'
          })
          await this.showDialogAfterChangeRoom()
        } else {
          await _dialog.setDialog({
            autoClose: true,
            msg: message,
            type: 'failed'
          })
        }
        this.$bus.$emit('change')
      } catch (err) {
        console.log(err)
      }
    }, 500),
    clearDisccountError () {
      this['changeRoom/SET_DISCOUNT_ERROR'](false)
    },
    /* ------------------------------------ *\
      $MULTI CLEAN
    \* ------------------------------------ */
    async showCleaningMultiRoomsDialog () {
      const isHas2 = _room.hasSpecificStatus(this.specificCards, ['2'])
      const isHas3 = _room.hasSpecificStatus(this.specificCards, ['3'])
      this['booking/SET_OPTION_AVAILABLE']({
        checkout: isHas2,
        cleaning: isHas3
      })
      _dialog.setDialog({
        type: 'multiCleanOption',
        show: true
      })
    },
    // 狀態 2
    async handleClickShowDialogChooseCheckOutRoom () {
      this['booking/SET_TYPE']({ type: '2' })
      const response = await _room.fetchGetCleaningList()
      if (response.length) {
        const _staff = createStaff()
        const items = _staff.getStaffItems('4', response)
        this.cleaningStaffItems = items
      }
      _dialog.setDialog({
        type: 'multiCleanOption',
        show: false
      })
      _dialog.setDialog({
        type: 'chooseCheckOutRoomToClean',
        show: true
      })
    },
    setStaffMultiClean ({ staffId }) {
      this['booking/SET_STAFFID']({ staffId })
    },
    async handleClickSetStatusMultiClean ({
      type,
      status
    }) {
      if (type === '2') {
        const valid = await this.$refs.multiClean.validate()
        if (!valid) return
        this['booking/SET_TYPE']({ type })
        this['booking/SET_STATUS']({ status })
      }
      switch (type) {
        case '2':
          _dialog.setDialog({
            type: 'chooseCheckOutRoomToClean',
            show: false
          })
          break
        case '3':
          this['booking/SET_TYPE']({ type: '3' })
          this['booking/SET_STATUS']({ status })
          _dialog.setDialog({
            type: 'multiCleanOption',
            show: false
          })
          break
        default:
          break
      }
    },
    handleClickSetMultiCleanItem (e) {
      if (e.roomStatus[0] === this.multiCleanType) {
        this['booking/SET_SELECT_ITEM'](e)
      }
    },
    handleClickCancelMutiClean () {
      this.handleClickSetStatusMultiClean({ status: '' })
      this['booking/CLEAR']()
    },
    async handleClickMultiClean () {
      try {
        this['booking/SET_TEMP']()
        if (this.tempMultiClean.bookingDetailId && this.tempMultiClean.bookingDetailId.length) {
          const res = await eventService.multiClean(this.tempMultiClean)
          if (res.data.success) {
            const finishText = this.tempMultiClean.roomStatus === '2'
              ? '清潔成功'
              : '清潔完成'
            _dialog.setDialog({
              autoClose: true,
              msg: finishText,
              type: 'success'
            })
            this.$bus.$emit('change')
          } else {
            _dialog.setDialog({
              autoClose: true,
              msg: '錯誤：系統錯誤',
              type: 'failed'
            })
          }
          this.handleClickSetStatusMultiClean({ status: '' })
          this['booking/CLEAR']()
        } else {
          _dialog.setDialog({
            autoClose: true,
            msg: '請先選擇房號',
            type: 'failed'
          })
        }
      } catch (err) {
        console.log(err)
      }
    }
  }
}
