import PRICE from '../constants/price'
import { mapState, mapMutations } from 'vuex'
import { mixinUtils } from './utils.mixin'
import { mixinPayment } from './payment.mixin'
import { mixinRoomActions } from './roomActions.mixin'
import { createPrice } from '../utils/create/createPrice'
import { createDialog } from '../utils/helpers/createDialog'
import { createUnCheckIn } from '../utils/create/createUnCheckIn'
import { createUtils } from '../utils/helpers/createUtils'
import { createPayment } from '../utils/create/createPayment'
import _ from 'lodash'
import eventService from '../utils/eventService'
const _dialog = createDialog()
const _price = createPrice()
const _unCheckIn = createUnCheckIn()
const _utils = createUtils()
const _payment = createPayment()

export const mixinUnCheckIn = {
  mixins: [
    mixinUtils,
    mixinPayment,
    mixinRoomActions
  ],
  data () {
    return {
      unCheckInData: [],
      searchUnCheckIn: '',
      particularCustomer: [],
      checkInRoomRadio: [],
      dialogUnCheckInStatus: '',
      showUnCheckInRoomsStatus: '',
      tempCustomerUnCheckIn: {
        bookingId: '',
        customerName: '',
        customerGender: '',
        customerNationality: '',
        customerIdNumber: '',
        customerPassportNumber: '',
        customerPhone: '',
        customerEmail: ''
      }
    }
  },
  computed: {
    ...mapState({
      dialogUnCheckInConfirmCustomer: state => state.dialog.map.unCheckInConfirmCustomer,
      selected: state => state.room.selected
    }),
    selectedAll: {
      get () {
        const isAll = (data) => {
          return data.every(el => el !== null)
        }
        if (this.particularCustomer && this.particularCustomer.length) {
          return this.selected && this.selected.length
            ? (this.selected.length === this.particularCustomer.length)
              ? isAll(this.selected)
              : false
            : false
        } else {
          return false
        }
      },
      set (val) {
        this['room/SET_SELECTED']([])
        if (this.particularCustomer && this.particularCustomer.length) {
          if (val) {
            this['room/SET_SELECTED'](this.particularCustomer)
          } else {
            const phs = this.particularCustomer.map(el => null)
            this['room/SET_SELECTED'](phs)
          }
        }
      }
    }
  },
  mounted () {
    this.$bus.$on('change', async () => {
      await this.setUnCheckIns()
    })
  },
  methods: {
    ...mapMutations([
      'room/SET_SELECTED',
      'payment/SET_AFTER_PAYMENT_ITEM'
    ]),
    async handleClickShowDialogUnCheckIn () {
      await this.setUnCheckIns()
      await _dialog.setDialog({
        type: 'unCheckIns',
        show: true
      })
    },
    async setUnCheckIns () {
      try {
        const result = await _unCheckIn.fetchGetUnCheckIn()
        if (result && result.length) {
          const converts = _utils.getResponseModified(
            ['customerEnable', 'roomAddable'],
            'TO_BOOLEAN',
            result
          )
          this.unCheckInData = await _unCheckIn.getUnCheckInModified(converts)
        } else {
          this.unCheckInData = []
        }
      } catch (err) {
        console.log(err)
      }
    },
    async searchUnCheckInData () {
      try {
        const temp = {
          search: this.searchUnCheckIn
        }
        if (temp.search === '') {
          this.setUnCheckIns()
        }
        const result = await _unCheckIn.fetchGetSearchUnCheckIn(temp)
        const converts = this._$dataTypeConvert.transAfterRes(result, 'customerEnable'
        )
        this.unCheckInData = converts
      } catch (err) {
        console.log(err)
      }
    },
    // Setp 1 點擊訂單入住的未入住訂單，跳出確認旅客資訊
    async confirmParticularCustomer (item) {
      try {
        const isAllRoomsArrange = (items) => {
          return items && items.length
            ? items.every(item => item.roomNumber !== null)
            : false
        }
        this.tempCustomerUnCheckIn = Object.assign({}, item)
        const data = {
          bookingId: item.bookingId
        }
        this.particularCustomer = await _unCheckIn.fetchGetParticularCustomer(data)

        if (!this.particularCustomer.length) {
          await _dialog.setDialog({
            autoClose: true,
            msg: '沒有旅客資訊',
            type: 'failed'
          })
        }

        if (!isAllRoomsArrange(this.particularCustomer)) {
          this.showUnCheckInRoomsStatus = 'empty'
        }
        if (isAllRoomsArrange(this.particularCustomer) && this.particularCustomer.length === 1) {
          this.showUnCheckInRoomsStatus = 'single'
          this['room/SET_SELECTED']([item])
        } else if (this.particularCustomer.length > 1 && isAllRoomsArrange(this.particularCustomer)) {
          this.showUnCheckInRoomsStatus = 'plural'
          const items = JSON.parse(JSON.stringify(this.particularCustomer))
          const phs = items.map(el => null)
          this['room/SET_SELECTED'](phs)
        }
        await _dialog.setDialog({
          type: 'unCheckInConfirmCustomer',
          show: true
        })
      } catch (err) {
        console.log(err)
      }
    },
    // step 2 確認是否付款？ 是否跳過付款 ？ 是否已付款 ？ 決定是否跳出 payment dialog
    handleClickCheckInForUnCheckIn: _.debounce(async function () {
      try {
        const config = {
          type: PRICE.PRICE_UNCHECKIN,
          stayingDay: this.tempCustomerUnCheckIn.stayingDay,
          expectedCheckInTime: this.tempCustomerUnCheckIn.expectedCheckInTime,
          expectedCheckOutTime: this.tempCustomerUnCheckIn.expectedCheckOutTime,
          bookingId: this.tempCustomerUnCheckIn.bookingId,
          roomStatus: this.tempCustomerUnCheckIn.roomStatus
        }
        const selected = this.selected.filter(el => el !== null)
        const rooms = selected.map(el => el.roomNumber).join(',')
        const priceItem = await _price.getPrice(config)

        const isPaid = _payment.isPaid(priceItem)

        this.dialogUnCheckInStatus = ''
        if (priceItem) {
          this.$set(priceItem, 'bookingId', this.tempCustomerUnCheckIn.bookingId)
          this.$set(priceItem, 'bookingNumber', this.particularCustomer[0].bookingNumber)
          this['price/SET_PRICE_ITEM'](priceItem)
        }

        if (selected && selected.length) {
          this.closeUnCheckInConfirmCustomerDialog()
          const res = await this.checkIn(selected)
          const {
            success,
            message
          } = res
          if (isPaid) {
            if (success) {
              await _dialog.setDialog({
                autoClose: true,
                msg: message,
                type: 'success'
              })
              await _dialog.setDialog({
                autoClose: true,
                msg: `房號為：${rooms}`,
                type: 'keycard'
              })
            } else {
              await _dialog.setDialog({
                autoClose: true,
                msg: message,
                type: 'failed'
              })
            }
          } else {
            if (success) {
              this['room/SET_SELECTED'](selected)
              this.cashStaffItems = await _payment.getCashStaffItems()
              await _dialog.setDialog({
                type: 'unCheckInConfirmCustomer',
                show: false
              })
              await _dialog.setDialog({
                autoClose: true,
                msg: message,
                type: 'success'
              })
              await _dialog.setDialog({
                autoClose: true,
                msg: `房號為：${rooms}`,
                type: 'keycard'
              })
              await _dialog.setDialog({
                type: 'paymentUnCheckIn',
                show: true
              })
            } else {
              await _dialog.setDialog({
                type: 'unCheckInConfirmCustomer',
                show: false
              })
              await _dialog.setDialog({
                autoClose: true,
                msg: message,
                type: 'failed'
              })
            }
          }
        } else {
          _dialog.setDialog({
            autoClose: true,
            msg: '請先選擇欲入住房間',
            type: 'failed'
          })
        }
        this.$bus.$emit('change')
        this['room/SET_SELECTED']([])
      } catch (err) {
        console.log(err)
      }
    }, 300),
    async getCheckInRoomForDialog (radioData) {
      const items = []
      radioData.forEach(el => {
        this.particularCustomer.forEach(el2 => {
          if (el2.bookingDetailId === el) {
            items.push(el2.roomNumber)
          }
        })
      })
      return items
    },
    updateCustomerHandler () {
      this.dialogUnCheckInStatus = 'update'
      this.tempCustomerUnCheckIn = Object.assign({}, this.tempCustomerUnCheckIn, this.particularCustomer[0])
    },
    async updateCustomer () {
      try {
        const temp = {
          customerId: this.tempCustomerUnCheckIn.customerId,
          customerName: this.tempCustomerUnCheckIn.customerName,
          customerGender: this.tempCustomerUnCheckIn.customerGender,
          customerPhone: this.tempCustomerUnCheckIn.customerPhone,
          customerEmail: this.tempCustomerUnCheckIn.customerEmail,
          customerNationality: this.tempCustomerUnCheckIn.customerNationality,
          customerIdNumber: this.tempCustomerUnCheckIn.customerIdNumber,
          customerPassportNumber: this.tempCustomerUnCheckIn.customerPassportNumber,
          customerNote: this.tempCustomerUnCheckIn.customerNote
        }
        const res = await eventService.updateCustomer(temp)
        if (res.data.success) {
          const tempC = {
            bookingId: this.tempCustomerUnCheckIn.bookingId
          }
          const res1 = await _unCheckIn.fetchGetParticularCustomer(tempC)

          const isAllCheck = this.selected.every(el => el !== null)
          this.selected = isAllCheck
            ? this.selected
            : []
          this.particularCustomer = res1
          this.dialogUnCheckInStatus = ''
          await _dialog.setDialog({
            autoClose: true,
            msg: '更新成功',
            type: 'success'
          })
        }
      } catch (err) {
        console.log(err)
      }
    },
    async closeUnCheckInConfirmCustomerDialog () {
      this['room/SET_SELECTED']([])
      this.dialogUnCheckInStatus = ''
      await _dialog.setDialog({
        type: 'unCheckInConfirmCustomer',
        show: false
      })
    },
    handleClickSetSelected (item, index) {
      const selected = this.selected.map((select, idx) => {
        if (idx === index) {
          select = select === null
            ? select = item
            : select = null
        }
        return select
      })
      this['room/SET_SELECTED'](selected)
    }
  }
}
