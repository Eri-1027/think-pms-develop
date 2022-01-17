/**
 * Api 管理及 http request and response 相關設定
 */
import axios from 'axios'
import store from '../store'

let token = localStorage.getItem('auth-info')
  ? localStorage.getItem('auth-info').token
  : null
const hotelId = localStorage.getItem('hotel-info')
  ? localStorage.getItem('hotel-info').hotelId
  : null

const apiClient = axios.create({
  baseURL: process.env.VUE_APP_APIPATH,
  /**
   * 為每隻 api 加上 hotelId 屬性及設定從 LocalStorage 設定的值
   */
  transformRequest: [data => {
    try {
      if (data) {
        if (data.toString() === '[object FormData]') {
          return data
        } else {
          data.hotelId = hotelId || store.state.hotel.hotelId
        }
      } else {
        data = { hotelId: hotelId || store.state.hotel.hotelId } || {}
      }
      return JSON.stringify(data)
    } catch (err) {
      console.log(err)
    }
  }],
  /**
   * 針對後端回傳格式，format 成自己格式
   */
  transformResponse: [data => {
    try {
      if (data) {
        const isPropContent = key => (key === 'success' || key === 'JWT' || key === 'code')
        const isPropError = key => key === 'error'
        const perfectObj = {
          fetch: {}
        }
        data = JSON.parse(data)
        const result = Promise.all(Object
          .keys(data)
          .map(async key => {
            if (isPropContent(key)) {
              perfectObj[key] = data[key]
            } else if (isPropError(key)) {
              perfectObj.errors = data[key] || []
            } else {
              perfectObj.fetch[key] = data[key]
            }
            return key
          }))
        if (result) {
          return perfectObj
        }
      }
    } catch (err) {
      console.log(err)
    }
  }]
})

/**
 * 針對非 `login.php` 的 api 加上 token
 * 針對上傳圖片 api 加上 multipart/form-data 的 Content-Type 設定
 */
apiClient.interceptors.request.use(config => {
  if (config.url === '/login.php') {
    return config
  } else {
    token = token || JSON.parse(localStorage.getItem('auth-info')).token || ''
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    } else {
      config.headers.Authorization = ''
    }
    if (config.url === '/forceToCancel.php') {
      return config
    }
    if (config.url === '/insertPhoto.php') {
      config.headers.post.Accept = 'application/json'
      config.headers.post['Content-Type'] = 'multipart/form-data'
      return config
    }
  }
  return config
}, err => {
  console.log(err)
})

const apiList = [
  { name: 'userLogin', httpMethod: 'post', endPoint: 'login' },
  { name: 'punchIn', httpMethod: 'post', endPoint: 'punchIn' },
  { name: 'updateTutorial', httpMethod: 'post', endPoint: 'updateTutorial' },
  { name: 'checkTutorial', httpMethod: 'post', endPoint: 'checkTutorial' },
  { name: 'checkCardsStatus', httpMethod: 'post', endPoint: 'checkCardsStatus' },
  { name: 'showMessage', httpMethod: 'post', endPoint: 'showMessage' },
  { name: 'updateMessage', httpMethod: 'post', endPoint: 'updateMessage' },
  { name: 'deleteMessage', httpMethod: 'post', endPoint: 'deleteMessage' },
  { name: 'insertStaff', httpMethod: 'post', endPoint: 'insertStaff' },
  { name: 'showStaffForManagement', httpMethod: 'post', endPoint: 'showStaffForManagement' },
  { name: 'showStaffForNormal', httpMethod: 'post', endPoint: 'showStaffForNormal' },
  { name: 'updateStaff', httpMethod: 'post', endPoint: 'updateStaff' },
  { name: 'deleteStaff', httpMethod: 'post', endPoint: 'deleteStaff' },
  { name: 'showAllStaff', httpMethod: 'post', endPoint: 'showAllStaff' },
  { name: 'insertDiscount', httpMethod: 'post', endPoint: 'insertDiscount' },
  { name: 'showDiscount', httpMethod: 'post', endPoint: 'showDiscount' },
  { name: 'updateDiscount', httpMethod: 'post', endPoint: 'updateDiscount' },
  { name: 'deleteDiscount', httpMethod: 'post', endPoint: 'deleteDiscount' },
  { name: 'insertPhoto', httpMethod: 'post', endPoint: 'insertPhoto' },
  { name: 'insertRoomType', httpMethod: 'post', endPoint: 'insertRoomType' },
  { name: 'showRoom', httpMethod: 'post', endPoint: 'showRoom' },
  { name: 'updateRoomType', httpMethod: 'post', endPoint: 'updateRoomType' },
  { name: 'deleteRoomType', httpMethod: 'post', endPoint: 'deleteRoomType' },
  { name: 'insertRoomNumber', httpMethod: 'post', endPoint: 'insertRoomNumber' },
  { name: 'updateRoomNumber', httpMethod: 'post', endPoint: 'updateRoomNumber' },
  { name: 'deleteRoomNumber', httpMethod: 'post', endPoint: 'deleteRoomNumber' },
  { name: 'insertExtraExpense', httpMethod: 'post', endPoint: 'insertExtraExpense' },
  { name: 'showExtraExpense', httpMethod: 'post', endPoint: 'showExtraExpense' },
  { name: 'updateExtraExpense', httpMethod: 'post', endPoint: 'updateExtraExpense' },
  { name: 'deleteExtraExpense', httpMethod: 'post', endPoint: 'deleteExtraExpense' },
  { name: 'showDiscountAndType', httpMethod: 'post', endPoint: 'showDiscountAndType' },
  { name: 'checkCustomer', httpMethod: 'post', endPoint: 'checkCustomer' },
  { name: 'insertBooking', httpMethod: 'post', endPoint: 'insertBooking' },
  { name: 'automaticArrangingRoomNumber', httpMethod: 'post', endPoint: 'automaticArrangingRoomNumber' },
  { name: 'payment', httpMethod: 'post', endPoint: 'payment' },
  { name: 'showPriceAndType', httpMethod: 'post', endPoint: 'showPriceAndType' },
  { name: 'showRoomType', httpMethod: 'post', endPoint: 'showRoomType' },
  { name: 'getRoomNumber', httpMethod: 'post', endPoint: 'getRoomNumber' },
  { name: 'insertRestBooking', httpMethod: 'post', endPoint: 'insertRestBooking' },
  // { name: 'showRestBooking', httpMethod: 'post', endPoint: 'showRestBooking' },
  { name: 'showRestPrice', httpMethod: 'post', endPoint: 'showRestPrice' },
  { name: 'showRestBookingRoom', httpMethod: 'post', endPoint: 'showRestBookingRoom' },
  { name: 'showHourDefault', httpMethod: 'post', endPoint: 'showHourDefault' },
  { name: 'addRestHour', httpMethod: 'post', endPoint: 'addRestHour' },
  { name: 'cancelRestPrice', httpMethod: 'post', endPoint: 'cancelRestPrice' }, // 棄用
  { name: 'addRestPrice', httpMethod: 'post', endPoint: 'addRestPrice' }, // 棄用
  { name: 'forceToCancel', httpMethod: 'post', endPoint: 'forceToCancel' },
  { name: 'showRoomsNumber', httpMethod: 'post', endPoint: 'showRoomsNumber' },
  { name: 'showSpecificCards', httpMethod: 'post', endPoint: 'showSpecificCards' },
  { name: 'showNextOrder', httpMethod: 'post', endPoint: 'showNextOrder' },
  { name: 'showEmptyCardsDetail', httpMethod: 'post', endPoint: 'showEmptyCardsDetail' },
  { name: 'showCardsDetail', httpMethod: 'post', endPoint: 'showCardsDetail' },
  { name: 'checkIn', httpMethod: 'post', endPoint: 'checkIn' },
  { name: 'checkOut', httpMethod: 'post', endPoint: 'checkOut' },
  { name: 'cleaned', httpMethod: 'post', endPoint: 'cleaned' },
  { name: 'cancel', httpMethod: 'post', endPoint: 'cancel' },
  { name: 'cancelCheckIn', httpMethod: 'post', endPoint: 'cancelCheckIn' },
  { name: 'showCleaningList', httpMethod: 'post', endPoint: 'showCleaningList' },
  { name: 'cleaning', httpMethod: 'post', endPoint: 'cleaning' },
  { name: 'comfirmParticularCustomer', httpMethod: 'post', endPoint: 'comfirmParticularCustomer' },
  { name: 'showUnCheckIn', httpMethod: 'post', endPoint: 'showUnCheckIn' },
  { name: 'searchUnCheckIn', httpMethod: 'post', endPoint: 'searchUnCheckIn' },
  { name: 'changeRoom', httpMethod: 'post', endPoint: 'changeRoom' },
  { name: 'showNewPrice', httpMethod: 'post', endPoint: 'showNewPrice' },
  { name: 'showUnCheckInRoomNumber', httpMethod: 'post', endPoint: 'showUnCheckInRoomNumber' },
  { name: 'showSpecificRoomNumber', httpMethod: 'post', endPoint: 'showSpecificRoomNumber' },
  { name: 'updateTotalPrice', httpMethod: 'post', endPoint: 'updateTotalPrice' },
  { name: 'showUnArrangementOrder', httpMethod: 'post', endPoint: 'showUnArrangementOrder' },
  { name: 'updateArrangeRoomNumber', httpMethod: 'post', endPoint: 'updateArrangeRoomNumber' },
  { name: 'showRoomsStatus', httpMethod: 'post', endPoint: 'showRoomsStatus' },
  { name: 'showRoomsStatusSpecificDate', httpMethod: 'post', endPoint: 'showRoomsStatusSpecificDate' },
  { name: 'showCustomer', httpMethod: 'post', endPoint: 'showCustomer' },
  { name: 'showCustomerDetail', httpMethod: 'post', endPoint: 'showCustomerDetail' },
  { name: 'showSearchCustomer', httpMethod: 'post', endPoint: 'showSearchCustomer' },
  { name: 'showSearchDateCustomer', httpMethod: 'post', endPoint: 'showSearchDateCustomer' },
  { name: 'showSearchDateCustomerAsc', httpMethod: 'post', endPoint: 'showSearchDateCustomerAsc' },
  { name: 'customerHistoryBooking', httpMethod: 'post', endPoint: 'customerHistoryBooking' },
  { name: 'updateCustomer', httpMethod: 'post', endPoint: 'updateCustomer' },
  { name: 'deleteCustomer', httpMethod: 'post', endPoint: 'deleteCustomer' },
  { name: 'showDailyReport', httpMethod: 'post', endPoint: 'showDailyReport' },
  { name: 'showParticularDailyReport', httpMethod: 'post', endPoint: 'showParticularDailyReport' },
  { name: 'showDailyReportBothDate', httpMethod: 'post', endPoint: 'showDailyReportBothDate' },
  { name: 'showDailyReportBothDateAll', httpMethod: 'post', endPoint: 'showDailyReportBothDateAll' },
  { name: 'showOrders', httpMethod: 'post', endPoint: 'showOrders' },
  { name: 'showOrdersDetail', httpMethod: 'post', endPoint: 'showOrdersDetail' },
  { name: 'showPrice', httpMethod: 'post', endPoint: 'showPrice' },
  { name: 'updateOrder', httpMethod: 'post', endPoint: 'updateOrder' },
  { name: 'roomAccommodate', httpMethod: 'post', endPoint: 'roomAccommodate' },
  { name: 'showOrdersSearching', httpMethod: 'post', endPoint: 'showOrdersSearching' },
  { name: 'showOrdersSearchingBoth', httpMethod: 'post', endPoint: 'showOrdersSearchingBoth' },
  { name: 'showOrdersSearchingDate', httpMethod: 'post', endPoint: 'showOrdersSearchingDate' },
  { name: 'insertExtraExpenseOrder', httpMethod: 'post', endPoint: 'insertExtraExpenseOrder' },
  { name: 'showExtraExpenseItems', httpMethod: 'post', endPoint: 'showExtraExpenseItems' },
  { name: 'showRoomsCards', httpMethod: 'post', endPoint: 'showRoomsCards' },
  { name: 'showExtraExpenseInOrder', httpMethod: 'post', endPoint: 'showExtraExpenseInOrder' },
  // { name: 'showExtraExpenseInOrderNewPrice', httpMethod: 'post', endPoint: 'showExtraExpenseInOrderNewPrice' },
  { name: 'deleteExtraExpenseInOrder', httpMethod: 'post', endPoint: 'deleteExtraExpenseInOrder' },
  { name: 'showBill', httpMethod: 'post', endPoint: 'showBill' },
  { name: 'showBillAmount', httpMethod: 'post', endPoint: 'showBillAmount' },
  { name: 'pos', httpMethod: 'post', endPoint: 'pos' },
  { name: 'transactionResult', httpMethod: 'post', endPoint: 'transactionResult' },
  { name: 'showDutyShift', httpMethod: 'post', endPoint: 'showDutyShift' },
  { name: 'showDutyShiftDetail', httpMethod: 'post', endPoint: 'showDutyShiftDetail' },
  { name: 'dutyShift', httpMethod: 'post', endPoint: 'dutyShift' },
  { name: 'showSearchDutyShiftDetail', httpMethod: 'post', endPoint: 'showSearchDutyShiftDetail' },
  { name: 'showParticularReport', httpMethod: 'post', endPoint: 'showParticularReport' },
  { name: 'showSearchBothDutyShiftDetail', httpMethod: 'post', endPoint: 'showSearchBothDutyShiftDetail' },
  { name: 'showSearchDateDutyShiftDetail', httpMethod: 'post', endPoint: 'showSearchDateDutyShiftDetail' },
  { name: 'multiClean', httpMethod: 'post', endPoint: 'multiClean' }
]

/**
 * 生成一個 eventService 物件，供後續調用
 * @param {array} apiList
 * @example
 * // let temp = { account:'John Doe', password: 1234 }
 * // let response = await eventService.userLogin(temp)
 */
const createServcie = (apiList) => {
  const methods = {}
  apiList.forEach(api => {
    methods[api.name] = (payload) => {
      return apiClient[api.httpMethod](`/${api.endPoint}.php`, payload)
    }
  })
  return methods
}

export default createServcie(apiList)
