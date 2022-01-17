<script>
import { mapState, mapMutations } from 'vuex'
import { mixinOrderInfo } from '../mixins/orderInfo.mixin'
import { mixinUtils } from '../mixins/utils.mixin'
import { mixinRoomActions } from '../mixins/roomActions.mixin'
import { createDialog } from '../utils/helpers/createDialog'
import { createOrderInfo } from '../utils/create/createOrderInfo'
import headers from '../utils/headerDataTables'
const _orderInfo = createOrderInfo()
const TPrintOrderInfo = () => import('@/components/TPrintOrderInfo')
/**
 * 訂單資訊
 */
export default {
  components: {
    TPrintOrderInfo
  },
  mixins: [
    mixinOrderInfo,
    mixinUtils,
    mixinRoomActions
  ],
  data () {
    return {
      cancelBooking: true,
      dialog: null,
      extraExpenseItems: [],
      headersOrderInfos: headers.orderInfos,
      headersExtraExpense: headers.orderInfosExtraExpense,
      headersPayment: headers.orderInfoPayment,
      tempExtraExpense: {
        extraExpenseId: '',
        extraExpenseOrderNumber: '',
        extraExpenseOrderTotalPrice: '',
        bookingId: '',
        extraExpenseOrderNote: '',
        extraExpenseOrderSinglePrice: ''// this is not for call api
      },
      tempOrderInfo: {
        numberOfPeople: '',
        bookingNote: '',
        roomCards: [],
        extraExpenseOrderId: [],
        number: [],
        note: [],
        total: [],
        keycardNumber: []
      }
    }
  },
  computed: {
    ...mapState({
      showPrintOrderInfo: state => state.print.orderInfo,
      bookingId: state => state.orderInfo.bookingId,
      bookingDetailId: state => state.orderInfo.bookingDetailId,
      tab: state => state.orderInfo.tab,
      orderInfo: state => state.orderInfo.orderInfo,
      orders: state => state.orderInfo.orders,
      payment: state => state.orderInfo.payment,
      extraExpenses: state => state.orderInfo.extraExpenses,
      status: state => state.orderInfo.status,
      // dialog
      dialogCancelBookingConfirm: state => state.dialog.map.cancelBookingConfirm,
      // orders
      dialogOrdersOrderInfo: state => state.dialog.map.ordersOrderInfo,
      dialogOrdersExtraExpense: state => state.dialog.map.ordersExtraExpense,
      selected: state => state.room.selected
    }),
    rwd () {
      return this.$vuetify.breakpoint.name
    }
  },
  async created () {
    this.dialog = createDialog()
    window.onafterprint = async () => {
      console.log('Printing completed...')
      this['print/SET_PRINT_SHOW']({
        name: 'ORDER_INFO',
        show: false
      })
      this['print/SET_PRINT_SHOW']({
        name: 'DAILY_REPORT',
        show: false
      })
    }
  },
  mounted () {
    this.$bus.$on('change', async () => {
      if (this.dialogOrdersOrderInfo) {
        await this.emitDialog({
          type: this.tab,
          bookingId: this.bookingId
        })
      }
    })
  },
  updated () {
    this.$bus.$on('init-temp-extra-expense', () => {
      if (this.$refs.formExtraExpense) {
        this.tempExtraExpense = this.initialExtraExpense()
        this.$refs.formExtraExpense.reset()
      }
    })
  },
  methods: {
    ...mapMutations([
      'room/SET_SELECTED',
      'orderInfo/SET_STATUS',
      'print/SET_PRINT_SHOW'
    ]),
    /**
     * 取得專案唯一值
     */
    getDiscountSet (discounts) {
      if (typeof discounts === 'string') {
        discounts = discounts.split(' ')
        const set = new Set(discounts)
        return Array
          .from(set)
          .join(',')
          .replace(/,/gi, ' ')
      }
    },
    initialExtraExpense () {
      return Object.assign({}, this.tempExtraExpense, {
        extraExpenseId: '',
        extraExpenseOrderNumber: '',
        extraExpenseOrderTotalPrice: '',
        bookingId: '',
        extraExpenseOrderNote: '',
        extraExpenseOrderSinglePrice: ''// this is not for call api
      })
    },
    /**
     * 設定開啟訂單資訊還是結帳作業 tab
     */
    async setDialogViewHandler ({
      type,
      bookingId,
      bookingDetailId
    }) {
      await _orderInfo.setDialogView({
        type,
        bookingId,
        bookingDetailId
      })
    },
    /**
     * 設定訂單資訊是否為編輯狀態
     */
    setDialogStatus ({
      status,
      orderItem,
      orders
    }) {
      if (status === 'ORDER_EDIT') {
        this.tempOrderInfo.numberOfPeople = orderItem.numberOfPeople
        this.tempOrderInfo.bookingNote = orderItem.bookingNote
        this.$set(this.tempOrderInfo, 'keycardNumber', JSON.parse(JSON.stringify(orders.map(order => {
          return order.keycardNumber !== ''
            ? order.keycardNumber
            : 1
        }))))
        console.log(this.tempOrderInfo.keycardNumber)
        this['orderInfo/SET_STATUS'](status)
      }
    },
    /**
     * 打開新增消費彈窗
     */
    async setDialogExtraExpense () {
      this.extraExpenseItems = await this.getExtraExpenseItemsHandler()
      if (this.extraExpenseItems && this.extraExpenseItems.length) {
        await this.dialog.setDialog({
          type: 'ordersExtraExpense',
          show: true
        })
      }
    },
    /**
     * 關閉新增收款彈窗
     */
    async setDialogExtraPaymentClose () {
      await this.dialog.setDialog({
        type: 'ordersExtraPayment',
        show: false
      })
    },
    setSelected (event) {
      this['room/SET_SELECTED'](event)
    },
    /**
     * 新增額外消費的商品數量
     */
    async updateExtraExpenseAmount ({
      number,
      item
    }) {
      this.extraExpenses.forEach(el => {
        if (el.extraExpenseOrderId === item.extraExpenseOrderId) {
          el.extraExpenseOrderTotalPrice = +el.extraExpensePrice * number
          el.extraExpenseOrderNumber = number
        }
      })
    },
    async print () {
      // 關掉訂單資訊彈窗
      await this.dialog.setDialog({
        type: 'ordersOrderInfo',
        show: false
      })
      this['room/SET_SELECTED']([])
      // 關掉其它打開的彈窗
      const map = this.$store.state.dialog.map
      if (map) {
        for (const prop in map) {
          if (map[prop]) {
            this.dialog.setDialog({
              type: prop,
              show: false
            })
          }
        }
      }
      await _orderInfo.setOrderInfoItem({
        type: 'ORDER_PAYMENT',
        bookingId: this.bookingId
      })
      window.setTimeout(() => {
        this['print/SET_PRINT_SHOW']({
          name: 'ORDER_INFO',
          show: true
        })
        this.$nextTick(() => {
          window.print()
        })
      })
    },
    handleClickCancelEdit () {
      this['orderInfo/SET_STATUS']('')
    }
  }
}
</script>
<template>
  <div class="page__orderInfo">
    <!-- order info print -->
    <TPrintOrderInfo
      :extra-expenses="extraExpenses"
      :order-info="orderInfo"
    />
    <!-- order info -->
    <v-dialog
      v-if="!showPrintOrderInfo"
      v-model="dialogOrdersOrderInfo"
      class="d-print-none"
      max-width="670"
      @click:outside="closeOrderInfoDialogHandler"
    >
      <v-card v-show="tab === 'ORDER_ORDER_INFO'">
        <template v-if="rwd === 'xs'">
          <v-card-title class="headline">
            <v-row>
              <v-col>
                <v-btn
                  block
                  color="success"
                  depressed
                >
                  訂單資訊
                </v-btn>
              </v-col>
              <v-col>
                <v-btn
                  block
                  depressed
                  @click="setDialogViewHandler({type:'ORDER_PAYMENT',bookingId})"
                >
                  收款結帳
                </v-btn>
              </v-col>
            </v-row>
          </v-card-title>
          <v-card-text>
            <v-card outlined>
              <v-card-title class="d-flex justify-start">
                <v-btn
                  class="mr-2"
                  outlined
                  small
                  @click="setDialogStatus({
                    status:'ORDER_EDIT',
                    orderItem:orderInfo,orders
                  })"
                >
                  編輯
                </v-btn>
                <v-btn
                  color="warning"
                  dark
                  depressed
                  small
                  @click="dialog.setDialog({
                    type:'ordersExtraExpense',
                    show:true
                  })"
                >
                  新增消費
                </v-btn>
              </v-card-title>
              <v-card-text>
                <v-row no-gutters>
                  <v-col cols="12">
                    <v-card-text class="d-flex justify-space-between align-center px-0 py-2">
                      <div>
                        <span>訂單編號：</span>
                      </div>
                      <div>
                        <v-btn
                          color="success"
                          text
                        >
                          {{ orderInfo.bookingNumber }}
                        </v-btn>
                      </div>
                    </v-card-text>
                  </v-col>
                  <v-col cols="12">
                    <v-card-text class="d-flex justify-space-between px-0 py-2">
                      <div>訂房日期：</div>
                      <div>{{ $date(orderInfo.bookingDate).format('YYYY/MM/DD') }}</div>
                    </v-card-text>
                  </v-col>
                  <v-col cols="12">
                    <v-card-text
                      v-if="orderInfo.roomStatus !== '4'"
                      class="d-flex justify-space-between px-0 py-2"
                    >
                      <div>入住日期：</div>
                      <div>{{ $date(orderInfo.expectedCheckInTime).format('YYYY/MM/DD') }}</div>
                    </v-card-text>
                    <v-card-text
                      v-else
                      class="d-flex justify-space-between px-0 py-2"
                    >
                      <div>入住時間：</div>
                      <div>{{ $date(orderInfo.expectedCheckInTime).format('YYYY/MM/DD HH:mm:ss') }}</div>
                    </v-card-text>
                  </v-col>
                  <v-col cols="12">
                    <v-card-text
                      v-if="orderInfo.roomStatus !== '4'"
                      class="d-flex justify-space-between px-0 py-2"
                    >
                      <div>退房日期：</div>
                      <div>{{ $date(orderInfo.expectedCheckOutTime).format('YYYY/MM/DD') }}</div>
                    </v-card-text>
                    <v-card-text
                      v-else
                      class="d-flex justify-space-between px-0 py-2"
                    >
                      <div>退房時間：</div>
                      <div>{{ $date(orderInfo.expectedCheckOutTime).format('YYYY/MM/DD HH:mm:ss') }}</div>
                    </v-card-text>
                  </v-col>
                  <v-col cols="12">
                    <v-card-text class="d-flex justify-space-between px-0 py-2">
                      <div>入住天數：</div>
                      <div>{{ orderInfo.stayingDay }}</div>
                    </v-card-text>
                  </v-col>
                  <v-col cols="12">
                    <v-card-text class="d-flex justify-space-between px-0 py-2 align-center">
                      <div>入住人數：</div>
                      <div v-if="status !== 'ORDER_EDIT'">
                        {{ orderInfo.numberOfPeople ? orderInfo.numberOfPeople : '未提供' }}
                      </div>
                      <v-text-field
                        v-else
                        v-model="tempOrderInfo.numberOfPeople"
                        class="py-0 my-0 mr-4"
                        dense
                        hide-details
                        single-line
                        type="number"
                      />
                    </v-card-text>
                  </v-col>
                  <v-col cols="12">
                    <v-card-text class="d-flex justify-space-between px-0 py-2">
                      <span>總價：</span>
                      <span
                        v-if="orderInfo.totalPrice"
                        v-math:round="orderInfo.totalPrice"
                        v-price="orderInfo.totalPrice"
                      />
                      <span v-else>
                        沒有資訊
                      </span>
                    </v-card-text>
                  </v-col>
                  <v-col cols="12">
                    <v-card-text class="d-flex justify-space-between px-0 py-2">
                      <span>備註：</span>
                      <span v-if="status !== 'ORDER_EDIT'">
                        {{ orderInfo.bookingNote ? orderInfo.bookingNote : '無' }}
                      </span>
                      <v-textarea
                        v-else
                        v-model="tempOrderInfo.bookingNote"
                        auto-grow
                        class="py-0 my-0 mr-4"
                        dense
                        hide-details
                        single-line
                      />
                    </v-card-text>
                  </v-col>
                  <v-col cols="12">
                    <v-card-text class="d-flex justify-space-between px-0 py-2">
                      <span>房型：</span>
                      <span>{{ orderInfo.roomTypeName }}</span>
                    </v-card-text>
                  </v-col>
                  <v-col cols="12">
                    <v-card-text class="d-flex justify-space-between px-0 py-2">
                      <span>旅客姓名：</span>
                      <span>{{ orderInfo.customerName ? orderInfo.customerName : '未提供' }}</span>
                    </v-card-text>
                  </v-col>

                  <v-col cols="12">
                    <v-card-text class="d-flex justify-space-between px-0 py-2">
                      <span>性別：</span>
                      <span>{{ customerGender(orderInfo.customerGender) }}</span>
                    </v-card-text>
                  </v-col>

                  <v-col cols="12">
                    <v-card-text class="d-flex justify-space-between px-0 py-2">
                      <span>國籍：</span>
                      <span>{{ orderInfo.customerNationality ? orderInfo.customerNationality : '未提供' }}</span>
                    </v-card-text>
                  </v-col>
                  <v-col cols="12">
                    <v-card-text class="d-flex justify-space-between px-0 py-2">
                      <span>身分證：</span>
                      <span>{{ orderInfo.customerIdNumber ? orderInfo.customerIdNumber : '未提供' }}</span>
                    </v-card-text>
                  </v-col>
                  <v-col cols="12">
                    <v-card-text class="d-flex justify-space-between px-0 py-2">
                      <span>護照號碼：</span>
                      <span>{{ orderInfo.customerPassportNumber ? orderInfo.customerPassportNumber : '未提供' }}</span>
                    </v-card-text>
                  </v-col>
                  <v-col cols="12">
                    <v-card-text class="d-flex justify-space-between px-0 py-2">
                      <span>聯絡電話：</span>
                      <span>{{ orderInfo.customerPhone ? orderInfo.customerPhone : '未提供' }}</span>
                    </v-card-text>
                  </v-col>

                  <v-col cols="12">
                    <v-card-text class="d-flex justify-space-between px-0 py-2">
                      <span>E-mail：</span>
                      <span>{{ orderInfo.customerEmail ? orderInfo.customerEmail : '未提供' }}</span>
                    </v-card-text>
                  </v-col>
                </v-row>
              </v-card-text>
              <v-card-text v-if="orderInfo">
                <template v-if="rwd === 'xs'">
                  <div
                    v-for="(item,index) in orders"
                    :key="index"
                    class="my-3"
                  >
                    <v-card outlined>
                      <v-card-text class="d-flex align-center justify-space-between primary white--text py-1 px-2">
                        <v-checkbox
                          v-model="selected[index]"
                          class="pb-1 my-0"
                          dark
                          hide-details
                          :value="item"
                        />
                        <span class="mr-1 subtitle">房號</span>
                        <v-spacer />
                        <span class="subtitle">{{ item.roomNumber }}</span>
                      </v-card-text>
                      <v-card-text class="d-flex align-center justify-space-between pl-9 pr-2 py-1">
                        <span>實際入住時間</span><span>{{ formatDate(item.checkInStart) }}</span>
                      </v-card-text>
                      <v-card-text class="d-flex align-center justify-space-between pl-9 pr-2 py-1">
                        <span>房單價格</span><span>{{ item.roomPrice }}</span>
                      </v-card-text>
                      <v-card-text class="d-flex align-center justify-space-between pl-9 pr-2 py-1">
                        <span>房間狀態</span><span>{{ roomStatusForDetail(item.roomStatus) }}</span>
                      </v-card-text>
                      <v-card-text class="d-flex align-center justify-space-between pl-9 pr-2 py-1">
                        <span>房卡張數</span><span>{{ item.keycardNumber ? item.keycardNumber : 1 }}</span>
                      </v-card-text>
                      <v-card-text class="d-flex align-center justify-space-between pl-9 pr-2 py-1">
                        <span>備註</span><span>{{ item.bookingNote ? item.bookingNote : '無' }}</span>
                      </v-card-text>
                    </v-card>
                  </div>
                </template>
                <template v-else>
                  <v-data-table
                    class="border--default"
                    :footer-props="{
                      itemsPerPageText:'每頁顯示',
                      itemsPerPageAllText:'全部',
                      firstIcon:'mdi-chevron-double-left',
                      lastIcon:'mdi-chevron-double-right',
                      prevIcon:'mdi-chevron-left',
                      nextIcon:'mdi-chevron-right'
                    }"
                    :headers="headersOrderInfos"
                    :hide-default-footer="orders.length === 1 ? true : false"
                    item-key="roomNumber"
                    :items="orders"
                    :value="selected"
                    @input="setSelected"
                  >
                    <template v-slot:[`item.roomNumber`]="{item}">
                      {{ item.roomNumber !== null ? item.roomNumber : '尚未排房' }}
                    </template>
                    <template v-slot:[`item.checkInStart`]="{item}">
                      {{ $date(item.checkInStart).format('YYYY/MM/DD') === '1899/11/30' ? '尚未入住' : $date(item.checkInStart).format('YYYY/MM/DD') }}
                    </template>
                    <template v-slot:[`item.roomPrice`]="{item}">
                      <span
                        v-math:round="item.roomPrice"
                        v-price="item.roomPrice"
                      />
                    </template>
                    <template v-slot:[`item.roomStatus`]="{item}">
                      <div>{{ roomStatusForDetail(item.roomStatus) }}</div>
                    </template>
                    <template v-slot:[`item.keycardNumber`]="{item}">
                      <div class="d-flex justify-center">
                        <span v-if="status !== 'ORDER_EDIT'">
                          {{ item.keycardNumber ? item.keycardNumber : '1' }}
                        </span>
                        <v-text-field
                          v-else
                          v-model="tempOrderInfo.keycardNumber[orders.indexOf(item)]"
                          dense
                          hide-details
                          single-line
                          style="max-width:40px"
                          type="number"
                        />
                      </div>
                    </template>
                    <template v-slot:[`item.bookingNote`]="{item}">
                      <span>{{ item.bookingNote ? item.bookingNote : '無' }}</span>
                    </template>
                  </v-data-table>
                </template>
              </v-card-text>
              <v-card-text
                v-if="extraExpenses.length"
                class="py-0"
              >
                其他消費：
              </v-card-text>
              <v-card-text
                v-if="extraExpenses.length"
              >
                <v-data-table
                  class="border--default"
                  :footer-props="{
                    itemsPerPageText:'每頁顯示',
                    itemsPerPageAllText:'全部',
                    firstIcon:'mdi-chevron-double-left',
                    lastIcon:'mdi-chevron-double-right',
                    prevIcon:'mdi-chevron-left',
                    nextIcon:'mdi-chevron-right'
                  }"
                  :headers="headersExtraExpense"
                  :hide-default-footer="extraExpenses.length === 1 ? true : false"
                  :items="extraExpenses"
                >
                  <template v-slot:[`item.extraExpenseOrderNumber`]="{item}">
                    <div class="d-flex justify-center">
                      <span v-if="status !== 'ORDER_EDIT'">{{ item.extraExpenseOrderNumber }}</span>
                      <v-text-field
                        v-else
                        dense
                        hide-details
                        min="1"
                        single-line
                        style="max-width:40px"
                        type="number"
                        :value="item.extraExpenseOrderNumber"
                        @input="updateExtraExpenseAmount({number:$event,item})"
                      />
                    </div>
                  </template>
                  <template v-slot:[`item.extraExpenseOrderNote`]="{item}">
                    <span>{{ item.extraExpenseOrderNote ? item.extraExpenseOrderNote : '無' }}</span>
                  </template>
                  <template v-slot:[`item.actions`]="{item}">
                    <v-btn
                      color="danger"
                      dark
                      depressed
                      icon
                      @click.stop="deleteExtraExpense(item)"
                    >
                      <v-icon>mdi-trash-can-outline</v-icon>
                    </v-btn>
                  </template>
                </v-data-table>
              </v-card-text>
              <v-card-text class="d-flex">
                <v-btn
                  v-show="isBtnShow({ orders, action:'CANCEL_CHECKIN', status:status })"
                  class="mr-2"
                  color="warning"
                  dark
                  depressed
                  small
                  @click="cancelCheckIn(selected)"
                >
                  取消入住
                </v-btn>
                <v-spacer />
                <v-btn
                  v-show="isBtnShow({ orders, action:'CHECKOUT', status:status })"
                  color="warning"
                  dark
                  depressed
                  small
                  @click="handleClickCheckOut(orders)"
                >
                  退房
                </v-btn>
              </v-card-text>
              <v-card-text class="pb-3 pt-0">
                <div class="d-flex justify-end">
                  <v-btn
                    v-show="isBtnShow({ orders, action:'CANCEL_UNCHECKIN', status:status })"
                    class="mr-2"
                    color="warning"
                    dark
                    depressed
                    small
                    @click="cancelBookingHandler"
                  >
                    取消訂單
                  </v-btn>
                  <v-spacer />
                  <v-btn
                    v-show="isBtnShow({ orders, action:'CANCLE', status:status })"
                    class="mr-2"
                    color="warning"
                    dark
                    depressed
                    small
                    @click="handleClickCancelEdit"
                  >
                    取消
                  </v-btn>
                  <v-btn
                    v-show="isBtnShow({ orders, action:'COMPLETE', status })"
                    class="mr-2"
                    color="success"
                    depressed
                    small
                    @click="updateOrder({orders,extraExpenses})"
                  >
                    完成
                  </v-btn>

                  <v-btn
                    v-show="isBtnShow({ orders, action:'CHECKIN', status:status })"
                    class="mr-2"
                    color="success"
                    depressed
                    small
                    @click="handleClickCheckIn(selected)"
                  >
                    辦理入住
                  </v-btn>
                  <v-btn
                    v-show="isBtnShow({ orders, action:'CONFIRM', status:status })"
                    color="success"
                    depressed
                    small
                    @click.stop="closeOrderInfoDialogHandler"
                  >
                    確定
                  </v-btn>
                </div>
              </v-card-text>
            </v-card>
          </v-card-text>
        </template>
        <template v-else>
          <v-card-title class="headline">
            <v-btn
              class="mr-2"
              color="success"
              depressed
            >
              訂單資訊
            </v-btn>
            <v-btn
              depressed
              @click="setDialogViewHandler({type:'ORDER_PAYMENT',bookingId})"
            >
              收款結帳
            </v-btn>
          </v-card-title>
          <v-card-text>
            <v-card outlined>
              <v-card-title class="d-flex justify-space-between">
                <small>訂單編號：</small>
                <div class="success--text">
                  {{ orderInfo.bookingNumber }}
                </div>
                <v-spacer />
                <v-btn
                  class="mr-2"
                  outlined
                  small
                  @click="setDialogStatus({status:'ORDER_EDIT',orderItem:orderInfo,orders})"
                >
                  編輯
                </v-btn>
                <v-btn
                  class="mr-2"
                  outlined
                  small
                  @click="print"
                >
                  列印訂單
                </v-btn>
                <v-btn
                  class="mr-2"
                  color="warning"
                  dark
                  depressed
                  small
                  @click="setDialogExtraExpense"
                >
                  新增消費
                </v-btn>
              </v-card-title>
              <v-card-text>
                <v-row no-gutters>
                  <v-col cols="12">
                    <v-card-text class="d-flex px-0 py-2">
                      <div>訂房日期：</div>
                      <div>{{ $date(orderInfo.bookingDate).format('YYYY/MM/DD') }}</div>
                    </v-card-text>
                  </v-col>
                  <v-col cols="6">
                    <v-card-text class="d-flex px-0 py-2">
                      <div>旅客姓名：</div>
                      <div>{{ orderInfo.customerName ? orderInfo.customerName : '未提供' }}</div>
                    </v-card-text>
                  </v-col>
                  <v-col cols="6">
                    <v-card-text
                      v-if="orderInfo.roomStatus !== '4'"
                      class="d-flex px-0 py-2"
                    >
                      <div>入住日期：</div>
                      <div>{{ $date(orderInfo.expectedCheckInTime).format('YYYY/MM/DD') }}</div>
                    </v-card-text>
                    <v-card-text
                      v-else
                      class="d-flex px-0 py-2"
                    >
                      <div>入住時間：</div>
                      <div>{{ $date(orderInfo.expectedCheckInTime).format('YYYY/MM/DD HH:mm:ss') }}</div>
                    </v-card-text>
                  </v-col>
                  <v-col cols="6">
                    <v-card-text class="d-flex px-0 py-2">
                      <div>性別：</div>
                      <div>{{ customerGender(orderInfo.customerGender) }}</div>
                    </v-card-text>
                  </v-col>
                  <v-col cols="6">
                    <v-card-text
                      v-if="orderInfo.roomStatus !== '4'"
                      class="d-flex px-0 py-2"
                    >
                      <div>退房日期：</div>
                      <div>{{ $date(orderInfo.expectedCheckOutTime).format('YYYY/MM/DD') }}</div>
                    </v-card-text>
                    <v-card-text
                      v-else
                      class="d-flex px-0 py-2"
                    >
                      <div>退房時間：</div>
                      <div>{{ $date(orderInfo.expectedCheckOutTime).format('YYYY/MM/DD HH:mm:ss') }}</div>
                    </v-card-text>
                  </v-col>
                  <v-col cols="6">
                    <v-card-text class="d-flex px-0 py-2">
                      <div>國籍：</div>
                      <div>{{ orderInfo.customerNationality ? orderInfo.customerNationality : '未提供' }}</div>
                    </v-card-text>
                  </v-col>
                  <v-col cols="6">
                    <v-card-text class="d-flex px-0 py-2">
                      <div>入住天數：</div>
                      <div>{{ orderInfo.stayingDay }}</div>
                    </v-card-text>
                  </v-col>
                  <v-col cols="6">
                    <v-card-text class="d-flex px-0 py-2">
                      <div>身分證：</div>
                      <div>{{ orderInfo.customerIdNumber ? orderInfo.customerIdNumber : '未提供' }}</div>
                    </v-card-text>
                  </v-col>
                  <v-col cols="6">
                    <v-card-text class="d-flex px-0 py-2 align-center">
                      <div>入住人數：</div>
                      <div v-if="status !== 'ORDER_EDIT'">
                        {{ orderInfo.numberOfPeople ? orderInfo.numberOfPeople : '未提供' }}
                      </div>
                      <v-text-field
                        v-else
                        v-model="tempOrderInfo.numberOfPeople"
                        class="py-0 my-0 mr-4"
                        dense
                        hide-details
                        single-line
                        type="number"
                      />
                    </v-card-text>
                  </v-col>
                  <v-col cols="6">
                    <v-card-text class="d-flex px-0 py-2">
                      <div>護照號碼：</div>
                      <div>{{ orderInfo.customerPassportNumber ? orderInfo.customerPassportNumber : '未提供' }}</div>
                    </v-card-text>
                  </v-col>
                  <v-col cols="6">
                    <v-card-text class="d-flex px-0 py-2">
                      <div>總價：</div>
                      <div
                        v-math:round="orderInfo.totalPrice"
                        v-price="orderInfo.totalPrice"
                      />
                    </v-card-text>
                  </v-col>
                  <v-col cols="6">
                    <v-card-text class="d-flex px-0 py-2">
                      <div>聯絡電話：</div>
                      <div>{{ orderInfo.customerPhone ? orderInfo.customerPhone : '未提供' }}</div>
                    </v-card-text>
                  </v-col>
                  <v-col cols="6">
                    <v-card-text class="d-flex px-0 py-2">
                      <div>
                        備註：
                      </div>
                      <div v-if="status !== 'ORDER_EDIT'">
                        {{ orderInfo.bookingNote ? orderInfo.bookingNote : '無' }}
                      </div>
                      <v-textarea
                        v-else
                        v-model="tempOrderInfo.bookingNote"
                        auto-grow
                        class="py-0 my-0 mr-4"
                        dense
                        hide-details
                        single-line
                      />
                    </v-card-text>
                  </v-col>
                  <v-col cols="6">
                    <v-card-text class="d-flex px-0 py-2">
                      <div>E-mail：</div>
                      <div>{{ orderInfo.customerEmail ? orderInfo.customerEmail : '未提供' }}</div>
                    </v-card-text>
                  </v-col>
                </v-row>
              </v-card-text>
              <v-card-text class="py-0">
                房型：{{ orderInfo.roomTypeName }}
              </v-card-text>
              <v-card-text v-if="orders && orders.length">
                <v-data-table
                  class="border--default"
                  :footer-props="{
                    itemsPerPageText:'每頁顯示',
                    itemsPerPageAllText:'全部',
                    firstIcon:'mdi-chevron-double-left',
                    lastIcon:'mdi-chevron-double-right',
                    prevIcon:'mdi-chevron-left',
                    nextIcon:'mdi-chevron-right'
                  }"
                  :headers="headersOrderInfos"
                  :hide-default-footer="orders.length === 1 ? true : false"
                  item-key="roomNumber"
                  :items="orders"
                  :show-select="status === ''"
                  :value="selected"
                  @input="setSelected"
                >
                  <template v-slot:[`header.data-table-select`]="{props,on}">
                    <v-simple-checkbox
                      dark
                      :disabled="isCheckboxDisabled(orders)"
                      :value="props.value"
                      v-on="on"
                    />
                  </template>
                  <template v-slot:[`item.roomNumber`]="{item}">
                    {{ item.roomNumber !== null ? item.roomNumber : '尚未排房' }}
                  </template>
                  <template v-slot:[`item.checkInStart`]="{item}">
                    {{ $date(item.checkInStart).format('YYYY/MM/DD') === '1899/11/30' ? '尚未入住' : $date(item.checkInStart).format('YYYY/MM/DD') }}
                  </template>
                  <template v-slot:[`item.roomPrice`]="{item}">
                    <span
                      v-math:round="item.roomPrice"
                      v-price="item.roomPrice"
                    />
                  </template>
                  <template v-slot:[`item.roomStatus`]="{item}">
                    <div>{{ roomStatusForDetail(item.roomStatus) }}</div>
                  </template>
                  <template v-slot:[`item.keycardNumber`]="{item}">
                    <div class="d-flex justify-center">
                      <span v-if="status !== 'ORDER_EDIT'">
                        {{ item.keycardNumber ? item.keycardNumber : '1' }}
                      </span>
                      <v-text-field
                        v-else
                        v-model="tempOrderInfo.keycardNumber[orders.indexOf(item)]"
                        dense
                        hide-details
                        min="1"
                        single-line
                        style="max-width:40px"
                        type="number"
                      />
                    </div>
                  </template>
                  <template v-slot:[`item.bookingNote`]="{item}">
                    <span>{{ item.bookingNote ? item.bookingNote : '無' }}</span>
                  </template>
                </v-data-table>
              </v-card-text>
              <v-card-text
                v-if="extraExpenses && extraExpenses.length"
                class="py-0"
              >
                其他消費：
              </v-card-text>
              <v-card-text v-if="extraExpenses && extraExpenses.length">
                <v-data-table
                  class="border--default"
                  :footer-props="{
                    itemsPerPageText:'每頁顯示',
                    itemsPerPageAllText:'全部',
                    firstIcon:'mdi-chevron-double-left',
                    lastIcon:'mdi-chevron-double-right',
                    prevIcon:'mdi-chevron-left',
                    nextIcon:'mdi-chevron-right'
                  }"
                  :headers="headersExtraExpense"
                  :hide-default-footer="extraExpenses.length === 1 ? true : false"
                  :items="extraExpenses"
                >
                  <template v-slot:[`item.extraExpenseOrderNumber`]="{item}">
                    <div class="d-flex justify-center">
                      <span v-if="status !== 'ORDER_EDIT'">{{ item.extraExpenseOrderNumber }}</span>
                      <v-text-field
                        v-else
                        dense
                        hide-details
                        min="1"
                        single-line
                        style="max-width:40px"
                        type="number"
                        :value="item.extraExpenseOrderNumber"
                        @input="updateExtraExpenseAmount({number:$event,item})"
                      />
                    </div>
                  </template>
                  <template v-slot:[`item.extraExpenseOrderNote`]="{item}">
                    <span>{{ item.extraExpenseOrderNote ? item.extraExpenseOrderNote : '無' }}</span>
                  </template>
                  <template v-slot:[`item.actions`]="{item}">
                    <v-btn
                      color="danger"
                      dark
                      depressed
                      icon
                      @click.stop="deleteExtraExpense(item)"
                    >
                      <v-icon>mdi-trash-can-outline</v-icon>
                    </v-btn>
                  </template>
                </v-data-table>
              </v-card-text>
              <v-card-text class="pb-3 pt-0">
                <div class="d-flex justify-end">
                  <v-btn
                    v-show="isBtnShow({ orders, action:'CANCEL_UNCHECKIN', status:status })"
                    class="mr-2"
                    color="warning"
                    dark
                    depressed
                    small
                    @click="cancelBookingHandler"
                  >
                    取消訂單
                  </v-btn>
                  <v-spacer />
                  <v-btn
                    v-show="isBtnShow({ orders, action:'CANCLE', status:status })"
                    class="mr-2"
                    color="warning"
                    dark
                    depressed
                    small
                    @click="handleClickCancelEdit"
                  >
                    取消
                  </v-btn>
                  <v-btn
                    v-show="isBtnShow({ orders, action:'COMPLETE', status })"
                    class="mr-2"
                    color="success"
                    depressed
                    small
                    @click="updateOrder({orders,extraExpenses})"
                  >
                    完成
                  </v-btn>
                  <v-btn
                    v-show="isBtnShow({ orders, action:'CHECKOUT', status })"
                    class="mr-2"
                    color="warning"
                    dark
                    depressed
                    small
                    @click="handleClickCheckOut(orders)"
                  >
                    退房
                  </v-btn>
                  <v-btn
                    v-show="isBtnShow({ orders, action:'CANCEL_CHECKIN', status })"
                    class="mr-2"
                    color="warning"
                    dark
                    depressed
                    small
                    @click="cancelCheckIn(selected)"
                  >
                    取消入住
                  </v-btn>
                  <v-btn
                    v-show="isBtnShow({ orders, action:'CHECKIN', status })"
                    class="mr-2"
                    color="success"
                    depressed
                    small
                    @click="handleClickCheckIn(selected)"
                  >
                    辦理入住
                  </v-btn>
                  <v-btn
                    v-show="isBtnShow({ orders, action:'CONFIRM', status })"
                    color="success"
                    depressed
                    small
                    @click.stop="closeOrderInfoDialogHandler"
                  >
                    確定
                  </v-btn>
                </div>
              </v-card-text>
            </v-card>
          </v-card-text>
        </template>
      </v-card>
      <v-card
        v-show="tab === 'ORDER_PAYMENT'"
        outlined
      >
        <template v-if="rwd === 'xs'">
          <v-card-title class="headline">
            <v-row>
              <v-col cols="6">
                <v-btn
                  block
                  depressed
                  @click="setDialogViewHandler({type:'ORDER_ORDER_INFO',bookingId})"
                >
                  訂單資訊
                </v-btn>
              </v-col>
              <v-col cols="6">
                <v-btn
                  block
                  color="success"
                  depressed
                >
                  收款結帳
                </v-btn>
              </v-col>
            </v-row>
          </v-card-title>
          <v-card-text>
            <v-card outlined>
              <v-card-title class="d-flex justify-space-between">
                <v-btn
                  color="warning"
                  dark
                  depressed
                  small
                  @click="handleClickAddExtraPayment"
                >
                  新增收款
                </v-btn>
              </v-card-title>
              <v-card-text class="d-flex justify-space-between title py-0">
                <span>總額：</span><span
                  v-math:round="payment.price"
                  v-price="payment.price"
                />
              </v-card-text>
              <v-card-text class="d-flex justify-space-between title py-0">
                <span>已收金額：</span><span
                  v-math:round="payment.payments"
                  v-price="payment.payments"
                />
              </v-card-text>
              <hr
                style="width:90%;margin:0 auto;border-top: 1px solid #ddd;"
              >
              <v-card-text class="d-flex justify-space-between title py-0">
                <span>待收金額：</span><span
                  v-math:round="payment.difference"
                  v-price="payment.difference"
                />
              </v-card-text>
              <hr
                style="width:90%;margin:0 auto;border-top: 1px solid #ddd;"
              >
              <v-card-text>
                <v-card-text class="d-flex px-0 py-2">
                  使用專案：{{ payment.discounts ? getDiscountSet(payment.discounts) : '未使用專案' }}
                </v-card-text>
                <v-card-text class="d-flex px-0 py-2">
                  收款明細：
                </v-card-text>

                <v-card-text
                  v-for="(item,index) in payment.bills"
                  :key="index"
                  class="px-0 py-1"
                >
                  <v-card outlined>
                    <v-card-title
                      class="d-flex justify-space-between py-1 px-2 subtitle-2 primary white--text"
                    >
                      <span>類型</span><span>{{ paymentType(item.paymentType) }}</span>
                    </v-card-title>
                    <v-card-text class="d-flex justify-space-between py-1 px-2 subtitle-2">
                      <span>金額</span>
                      <span
                        v-if="item.paymentAmount"
                        v-math:round="item.paymentAmount"
                        v-price="item.paymentAmount"
                      />
                      <span v-else>－－</span>
                    </v-card-text>
                    <v-card-text class="d-flex justify-space-between py-1 px-2 subtitle-2">
                      <span>方式</span>
                      <span>{{ paymentMethods(item.paymentMethod) }}</span>
                    </v-card-text>
                    <v-card-text class="d-flex justify-space-between py-1 px-2 subtitle-2">
                      <span>收款時間</span>
                      <span>{{ item.extraExpenseOrderNote ? item.extraExpenseOrderNote :'無' }}</span>
                    </v-card-text>
                    <v-card-text class="d-flex justify-space-between py-1 px-2 subtitle-2">
                      <span>備註</span>
                      <span>{{ item.paymentNote ? paymentNote :'無' }}</span>
                    </v-card-text>
                  </v-card>
                </v-card-text>

                <div class="d-flex justify-space-between align-center mt-4">
                  <v-spacer />
                  <v-btn
                    color="success"
                    depressed
                    small
                    @click.stop="closeOrderInfoDialogHandler"
                  >
                    確定
                  </v-btn>
                </div>
              </v-card-text>
            </v-card>
          </v-card-text>
        </template>
        <template v-else>
          <v-card-title class="headline">
            <v-btn
              class="mr-2"
              depressed
              @click="setDialogViewHandler({type:'ORDER_ORDER_INFO',bookingId})"
            >
              訂單資訊
            </v-btn>
            <v-btn
              color="success"
              depressed
            >
              收款結帳
            </v-btn>
          </v-card-title>
          <v-card-text>
            <v-card outlined>
              <v-card-title class="d-flex justify-space-between">
                <div>
                  總額：<span
                    v-math:round="payment.price"
                    v-price="payment.price"
                  />
                </div>
                <div>
                  已收金額：<span
                    v-math:round="payment.payments"
                    v-price="payment.payments"
                  />
                </div>
                <div>
                  待收金額：<span
                    v-math:round="payment.difference"
                    v-price="payment.difference"
                  />
                </div>
                <v-btn
                  color="warning"
                  dark
                  depressed
                  small
                  @click="handleClickAddExtraPayment"
                >
                  新增收款
                </v-btn>
              </v-card-title>
              <v-card-text>
                <v-card-text class="d-flex px-0 py-2">
                  使用專案：{{ payment.discounts ? getDiscountSet(payment.discounts) : '未使用專案' }}
                </v-card-text>
                <v-card-text class="d-flex px-0 py-2">
                  收款明細：
                </v-card-text>

                <v-data-table
                  v-if="payment.bills && payment.bills.length"
                  class="border--default"
                  :footer-props="{
                    itemsPerPageText:'每頁顯示',
                    itemsPerPageAllText:'全部',
                    firstIcon:'mdi-chevron-double-left',
                    lastIcon:'mdi-chevron-double-right',
                    prevIcon:'mdi-chevron-left',
                    nextIcon:'mdi-chevron-right'
                  }"
                  :headers="headersPayment"
                  :hide-default-footer="payment.bills.length === 0 ? true : false"
                  :items="payment.bills"
                >
                  <template v-slot:[`item.paymentType`]="{item}">
                    {{ paymentType(item.paymentType) }}
                  </template>
                  <template v-slot:[`item.paymentAmount`]="{item}">
                    <div
                      v-math:round="item.paymentAmount"
                      v-price="item.paymentAmount"
                    />
                  </template>
                  <template v-slot:[`item.paymentMethod`]="{item}">
                    {{ paymentMethods(item.paymentMethod) }}
                  </template>
                  <template v-slot:[`item.extraExpenseOrderNote`]="{item}">
                    <span> {{ item.extraExpenseOrderNote ? item.extraExpenseOrderNote :'無' }}</span>
                  </template>
                </v-data-table>

                <div class="d-flex justify-space-between align-center mt-4">
                  <v-spacer />
                  <v-btn
                    color="success"
                    depressed
                    small
                    @click.stop="closeOrderInfoDialogHandler"
                  >
                    確定
                  </v-btn>
                </div>
              </v-card-text>
            </v-card>
          </v-card-text>
        </template>
      </v-card>
    </v-dialog>

    <!--extra expense -->
    <v-dialog
      v-model="dialogOrdersExtraExpense"
      max-width="290"
      @click:outside="dialog.beforeSetDialog(
        {initAction:'temp-extra-expense'},
        {type:'ordersExtraExpense',show:false}
      )"
    >
      <v-card>
        <ValidationObserver ref="formExtraExpense">
          <form>
            <v-card-title>
              新增消費：
              <v-spacer />
              <v-btn
                icon
                @click="dialog.beforeSetDialog({initAction:'temp-extra-expense'},{type:'ordersExtraExpense',show:false})"
              >
                <v-icon>mdi-close-box</v-icon>
              </v-btn>
            </v-card-title>
            <v-card-text>
              <ValidationProvider
                v-slot="{ errors }"
                name="名稱"
                rules="required"
              >
                <v-select
                  v-model="tempExtraExpense.extraExpenseId"
                  class="py-2"
                  dense
                  :error-messages="errors"
                  :items="extraExpenseItems"
                  label="名稱"
                  @input="setExtraExpenseSinglePrice"
                />
              </ValidationProvider>
              <ValidationProvider
                v-slot="{ errors }"
                name="單價"
                rules="required"
              >
                <v-text-field
                  v-model="tempExtraExpense.extraExpenseOrderSinglePrice"
                  class="py-2"
                  dense
                  :error-messages="errors"
                  label="單價"
                  readonly
                />
              </ValidationProvider>
              <ValidationProvider
                v-slot="{ errors }"
                name="數量"
                rules="required"
              >
                <v-text-field
                  v-model="tempExtraExpense.extraExpenseOrderNumber"
                  class="py-2"
                  dense
                  :error-messages="errors"
                  label="數量"
                  min="1"
                  type="number"
                />
              </ValidationProvider>
              <ValidationProvider
                v-slot="{ errors }"
                name="備註"
                rules="max:300"
              >
                <v-textarea
                  v-model="tempExtraExpense.extraExpenseOrderNote"
                  auto-grow
                  class="py-2"
                  dense
                  :error-messages="errors"
                  label="備註"
                  row-height="20"
                  rows="4"
                />
              </ValidationProvider>
              <div class="d-flex align-center">
                <v-spacer />
                <v-btn
                  color="success"
                  depressed
                  small
                  @click="insertExtraExpenseOrder"
                >
                  完成
                </v-btn>
              </div>
            </v-card-text>
          </form>
        </ValidationObserver>
      </v-card>
    </v-dialog>

    <!--  confirm cancel booking? -->
    <t-dialog-confirm
      :t-actions="true"
      :t-confirm-text="dialogConfirmText"
      :t-dialog="dialogCancelBookingConfirm"
      t-icon
      :t-icon-color="'danger'"
      :t-icon-text="'mdi-alert-circle-outline'"
      :t-persistent="true"
    >
      <template v-slot:actions>
        <v-btn
          color="danger"
          outlined
          small
          @click="dialog.setDialog({type:'cancelBookingConfirm',show:false})"
        >
          取消
        </v-btn>
        <v-btn
          color="primary"
          depressed
          small
          @click="cancelBooking(orderInfo)"
        >
          確定
        </v-btn>
      </template>
    </t-dialog-confirm>
  </div>
</template>

<style lang="scss">
@import 'src/assets/scss/utils/_variables.scss';
.page__orderInfo {
  height: 100%;
  .main {
    height: calc(100% - 128px);
  }
}
.theme--light.v-data-table > .v-data-table__wrapper > table > thead > tr > th:first-child {
  background: $primary !important;
}

</style>
