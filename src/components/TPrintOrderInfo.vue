<script>
import { mapState } from 'vuex'
import { mixinUtils } from '../mixins/utils.mixin'
import headers from '../utils/headerDataTables'
/**
 * 訂單資訊列印
 */
export default {
  mixins: [mixinUtils],
  data () {
    return {
      headersOrderInfosPrint: headers.orderInfosPrint,
      headersExtraExpense: headers.orderInfosExtraExpense,
      headersPayment: headers.orderInfoPayment
    }
  },
  computed: {
    ...mapState({
      orderInfo: state => state.orderInfo.orderInfo,
      orders: state => state.orderInfo.orders,
      extraExpenses: state => state.orderInfo.extraExpenses,
      payment: state => state.orderInfo.payment,
      showPrintOrderInfo: state => state.print.orderInfo
    })
  }
}
</script>
<template>
  <div class="components__tPrintOrderList">
    <v-card
      v-if="orderInfo && showPrintOrderInfo"
      outlined
    >
      <v-card-title class="d-flex">
        <small>訂單編號：</small>
        <div class="success--text">
          {{ orderInfo.bookingNumber }}
        </div>
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
              <div>
                {{
                  orderInfo.numberOfPeople
                    ? orderInfo.numberOfPeople
                    : '未提供'
                }}
              </div>
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
              <div>
                {{
                  orderInfo.bookingNote
                    ? orderInfo.bookingNote
                    : '無'
                }}
              </div>
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
          :headers="headersOrderInfosPrint"
          hide-default-footer
          item-key="roomNumber"
          :items="orders"
        >
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
              <span>
                {{
                  item.keycardNumber
                    ? item.keycardNumber
                    : '1'
                }}
              </span>
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
          hide-default-footer
          :items="extraExpenses"
        >
          <template v-slot:[`item.extraExpenseOrderNumber`]="{item}">
            <div class="d-flex justify-center">
              <span>{{ item.extraExpenseOrderNumber }}</span>
            </div>
          </template>
          <template v-slot:[`item.extraExpenseOrderNote`]="{item}">
            <span>{{
              item.extraExpenseOrderNote
                ? item.extraExpenseOrderNote
                : '無'
            }}</span>
          </template>
        </v-data-table>
      </v-card-text>
    </v-card>
    <v-card
      v-if="payment && showPrintOrderInfo"
      outlined
    >
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
      </v-card-title>
      <v-card-text>
        <v-card-text class="d-flex px-0 py-2">
          使用專案：{{ payment.discount }}
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
          hide-default-footer
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
            <span> {{
              item.extraExpenseOrderNote
                ? item.extraExpenseOrderNote
                :'無'
            }}</span>
          </template>
        </v-data-table>
      </v-card-text>
    </v-card>
  </div>
</template>
