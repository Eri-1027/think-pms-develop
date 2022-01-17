import PRICE from '../constants/price'
import { mapState, mapMutations } from 'vuex'
import { mixinUtils } from './utils.mixin'
import { createPrice } from '../utils/create/createPrice'
import { createDialog } from '../utils/helpers/createDialog'
import { createPayment } from '../utils/create/createPayment'
import { createUtils } from '../utils/helpers/createUtils'
import { createRoom } from '../utils/create/createRoom'
import { createOrderInfo } from '../utils/create/createOrderInfo'
import _ from 'lodash'
const _utils = createUtils()
const _payment = createPayment()
const _dialog = createDialog()
const _room = createRoom()
const _orderInfo = createOrderInfo()

export const mixinPayment = {
  mixins: [mixinUtils],
  data () {
    return {
      tempPaymentItem: {},
      paymentItem: {
        price: 0,
        payment: 0,
        difference: 0,
        bill: []
      },
      tempPayment: {
        staffId: '',
        paymentType: '',
        paymentMethod: [],
        paymentAmount: [],
        paymentNote: [],
        taxNumber: '',
        bookingId: ''
      },
      tempPaymentMethods: [
        {
          paymentMethod: '',
          paymentAmount: '',
          paymentNote: ''
        }
      ],
      paymentTypeItems: [
        { text: '訂金', value: '0' },
        { text: '現場收款', value: '1' },
        { text: '月結簽帳', value: '2' },
        { text: '帳務調整', value: '3' },
        { text: '退款', value: '4' },
        { text: '其他', value: '5' }
      ],
      paymentMethodsItems: [
        { text: '現金', value: '0' },
        { text: '信用卡', value: '1' },
        { text: '轉帳', value: '2' },
        { text: '其他', value: '3' },
        { text: '行動支付', value: '5' }
      ],
      cashStaffItems: []
    }
  },
  computed: {
    ...mapState({
      dialogPaymentUnCheckIn: state => state.dialog.map.paymentUnCheckIn,
      // page-payment
      price: state => state.price.price,
      payment: state => state.price.payment,
      difference: state => state.price.difference,
      bookingId: state => state.price.bookingId,
      bookingDetailId: state => state.price.bookingDetailId,
      bookingNumber: state => state.price.bookingNumber,
      selected: state => state.room.selected
    })
  },
  updated () {
    this.$bus.$on('clear-temp-payment', () => {
      this.tempPayment = _payment.getInitTempPayment()
      this.tempPaymentMethods = _payment.getInitTempPaymentMethods()
    })
  },
  async created () {
    this.cashStaffItems = await _payment.getCashStaffItems()
  },
  methods: {
    ...mapMutations([
      'price/SET_PRICE_ITEM',
      'price/SET_PRICE_ITEM_DIFFERENCE'
    ]),
    setPriceAsPaymentAmount ({
      source,
      i
    }) {
      if (this.difference) {
        if (source !== '') {
          if (this.tempPaymentMethods.length === 1) {
            // 已經等同待收，點擊歸零
            if (+this.tempPaymentMethods[0].paymentAmount === this.difference) {
              this.tempPaymentMethods[0].paymentAmount = 0
              return
            }
            this.tempPaymentMethods.map(el => {
              el.paymentAmount = this.difference
                ? +this.difference
                : 0
            })
          }
        }

        if (this.tempPaymentMethods.length > 1) {
          this.tempPaymentMethods.map((el, index) => {
            if (index === i) {
              if (
                +this.tempPaymentMethods[i].paymentAmount === this.difference
              ) {
                this.tempPaymentMethods[i].paymentAmount = 0
                return
              }
              el.paymentAmount = this.difference
                ? this.difference
                : ''
            } else {
              el.paymentAmount = 0
            }
            return el
          })
        }
      }
    },
    handleClickUpdatePaymentItemTotal: _.debounce(async function (e) {
      try {
        const config = {
          type: PRICE.PRICE_UPDATE_TOTAL,
          bookingId: this.bookingId,
          price: e
        }
        const price = createPrice()
        const priceItem = await price.getPrice(config)
        this['price/SET_PRICE_ITEM_DIFFERENCE'](priceItem.difference)
      } catch (err) {
        console.log(err)
      }
    }, 200),
    deletePaymentMethods ({ i }) {
      this.tempPaymentMethods.splice(i, 1)
    },
    addPaymentMethods () {
      this.tempPaymentMethods.push({
        paymentMethod: '',
        paymentAmount: '',
        paymentNote: ''
      })
    },
    handleClickPayment: _.debounce(async function (type) {
      const isPosType = _payment.isPosType(this.tempPaymentMethods)
      const typeOfDoPayment = isPosType
        ? 'COMPLEX'
        : 'SIMPLE'
      const hashString = `${this.bookingNumber}${this.$date().format('YYYYMMDDHHmmss')}`
      const paymentId = await _utils.getHash(hashString)
      const paramsComplex = {
        pos: {
          setting: {
            paymentId,
            orderNumber: this.bookingNumber,
            payment: this.tempPaymentMethods[0].paymentMethod,
            cost: this.tempPaymentMethods[0].paymentAmount
          }
        },
        trans: {
          setting: {
            paymentId,
            bookingNumber: this.bookingNumber,
            payment: this.tempPaymentMethods[0].paymentMethod
          }
        },
        pay: {
          setting: {
            bookingId: this.bookingId
          },
          temp: this.tempPayment,
          methods: this.tempPaymentMethods
        }
      }
      const paramsSimple = {
        pay: {
          setting: {
            bookingId: this.bookingId
          },
          temp: this.tempPayment,
          methods: this.tempPaymentMethods
        }
      }
      const params = isPosType
        ? paramsComplex
        : paramsSimple

      _payment.dispatchDialogByPaymentType(type, false)

      if (typeOfDoPayment === 'COMPLEX') {
        _dialog.setDialog({
          type: 'animationGIF',
          show: true
        })
      }
      const res = await _payment.doPayment(params, typeOfDoPayment)
      const {
        success,
        message
      } = res
      if (success) {
        _dialog.setDialog({
          type: 'animationGIF',
          show: false
        })
        await _dialog.setDialog({
          autoClose: true,
          msg: message,
          type: 'success'
        })
        // 調用付款後需要進行的動作，如：退房
        // 因為可以退房的地方除了當日房況的紅色卡片及休息卡片之外，還有點開「訂單資訊」彈窗，因此判斷 eventFn 如果是 setOrderInfoItem，就執行它來重取彈窗需要的資料。
        const eventFn = _room.createAfterPaymentFnByType(type)
        if (eventFn && typeof eventFn === 'string') {
          if (eventFn === 'setOrderInfoItem') {
            _orderInfo[eventFn]({
              type: 'ORDER_PAYMENT',
              bookingId: this.bookingId
            })
          } else {
            this[eventFn](this.selected)
          }
        } else {
          return
        }
      } else {
        _dialog.setDialog({
          type: 'animationGIF',
          show: false
        })
        _dialog.setDialog({
          autoClose: true,
          msg: message,
          type: 'failed'
        })
      }
      this.$bus.$emit('clear-temp-payment')
    })
  }
}
