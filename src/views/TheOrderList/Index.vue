<script>
import { mapState, mapMutations } from 'vuex'
import { mixinRoomActions } from '@/mixins/roomActions.mixin'
import { mixinInsertBooking } from '@/mixins/insertBooking.mixin'
import { mixinPayment } from '@/mixins/payment.mixin'
import { mixinOrderInfo } from '@/mixins/orderInfo.mixin'
import { mixinUnCheckIn } from '@/mixins/unCheckIn.mixin'
import { mixinUtils } from '@/mixins/utils.mixin'
import { createDialog } from '@/utils/helpers/createDialog'
import { createOrders } from '@/utils/create/createOrders'
import _ from 'lodash'
const _orders = createOrders()
// components
const TCardAllBooking = () => import('@/components/TCardAllBooking.vue')
const TDivider = () => import('@/components/TDivider.vue')
export default {
  components: {
    TCardAllBooking,
    TDivider
  },
  mixins: [
    mixinRoomActions,
    mixinInsertBooking,
    mixinPayment,
    mixinOrderInfo,
    mixinUnCheckIn,
    mixinUtils
  ],
  data () {
    return {
      /* ------------------------------------ *\
          TheOrderList.vue
      \* ------------------------------------ */
      searchKeyWord: '',
      searchDateType: '0',
      dateTypeItems: [
        { text: '訂房日', value: '0' },
        { text: '入住日', value: '1' },
        { text: '退房日', value: '2' }
      ],
      dateStartDay: '',
      dateEndDay: '',
      currentPage: 1,
      orders: [],
      totalPage: 0,
      searchUnCheckIn: '',
      currentDay: this.$date()
    }
  },
  computed: {
    ...mapState({
      isLoading: state => state.loading.isLoading,
      dialogInsertOption: state => state.dialog.map.insertOption,
      dialogInsertGeneralBooking: state => state.dialog.map.insertGeneralBooking,
      dialogInsertRestBooking: state => state.dialog.map.insertRestBooking,
      dialogPaymentAfterInsertBooking: state => state.dialog.map.paymentAfterInsertBooking,
      dialogPaymentAfterInsertRestBooking: state => state.dialog.map.paymentAfterInsertRestBooking,
      // orders
      dialogCancelBookingConfirm: state => state.dialog.map.cancelBookingConfirm,
      dialogCustomerListOfInsertBooking: state => state.dialog.map.customerListOfInsertBooking
    }),
    rwd () {
      return this.$vuetify.breakpoint.name
    },
    /**
     * 注意 不要直接使用 this.$date() 來表示今天，最好是 this.$date(today) // today = this.$date().format('yyyy-mm-dd)
     */
    filterOrdersToday () {
      const between = (checkin, checkout) => {
        const today = this.$date().format('YYYY-MM-DD')
        return this.$date(today).isBetween(checkin, checkout, null, '[]')
      }
      return this.orders.filter(order => {
        const checkin = this.$date(order.expectedCheckInTime).format('YYYY-MM-DD')
        const checkout = this.$date(order.expectedCheckOutTime).format('YYYY-MM-DD')
        return between(checkin, checkout)
      })
    },
    ordersGroupByDate () {
      const groups = []
      const bgDate = el => this.$date(el.bookingDate).format('YYYY-MM-DD')
      this.orders.forEach((order, index) => {
        if (!groups.length) {
          groups.push([order])
        } else {
          const idx = groups.findIndex(group => {
            return bgDate(group[0]) === bgDate(order)
          })
          if (idx !== -1) {
            groups[idx].push(order)
          } else {
            groups.push([order])
          }
        }
      })
      return groups
    }
  },
  mounted () {
    this.$bus.$on('change', async () => {
      this.dialogOrderInfoStatus = ''
      await this.setOrdersHandler({ page: 1 })
      await this.reFetchHandler()
    })
  },
  async created () {
    this.dialog = createDialog()
    await this.setOrdersHandler({ page: 1 })
  },
  updated () {
    this.$bus.$on('set-errors-by-ref', (payload) => {
      const { ref, msg } = payload
      if (this.$refs[ref]) {
        this.$refs[ref].errors = [msg]
      }
    })
    this.$bus.$on('clear-errors-by-ref', (ref) => {
      if (this.$refs[ref]) {
        this.$refs[ref].errors = []
      }
    })
  },
  methods: {
    ...mapMutations([
      'loading/SET_LOADING'
    ]),
    searchingHandler: _.debounce(async function (type, event) {
      if (event) {
        if (type === 'START_DATE') {
          this.dateStartDay = event
        }
        if (type === 'END_DATE') {
          this.dateEndDay = event
        }
        if (type === 'KEYWORD') {
          this.searchKeyWord = event
        }
      }
      const params = {
        type,
        fromDate: this.dateStartDay,
        endDate: this.dateEndDay,
        dateType: this.searchDateType,
        search: this.searchKeyWord,
        currentDay: this.currentDay
      }
      const fn = _orders.createSearchOrders(params)
      if (fn) {
        const temp = _orders.getTempSearch(this.currentPage, params)
        const fetchs = await fn(temp)
        if (fetchs && fetchs.length) {
          const modifierOrders = await _orders.getModifierOrders(fetchs)
          this.orders = modifierOrders
        } else {
          this.orders = []
        }
      } else {
        console.log('fn create failed')
        await this.setOrdersHandler({ page: 1 })
      }
    }, 300),
    // new version of show orders
    async setOrdersHandler ({ page = 1 }) {
      this['loading/SET_LOADING'](true)
      try {
        this.currentPage = page
        const temp = {
          currentPage: this.currentPage
        }
        const fetchs = await _orders.fetchGetOrders(temp)
        this.totalPage = fetchs.page
        const modifierOrders = await _orders.getModifierOrders(fetchs.showOrders)
        this.orders = modifierOrders
        this['loading/SET_LOADING'](false)
      } catch (err) {
        console.log(err)
        this['loading/SET_LOADING'](false)
      }
    },
    async getResetOrders (props) {
      if (props && props.length) {
        props.forEach(prop => {
          this[prop] = ''
        })
      }
      await this.setOrdersHandler({ page: 1 })
    },
    /* ------------------------------------ *\
      both order-info && TheOrderList.vue
    \* ------------------------------------ */
    displayHeaderRight (bulbs) {
      if (bulbs && bulbs.length) {
        if (bulbs[4]) {
          return '休'
        } else if (bulbs[6]) {
          return '保'
        } else if (bulbs[7]) {
          return 'C'
        } else {
          let count = 0
          bulbs.forEach((bulb, idx, ary) => {
            if ((+bulb) > 0) {
              count += bulb
            }
            if (idx === ary.length - 1) {
              return count
            }
          })
          return count
        }
      }
    }
  }
}
</script>
<template>
  <v-container class="t-view__orderList pt-0 page-fixed">
    <div class="d-print-none views__theOrderList--main">
      <template v-if="rwd === 'xs'">
        <h1 class="text-left">
          所有訂單
        </h1>
        <v-row no-gutters>
          <v-col
            class="py-1 pr-1"
            cols="6"
          >
            <v-text-field
              v-model="searchKeyWord"
              append-icon="mdi-magnify"
              class="rounded-lg"
              dense
              full-width
              hide-details
              label="關鍵字搜尋"
              outlined
              single-line
              @input="searchingHandler('KEYWORD',$event)"
            />
          </v-col>
          <v-col
            class="py-1 pl-1"
            cols="6"
          >
            <v-select
              v-model="searchDateType"
              class="rounded-lg"
              dense
              full-width
              hide-details
              :items="dateTypeItems"
              label="日期類型"
              outlined
              single-line
              @input="searchingHandler('DATE_TYPE',$event)"
            />
          </v-col>
          <v-col
            class="py-1 pr-1"
            cols="6"
          >
            <t-date-picker
              append-icon="mdi-calendar"
              :date="dateStartDay"
              label="開始日期"
              :t-class="'rounded-lg'"
              :t-hide-details="true"
              @pick-date="searchingHandler('START_DATE',$event)"
            />
          </v-col>
          <v-col
            class="py-1 pl-1"
            cols="6"
          >
            <t-date-picker
              append-icon="mdi-calendar"
              :date="dateEndDay"
              label="結束日期"
              :min="$date(dateStartDay).add(0,'day').format('YYYY-MM-DD')"
              :t-class="'rounded-lg'"
              :t-hide-details="true"
              @pick-date="searchingHandler('END_DATE',$event)"
            />
          </v-col>
          <v-col
            class="py-1 pr-1"
            cols="6"
          >
            <v-btn
              block
              class="rounded-lg"
              color="primary"
              depressed
              @click="getResetOrders(['dateStartDay','dateEndDay','searchKeyWord'])"
            >
              重設
            </v-btn>
          </v-col>
          <v-col
            class="py-1 pl-1"
            cols="6"
          >
            <v-btn
              block
              class="rounded-lg"
              color="primary"
              depressed
              @click.stop="handleClickShowDialogBookingOption"
            >
              新增訂單
            </v-btn>
          </v-col>
        </v-row>
        <section>
          <TDivider>
            <span>今日訂單</span>
          </TDivider>
          <template v-if="filterOrdersToday && filterOrdersToday.length">
            <div
              v-for="order in filterOrdersToday"
              :key="order.bookingNumber"
              class="my-2"
            >
              <t-mobile-card
                v-if="Object.keys(order)"
                :action="false"
                :theme="order.bulbItems"
                @action="emitDialog({
                  type:'ORDER_ORDER_INFO',
                  bookingId:order.bookingId,
                  bookingDetailId:order.bookingDetailId,
                  bookingNumber:order.bookingNumber
                })"
              >
                <template #header>
                  <span
                    class="white--text"
                    style="max-width:50%;"
                  >
                    {{ order.bookingNumber }}
                  </span>
                  <div
                    class="t-text--circle t-text--circle--xs d-flex align-center justify-center"
                    :class="displayHeaderRight(order.bulbItems) === 'C' ? 't-text--circle--cancelXs' : ''"
                  >
                    <span
                      v-show="displayHeaderRight(order.bulbItems) !== 'C'"
                      class="white--text"
                    >{{ displayHeaderRight(order.bulbItems) }}</span>
                    <span
                      v-show="displayHeaderRight(order.bulbItems) === 'C'"
                    />
                  </div>
                </template>
                <template #default>
                  <div class="t-card__text d-flex justify-space-between px-2">
                    <span class="t-text--subtitle">
                      旅客姓名
                    </span>
                    <span class="t-text--subtitle">{{ order.customerName ? order.customerName : '未提供' }}</span>
                  </div>
                  <div class="t-card__text d-flex justify-space-between px-2">
                    <span class="t-text--subtitle">
                      聯絡電話
                    </span>
                    <span class="t-text--subtitle">{{ order.customerPhone ? order.customerPhone : '未提供' }}</span>
                  </div>
                  <div class="t-card__text d-flex justify-space-between px-2">
                    <span class="t-text--subtitle">
                      入住日期
                    </span>
                    <span class="t-text--subtitle">{{ $date(order.expectedCheckInTime).format('YYYY-MM-DD') }}</span>
                  </div>
                  <div class="t-card__text d-flex justify-space-between px-2">
                    <span class="t-text--subtitle">
                      退房日期
                    </span>
                    <span class="t-text--subtitle">{{ $date(order.expectedCheckOutTime).format('YYYY-MM-DD') }}</span>
                  </div>
                </template>
              </t-mobile-card>
            </div>
          </template>
          <template v-else>
            <h3>今天沒有訂單</h3>
          </template>
          <div
            v-for="group in ordersGroupByDate"
            :key="group[0].bookingId"
          >
            <TDivider type="left">
              <span>{{ $date(group[0].expectedCheckInTime).format('YYYY/MM/DD') }}</span>
            </TDivider>
            <div
              v-for="(order,orderIndex) in group"
              :key="orderIndex"
              class="my-2"
            >
              <t-mobile-card
                v-if="Object.keys(order)"
                :action="false"
                :theme="order.bulbItems"
                @action="emitDialog({
                  type:'ORDER_ORDER_INFO',
                  bookingId:order.bookingId,
                  bookingDetailId:order.bookingDetailId,
                  bookingNumber:order.bookingNumber})"
              >
                <template #header>
                  <span
                    class="white--text"
                    style="max-width:50%;"
                  >
                    {{ order.bookingNumber }}
                  </span>
                  <div
                    class="t-text--circle t-text--circle--xs d-flex align-center justify-center"
                    :class="displayHeaderRight(order.bulbItems) === 'C' ? 't-text--circle--cancelXs' : ''"
                  >
                    <span
                      v-show="displayHeaderRight(order.bulbItems) !== 'C'"
                      class="white--text"
                    >{{ displayHeaderRight(order.bulbItems) }}</span>
                    <span v-show="displayHeaderRight(order.bulbItems) === 'C'" />
                  </div>
                </template>
                <template #default>
                  <div class="t-card__text d-flex justify-space-between px-2">
                    <span class="t-text--subtitle">
                      旅客姓名
                    </span>
                    <span class="t-text--subtitle">{{ order.customerName ? order.customerName : '未提供' }}</span>
                  </div>
                  <div class="t-card__text d-flex justify-space-between px-2">
                    <span class="t-text--subtitle">
                      聯絡電話
                    </span>
                    <span class="t-text--subtitle">{{ order.customerPhone ? order.customerPhone : '未提供' }}</span>
                  </div>
                  <div class="t-card__text d-flex justify-space-between px-2">
                    <span class="t-text--subtitle">
                      入住日期
                    </span>
                    <span class="t-text--subtitle">{{ $date(order.expectedCheckInTime).format('YYYY-MM-DD') }}</span>
                  </div>
                  <div class="t-card__text d-flex justify-space-between px-2">
                    <span class="t-text--subtitle">
                      退房日期
                    </span>
                    <span class="t-text--subtitle">{{ $date(order.expectedCheckOutTime).format('YYYY-MM-DD') }}</span>
                  </div>
                </template>
              </t-mobile-card>
            </div>
          </div>
        </section>
        <v-pagination
          v-model="currentPage"
          circle
          :length="totalPage"
          @input="setOrdersHandler({ page: $event })"
        />
      </template>
      <template v-else>
        <v-toolbar flat>
          <!-- 關鍵字搜尋 -->
          <v-text-field
            v-model="searchKeyWord"
            append-icon="mdi-magnify"
            class="mr-2"
            dense
            hide-details
            label="關鍵字搜尋"
            outlined
            single-line
            style="max-width:200px"
            @input="searchingHandler('KEYWORD',$event)"
          />
          <!-- 日期類型 -->
          <v-select
            v-model="searchDateType"
            class="mr-2"
            dense
            hide-details
            :items="dateTypeItems"
            label="日期類型"
            outlined
            single-line
            style="max-width:200px"
            @input="searchingHandler('DATE_TYPE',$event)"
          />
          <!-- start -->
          <t-date-picker
            append-icon="mdi-calendar"
            :date="dateStartDay"
            label="開始日期"
            :t-class="'mr-2'"
            :t-hide-details="true"
            :t-style="'max-width:200px'"
            @pick-date="searchingHandler('START_DATE',$event)"
          />
          <!-- end -->
          <t-date-picker
            append-icon="mdi-calendar"
            :date="dateEndDay"
            label="結束日期"
            :min="$date(dateStartDay).add(0,'day').format('YYYY-MM-DD')"
            :t-class="'mr-2'"
            :t-hide-details="true"
            :t-style="'max-width:200px'"
            @pick-date="searchingHandler('END_DATE',$event)"
          />

          <v-spacer />

          <v-btn
            class="mr-2"
            color="primary"
            depressed
            @click="getResetOrders(['dateStartDay','dateEndDay','searchKeyWord'])"
          >
            重設
          </v-btn>
          <v-btn
            color="primary"
            depressed
            @click.stop="handleClickShowDialogBookingOption"
          >
            新增訂單
          </v-btn>
        </v-toolbar>
        <section v-if="orders && orders.length">
          <TDivider type="left">
            <span>今日訂單</span>
          </TDivider>
          <template v-if="filterOrdersToday && filterOrdersToday.length">
            <div
              v-for="filter in filterOrdersToday"
              :key="filter.bookingNumber"
            >
              <t-card-all-booking
                :item="filter"
                :theme="filter.bulbItems"
                @dialog="emitDialog"
              />
            </div>
          </template>
          <template v-else>
            <h3 class="secondary--text">
              今天沒有訂單
            </h3>
          </template>
          <div
            v-for="group in ordersGroupByDate"
            :key="group[0].bookingId"
          >
            <TDivider type="left">
              <span>{{ $date(group[0].expectedCheckInTime).format('YYYY/MM/DD') }}</span>
            </TDivider>
            <div
              v-for="(order,orderIndex) in group"
              :key="orderIndex"
            >
              <t-card-all-booking
                :item="order"
                :theme="order.bulbItems"
                @dialog="emitDialog"
              />
            </div>
          </div>
        </section>
        <section
          v-if="!orders.length"
          class="d-flex align-center justify-center"
        >
          <h3 class="secondary--text">
            沒有訂單
          </h3>
        </section>
        <v-pagination
          v-model="currentPage"
          circle
          :length="totalPage"
          @input="setOrdersHandler({ page: $event })"
        />
      </template>
    </div>

    <!-- 新增訂單選項 `insert-options` -->
    <v-dialog
      v-model="dialogInsertOption"
      max-width="290"
      @click:outside="dialog.setDialog({
        type:'insertOption',
        show:false
      })"
    >
      <v-card>
        <v-card-title class="d-flex justify-center">
          <v-icon
            color="primary"
            x-large
          >
            mdi-bed-outline
          </v-icon>
        </v-card-title>
        <v-card-text class="d-flex justify-center">
          <p class="title">
            選擇訂單類型
          </p>
        </v-card-text>
        <v-card-actions class="d-flex justify-center">
          <v-btn
            color="primary"
            outlined
            small
            @click="handleClickShowDialogInsertRestBooking('formRestBooking')"
          >
            休息
          </v-btn>
          <v-btn
            color="primary"
            depressed
            small
            @click="handleClickShowDialogInsertBooking"
          >
            入住
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <!-- 新增一般訂單 `insert-booking` -->
    <v-dialog
      v-model="dialogInsertGeneralBooking"
      max-width="600"
      @click:outside="dialog.beforeSetDialog(
        {initAction:'temp-booking'},
        {type:'insertGeneralBooking',show:false}
      )"
    >
      <v-card>
        <ValidationObserver ref="formInsertGenaralBooking">
          <form>
            <v-card-title class="headline">
              新增訂單
              <v-spacer />
              <v-btn
                icon
                @click.stop="dialog.beforeSetDialog(
                  {initAction:'temp-booking'},
                  {type:'insertGeneralBooking',show:false}
                )"
              >
                <v-icon v-text="'mdi-close-box'" />
              </v-btn>
            </v-card-title>
            <v-card-text>
              <v-row no-gutters>
                <template v-if="rwd === 'xs'">
                  <v-col cols="6">
                    <ValidationProvider
                      ref="ibDatePickerCheckIn"
                      v-slot="{ errors }"
                      name="入住日期"
                      rules="required"
                    >
                      <t-date-picker
                        append-icon="mdi-calendar"
                        :date="tempBooking.expectedCheckInTime"
                        label="入住日期"
                        :min="$date().format('YYYY-MM-DD')"
                        :t-class="'py-2 mx-2'"
                        :t-errors="errors"
                        :t-outlined="false"
                        @pick-date="handleClickPickCheckInDate"
                      />
                    </ValidationProvider>
                  </v-col>
                  <v-col cols="6">
                    <ValidationProvider
                      ref="ibDatePickerCheckOut"
                      v-slot="{ errors }"
                      name="退房日期"
                      rules="required"
                    >
                      <t-date-picker
                        append-icon="mdi-calendar"
                        :date="tempBooking.expectedCheckOutTime"
                        label="退房日期"
                        :min="$date(tempBooking.expectedCheckInTime).add(1,'day').format('YYYY-MM-DD')"
                        :t-class="'py-2 mx-2'"
                        :t-errors="errors"
                        :t-outlined="false"
                        @pick-date="handleClickPickCheckOutDate($event)"
                      />
                    </ValidationProvider>
                  </v-col>
                  <v-col cols="6">
                    <ValidationProvider
                      ref="ibCustomerName"
                      v-slot="{ errors }"
                      name="旅客姓名"
                    >
                      <v-text-field
                        v-model="tempBooking.customerName"
                        class="py-2 mx-2"
                        dense
                        :disabled="tempBooking.roomStatus === '6'"
                        :error-messages="errors"
                        label="旅客姓名"
                      />
                    </ValidationProvider>
                  </v-col>
                  <v-col cols="6">
                    <v-select
                      v-model="tempBooking.customerGender"
                      class="py-2 mx-2"
                      dense
                      :disabled="tempBooking.roomStatus === '6'"
                      :items="customerGenderItems"
                      label="旅客性別"
                      required
                    />
                  </v-col>
                  <v-col cols="6">
                    <ValidationProvider
                      ref="ibCustomerIdNumber"
                      v-slot="{ errors }"
                      mode="eager"
                      name="身分證號碼"
                      rules="max:10"
                    >
                      <v-text-field
                        v-model="tempBooking.customerIdNumber"
                        class="py-2 mx-2"
                        dense
                        :disabled="tempBooking.roomStatus === '6'"
                        :error-messages="errors"
                        label="身分證號碼"
                        required
                        @input="handleClickCheckCustomer('ID')"
                      />
                    </ValidationProvider>
                  </v-col>
                  <v-col cols="6">
                    <ValidationProvider
                      ref="ibCustomerPassportNumber"
                      v-slot="{ errors }"
                      mode="eager"
                      name="護照號碼"
                    >
                      <v-text-field
                        v-model="tempBooking.customerPassportNumber"
                        class="py-2 mx-2"
                        dense
                        :disabled="tempBooking.roomStatus === '6'"
                        :error-messages="errors"
                        label="護照號碼"
                        required
                        @input="handleClickCheckCustomer('PASSPORT')"
                      />
                    </ValidationProvider>
                  </v-col>
                </template>
                <template v-else>
                  <v-col cols="4">
                    <ValidationProvider
                      ref="ibDatePickerCheckIn"
                      v-slot="{ errors }"
                      name="入住日期"
                      rules="required"
                    >
                      <t-date-picker
                        append-icon="mdi-calendar"
                        :date="tempBooking.expectedCheckInTime"
                        label="入住日期"
                        :min="$date().format('YYYY-MM-DD')"
                        :t-class="'py-2 mx-2'"
                        :t-errors="errors"
                        :t-outlined="false"
                        @pick-date="handleClickPickCheckInDate"
                      />
                    </ValidationProvider>
                  </v-col>
                  <v-col cols="4">
                    <ValidationProvider
                      ref="ibCustomerName"
                      v-slot="{ errors }"
                      name="旅客姓名"
                    >
                      <v-text-field
                        v-model="tempBooking.customerName"
                        class="py-2 mx-2"
                        dense
                        :disabled="tempBooking.roomStatus === '6'"
                        :error-messages="errors"
                        label="旅客姓名"
                      />
                    </ValidationProvider>
                  </v-col>
                  <v-col cols="4">
                    <v-select
                      v-model="tempBooking.customerGender"
                      class="py-2 mx-2"
                      dense
                      :disabled="tempBooking.roomStatus === '6'"
                      :items="customerGenderItems"
                      label="旅客性別"
                      required
                    />
                  </v-col>
                  <v-col cols="4">
                    <ValidationProvider
                      ref="ibDatePickerCheckOut"
                      v-slot="{ errors }"
                      name="退房日期"
                      rules="required"
                    >
                      <t-date-picker
                        append-icon="mdi-calendar"
                        :date="tempBooking.expectedCheckOutTime"
                        label="退房日期"
                        :min="$date(tempBooking.expectedCheckInTime).add(1,'day').format('YYYY-MM-DD')"
                        :t-class="'py-2 mx-2'"
                        :t-errors="errors"
                        :t-outlined="false"
                        @pick-date="handleClickPickCheckOutDate($event)"
                      />
                    </ValidationProvider>
                  </v-col>
                  <v-col cols="4">
                    <ValidationProvider
                      ref="ibCustomerIdNumber"
                      v-slot="{ errors }"
                      name="身分證號碼"
                    >
                      <v-text-field
                        v-model="tempBooking.customerIdNumber"
                        class="py-2 mx-2"
                        dense
                        :disabled="tempBooking.roomStatus === '6'"
                        :error-messages="errors"
                        label="身分證號碼"
                        required
                        @input="handleClickCheckCustomer('ID')"
                      />
                    </ValidationProvider>
                  </v-col>
                  <v-col cols="4">
                    <ValidationProvider
                      ref="ibCustomerPassportNumber"
                      v-slot="{ errors }"
                      mode="eager"
                      name="護照號碼"
                    >
                      <v-text-field
                        v-model="tempBooking.customerPassportNumber"
                        class="py-2 mx-2"
                        dense
                        :disabled="tempBooking.roomStatus === '6'"
                        :error-messages="errors"
                        label="護照號碼"
                        required
                        @input="handleClickCheckCustomer('PASSPORT')"
                      />
                    </ValidationProvider>
                  </v-col>
                </template>
                <v-col cols="4">
                  <v-text-field
                    v-model="_stayingDay"
                    class="py-2 mx-2"
                    dense
                    label="入住天數"
                    readonly
                    required
                  />
                </v-col>
                <v-col cols="4">
                  <ValidationProvider
                    ref="ibNumberOfPeople"
                    v-slot="{ errors }"
                    name="入住人數"
                    rules="required"
                  >
                    <v-text-field
                      v-model="tempBooking.numberOfPeople"
                      class="py-2 mx-2"
                      dense
                      :error-messages="errors"
                      label="入住人數"
                      min="1"
                      required
                      type="number"
                    />
                  </ValidationProvider>
                </v-col>
                <v-col cols="4">
                  <ValidationProvider
                    ref="ibCustomerPhoneNumber"
                    v-slot="{ errors }"
                    mode="eager"
                    name="聯絡電話"
                  >
                    <v-text-field
                      v-model="tempBooking.customerPhone"
                      class="py-2 mx-2"
                      dense
                      :disabled="tempBooking.roomStatus === '6'"
                      :error-messages="errors"
                      label="聯絡電話"
                      required
                      @input="handleClickCheckCustomer('PHONE')"
                    />
                  </ValidationProvider>
                </v-col>
                <v-col cols="4">
                  <v-text-field
                    v-model="tempBooking.customerNationality"
                    class="py-2 mx-2"
                    dense
                    :disabled="tempBooking.roomStatus === '6'"
                    label="國籍"
                    required
                  />
                </v-col>
                <v-col cols="8">
                  <ValidationProvider
                    v-slot="{ errors }"
                    name="E-mail"
                    rules="email"
                  >
                    <v-text-field
                      v-model="tempBooking.customerEmail"
                      class="py-2 mx-2"
                      dense
                      :disabled="tempBooking.roomStatus === '6'"
                      :error-messages="errors"
                      label="E-mail"
                      required
                    />
                  </ValidationProvider>
                </v-col>

                <v-col
                  v-if="tempBooking.expectedCheckInTime && tempBooking.expectedCheckOutTime"
                  class="py-0 px-2 subtitle-2"
                  cols="12"
                >
                  房型
                </v-col>
                <v-col
                  v-if="roomTypeItems && roomTypeItems.length && tempBooking.expectedCheckInTime && tempBooking.expectedCheckOutTime"
                  :key="1"
                  class="px-2"
                  cols="12"
                >
                  <div
                    v-for="(item,index) in roomTypeItems"
                    :key="index"
                    class="d-flex justify-space-between roomType__group"
                  >
                    <div class="d-flex align-center roomType__item--name">
                      <span style="width:200px">{{ item.roomTypeName }}</span>
                    </div>
                    <div
                      v-if="item && item.roomTypeNumber && tempBooking.roomType[index]"
                      class="d-flex align-center mr-1 roomType__item--number"
                    >
                      <v-text-field
                        v-model="tempBooking.roomType[index].roomTypeNumber"
                        dense
                        :disabled="item.roomTypeNumber === '0'"
                        :max="item.roomTypeNumber"
                        :min="0"
                        required
                        single-line
                        style="width:60px;"
                        type="number"
                      />
                    </div>
                    <div class="d-flex align-center justify-center roomType__item--unit">
                      <span>間</span>
                    </div>
                    <div
                      class="d-flex align-center roomType__item--count"
                    >
                      <v-select
                        v-model="tempBooking.discountId[index]"
                        dense
                        :disabled="item && item.roomTypeNumber === '0'"
                        :items="item.discount"
                        label="選擇專案"
                        no-data-text="此房型沒有專案"
                        required
                        single-line
                        style="width:200px"
                      />
                    </div>
                  </div>
                  <small class="danger--text">{{ validateRoom(tempBooking.numberOfPeople) }}</small>
                </v-col>
                <v-col cols="12">
                  <ValidationProvider
                    v-slot="{ errors }"
                    name="備註"
                    rules="max:300"
                  >
                    <v-textarea
                      v-model="tempBooking.bookingNote"
                      class="py-2 mx-2"
                      dense
                      :error-messages="errors"
                      label="備註"
                      name="備註"
                      row-height="24"
                      rows="4"
                      value="寫點什麼⋯⋯"
                    />
                  </ValidationProvider>
                </v-col>
              </v-row>
              <div class="d-flex align-center">
                <v-checkbox
                  v-model="isReserve"
                  dense
                  label="保留房"
                  @change="handleClickSetReserve"
                />
                <v-spacer />
                <v-btn
                  class="mr-2"
                  color="primary"
                  depressed
                  @click="handleClickInsertBookingByInsertType('HAND_ARRANGE')"
                >
                  手動排房
                </v-btn>
                <v-btn
                  color="primary"
                  depressed
                  @click="handleClickInsertBookingByInsertType('AUTO_ARRANGE')"
                >
                  自動排房
                </v-btn>
              </div>
            </v-card-text>
          </form>
        </ValidationObserver>
      </v-card>
    </v-dialog>

    <!-- 新增休息訂單 `insert-rest-booking` -->
    <v-dialog
      v-model="dialogInsertRestBooking"
      max-width="290"
      @click:outside="dialog.beforeSetDialog({initAction:'temp-rest-booking'},{type:'insertRestBooking',show:false})"
    >
      <v-card>
        <ValidationObserver ref="formRestBooking">
          <form>
            <v-card-title class="headline">
              新增休息
              <v-spacer />
              <v-btn
                icon
                @click.stop="dialog.beforeSetDialog({initAction:'temp-rest-booking'},{type:'insertRestBooking',show:false})"
              >
                <v-icon>mdi-close-box</v-icon>
              </v-btn>
            </v-card-title>
            <v-card-text>
              <ValidationProvider
                v-slot="{ errors }"
                mode="lazy"
                name="房型"
                rules="required"
              >
                <v-select
                  v-model="tempRestBooking.roomTypeId"
                  class="my-2"
                  dense
                  :error-messages="errors"
                  :items="roomTypeRestItems"
                  label="請選擇房型"
                  @change="handleClickSetRoomType(tempRestBooking)"
                />
              </ValidationProvider>
              <ValidationProvider
                v-slot="{ errors }"
                mode="lazy"
                name="房號"
                rules="required"
              >
                <v-select
                  v-model="tempRestBooking.roomId"
                  class="my-2"
                  dense
                  :error-messages="errors"
                  :items="restRoomNumberItems"
                  label="請選擇房號"
                  no-data-text="請先選擇房型及時數"
                />
              </ValidationProvider>
              <v-row no-gutters>
                <v-col cols="6">
                  <ValidationProvider
                    v-slot="{ errors }"
                    mode="lazy"
                    name="時數"
                    rules="required"
                  >
                    <v-text-field
                      v-model="tempRestBooking.hours"
                      class="mr-2"
                      dense
                      :error-messages="errors"
                      hide-details
                      label="時數"
                      :max="restAvailableHour"
                      min="1"
                      type="number"
                      @input="handleSelectRestHour"
                    />
                  </ValidationProvider>
                </v-col>
                <v-col cols="6">
                  <v-subheader>總額：{{ restTotalPrice }}</v-subheader>
                </v-col>
              </v-row>
              <div class="danger--text">
                {{ roomNumberErrMsg }}
              </div>
            </v-card-text>
            <v-card-actions>
              <v-spacer />
              <v-btn
                color="primary"
                depressed
                @click="handleClickInsertRestBooking"
              >
                收款
              </v-btn>
            </v-card-actions>
          </form>
        </ValidationObserver>
      </v-card>
    </v-dialog>

    <!-- 新增訂單 -> 手機帶入多筆客戶-->
    <v-dialog
      v-model="dialogCustomerListOfInsertBooking"
      max-width="350"
      @click:outside="dialog.setDialog({type:'customerListOfInsertBooking',show:false})"
    >
      <v-card>
        <v-card-title class="d-flex justify-center">
          以下客戶均符合您所輸入的資訊
        </v-card-title>
        <v-card-text
          v-for="(item,index) in customerList"
          :key="index"
          class="py-1"
          style="border-top: 1px solid #ccc;"
        >
          <v-row
            no-gutters
            style="cursor:pointer;"
            @click="handleClickSetTempCustomer(item)"
          >
            <v-col cols="6">
              顧客姓名：{{ item.customerName }}
            </v-col>
            <v-col cols="6">
              身分證：{{ item.customerIdNumber ? item.customerIdNumber : '未提供' }}
            </v-col>
            <v-col cols="6">
              顧客性別：{{ customerGender(item.customerGender) }}
            </v-col>
            <v-col cols="6">
              護照號碼：{{ item.customerPassportNumber ? item.customerPassportNumber : '未提供' }}
            </v-col>
            <v-col cols="6">
              國籍：{{ item.customerNationality ? item.customerNationality : '未提供' }}
            </v-col>
            <v-col cols="6">
              聯絡電話：{{ item.customerPhone ? item.customerPhone : '未提供' }}
            </v-col>
          </v-row>
        </v-card-text>
        <v-card-actions
          class="d-flex justify-center"
          style="border-top:1px solid #ccc;"
        >
          <v-btn
            text
            @click="dialog.setDialog({type:'customerListOfInsertBooking',show:false})"
          >
            <v-icon>mdi-plus</v-icon>
            新增新的
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </v-container>
</template>

<style lang="scss" scoped>
// .cancel-strip {
//   min-width: 100%;
//   height:15px !important;
//   background: repeating-linear-gradient(
//   135deg,
//   rgba(0, 0, 0, 0),
//   rgba(0, 0, 0, 0) 5px,
//   #c50000 5px,
//   #c50000 10px
//   );
// }

@media print {
  .views__theOrderList {
    .print {
      display:  block!important;
    }
  }
}
</style>
