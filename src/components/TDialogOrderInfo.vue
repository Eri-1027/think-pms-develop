<script>
/**
 * @displayName [未知]TDialogOrderInfo
 * @todo 與 TCardOrderInfo 似乎重複
 */
export default {
  props: {
    roomStatusForDetail: {
      type: Function,
      default: () => {}
    },
    selected: {
      type: Array,
      default: () => []
    },
    isBtnShow: {
      type: Function,
      default: () => {}
    },
    paymentType: {
      type: Function,
      default: () => {}
    },
    paymentMethods: {
      type: Function,
      default: () => {}
    },
    dialog: {
      type: Boolean,
      default: true
    },
    payment: {
      type: Object,
      default: () => {}
    },
    tabOptions: {
      type: String,
      default: 'ORDER_ORDER_INFO'
    },
    orderInfo: {
      type: Object,
      default: () => {}
    },
    status: {
      type: String,
      default: ''
    },
    tempOrderInfo: {
      type: Object,
      default: () => {}
    },
    headerOrderInfos: {
      type: Array,
      default: () => []
    },
    headerOrderInfosExtraExpense: {
      type: Array,
      default: () => []
    },
    headerOrderInfosPayment: {
      type: Array,
      default: () => []
    },
    extraExpenses: {
      type: Array,
      default: () => []
    },
    customerGender: {
      type: String,
      default: ''
    }
  },
  methods: {
    setDialog ({ type, isShow }) {
      this.$emit('set-dialog', { type, isShow })
    },
    setOrderInfoToView ({ type, item }) {
      this.$emit('set-order-info-to-view', { type, item })
    },
    setOrderInfoStatus ({ order }) {
      this.$emit('set-order-info-status', { order })
    },
    setTempUpdateOrderInfo ({ prop, val }) {
      this.$emit('set-temp-update-order-info', { prop, val })
    },
    setSelected (event) {
      this.$emit('set-selected', event)
    },
    updateExtraExpenseAmount ({ number, item }) {
      // 應該取 item 的 id 即可
      this.$emit('update-extra-expense-amount', { number, item })
    },
    closeDialog () {
      this.$emit('close-dialog')
    },
    print () {
      // print utils...
      this.$emit('print')
    },
    deleteExtraExpense ({ item }) {
      this.$emit('delete-extra-expense', { item })
    },
    cancelBooking () {
      this.$emit('cancel-booking')
      console.log(this.cancelBooking)
    },
    updateOrder ({ orders, extraExpenses }) {
      this.$emit('update-order', { orders, extraExpenses })
    },
    checkOut (selected) {
      this.$emit('checkout', selected)
    },
    cancelCheckIn (selected) {
      this.$emit('cancel-checkin', selected)
    },
    checkIn (selected) {
      this.$emit('checkin', selected)
    }
  }
}
</script>
<template>
  <v-dialog
    class="d-print-none"
    max-width="670"
    :value="dialog"
    @click:outside="closeDialog"
  >
    <v-card v-show="tabOptions === 'ORDER_ORDER_INFO'">
      <v-card-title class="headline">
        <v-btn
          class="mr-2"
          color="info"
          depressed
        >
          訂單資訊
        </v-btn>
        <v-btn
          depressed
          @click="setOrderInfoToView({
            type:'ORDER_PAYMENT',
            bookingId:orderInfo.bookingId
          })"
        >
          收款結帳
        </v-btn>
      </v-card-title>
      <v-card-text v-if="orderInfo">
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
              @click="setOrderInfoStatus({
                type:'ORDER_EDIT',
                order:orderInfo
              })"
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
              @click="setDialog({
                type:'ORDER_EXTRA_EXPENSE',
                isShow:true
              })"
            >
              新增消費
            </v-btn>
          </v-card-title>
          <v-card-text>
            <v-row no-gutters>
              <v-col cols="6">
                <v-card-text class="d-flex px-0 py-2">
                  <div>訂房日期：</div>
                  <div>{{ $date(orderInfo.bookingDate).format('YYYY/MM/DD') }}</div>
                </v-card-text>
              </v-col>
              <v-col cols="6">
                <v-card-text class="d-flex px-0 py-2">
                  <div>旅客姓名：</div>
                  <div>
                    {{
                      orderInfo.customerName
                        ? orderInfo.customerName
                        : '未提供'
                    }}
                  </div>
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
                  <div>{{ customerGender }}</div>
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
                  <div>
                    {{
                      orderInfo.customerNationality
                        ? orderInfo.customerNationality
                        : '未提供'
                    }}
                  </div>
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
                  <div>
                    {{
                      orderInfo.customerIdNumber
                        ? orderInfo.customerIdNumber
                        : '未提供'
                    }}
                  </div>
                </v-card-text>
              </v-col>
              <v-col cols="6">
                <v-card-text class="d-flex px-0 py-2 align-center">
                  <div>入住人數：</div>
                  <div v-show="status !== 'edit'">
                    {{
                      orderInfo.numberOfPeople
                        ? orderInfo.numberOfPeople
                        : '未提供'
                    }}
                  </div>
                  <v-text-field
                    v-show="status === 'edit'"
                    class="py-0 my-0 mr-4"
                    dense
                    hide-details
                    single-line
                    type="number"
                    :value="tempOrderInfo.numberOfPeople"
                    @input="setTempUpdateOrderInfo({
                      prop:'numberOfPeople',
                      val:$event
                    })"
                  />
                </v-card-text>
              </v-col>
              <v-col cols="6">
                <v-card-text class="d-flex px-0 py-2">
                  <div>護照號碼：</div>
                  <div>
                    {{
                      orderInfo.customerPassportNumber
                        ? orderInfo.customerPassportNumber
                        : '未提供'
                    }}
                  </div>
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
                  <div>
                    {{
                      orderInfo.customerPhone
                        ? orderInfo.customerPhone
                        : '未提供'
                    }}
                  </div>
                </v-card-text>
              </v-col>
              <v-col cols="6">
                <v-card-text class="d-flex px-0 py-2">
                  <div>
                    備註：
                  </div>
                  <div v-show="status !== 'edit'">
                    {{
                      orderInfo.bookingNote
                        ? orderInfo.bookingNote
                        : '無'
                    }}
                  </div>
                  <v-textarea
                    v-show="status === 'edit'"
                    auto-grow
                    class="py-0 my-0 mr-4"
                    dense
                    hide-details
                    single-line
                    :value="tempOrderInfo.bookingNote"
                    @input="setTempUpdateOrderInfo({
                      prop:'bookingNote',
                      val:$event
                    })"
                  />
                </v-card-text>
              </v-col>
              <v-col cols="6">
                <v-card-text class="d-flex px-0 py-2">
                  <div>E-mail：</div>
                  <div>
                    {{
                      orderInfo.customerEmail
                        ? orderInfo.customerEmail
                        : '未提供'
                    }}
                  </div>
                </v-card-text>
              </v-col>
            </v-row>
          </v-card-text>
          <v-card-text class="py-0">
            房型：{{ orderInfo.roomTypeName }}
          </v-card-text>
          <v-card-text v-if="orderInfo.orders && orderInfo.orders.length">
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
              :headers="headerOrderInfos"
              :hide-default-footer="orderInfo.orders.length === 1 ? true : false"
              item-key="roomNumber"
              :items="orderInfo.orders"
              show-select
              :value="selected"
              @input="setSelected"
            >
              <template v-slot:[`header.data-table-select`]="{props,on}">
                <v-simple-checkbox
                  dark
                  :value="props.value"
                  v-on="on"
                />
              </template>
              <template v-slot:[`item.roomNumber`]="{item}">
                {{
                  item.roomNumber !== null
                    ? item.roomNumber
                    : '尚未排房'
                }}
              </template>
              <template v-slot:[`item.checkInStart`]="{item}">
                {{
                  $date(item.checkInStart).format('YYYY/MM/DD') === '1899/11/30'
                    ? '尚未入住'
                    : $date(item.checkInStart).format('YYYY/MM/DD')
                }}
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
                  <span v-show="status !== 'edit'">
                    {{
                      item.keycardNumber
                        ? item.keycardNumber
                        : '1'
                    }}
                  </span>
                  <v-text-field
                    v-show="status === 'edit'"
                    dense
                    hide-details
                    min="1"
                    single-line
                    style="max-width:40px"
                    type="number"
                    :value="tempOrderInfo.orders[orderInfo.orders.indexOf(item)].keycardNumber"
                    @input="setTempUpdateOrderInfo({
                      prop:['orders',orderInfo.orders.indexOf(item)],val:$event
                    })"
                  />
                </div>
              </template>
              <template v-slot:[`item.bookingNote`]="{item}">
                <span>{{
                  item.bookingNote
                    ? item.bookingNote
                    : '無'
                }}</span>
              </template>
            </v-data-table>
          </v-card-text>
          <v-card-text
            v-if="extraExpenses && extraExpenses.length"
            class="py-0"
          >
            其他消費：
          </v-card-text>
          <v-card-text>
            <v-data-table
              v-if="extraExpenses.length"
              class="border--default"
              :footer-props="{
                itemsPerPageText:'每頁顯示',
                itemsPerPageAllText:'全部',
                firstIcon:'mdi-chevron-double-left',
                lastIcon:'mdi-chevron-double-right',
                prevIcon:'mdi-chevron-left',
                nextIcon:'mdi-chevron-right'
              }"
              :headers="headerOrderInfosExtraExpense"
              :hide-default-footer="extraExpenses.length === 1 ? true : false"
              :items="extraExpenses"
            >
              <template v-slot:[`item.extraExpenseOrderNumber`]="{item}">
                <div class="d-flex justify-center">
                  <span v-show="status !== 'edit'">{{ item.extraExpenseOrderNumber }}</span>
                  <v-text-field
                    v-show="status === 'edit'"
                    dense
                    hide-details
                    min="1"
                    single-line
                    style="max-width:40px"
                    type="number"
                    :value="item.extraExpenseOrderNumber"
                    @input="updateExtraExpenseAmount({
                      number:$event,
                      item
                    })"
                  />
                </div>
              </template>
              <template v-slot:[`item.extraExpenseOrderNote`]="{item}">
                <span>{{
                  item.extraExpenseOrderNote
                    ? item.extraExpenseOrderNote
                    : '無'
                }}</span>
              </template>
              <template v-slot:[`item.actions`]="{item}">
                <v-btn
                  color="danger"
                  dark
                  depressed
                  icon
                  @click.stop="deleteExtraExpense({item})"
                >
                  <v-icon>mdi-trash-can-outline</v-icon>
                </v-btn>
              </template>
            </v-data-table>
          </v-card-text>
          <v-card-text>
            <div class="d-flex justify-end mt-4">
              <v-btn
                v-show="isBtnShow({
                  orders:orderInfo.orders,
                  action:'CANCEL_UNCHECKIN',
                  status
                })"
                class="mr-2"
                color="warning"
                dark
                depressed
                small
                @click="cancelBooking"
              >
                取消訂單
              </v-btn>
              <v-spacer />
              <v-btn
                v-show="isBtnShow({
                  orders:orderInfo.orders,
                  action:'CANCLE',
                  status
                })"
                class="mr-2"
                color="warning"
                dark
                depressed
                small
                @click="setOrderInfoStatus({
                  type:'',
                  order:orderInfo
                })"
              >
                取消
              </v-btn>
              <v-btn
                v-show="isBtnShow({
                  orders:orderInfo.orders,
                  action:'COMPLETE',
                  status
                })"
                class="mr-2"
                color="info"
                depressed
                small
                @click="updateOrder({
                  orders:orderInfo.orders,
                  extraExpenses
                })"
              >
                完成
              </v-btn>
              <v-btn
                v-show="isBtnShow({
                  orders:orderInfo.orders,
                  action:'CHECKOUT',
                  status
                })"
                class="mr-2"
                color="warning"
                dark
                depressed
                small
                @click="checkOut(selected)"
              >
                退房
              </v-btn>
              <v-btn
                v-show="isBtnShow({
                  orders:orderInfo.orders,
                  action:'CANCEL_CHECKIN',
                  status
                })"
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
                v-show="isBtnShow({
                  orders:orderInfo.orders,
                  action:'CHECKIN', status
                })"
                class="mr-2"
                color="info"
                depressed
                small
                @click="checkIn(selected)"
              >
                辦理入住
              </v-btn>
              <v-btn
                v-show="isBtnShow({
                  orders:orderInfo.orders,
                  action:'CONFIRM',
                  status
                })"
                color="info"
                depressed
                small
                @click.stop="closeDialog"
              >
                確定
              </v-btn>
            </div>
          </v-card-text>
        </v-card>
      </v-card-text>
    </v-card>
    <v-card
      v-show="tabOptions === 'ORDER_PAYMENT'"
      outlined
    >
      <v-card-title class="headline">
        <v-btn
          class="mr-2"
          depressed
          @click="setOrderInfoToView({
            type:'ORDER_ORDER_INFO',
            bookingId:payment.bookingId
          })"
        >
          訂單資訊
        </v-btn>
        <v-btn
          color="info"
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
              @click="setDialog({
                type:'ORDER_EXTRA_PAYMENT',
                isShow:true
              })"
            >
              新增收款
            </v-btn>
          </v-card-title>
          <v-card-text>
            <v-card-text class="d-flex px-0 py-2">
              使用專案：{{ payment.discount }}
            </v-card-text>
            <v-card-text class="d-flex px-0 py-2">
              收款明細：
            </v-card-text>
            <v-data-table
              v-if="payment.bill && payment.bill.length"
              class="border--default"
              :footer-props="{
                itemsPerPageText:'每頁顯示',
                itemsPerPageAllText:'全部',
                firstIcon:'mdi-chevron-double-left',
                lastIcon:'mdi-chevron-double-right',
                prevIcon:'mdi-chevron-left',
                nextIcon:'mdi-chevron-right'
              }"
              :headers="headerOrderInfosPayment"
              :hide-default-footer="payment.bill.length === 0 ? true : false"
              :items="payment.bill"
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
                <span> {{
                  item.extraExpenseOrderNote
                    ? item.extraExpenseOrderNote
                    : '無'
                }}</span>
              </template>
            </v-data-table>

            <div class="d-flex justify-space-between align-center mt-4">
              <v-spacer />
              <v-btn
                color="info"
                depressed
                small
                @click.stop="closeDialog"
              >
                確定
              </v-btn>
            </div>
          </v-card-text>
        </v-card>
      </v-card-text>
    </v-card>
  </v-dialog>
</template>

<style lang="scss">
.theme--light.v-data-table > .v-data-table__wrapper > table > thead > tr > th:first-child {
  background: #344955 !important;
}

</style>
