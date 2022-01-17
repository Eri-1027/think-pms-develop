import PRICE from '../constants/price'
import { mapState, mapMutations } from 'vuex'
import { mixinUtils } from './utils.mixin'
import { mixinPayment } from './payment.mixin'
import { createPrice } from '../utils/create/createPrice'
import { createPayment } from '../utils/create/createPayment'
import { createDialog } from '../utils/helpers/createDialog'
import { createBooking } from '../utils/create/createBooking'
import { createBookingRest } from '../utils/create/createBookingRest'
import { createValidate } from '../utils/helpers/createValidate'
import { createFormat } from '../utils/helpers/createFormat'
const _price = createPrice()
const _payment = createPayment()
const _dialog = createDialog()
const _booking = createBooking()
const _bookingRest = createBookingRest()
const _format = createFormat()
const _v = createValidate()
/**
 * 新增訂單
 */
export const mixinInsertBooking = {
  mixins: [
    mixinUtils,
    mixinPayment
  ],
  data () {
    return {
      tempBooking: {
        expectedCheckInTime: '',
        expectedCheckOutTime: '',
        stayingDay: '',
        numberOfPeople: '',
        bookingNote: '',
        roomType: [],
        discountId: [],
        roomStatus: '0',
        customerName: '',
        customerGender: '',
        customerPhone: '',
        customerEmail: '',
        customerNationality: '',
        customerIdNumber: '',
        customerPassportNumber: '',
        count: ''
      },
      tempRestBooking: {
        totalPrice: '',
        roomTypeId: '',
        roomId: '',
        hours: ''
      },
      isReserve: false,
      roomTypeItems: [],
      customerGenderItems: [
        { text: '男', value: '0' },
        { text: '女', value: '1' },
        { text: '其他', value: '2' }
      ],
      roomTypeRestItems: [],
      restRoomNumberItems: [],
      customerList: [],
      roomNumberErrMsg: '',
      needCustomerNameError: false,
      restAvailableHour: ''

    }
  },
  computed: {
    ...mapState({
      staffId: state => state.user.staff.staffId
    }),
    /* ------------------------------------ *\
       $INSERT `GENERAL` BOOKING
    \* ------------------------------------ */
    validateRoom () {
      return numberOfPeople => {
        let availableNumbers = 0
        if (
          this.tempBooking.numberOfPeople &&
          this.roomTypeItems &&
          this.roomTypeItems.length
        ) {
          for (let i = 0; i < this.roomTypeItems.length; i++) {
            let a
            if (this.tempBooking.roomType && this.tempBooking.roomType.length) {
              a = +this.tempBooking.roomType[i].roomTypeNumber // 目前正在選的房間及間數
            }

            const b = +this.roomTypeItems[i].roomAccommodate // 正在選的該房間的可入住人數
            availableNumbers = availableNumbers + a * b
          }
          if (numberOfPeople > availableNumbers) {
            return '剩餘房間數不足。目前所剩房間已無法容納您所選之人數，請重新選擇。'
          } else {
            return ''
          }
        } else {
          return ''
        }
      }
    },
    _stayingDay: {
      get () {
        if (
          !this.tempBooking.expectedCheckOutTime ||
          !this.tempBooking.expectedCheckInTime
        ) {
          return 0
        }
        return (
          this.$date(
            this.$date(this.tempBooking.expectedCheckOutTime).diff(
              this.$date(this.tempBooking.expectedCheckInTime, 'day')
            )
          ).format('D') - 1
        )
      },
      set (val) {
        this._stayingDay = val
      }
    },
    /* ------------------------------------ *\
      $INSERT `REST` BOOKING
    \* ------------------------------------ */
    restTotalPrice () {
      return this.tempRestBooking.totalPrice
    }
  },
  mounted () {
    this.$bus.$on('init-temp-booking', async () => {
      if (this.$refs.formInsertGenaralBooking) {
        this.$refs.formInsertGenaralBooking.reset()
      }
    })
    this.$bus.$on('init-temp-rest-booking', async () => {
      if (this.$refs.formRestBooking) {
        this.$refs.formRestBooking.reset()
      }
    })
  },
  methods: {
    ...mapMutations(['price/SET_PRICE_ITEM']),
    // 第一步 `選擇新增類型`
    async handleClickShowDialogBookingOption () {
      _dialog.setDialog({ type: 'insertOption', show: true })
    },
    /* ------------------------------------ *\
       $INSERT `GENERAL` BOOKING
    \* ------------------------------------ */
    // 新增訂單 > 選擇訂單類型 > 入住
    async handleClickShowDialogInsertBooking () {
      this.tempBooking = _booking.getInitTempBooking(this.tempBooking)
      _dialog.setDialog({
        type: 'insertOption',
        show: false
      })
      _dialog.setDialog({
        type: 'insertGeneralBooking',
        show: true
      })
    },
    handleClickPickCheckInDate (date) {
      this.tempBooking.expectedCheckInTime = date
      this.tempBooking.expectedCheckOutTime = ''
      _booking.validatePostBookingPart(this.tempBooking, ['v1'])
    },
    async handleClickPickCheckOutDate (date) {
      try {
        if (!this.tempBooking.expectedCheckInTime) return

        this.tempBooking.expectedCheckOutTime = date
        _booking.validatePostBookingPart(this.tempBooking, ['v2'])

        const roomTypeItems = await _booking.getItemsRoomType(
          {
            checkInTime: this.tempBooking.expectedCheckInTime, checkOutTime: this.tempBooking.expectedCheckOutTime
          }
        )
        this.roomTypeItems = roomTypeItems
        if (roomTypeItems && roomTypeItems.length) {
          this.tempBooking = Object.assign(
            this.tempBooking,
            {
              roomType: _booking.getTempRoomType(roomTypeItems),
              discountId: _booking.getTempDiscountId(roomTypeItems.length),
              stayingDay: this._stayingDay,
              numberOfPeople: 1
            }
          )
        }
      } catch (err) {
        console.log(err)
      }
    },
    // 第五步 假如客戶資料存在，透過身分證或是護照，設定客戶資料
    async handleClickCheckCustomer (field) {
      try {
        const isPhone = _v.isPhone(this.tempBooking.customerPhone)
        const isIdNumber = _v.isIdNumber(this.tempBooking.customerIdNumber)

        if (field === 'ID' && !isIdNumber) {
          console.log('格式不正確')
          // await _booking.validatePostBookingPart(this.tempBooking, ['v6', 'v7'])
        }
        if (field === 'PHONE' && !isPhone) {
          console.log('格式不正確')
          await _booking.validatePostBookingPart(this.tempBooking, ['v7'])
        }
        const temp = {
          customerIdNumber: this.tempBooking.customerIdNumber,
          customerPassportNumber: this.tempBooking.customerPassportNumber,
          customerPhone: this.tempBooking.customerPhone,
          field
        }
        if (
          !this.tempBooking.customerIdNumber &&
          !this.tempBooking.customerPassportNumber &&
          !this.tempBooking.customerPhone
        ) {
          return
        } else {
          const customers = await _booking.fetchGetCustomerByCheck(temp)
          if (customers && customers.length) {
            if (customers.length > 1 && field === 'PHONE') {
              this.customerList = customers
              _dialog.setDialog({
                type: 'customerListOfInsertBooking',
                show: true
              })
            } else {
              this.tempBooking = Object.assign(this.tempBooking, {
                customerEmail: customers[0].customerEmail,
                customerGender: customers[0].customerGender,
                customerIdNumber: customers[0].customerIdNumber,
                customerName: customers[0].customerName,
                customerNationality: customers[0].customerNationality,
                customerPhone: customers[0].customerPhone,
                numberOfPeople: 1
              })
              await _booking.validatePostBookingPart(this.tempBooking, ['v3', 'v4', 'v5', 'v6', 'v7'])
            }
          } else {
            await _booking.validatePostBookingPart(this.tempBooking, ['v5', 'v6', 'v7'])
          }
        }
      } catch (err) {
        console.log(err)
      }
    },
    handleClickSetTempCustomer (item) {
      if (item && Object.keys(item)) {
        this.tempBooking = Object.assign(this.tempBooking, {
          customerEmail: item.customerEmail,
          customerGender: item.customerGender,
          customerId: item.customerId,
          customerName: item.customerName,
          customerNationality: item.customerNationality,
          customerIdNumber: item.customerIdNumber,
          customerPassportNumber: item.customerPassportNumber,
          customerPhone: item.customerPhone,
          numberOfPeople: 1
        })
        _dialog.setDialog({ type: 'customerListOfInsertBooking', show: false })
      }
    },
    // 第六步 假如設定為 `保留房`，將客戶資料清空，狀態改為 6
    async handleClickSetReserve (val) {
      if (val) {
        this.tempBooking = Object.assign(this.tempBooking, {
          customerName: '保留',
          customerGender: 2,
          customerIdNumber: '',
          customerPassportNumber: '',
          customerNationality: '',
          customerEmail: '',
          customerPhone: '',
          roomStatus: '6'
        })
        this.$refs.formInsertGenaralBooking.reset()
      } else {
        this.tempBooking.roomStatus = '0'
      }
    },
    // 第七步 選擇 `自動` 或 `手動` 排房，並新增訂單
    async handleClickInsertBookingByInsertType (type) {
      const valid = await _booking.validatePostBookingAll(this.tempBooking)
      if (!valid) return
      if (this.tempBooking.roomStatus === '6') {
        const invalidInsertReserve =
          this.tempBooking.roomStatus === '6' && type === 'AUTO_ARRANGE'
        if (invalidInsertReserve) {
          await _dialog.setDialog({
            autoClose: true,
            msg: '請以手動排房新增保留房',
            type: 'failed'
          })
        } else {
          this.insertBooking(type)
        }
      }
      if (this.tempBooking.roomStatus === '0') {
        this.insertBooking(type)
        await _dialog.setDialog({
          type: 'insertGeneralBooking',
          show: false
        })
        await _dialog.setDialog({
          autoClose: true,
          msg: '訂單新增成功',
          type: 'success'
        })
      }
    },
    // 第八步 新增一筆訂單
    async insertBooking (type) {
      try {
        const {
          bookingId,
          bookingNumber
        } = await _booking.fetchPostBooking(this.tempBooking)
        await _booking.doPaymentInitBooking(bookingId)
        if (!bookingId) {
          await _dialog.setDialog({
            autoClose: true,
            msg: '伺服器錯誤',
            type: 'failed'
          })
          return
        }
        const isReserve = this.tempBooking.roomStatus === '6'
        if (isReserve) {
          await _dialog.setDialog({
            type: 'insertGeneralBooking',
            show: false
          })
          this.$bus.$emit('change')
          return
        } else {
          const res = await _booking.dispatchActions(type, bookingId, this.tempBooking)
          const {
            success,
            message,
            roomNumbers
          } = res
          if (success) {
            await _dialog.setDialog({
              autoClose: true,
              msg: message,
              type: 'success'
            })
            if (roomNumbers) {
              await _dialog.setDialog({
                autoClose: true,
                msg: `房號為：${_format.getDotsAppendBySplit(roomNumbers, 5, ',')}`,
                type: 'keycard'
              })
            }
            const config = {
              type: PRICE.PRICE_INSERT_BOOKING,
              bookingId: bookingId,
              stayingDay: this.tempBooking.stayingDay,
              expectedCheckInTime: this.tempBooking.expectedCheckInTime,
              expectedCheckOutTime: this.tempBooking.expectedCheckOutTime,
              roomStatus: this.tempBooking.roomStatus
            }
            const priceItem = await _price.getPrice(config)
            if (priceItem) {
              this.$set(priceItem, 'bookingId', bookingId)
              this.$set(priceItem, 'bookingNumber', bookingNumber)
              this['price/SET_PRICE_ITEM'](priceItem)
            }
            this.tempPayment = _payment.getInitTempPayment()
            this.$bus.$emit('change')
            _dialog.setDialog({
              type: 'paymentAfterInsertBooking',
              show: true
            })
          }
        }
      } catch (err) {
        console.log(err)
      }
    },
    // for insertBooking methods
    // change discountId:['1'] to ['1','0','3'], if index[1] is not exist
    // then finally become "1,0,3"
    getNewDiscountId (data) {
      const newDiscountId = data.discountId.map(el => {
        if (el === '') {
          el = '0'
          return el
        } else {
          return el
        }
      })
      return newDiscountId
    },
    /* ------------------------------------ *\
      $INSERT `REST` BOOKING
   \* ------------------------------------ */
    // 新增訂單 > 選擇訂單類型 > 休息
    async handleClickShowDialogInsertRestBooking () {
      this.tempRestBooking = _bookingRest.getInitTempRestBooking(this.tempRestBooking)
      this.restAvailableHour = _bookingRest.getRestAvailableHour()

      const types = await _bookingRest
        .getRestRoomTypeItems()
      this.roomTypeRestItems = types.sort((a, b) => (+a.value) - (+b.value))

      _dialog.setDialog({
        type: 'insertOption',
        show: false
      })
      _dialog.setDialog({
        type: 'insertRestBooking',
        show: true
      })
    },
    // 請選擇房型
    async handleClickSetRoomType (item) {
      const defaulHours = await _bookingRest.fetchGetHoursDefault({
        roomTypeId: item.roomTypeId
      })
      // 選擇房型後，清空選擇的房間及小時
      this.tempRestBooking = Object.assign(this.tempRestBooking, {
        roomId: '',
        hours: ''
      })

      this.restRoomNumberItems = []
      if (defaulHours) {
        this.tempRestBooking = Object.assign(this.tempRestBooking, {
          hours: defaulHours
        })
      }

      // 設置預設時數對應的價格
      const price = await _bookingRest.fetchGetRestPrice(this.tempRestBooking)
      this.tempRestBooking = Object.assign(this.tempRestBooking, {
        totalPrice: price
      })

      /// ???
      const hours = _bookingRest.getHours(defaulHours, this.tempRestBooking.hours)
      this.$set(this.tempRestBooking, 'hours', hours)

      const roomNumbers = await _bookingRest.fetchGetRoomNumbers(this.tempRestBooking)
      if (!roomNumbers.length || roomNumbers === null) {
        this.roomNumberErrMsg = '該時段無可休息房間！'
      } else {
        this.roomNumberErrMsg = ''
      }

      this.restRoomNumberItems = _bookingRest
        .getRestRoomNumberItems(roomNumbers)
        .sort((a, b) => (+a.text) - (+b.text))
    },
    // 選擇時數
    async handleSelectRestHour () {
      const price = await _bookingRest.fetchGetRestPrice(this.tempRestBooking)
      this.$set(this.tempRestBooking, 'totalPrice', price)
    },
    // 收款
    async handleClickInsertRestBooking () {
      try {
        const valid = await this.$refs.formRestBooking.validate()
        if (!valid) return

        const {
          success,
          bookingId,
          message
        } = await _bookingRest.fetchPostRestBooking(
          this.tempRestBooking
        )

        if (success && bookingId) {
          const config = {
            type: PRICE.PRICE_INSERT_REST_BOOKING,
            bookingId,
            roomTypeId: this.tempRestBooking.roomTypeId,
            hours: this.tempRestBooking.hours,
            roomStatus: '4'
          }
          const priceItem = await _price.getPrice(config)
          this.$set(priceItem, 'bookingId', bookingId)
          this['price/SET_PRICE_ITEM'](priceItem)
          if (priceItem) {
            _dialog.setDialog({
              type: 'insertRestBooking',
              show: false
            })
            await _dialog.setDialog({
              autoClose: true,
              msg: '新增成功',
              type: 'success'
            })

            await _booking.doPaymentInitBooking(this.bookingId)

            this.tempPayment = _payment.getInitTempPayment()
            this.tempPaymentMethods = _payment.getInitTempPaymentMethods()

            _dialog.setDialog({
              type: 'paymentAfterInsertRestBooking',
              show: true
            })
          }
        } else {
          if (message) {
            _dialog.setDialog({
              autoClose: true,
              msg: message,
              type: 'failed'
            })
          }
        }
        this.$bus.$emit('change')
      } catch (err) {
        console.log(err)
      }
    }
  }
}
