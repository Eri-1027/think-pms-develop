import PRICE from '../constants/price'
import { mapState, mapMutations } from 'vuex'
import { mixinPayment } from './payment.mixin'
import { mixinUtils } from './utils.mixin'
import { createPrice } from '../utils/create/createPrice'
import { createDialog } from '../utils/helpers/createDialog'
import { createOrderInfo } from '../utils/create/createOrderInfo'
import eventService from '../utils/eventService'
const _dialog = createDialog()
const _orderInfo = createOrderInfo()
const _price = createPrice()
export const mixinOrderInfo = {
  mixins: [
    mixinPayment,
    mixinUtils
  ],
  data () {
    return {
      // dialog
      dialoExtraPaymentSuccess: false,
      dialogConfirmText: '',
      /* ------------------------------------ *\
       $FOR GLOBALLY USE
    \* ------------------------------------ */
      // local-item
      priceAndTypeData: {},
      // fetch
      roomTypeData: [], // for insert both `general` and `rest` booking use
      dialogType: 'insert-options',
      // nav-input
      searchUnCheckIn: ''
      // date
    }
  },
  mounted () {
    this.$bus.$on('init-temp-extra-expense', () => {
      console.log(this.$refs)
    })
  },
  computed: {
    ...mapState({
      orderInfo: state => state.orderInfo.orderInfo,
      extraExpenses: state => state.orderInfo.extraExpenses,
      bookingId: state => state.orderInfo.bookingId
    })
  },
  methods: {
    ...mapMutations([
      'room/SET_SELECTED',
      'orderInfo/SET_TAB',
      'orderInfo/SET_ORDER_INFO',
      'orderInfo/SET_EXTRA_EXPENSES',
      'orderInfo/SET_PAYMENT',
      'orderInfo/SET_BOOKINGID',
      'orderInfo/SET_BOOKINGDETAILID',
      'orderInfo/CLEAR_SELECTED',
      'orderInfo/SET_STATUS'
    ]),
    isCheckboxDisabled (item) {
      return item && item.disabled
    },
    async reFetchHandler () {
      await _orderInfo.setOrderInfoItem({
        type: this.dialogOrderOptions,
        item: this.orderInfo
      })
      this['room/SET_SELECTED']([])
    },
    async emitDialog ({
      type,
      bookingId,
      bookingDetailId,
      bookingNumber
    }) {
      _orderInfo.initStatus()
      this['orderInfo/SET_BOOKINGID'](bookingId)
      this['orderInfo/SET_BOOKINGDETAILID'](bookingDetailId)
      await _orderInfo.setOrderInfoItem({
        type,
        bookingId,
        bookingNumber
      })
      _dialog.setDialog({
        type: 'ordersOrderInfo',
        show: true
      })
      this['orderInfo/SET_TAB'](type)
      this['room/SET_SELECTED']([])
    },
    async setDialog ({
      type,
      isShow
    }) {
      switch (type) {
        case 'ORDER_EXTRA_EXPENSE':
          await this.setDilogExtraExpense({ isShow })
          break
        case 'ORDER_EXTRA_PAYMENT':
          await this.setDilogExtraPayment({ isShow })
          break
        default:
          break
      }
    },
    async setDilogExtraPayment  ({ isShow }) {
      const config = {
        type: PRICE.PRICE_EXTRA_PAYMENT,
        bookingId: this.priceItem.bookingId
      }
      const price = createPrice()
      this.$set(this.priceItem, 'bookingId', config.bookingId)
      const priceItem = await price.getPrice(config)
      this.priceItem.price = priceItem.price
      this.priceItem.payments = priceItem.payments
      this.priceItem.difference = priceItem.difference
      await _dialog.setDialog({
        type: 'paymentExtra',
        show: true
      })
    },
    async closeOrderInfoDialogHandler () {
      await _dialog.setDialog({
        type: 'ordersOrderInfo',
        show: false
      })
      this['orderInfo/CLEAR_SELECTED']()
    },
    async deleteExtraExpense (item) {
      try {
        const data = {
          extraExpenseOrderId: item.extraExpenseOrderId
        }
        const result = await _orderInfo.fetchDeleteExtraExpenseOrder(data)
        if (result) {
          this.emitDialog({
            type: 'ORDER_ORDER_INFO',
            bookingId: this.bookingId,
            bookingNumber: this.bookingNumber
          })
          await _dialog.setDialog({
            autoClose: true,
            msg: '刪除成功',
            type: 'success'
          })
        }
      } catch (err) {
        console.log(err)
      }
    },
    async insertExtraExpenseOrder () {
      const valid = await this.$refs.formExtraExpense.validate()
      if (!valid) return
      try {
        const data = {
          extraExpenseId: this.tempExtraExpense.extraExpenseId,
          extraExpenseOrderNumber: this.tempExtraExpense.extraExpenseOrderNumber,
          extraExpenseOrderTotalPrice: +this.tempExtraExpense.extraExpenseOrderSinglePrice * +this.tempExtraExpense.extraExpenseOrderNumber,
          bookingId: this.orderInfo.bookingId,
          extraExpenseOrderNote: this.tempExtraExpense.extraExpenseOrderNote
        }
        const result = await _orderInfo.fetchPostExtraExpenseOrder(data)
        if (result) {
          await _dialog.setDialog({
            type: 'ordersExtraExpense',
            show: false
          })
          await _dialog.setDialog({
            autoClose: true,
            msg: '新增成功',
            type: 'success'
          })
          this.emitDialog({
            type: 'ORDER_ORDER_INFO',
            bookingId: this.bookingId,
            bookingNumber: this.bookingNumber
          })
        }
      } catch (err) {
        console.log(err)
      }
    },
    setTempUpdateOrderInfo ({ prop, val }) {
      this.$set(this.tempOrderInfo[prop], val)
    },
    /* ------------------------------------ *\
      both order-info & TheOrderList.vue
    \* ------------------------------------ */
    pickOrderCheckInDate (date) {
      this.tempOrderInfo.expectedCheckInTime = date
    },
    pickOrderCheckOutDate (date) {
      this.tempOrderInfo.expectedCheckOutTime = date
    },
    async updateOrder ({
      orders,
      extraExpenses
    }) {
      const tempBookingDetails = orders.map(el => el.bookingDetailId)
      const tempRoomCards = this.tempOrderInfo.keycardNumber
      const data = {
        peopleNumber: this.tempOrderInfo.numberOfPeople,
        bookingNote: this.tempOrderInfo.bookingNote,
        roomCards: tempRoomCards,
        count: tempRoomCards.length,
        // above is in this.tempOrderInfo
        bookingId: this.orderInfo.bookingId,
        bookingDetails: tempBookingDetails, // 每筆房間的 bookingDetailId
        originalPrice: orders.map(el => el.roomPrice), // 房單價格
        extraExpenseOrderId: extraExpenses.map(el => el.extraExpenseOrderId), // new feature!
        number: extraExpenses.map(el => el.extraExpenseOrderNumber), // new feature!
        note: extraExpenses.map(el => el.extraExpenseOrderNote), // new feature!
        total: extraExpenses.map(el => el.extraExpenseOrderTotalPrice) // new feature!
      }
      const res = await eventService.updateOrder(data)
      if (res.data.success) {
        await this.emitDialog({
          type: 'ORDER_ORDER_INFO',
          bookingId: this.bookingId,
          bookingDetailId: this.bookingDetailId,
          bookingNumber: this.bookingNumber
        })
        _dialog.setDialog({
          autoClose: true,
          msg: '修改成功',
          type: 'success'
        })
      }
      _orderInfo.initStatus()
    },
    async getExtraExpenseItemsHandler () {
      try {
        const extras = await _orderInfo.fetchGetExtraExpenseItems()
        if (extras && extras.length) {
          return extras.filter(extra => {
            return extra.extraExpenseEnable === '1'
          }).map(extra => {
            return {
              text: extra.extraExpenseName,
              value: extra.extraExpenseId
            }
          })
        }
      } catch (err) {
        console.log(err)
      }
    },
    // extraExpense 選擇品項後觸發
    async setExtraExpenseSinglePrice () {
      const extras = await _orderInfo.fetchGetExtraExpenseItems()
      if (extras && extras.length && this.tempExtraExpense.extraExpenseId) {
        extras.forEach(extra => {
          if (extra.extraExpenseId === this.tempExtraExpense.extraExpenseId) {
            this.tempExtraExpense.extraExpenseOrderSinglePrice = extra.extraExpensePrice
            this.tempExtraExpense.extraExpenseOrderNumber = 1
          }
        })
      }
    },
    /* ------------------------------------ *\
      payment
    \* ------------------------------------ */
    async handleClickAddExtraPayment () {
      const params = {
        type: PRICE.PRICE_EXTRA_PAYMENT,
        bookingId: this.bookingId
      }
      const priceItem = await _price.getPrice(params)
      if (priceItem) {
        this.$set(priceItem, 'bookingId', this.bookingId)
        this.$set(priceItem, 'price', priceItem.price)
        this.$set(priceItem, 'payment', priceItem.payments)
        this.$set(priceItem, 'difference', priceItem.difference)
        this.$set(priceItem, 'bookingNumber', this.orderInfo.bookingNumber)
        this['price/SET_PRICE_ITEM'](priceItem)
        await _dialog.setDialog({
          type: 'paymentExtra',
          show: true
        })
      }
    },
    async cancelBookingHandler () {
      const illegalRoomStatus =
      (this.orderInfo.roomStatus === '0') ||
      (this.orderInfo.roomStatus === '4') ||
      (this.orderInfo.roomStatus === '6')
      if (illegalRoomStatus) {
        _dialog.setDialog({
          type: 'cancelBookingConfirm',
          show: true
        })
        this.dialogConfirmText = '確定要取消訂單嗎？訂單一經取消便無法復原！'
      } else {
        this['room/SET_SELECTED']([])
        _dialog.setDialog({
          autoClose: true,
          msg: '該房間狀態不得取消',
          type: 'failed'
        })
      }
    },
    /// ?????????
    // 第一步 `點選辦理入住`(for order-info)
    async checkInHandler (type) {
      if (!this.selected.length) {
        _dialog.setDialog({
          autoClose: true,
          msg: '沒有選取任何房號',
          type: 'failed'
        })
        return
      }

      // 假如這邊有不只一間房間，有的已排房，有的未排房，dialog 該如何顯示？
      for (let i = 0; i < this.selected.length; i++) {
        if (this.selected[i].roomStatus === '0') {
          const data = {
            bookingDetailId: this.selected[i].bookingDetailId,
            roomId: this.selected[i].roomId,
            roomTypeId: this.selected[i].roomTypeId,
            checkOut: this.selected[i].expectedCheckOutTime
          }
          if (this.selected[i].roomNumber === null) {
            await _dialog.setDialog({
              autoClose: true,
              msg: '未排房不可入住',
              type: 'failed'
            })
            return
          }
          const res = await eventService.checkIn(data)
          if (res.data.success) {
            if (res.data.fetch.checkInMessage === 'error: future date cant be check in right now.') {
              await _dialog.setDialog({
                autoClose: true,
                msg: '未來訂單不可入住',
                type: 'failed'
              })
              return
            }
            if (res.data.fetch.checkInMessage !== 'success') {
              return
            }
          }
        }
      }
      await this.showRoomsCards(this.orderInfo.bookingId)
      await _dialog.setDialog({
        autoClose: true,
        msg: '入住成功',
        type: 'success'
      })
      const roomItems = this.selected.map(el => el.roomNumber)
      this.roomItemsForDialog = roomItems.join()
      await _dialog.setDialog({
        autoClose: true,
        type: 'keycard'
      })
      this['room/SET_SELECTED']([])
    }
  }
}
