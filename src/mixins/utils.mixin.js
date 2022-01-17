import GENDER from '../constants/gender'
import PAYMENT_METHODS from '../constants/paymentMethods'
import PAYMENT_TYPES from '../constants/paymentType'
import ROOM_STATUS from '../constants/roomStatus'

export const mixinUtils = {
  computed: {
    rwd () {
      return this.$vuetify.breakpoint.name
    },
    customerGender () {
      return gender => {
        switch (gender) {
          case GENDER.MALE_KEY:
            return GENDER.MALE_VALUE
          case GENDER.FEMALE_KEY:
            return GENDER.FEMALE_VALUE
          case GENDER.OTHER_GENDER_KEY:
            return GENDER.OTHER_GENDER_VALUE
          default:
            return GENDER.OTHER_GENDER_VALUE
        }
      }
    },
    paymentMethods () {
      return type => {
        switch (type) {
          case PAYMENT_METHODS.CASH_KEY:
            return PAYMENT_METHODS.CASH_VALUE
          case PAYMENT_METHODS.CREDIT_KEY:
            return PAYMENT_METHODS.CREDIT_VALUE
          case PAYMENT_METHODS.CONVERT_KEY:
            return PAYMENT_METHODS.CONVERT_VALUE
          case PAYMENT_METHODS.OTHER_METHODS_KEY:
            return PAYMENT_METHODS.OTHER_METHODS_VALUE
          case PAYMENT_METHODS.SKIP_METHODS_KEY:
            return PAYMENT_METHODS.SKIP_METHODS_VALUE
          default:
            return PAYMENT_METHODS.SKIP_METHODS_VALUE
        }
      }
    },
    paymentType () {
      return type => {
        switch (type) {
          case PAYMENT_TYPES.DEPOSIT_KEY:
            return PAYMENT_TYPES.DEPOSIT_VALUE
          case PAYMENT_TYPES.ON_SITE_KEY:
            return PAYMENT_TYPES.ON_SITE_VALUE
          case PAYMENT_TYPES.MONTHLY_KEY:
            return PAYMENT_TYPES.MONTHLY_VALUE
          case PAYMENT_TYPES.ADJUSTMENT_KEY:
            return PAYMENT_TYPES.ADJUSTMENT_VALUE
          case PAYMENT_TYPES.REFUND_KEY:
            return PAYMENT_TYPES.REFUND_VALUE
          case PAYMENT_TYPES.OTHER_TYPE_KEY:
            return PAYMENT_TYPES.OTHER_TYPE_VALUE
          case PAYMENT_TYPES.PRE_AUTH_KEY:
            return PAYMENT_TYPES.PRE_AUTH_VALUE
          case PAYMENT_TYPES.SKIP_KEY:
            return PAYMENT_TYPES.SKIP_VALUE
          default:
            return PAYMENT_TYPES.SKIP_VALUE
        }
      }
    },
    roomStatus () {
      return status => {
        switch (status) {
          case ROOM_STATUS.UNCHECKIN_KEY:
            return ROOM_STATUS.UNCHECKIN_VALUE
          case ROOM_STATUS.CHECKIN_KEY:
            return ROOM_STATUS.CHECKIN_VALUE
          case ROOM_STATUS.UNCLEAN_KEY:
            return ROOM_STATUS.UNCLEAN_VALUE
          case ROOM_STATUS.CLEANING_KEY:
            return ROOM_STATUS.CLEANING_VALUE
          case ROOM_STATUS.REST_KEY:
            return ROOM_STATUS.REST_VALUE
          case ROOM_STATUS.CHECKOUT_KEY:
            return ROOM_STATUS.CHECKOUT_VALUE
          case ROOM_STATUS.RESERVE_KEY:
            return ROOM_STATUS.RESERVE_VALUE
          case ROOM_STATUS.CANCEL_KEY:
            return ROOM_STATUS.CANCEL_VALUE
          case ROOM_STATUS.UNCHECKIN_DOUBLE_KEY:
            return ROOM_STATUS.UNCHECKIN_DOUBLE_VALUE
          case ROOM_STATUS.UNCHECKIN_REST_KEY:
            return ROOM_STATUS.UNCHECKIN_REST_VALUE
          case ROOM_STATUS.CHECKIN_UNCHECKIN_KEY:
            return ROOM_STATUS.CHECKIN_UNCHECKIN_VALUE
          case ROOM_STATUS.CHECKIN_RESERVE_KEY:
            return ROOM_STATUS.CHECKIN_RESERVE_VALUE
          case ROOM_STATUS.UNCLEAN_UNCHECKIN_KEY:
            return ROOM_STATUS.UNCLEAN_UNCHECKIN_VALUE
          case ROOM_STATUS.UNCLEAN_RESERVE_KEY:
            return ROOM_STATUS.UNCLEAN_RESERVE_VALUE
          case ROOM_STATUS.CLEANING_UNCHECKIN_KEY:
            return ROOM_STATUS.CLEANING_UNCHECKIN_VALUE
          case ROOM_STATUS.CLEANING_RESERVE_KEY:
            return ROOM_STATUS.CLEANING_RESERVE_VALUE
          case ROOM_STATUS.REST_UNCHECKIN_KEY:
            return ROOM_STATUS.REST_UNCHECKIN_VALUE
          case ROOM_STATUS.REST_RESERVE_KEY:
            return ROOM_STATUS.REST_RESERVE_VALUE
          case ROOM_STATUS.RESERVE_UNCHECKIN_KEY:
            return ROOM_STATUS.RESERVE_UNCHECKIN_VALUE
          case ROOM_STATUS.RESERVE_RESERVE_KEY:
            return ROOM_STATUS.RESERVE_RESERVE_VALUE
          default:
            break
        }
      }
    },
    roomStatusForDetail () {
      return status => {
        switch (status) {
          case ROOM_STATUS.UNCHECKIN_KEY:
            return ROOM_STATUS.UNCHECKIN_VALUE_LONG
          case ROOM_STATUS.CHECKIN_KEY:
            return ROOM_STATUS.CHECKIN_VALUE_LONG
          case ROOM_STATUS.UNCLEAN_KEY:
            return ROOM_STATUS.UNCLEAN_VALUE_LONG
          case ROOM_STATUS.CLEANING_KEY:
            return ROOM_STATUS.CLEANING_VALUE_LONG
          case ROOM_STATUS.REST_KEY:
            return ROOM_STATUS.REST_VALUE_LONG
          case ROOM_STATUS.CHECKOUT_KEY:
            return ROOM_STATUS.CHECKOUT_VALUE_LONG
          case ROOM_STATUS.RESERVE_KEY:
            return ROOM_STATUS.RESERVE_VALUE_LONG
          case ROOM_STATUS.CANCEL_KEY:
            return ROOM_STATUS.CANCEL_VALUE_LONG
          case ROOM_STATUS.UNCHECKIN_DOUBLE_KEY:
            return ROOM_STATUS.UNCHECKIN_DOUBLE_VALUE_LONG
          case ROOM_STATUS.UNCHECKIN_REST_KEY:
            return ROOM_STATUS.UNCHECKIN_REST_VALUE_LONG
          case ROOM_STATUS.UNCHECKIN_RESERVE_KEY:
            return ROOM_STATUS.UNCHECKIN_RESERVE_VALUE_LONG
          case ROOM_STATUS.CHECKIN_UNCHECKIN_KEY:
            return ROOM_STATUS.CHECKIN_UNCHECKIN_VALUE_LONG
          case ROOM_STATUS.CHECKIN_RESERVE_KEY:
            return ROOM_STATUS.CHECKIN_RESERVE_VALUE_LONG
          case ROOM_STATUS.UNCLEAN_UNCHECKIN_KEY:
            return ROOM_STATUS.UNCLEAN_UNCHECKIN_VALUE_LONG
          case ROOM_STATUS.UNCLEAN_RESERVE_KEY:
            return ROOM_STATUS.UNCLEAN_RESERVE_VALUE_LONG
          case ROOM_STATUS.CLEANING_UNCHECKIN_KEY:
            return ROOM_STATUS.CLEANING_UNCHECKIN_VALUE_LONG
          case ROOM_STATUS.CLEANING_RESERVE_KEY:
            return ROOM_STATUS.CLEANING_RESERVE_VALUE_LONG
          case ROOM_STATUS.REST_UNCHECKIN_KEY:
            return ROOM_STATUS.REST_UNCHECKIN_VALUE_LONG
          case ROOM_STATUS.REST_RESERVE_KEY:
            return ROOM_STATUS.REST_RESERVE_VALUE_LONG
          case ROOM_STATUS.RESERVE_UNCHECKIN_KEY:
            return ROOM_STATUS.RESERVE_UNCHECKIN_VALUE_LONG
          case ROOM_STATUS.RESERVE_RESERVE_KEY:
            return ROOM_STATUS.RESERVE_RESERVE_VALUE_LONG
        }
      }
    },
    displayCustomerName () {
      return item => {
        const breakNum = () => {
          switch (this.rwd) {
            case 'xs':
              return 3
            default:
              return 4
          }
        }
        if (typeof item === 'string') {
          return item && item.length > breakNum()
            ? `${this._.take(item.split(''), breakNum()).join('')}...`
            : item
        }
        if (Object.keys(item) && Object.keys(item).length) {
          return item.customerName && item.customerName.length > breakNum()
            ? `${this._.take(item.customerName.split(''), breakNum()).join('')}...`
            : item.customerName || '休息'
        }
      }
    },
    formatDate () {
      return date => {
        if (date) {
          const key = this.$date(date).format('YYYY/MM/DD')
          switch (key) {
            case '1899/11/30':
              return '尚未入住'
            default:
              return this.$date(date).format('YYYY/MM/DD')
          }
        } else {
          return 'invalid date'
        }
      }
    },
    formatRoomNumber () {
      return number => {
        switch (number) {
          case '':
            return '未排房'
          default:
            return number
        }
      }
    },
    /**
     * use in ORDER_ORDER_INFO
     * determine action button show by (orders, action type and room status).
     * @param {array} orders - orders in ORDER_INFO tab.
     * @param {string} action - action which button does.
     * @param {string} status - status of dialog, for example 'ORDER_EDIT', 'ORDER_ORDER_INFO', 'ORDER_PAYMENT .
     */
    isBtnShow () {
      return ({ orders, action, status }) => {
        const isOrdersHasRoomStatus = roomStatus => {
          return orders && orders.length
            ? orders.some(el => roomStatus === el.roomStatus)
            : false
        }
        const isPureType = (action, status) => {
          return status === 'ORDER_EDIT'
            ? (action === 'CANCLE' || action === 'COMPLETE')
            : false
        }
        const isShowByAction = (action) => {
          switch (action) {
            // case 'CLEAN':
            //   return isOrdersHasRoomStatus('2')
            case 'CANCEL_UNCHECKIN':
              return isOrdersHasRoomStatus('0') || isOrdersHasRoomStatus('6')
            case 'CANCEL_CHECKIN':
              return isOrdersHasRoomStatus('1')
            case 'CHECKIN':
              return isOrdersHasRoomStatus('0')
            case 'CHECKOUT' :
              return isOrdersHasRoomStatus('1') || isOrdersHasRoomStatus('4')
            case 'CONFIRM':
              return true
            default:
              return false
          }
        }
        return status === 'ORDER_EDIT'
          ? isPureType(action, status)
          : isShowByAction(action)
      }
    },
    isBtnToolbar () {
      return ({ action, status }) => {
        const isGeneral = () => {
          return action === 'INSERT_OPTION' ||
          action === 'UN_CHECKIN' ||
          action === 'MULTI_CLEAN_OPTION'
        }
        const isMultiClean = () => {
          return action === 'MULTI_CLEAN_CANCEL' ||
          action === 'MULTI_CLEAN_START'
        }
        const isChooseRoom = () => {
          return status === 'CHOOSE_ROOM'
        }
        return isChooseRoom()
          ? isMultiClean()
          : isGeneral()
      }
    }
  }
}
