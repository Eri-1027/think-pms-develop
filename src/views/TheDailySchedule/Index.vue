<script>
import { mapState, mapMutations } from 'vuex'
import PRICE from '../../constants/price'
import { mixinRoomActions } from '@/mixins/roomActions.mixin'
import { mixinToday } from '@/mixins/today.mixin'
import { mixinInsertBooking } from '@/mixins/insertBooking.mixin'
import { mixinPayment } from '@/mixins/payment.mixin'
// import { mixinPrice } from '@/mixins/price'
import { mixinOrderInfo } from '@/mixins/orderInfo.mixin'
import { mixinUnCheckIn } from '@/mixins/unCheckIn.mixin'
import { mixinPagination } from '@/mixins/pagination.mixin'
// import { mixinCardDetails } from '@/mixins/cardDetails'
import { mixinUtils } from '@/mixins/utils.mixin'
import { dragscroll } from 'vue-dragscroll'
// utils class
import { createDialog } from '@/utils/helpers/createDialog'
import { createPrice } from '@/utils/create/createPrice'
import { createRoom } from '@/utils/create/createRoom'
import TDialogRoomStatusDetail from '@/components/TDialogRoomStatusDetail'
const _price = createPrice()
const _room = createRoom()
export default {
  name: 'TheDailySchedule',
  directives: {
    dragscroll
  },
  components: {
    TDialogRoomStatusDetail
  },
  mixins: [
    mixinRoomActions,
    mixinToday,
    mixinInsertBooking,
    mixinPayment,
    // mixinPrice,
    mixinUnCheckIn,
    mixinPagination,
    mixinOrderInfo,
    // mixinCardDetails,
    mixinUtils
  ],
  data () {
    return {
      priceItem: {},
      cardItem: {},
      roomsNumber: [],
      specificCards: [],
      displayCards: [],
      displayCardData: [],
      restAddPrice: 0, // addRestPrice 暫存
      // 點擊滑鼠拖移螢幕
      contentX: 0,
      contentY: 0,
      contentTop: 0,
      contentLeft: 0,
      /* ------------------------------------ *\
         $CARDS
      \* ------------------------------------ */
      // fetch-data
      // cleaningIdData: [],
      /* ------------------------------------ *\
         $CHANGE_ROOM
      \* ------------------------------------ */
      cleaningStaffItems: [],
      timerOfShowCards: false,
      /* ------------------------------------ *\
         $CHANGE_ROOM
      \* ------------------------------------ */
      cleanedCardItem: {},
      cleaningCardsItem: {}
    }
  },
  computed: {
    ...mapState({
      // change-room
      tempChangeRoom: state => state.changeRoom.tempChangeRoom,
      changeRoomItem: state => state.changeRoom.changeRoomItem,
      changeRoomNumberItems: state => state.changeRoom.changeRoomNumberItems,
      showDiscountError: state => state.changeRoom.showDiscountError,
      keepPrice: state => state.changeRoom.keepPrice,
      isLoading: state => state.loading.isLoading,
      isLogin: state => state.auth.isLogin,
      // booking
      multiCleanType: state => state.booking.type,
      multiCleanStatus: state => state.booking.status,
      tempMultiClean: state => state.booking.tempMultiClean,
      multiCleanAvailable: state => state.booking.available,
      // muti-clean
      dialogMultiCleanOption: state => state.dialog.map.multiCleanOption,
      dialogChooseCheckOutRoomToClean: state => state.dialog.map.chooseCheckOutRoomToClean,
      // card detail
      dialogUnCheckIn: state => state.dialog.map.unCheckIn,
      dialogCheckIn: state => state.dialog.map.checkIn,
      dialogCheckOut: state => state.dialog.map.checkOut,
      dialogCleaned: state => state.dialog.map.cleaned,
      dialogCleaning: state => state.dialog.map.cleaning,
      dialogRest: state => state.dialog.map.rest,
      dialogReserve: state => state.dialog.map.reserve,
      // card actions
      dialogChangeRoom: state => state.dialog.map.changeRoom,
      // payment
      dialogPaymentAfterCheckOut: state =>
        state.dialog.map.paymentAfterCheckOut,
      // price
      price: state => state.price.price,
      payments: state => state.price.payment,
      difference: state => state.price.difference,
      bookingId: state => state.price.bookingId,
      bookingNumber: state => state.price.bookingNumber,
      cRPrice: state => state.changeRoom.price,
      cRPayment: state => state.changeRoom.payment,
      cRDifference: state => state.changeRoom.difference
    }),
    /**
     * 判斷樓層數，決定是否需要使整塊 section 置中
     */
    isAllRoomsCenter () {
      return (floors) => {
        if (this.rwd) {
          switch (this.rwd) {
            case 'xs':
              return false
            case 'sm':
              return floors && floors.length
                ? floors.length < 3
                : false
            case 'md':
              return floors && floors.length
                ? floors.length < 4
                : false
            case 'lg':
              return floors && floors.length
                ? floors.length < 5
                : false
            case 'xl':
              return floors && floors.length
                ? floors.length < 7
                : false
            default:
              return floors && floors.length
                ? floors.length < 8
                : false
          }
        }
      }
    },
    rwd () {
      return this.$vuetify.breakpoint.name
    }
  },
  mounted () {
    this.$bus.$on('change', async () => {
      await this.setUnCheckIns()
      await this.getCardsHandler()
    })
  },
  // 即便寫 mounted 沒屁用，因為正在渲染！所以會產生時有時沒有的情況！
  updated () {
    this.$bus.$on('init-temp-cleaning', payload => {
      this.$refs.cardCheckOut.reset()
      this.cleaningCardsItem.cleaningStaffId = ''
    })
    this.$bus.$on('init-temp-multi-clean', payload => {
      this.$refs.multiClean.reset()
      this.tempMultiClean.staffId = null
    })
    this.$bus.$on('clear-temp-changeroom', payload => {
      this.$refs.tempChangeRoom.reset()
    })
  },
  async created () {
    this['loading/SET_LOADING'](true)
    await this.setUnCheckIns()
    this.getCardsHandler()
    this.dialog = createDialog()
  },
  beforeDestroy () {
    window.clearInterval(this.timerOfShowCards)
    this.$bus.$off('init-temp-multi-clean')
    this.$bus.$off('init-temp-cleaning')
  },
  methods: {
    ...mapMutations(['loading/SET_LOADING']),
    async handleUpdateTotalPriceRest (payload) {
      const {
        bookingId,
        bookingDetailId,
        hours
      } = payload
      let item = await _room.fetchGetCardDetail({ bookingDetailId })
      item = item && item.length && item[0] !== null
        ? item = item[0]
        : item = {}
      const price = (+item.restPrice) + (+item.restPerHour) * hours
      const opts = {
        type: PRICE.PRICE_UPDATE_TOTAL,
        bookingId,
        price
      }
      await _price.getPrice(opts)
    }
  }
}
</script>
<template>
  <div class="views__theDailySchedule d-print-none">
    <v-banner
      single-line
      sticky
      style="width:100%!important;z-index:3!important;"
    >
      <v-toolbar
        class="d-flex justify-center"
        flat
      >
        <PaginationDate
          :display-days-data="displayDaysData(currentDay)"
          @get-next-days-zone="getNextDaysZone"
          @get-prev-days-zone="getPrevDaysZone"
          @get-specific-day="getSpecificDay"
        />
      </v-toolbar>
    </v-banner>

    <!-- Section -->
    <section
      v-if="rwd === 'xs'"
      class="d-print-none"
    >
      <div
        v-for="(rowItems,index) in displayCardData"
        :key="index"
        class="t-card__row t-card__row--borderTop pa-1 d-flex align-center"
      >
        <div class="d-flex">
          <div
            v-for="(item,index2) in rowItems"
            :key="index2"
            class="t-card__item d-flex align-center justify-center my-4 mx-1"
          >
            <template v-if="item.roomStatus === '5' || item.roomStatus === '7'">
              <div class="t-card--outer">
                <t-mobile-card
                  empty
                  height="70"
                  pill
                  single-line
                  width="170"
                  @action="handleClickGetCardDetail(item)"
                >
                  <template #default>
                    <div>
                      <span class="subtitle">{{ item.roomNumber }}</span>
                    </div>
                  </template>
                </t-mobile-card>
              </div>
            </template>
            <template
              v-else-if="item.roomStatus === '4' || item.roomStatus === '4-0'|| item.roomStatus === '0-4'"
            >
              <t-mobile-card
                :action="false"
                :border-top="false"
                :class="`bg__${item.roomStatus}`"
                dark
                :header="false"
                height="120"
                :item="item"
                width="248"
                @action="handleClickGetCardDetail(item)"
                @handle-over-rest-price="handleUpdateTotalPriceRest"
              >
                <template v-slot:default="slotProps">
                  <v-row no-gutters>
                    <v-col class="d-flex align-center justify-center">
                      <span class="t-text--subtitle">
                        {{ item.roomNumber }}
                      </span>
                    </v-col>
                    <v-col class="d-flex align-center justify-center">
                      <span>訂房名</span>
                    </v-col>
                    <v-col class="d-flex align-center justify-start">
                      <span>{{ displayCustomerName(item) }}</span>
                    </v-col>
                  </v-row>
                  <v-row no-gutters>
                    <v-col class="d-flex align-center justify-center">
                      <div
                        class="t-text__box t-text--border d-flex align-center justify-center"
                        style="width:44px;"
                      >
                        <span
                          :class="item.roomStatus.length > 2 ? 't-text--subtitle' : 't-text--title'"
                        >{{ roomStatus(item.roomStatus) }}</span>
                      </div>
                    </v-col>
                    <v-col class="d-flex flex-column">
                      <span class="caption">訂房時間</span>
                      <span class="caption">房間狀況</span>
                    </v-col>
                    <v-col class="d-flex flex-column align-start">
                      <span
                        class="caption"
                      >{{ $date(item.expectedCheckInTime).format('MM/DD') }}-{{ $date(item.expectedCheckOutTime).format('MM/DD') }}</span>
                      <span class="caption">{{ roomStatusForDetail(item.roomStatus) }}</span>
                    </v-col>
                  </v-row>
                  <v-row no-gutters>
                    <v-col class="d-flex align-center justify-space-between px-4">
                      <v-icon
                        class="d-flex align-center"
                        color="#fff"
                        small
                      >
                        mdi-alarm-check
                      </v-icon>
                      <span class="caption">剩餘時間</span>
                      <span
                        class="caption"
                        :class="slotProps.displayCounterClass"
                        style="max-width:30%;"
                      >{{ slotProps.restCounter }}</span>
                      <span class="caption">更多資訊 ></span>
                    </v-col>
                  </v-row>
                </template>
              </t-mobile-card>
            </template>
            <template v-else>
              <t-mobile-card
                :action="false"
                :border-top="false"
                :class="`bg__${item.roomStatus}`"
                dark
                :header="false"
                height="120"
                :item="item"
                width="248"
                @action="handleClickGetCardDetail(item)"
              >
                <template #default>
                  <v-row no-gutters>
                    <v-col class="d-flex align-center justify-center">
                      <span class="t-text--subtitle">
                        {{ item.roomNumber }}
                      </span>
                    </v-col>
                    <v-col class="d-flex align-center justify-center">
                      <span>訂房名</span>
                    </v-col>
                    <v-col class="d-flex align-center justify-start">
                      <span>{{ displayCustomerName(item) }}</span>
                    </v-col>
                  </v-row>
                  <v-row no-gutters>
                    <v-col class="d-flex align-center justify-center">
                      <div
                        class="t-text__box t-text--border d-flex align-center justify-center"
                        style="width:44px;"
                      >
                        <span
                          class="t-text--title"
                          :class="item.roomStatus.length > 2
                            ? 't-text--subtitle'
                            : 't-text--title'"
                        >{{ roomStatus(item.roomStatus) }}</span>
                      </div>
                    </v-col>
                    <v-col class="d-flex flex-column">
                      <span class="caption">訂房時間</span>
                      <span class="caption">房間狀況</span>
                    </v-col>
                    <v-col class="d-flex flex-column align-start">
                      <span
                        class="caption"
                      >{{ $date(item.expectedCheckInTime).format('MM/DD') }}-{{ $date(item.expectedCheckOutTime).format('MM/DD') }}</span>
                      <span class="caption">{{ roomStatusForDetail(item.roomStatus) }}</span>
                    </v-col>
                  </v-row>
                  <v-row no-gutters>
                    <v-col
                      class="d-flex align-center justify-space-between px-4"
                      cols="12"
                    >
                      <span class="subtitle-2">{{ item.bookingNumber }}</span>
                      <span class="caption">更多資訊 ></span>
                    </v-col>
                  </v-row>
                </template>
              </t-mobile-card>
            </template>
          </div>
        </div>
      </div>
    </section>
    <section
      v-else
      v-dragscroll.pass
      class="main d-print-none"
    >
      <div
        class="d-flex flex-nowrap"
        :class="isAllRoomsCenter(displayCardData)
          ? 'justify-center'
          : ''"
        data-no-dragscroll
      >
        <!-- 樓層 -->
        <div
          v-for="(rowItems,index) in displayCardData"
          :key="index"
          class="ma-2"
        >
          <div
            v-for="(item,index2) in rowItems"
            :key="index2"
            class="t-card__row d-flex align-center justify-center"
          >
            <!-- 房間 -->
            <template v-if="item.roomStatus === '5' || item.roomStatus === '7'">
              <t-mobile-card
                :key="item.roomStatus"
                class="card--fade"
                empty
                height="70"
                pill
                single-line
                width="170"
                @action="handleClickGetCardDetail(item)"
              >
                <template #default>
                  <div>
                    <span class="subtitle">{{ item.roomNumber }}</span>
                  </div>
                </template>
              </t-mobile-card>
            </template>
            <template
              v-else-if="item.roomStatus === '4' || item.roomStatus === '4-0'|| item.roomStatus === '0-4'"
            >
              <t-mobile-card
                :key="item.roomStatus"
                :action="false"
                :border-top="false"
                class="card--fade"
                :class="`bg__${item.roomStatus}`"
                dark
                :header="false"
                height="120"
                :item="item"
                width="248"
                @action="handleClickGetCardDetail(item)"
                @handle-over-rest-price="handleUpdateTotalPriceRest"
              >
                <template v-slot:default="slotProps">
                  <v-row no-gutters>
                    <v-col class="d-flex align-center justify-center">
                      <span class="t-text--subtitle2">
                        {{ item.roomNumber }}
                      </span>
                    </v-col>
                    <v-col class="d-flex align-center justify-center">
                      <span>訂房名</span>
                    </v-col>
                    <v-col class="d-flex align-center justify-start">
                      <span>{{ displayCustomerName(item) }}</span>
                    </v-col>
                  </v-row>
                  <v-row no-gutters>
                    <v-col class="d-flex align-center justify-center">
                      <div
                        class="t-text__box t-text--border d-flex align-center justify-center"
                        style="width:44px;"
                      >
                        <span
                          :class="item.roomStatus.length > 2 ? 't-text--subtitle' :'t-text--title'"
                        >{{ roomStatus(item.roomStatus) }}</span>
                      </div>
                    </v-col>
                    <v-col class="d-flex flex-column">
                      <span class="caption">訂房時間</span>
                      <span class="caption">房間狀況</span>
                    </v-col>
                    <v-col class="d-flex flex-column align-start">
                      <span
                        class="caption"
                      >{{ $date(item.expectedCheckInTime).format('MM/DD') }}-{{ $date(item.expectedCheckOutTime).format('MM/DD') }}</span>
                      <span class="caption">{{ roomStatusForDetail(item.roomStatus) }}</span>
                    </v-col>
                  </v-row>
                  <v-row no-gutters>
                    <v-col class="d-flex align-center justify-space-between px-4">
                      <v-icon
                        class="d-flex align-center"
                        color="#fff"
                        small
                      >
                        mdi-alarm-check
                      </v-icon>
                      <span class="caption">剩餘時間</span>
                      <span
                        class="caption"
                        :class="slotProps.displayCounterClass"
                        style="max-width:30%;"
                      >{{ slotProps.restCounter }}</span>
                      <span class="caption">更多資訊 ></span>
                    </v-col>
                  </v-row>
                </template>
              </t-mobile-card>
            </template>
            <template v-else>
              <t-mobile-card
                :key="item.roomStatus"
                :action="false"
                :border-top="false"
                class="card--fade"
                :class="`bg__${item.roomStatus}`"
                dark
                :header="false"
                height="120"
                :item="item"
                width="248"
                @action="handleClickGetCardDetail(item)"
                @set-multi-clean-item="handleClickSetMultiCleanItem"
              >
                <template #default>
                  <v-row no-gutters>
                    <v-col class="d-flex align-center justify-center">
                      <span class="t-text--subtitle2">
                        {{ item.roomNumber }}
                      </span>
                    </v-col>
                    <v-col class="d-flex align-center justify-center">
                      <span>訂房名</span>
                    </v-col>
                    <v-col class="d-flex align-center justify-start">
                      <span>{{ displayCustomerName(item) }}</span>
                    </v-col>
                  </v-row>
                  <v-row no-gutters>
                    <v-col class="d-flex align-center justify-center">
                      <div
                        class="t-text__box t-text--border d-flex align-center justify-center"
                        style="width:44px;"
                      >
                        <span
                          class="t-text--title"
                          :class="item.roomStatus.length > 2 ? 't-text--subtitle' : 't-text--title'"
                        >{{ roomStatus(item.roomStatus) }}</span>
                      </div>
                    </v-col>
                    <v-col class="d-flex flex-column">
                      <span class="caption">訂房時間</span>
                      <span class="caption">房間狀況</span>
                    </v-col>
                    <v-col class="d-flex flex-column align-start">
                      <span
                        class="caption"
                      >{{ $date(item.expectedCheckInTime).format('MM/DD') }}-{{ $date(item.expectedCheckOutTime).format('MM/DD') }}</span>
                      <span class="caption">{{ roomStatusForDetail(item.roomStatus) }}</span>
                    </v-col>
                  </v-row>
                  <v-row no-gutters>
                    <v-col class="d-flex align-center justify-space-between px-4">
                      <span class="subtitle-2">{{ item.bookingNumber }}</span>
                      <span class="caption">更多資訊 ></span>
                    </v-col>
                  </v-row>
                </template>
              </t-mobile-card>
            </template>
          </div>
        </div>
      </div>
    </section>

    <!-- 點選`空` -->
    <v-dialog
      v-model="dialogCleaned"
      max-width="290"
      @click:outside="handleClickCloseCardDetail('cleaned')"
    >
      <v-card>
        <v-card-title>房型資訊：</v-card-title>
        <v-card-text>
          <v-row no-gutters>
            <v-col
              class="text-no-wrap"
              cols="2"
            >
              名稱：
            </v-col>
            <v-col
              class="text-left"
              cols="10"
              style="max-width:200px"
            >
              {{ cleanedCardItem.roomTypeName }}
            </v-col>
          </v-row>
          <v-row no-gutters>
            <v-col
              class="text-no-wrap"
              cols="2"
            >
              加床：
            </v-col>
            <v-col
              class="text-left"
              style="max-width:200px"
            >
              {{ cleanedCardItem.roomAddable ? '有' : '無' }}
            </v-col>
          </v-row>
          <v-row no-gutters>
            <v-col
              class="text-no-wrap"
              cols="2"
            >
              介紹：
            </v-col>
            <v-col
              class="text-left"
              style="max-width:200px"
            >
              {{ cleanedCardItem.roomDescription }}
            </v-col>
          </v-row>
          <div class="d-flex mt-3">
            <v-spacer />
            <v-btn
              color="success"
              depressed
              small
              @click="dialog.setDialog({type:'cleaned',show:false})"
            >
              確定
            </v-btn>
          </div>
        </v-card-text>
      </v-card>
    </v-dialog>

    <!-- 點選`訂` -->
    <t-dialog-room-status-detail
      :t-dialog="dialogUnCheckIn"
      :t-payment-item="priceItem"
      :t-room-card-item="cardItem"
      @check-in="handleClickCheckIn"
      @close-dialog="handleClickCloseCardDetail('unCheckIn')"
      @dialog="emitDialog"
      @dialog-change-room-handler="handleClickShowDialogChangeRoom"
    />

    <!-- 點選`住` -->
    <t-dialog-room-status-detail
      :t-dialog="dialogCheckIn"
      :t-payment-item="priceItem"
      :t-room-card-item="cardItem"
      @cancel-check-in="handleCancelCheckIn"
      @check-out="handleClickCheckOut"
      @close-dialog="handleClickCloseCardDetail('checkIn')"
      @dialog="emitDialog"
      @dialog-change-room-handler="handleClickShowDialogChangeRoom"
    />

    <!-- 點選`休` -->
    <t-dialog-room-status-detail
      :t-dialog="dialogRest"
      :t-payment-item="priceItem"
      :t-room-card-item="cardItem"
      @check-out="handleClickCheckOut"
      @close-dialog="handleClickCloseCardDetail('rest')"
      @dialog="emitDialog"
      @dialog-change-room-handler="handleClickShowDialogChangeRoom"
    />

    <!-- 點選`保` -->
    <t-dialog-room-status-detail
      :t-dialog="dialogReserve"
      :t-payment-item="priceItem"
      :t-room-card-item="cardItem"
      @cancel-booking="handleClickCancelBooking"
      @close-dialog="handleClickCloseCardDetail('reserve')"
      @dialog="emitDialog"
      @dialog-change-room-handler="handleClickShowDialogChangeRoom"
    />

    <!-- 點選`待` -->
    <v-dialog
      v-model="dialogCheckOut"
      max-width="290"
      @click:outside="dialog.beforeSetDialog({initAction:'temp-cleaning'},{type:'checkOut',show:false})"
    >
      <v-card>
        <validation-observer ref="cardCheckOut">
          <form>
            <v-card-title>下一筆訂單資訊</v-card-title>
            <v-card-text>
              <v-row no-gutters>
                <v-col cols="12">
                  <v-card-text class="d-flex px-0 py-2">
                    <div>宿期：</div>
                    <div>{{ cleaningCardsItem.nextBookingSection }}</div>
                  </v-card-text>
                  <v-card-text class="d-flex px-0 py-2">
                    <div>訂單備註：</div>
                    <div>{{ cleaningCardsItem.bookingNote }}</div>
                  </v-card-text>
                  <ValidationProvider
                    v-slot="{ errors }"
                    name="清潔人員"
                    rules="required"
                  >
                    <v-select
                      v-model="cleaningCardsItem.cleaningStaffId"
                      class="my-2"
                      dense
                      :error-messages="errors"
                      :items="cleaningStaffItems"
                      label="選擇清潔人員"
                      required
                    />
                  </ValidationProvider>
                </v-col>
              </v-row>

              <div class="d-flex justify-space-between mt-5 pt-2">
                <v-spacer />
                <v-btn
                  class="mr-2"
                  color="warning"
                  dark
                  depressed
                  small
                  @click="dialog.beforeSetDialog({initAction:'temp-cleaning'},{type:'checkOut',show:false})"
                >
                  取消
                </v-btn>
                <v-btn
                  color="success"
                  depressed
                  small
                  @click="handleClickCleaning(cleaningCardsItem)"
                >
                  清潔
                </v-btn>
              </div>
            </v-card-text>
          </form>
        </validation-observer>
      </v-card>
    </v-dialog>

    <!-- 點選`清` -->
    <v-dialog
      v-model="dialogCleaning"
      max-width="290"
      @click:outside="dialog.setDialog({
        type:'cleaning',
        show:false
      })"
    >
      <v-card>
        <v-card-title>下一筆訂單資訊</v-card-title>
        <v-card-text>
          <v-row no-gutters>
            <v-col cols="12">
              <v-card-text class="d-flex px-0 py-2">
                <div>宿期：</div>
                <div>{{ cleaningCardsItem.nextBookingSection }}</div>
              </v-card-text>
            </v-col>
            <v-col cols="12">
              <v-card-text class="d-flex px-0 py-2">
                <div>訂單備註：</div>
                <div>{{ cleaningCardsItem.bookingNote }}</div>
              </v-card-text>
            </v-col>
          </v-row>
          <div class="d-flex justify-space-between mt-5 pt-2">
            <v-spacer />
            <v-btn
              class="mr-2"
              color="warning"
              dark
              depressed
              small
              @click="dialog.setDialog({
                type:'cleaning',
                show:false
              })"
            >
              取消
            </v-btn>
            <v-btn
              color="success"
              depressed
              small
              @click="handleClickCleaned(cleaningCardsItem)"
            >
              清潔完成
            </v-btn>
          </div>
        </v-card-text>
      </v-card>
    </v-dialog>

    <!-- 點選`換房` -->
    <v-dialog
      v-model="dialogChangeRoom"
      :max-width="changeRoomItem.roomStatus === '4' ? '700' : '600'"
      persistent
    >
      <template v-if="rwd === 'xs'">
        <validation-observer ref="tempChangeRoom">
          <v-card class="rounded-lg">
            <ValidationObserver ref="formChangeRoom">
              <form>
                <v-card-title>
                  換房作業：
                  <v-spacer />
                  <v-btn
                    icon
                    @click="dialog.setDialog({
                      type:'changeRoom',
                      show: false
                    })"
                  >
                    <v-icon>mdi-close-box</v-icon>
                  </v-btn>
                </v-card-title>
                <v-card-text class="d-flex align-center justify-space-between px-4 py-1">
                  <span>入住時間</span>
                  <span>{{ $date(changeRoomItem.expectedCheckInTime).format('MM/DD') }} - {{ $date(changeRoomItem.expectedCheckOutTime).format('MM/DD') }}</span>
                </v-card-text>
                <v-card-text class="d-flex align-center justify-space-between px-4 py-1">
                  <span>入住人數</span>
                  <span>{{ changeRoomItem.numberOfPeople }}</span>
                </v-card-text>
                <v-card-text class="d-flex align-center justify-space-between px-4 py-1">
                  <span>原房型 / 號：</span>
                  <span>{{ changeRoomItem.roomTypeName }} / {{ changeRoomItem.roomNumber }}</span>
                </v-card-text>
                <v-card-text class="d-flex align-center justify-space-between px-4 py-1">
                  <span>新房型 / 號：</span>
                  <ValidationProvider
                    v-slot="{ errors }"
                    name="房型"
                    rules="required"
                  >
                    <v-select
                      v-model="tempChangeRoom.newRoomTypeId"
                      class="py-0 px-1"
                      dense
                      :error-messages="errors"
                      :items="roomTypeRestItems"
                      label="選擇房型"
                      outline
                      style="max-width:100px;"
                      @input="getNumberAndDiscoutByRoomType"
                    />
                  </ValidationProvider>
                  <ValidationProvider
                    v-slot="{ errors }"
                    name="房號"
                    rules="required"
                  >
                    <v-select
                      v-model="tempChangeRoom.newRoomNumberId"
                      class="py-0 px-1"
                      dense
                      :error-messages="errors"
                      :items="changeRoomNumberItems"
                      label="選擇房號"
                      no-data-text="請先選擇房型"
                      outline
                      style="max-width:100px;"
                      @input="clearDisccountError"
                    />
                  </ValidationProvider>
                </v-card-text>
                <v-card-text class="d-flex justify-space-between px-4 py-1">
                  <span>保留原始房價</span>
                  <ValidationProvider
                    v-slot="{ errors }"
                    name="保留原始房價"
                    rules="required"
                  >
                    <v-radio-group
                      class="mt-0 pt-0"
                      dense
                      :error-messages="errors"
                      hide-details
                      row
                      :value="keepPrice"
                    >
                      <v-radio
                        label="是"
                        value="1"
                        @click="setkeepPrice('1')"
                      />
                      <v-radio
                        label="否"
                        value="0"
                        @click="setkeepPrice('0')"
                      />
                    </v-radio-group>
                  </ValidationProvider>
                </v-card-text>
                <v-card-text class="d-flex align-center justify-space-between px-4 py-1">
                  <span>應收 {{ cRPrice }}</span>
                  <span>已收 {{ cRPayment }}</span>
                  <span>待收 {{ cRDifference }}</span>
                </v-card-text>
                <v-card-actions class="px-4 pb-3">
                  <v-spacer />
                  <v-btn
                    class="mr-2"
                    color="warning"
                    dark
                    depressed
                    small
                    @click="dialog.setDialog({
                      type:'changeRoom',
                      show:false
                    })"
                  >
                    取消
                  </v-btn>

                  <v-btn
                    color="success"
                    depressed
                    small
                    @click="handleClickChangeRoom"
                  >
                    確定
                  </v-btn>
                </v-card-actions>
              </form>
            </ValidationObserver>
          </v-card>
        </validation-observer>
      </template>
      <template v-else>
        <validation-observer ref="tempChangeRoom">
          <v-card>
            <ValidationObserver ref="formChangeRoom">
              <form>
                <v-card-title>
                  換房作業
                  <v-spacer />
                  <v-btn
                    icon
                    @click="dialog.afterSetDialog({type:'changeRoom',show:false},{afterAction:'clear-temp-changeroom'})"
                  >
                    <v-icon v-text="'mdi-close-box'" />
                  </v-btn>
                </v-card-title>
                <v-card-text>
                  <v-row no-gutters>
                    <v-col cols="4">
                      <v-card-text class="d-flex px-0 py-1">
                        <div>訂房日期：</div>
                        <div
                          v-if="changeRoomItem.roomStatus === '4'"
                        >
                          {{ $date(changeRoomItem.bookingDate).format('YYYY/MM/DD HH:mm:ss') }}
                        </div>
                        <div v-else>
                          {{ $date(changeRoomItem.bookingDate).format('YYYY/MM/DD') }}
                        </div>
                      </v-card-text>
                    </v-col>
                    <v-col cols="8">
                      <v-card-text class="d-flex px-0 py-1">
                        <div>原房型/房間：</div>
                        <div>{{ changeRoomItem.roomTypeName }}</div>
                      </v-card-text>
                    </v-col>
                  </v-row>
                  <v-row
                    class="d-flex align-center"
                    no-gutters
                  >
                    <v-col cols="4">
                      <v-card-text class="d-flex px-0 py-1">
                        <div>入住日期：</div>
                        <div
                          v-if="changeRoomItem.roomStatus === '4'"
                        >
                          {{ $date(changeRoomItem.expectedCheckInTime).format('YYYY/MM/DD HH:mm:ss') }}
                        </div>
                        <div
                          v-else
                        >
                          {{ $date(changeRoomItem.expectedCheckInTime).format('YYYY/MM/DD') }}
                        </div>
                      </v-card-text>
                    </v-col>
                    <v-col cols="8">
                      <v-row
                        class="d-flex align-center"
                        no-gutters
                      >
                        <v-col cols="3">
                          <v-card-text class="d-flex px-0 py-1">
                            更換為
                          </v-card-text>
                        </v-col>
                        <v-col cols="9">
                          <v-card-text class="d-flex px-0 py-1">
                            <ValidationProvider
                              v-slot="{ errors }"
                              name="房型"
                              rules="required"
                            >
                              <v-select
                                v-model="tempChangeRoom.newRoomTypeId"
                                class="py-0 px-2"
                                dense
                                :error-messages="errors"
                                :items="roomTypeRestItems"
                                label="選擇房型"
                                outline
                                style="max-width:150px;"
                                @input="getNumberAndDiscoutByRoomType"
                              />
                            </ValidationProvider>
                            <ValidationProvider
                              v-slot="{ errors }"
                              name="房號"
                              rules="required"
                            >
                              <v-select
                                v-model="tempChangeRoom.newRoomNumberId"
                                class="py-0 px-2"
                                dense
                                :error-messages="errors"
                                :items="changeRoomNumberItems"
                                label="選擇房號"
                                no-data-text="請先選擇房型"
                                outline
                                style="max-width:150px;"
                                @input="clearDisccountError"
                              />
                            </ValidationProvider>
                          </v-card-text>
                        </v-col>
                      </v-row>
                    </v-col>
                  </v-row>
                  <v-row no-gutters>
                    <v-col cols="4">
                      <v-card-text class="d-flex px-0 py-1">
                        <div>退房日期：</div>
                        <div
                          v-if="changeRoomItem.roomStatus === '4'"
                        >
                          {{ $date(changeRoomItem.expectedCheckOutTime).format('YYYY/MM/DD HH:mm:ss') }}
                        </div>
                        <div
                          v-else
                        >
                          {{ $date(changeRoomItem.expectedCheckOutTime).format('YYYY/MM/DD') }}
                        </div>
                      </v-card-text>
                    </v-col>
                    <v-col cols="8">
                      <v-row
                        class="d-flex align-center"
                        no-gutters
                      >
                        <v-col cols="3">
                          <v-card-text class="d-flex px-0 py-1">
                            <div>入住人數：</div>
                            <div>{{ changeRoomItem.roomAccommodate }}</div>
                          </v-card-text>
                        </v-col>
                        <v-col cols="9">
                          <v-card-text class="d-flex align-center px-0 py-1">
                            <div class="mx-2">
                              保留原始房價
                            </div>
                            <ValidationProvider
                              v-slot="{ errors }"
                              name="保留原始房價"
                              rules="required"
                            >
                              <v-radio-group
                                class="mt-0 pt-0"
                                dense
                                :error-messages="errors"
                                hide-details
                                row
                                :value="keepPrice"
                              >
                                <v-radio
                                  label="是"
                                  value="1"
                                  @click="setkeepPrice('1')"
                                />
                                <v-radio
                                  label="否"
                                  value="0"
                                  @click="setkeepPrice('0')"
                                />
                              </v-radio-group>
                            </ValidationProvider>
                          </v-card-text>
                        </v-col>
                      </v-row>
                    </v-col>
                  </v-row>
                  <v-row no-gutters>
                    <v-col cols="4">
                      <v-card-text class="d-flex px-0 py-1">
                        <div>應收：</div>
                        <div
                          v-math:round="cRPrice"
                          v-price="cRPrice"
                        />
                      </v-card-text>
                    </v-col>
                    <v-col cols="4">
                      <v-card-text class="d-flex px-0 py-1">
                        <div>已收：</div>
                        <div
                          v-math:round="cRPayment"
                          v-price="cRPayment"
                        />
                      </v-card-text>
                    </v-col>
                    <v-col cols="4">
                      <v-card-text class="d-flex px-0 py-1">
                        <div>待收：</div>
                        <div
                          v-math:round="cRDifference"
                          v-price="cRDifference"
                        />
                      </v-card-text>
                    </v-col>
                  </v-row>
                  <v-row no-gutters>
                    <div
                      v-show="showDiscountError"
                      class="danger--text"
                    >
                      請先選擇房型及房號！
                    </div>
                  </v-row>
                  <div class="d-flex justify-space-between mt-5 pt-2">
                    <v-spacer />
                    <v-btn
                      class="mr-2"
                      color="warning"
                      dark
                      depressed
                      small
                      @click="dialog.setDialog({type:'changeRoom',show:false})"
                    >
                      取消
                    </v-btn>
                    <v-btn
                      color="success"
                      depressed
                      small
                      @click="handleClickChangeRoom"
                    >
                      確定
                    </v-btn>
                  </div>
                </v-card-text>
              </form>
            </ValidationObserver>
          </v-card>
        </validation-observer>
      </template>
    </v-dialog>

    <!-- 新增批量清潔 `insert-muti-clean` -->
    <v-dialog
      v-model="dialogMultiCleanOption"
      max-width="290"
      @click:outside="dialog.setDialog({
        type:'multiCleanOption',
        show:false
      })"
    >
      <v-card>
        <v-card-title class="d-flex justify-center">
          <v-img
            max-height="40"
            max-width="40"
            src="~@/assets/img/multiclean.jpg"
          />
        </v-card-title>
        <v-card-text class="d-flex justify-center">
          <p class="title">
            選擇清潔狀態
          </p>
        </v-card-text>
        <v-card-actions class="d-flex justify-center">
          <v-btn
            color="warning"
            depressed

            small
            @click="handleClickShowDialogChooseCheckOutRoom"
          >
            待清潔
          </v-btn>
          <v-btn
            color="blue"
            dark
            depressed

            small
            @click="handleClickSetStatusMultiClean({
              type:'3',
              status:'CHOOSE_ROOM'
            })"
          >
            清潔中
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <!-- 批量清潔：選擇房間（狀態2）-->
    <v-dialog
      v-model="dialogChooseCheckOutRoomToClean"
      max-width="200"
      @click:outside="dialog.beforeSetDialog(
        {initAction:'temp-multi-clean'},
        {type:'chooseCheckOutRoomToClean',show:false}
      )"
    >
      <v-card>
        <validation-observer ref="multiClean">
          <form>
            <v-card-text>
              <ValidationProvider
                v-slot="{ errors }"
                name="清潔人員"
                rules="required"
              >
                <v-select
                  v-model="tempMultiClean.staffId"
                  class="my-2"
                  dense
                  :error-messages="errors"
                  :items="cleaningStaffItems"
                  label="選擇清潔人員"
                  required
                  @input="setStaffMultiClean({staffId:$event})"
                />
              </ValidationProvider>
            </v-card-text>
            <v-card-actions class="d-flex justify-center">
              <v-btn
                color="success"
                depressed
                small
                @click="handleClickSetStatusMultiClean({
                  type:'2',
                  status:'CHOOSE_ROOM'
                })"
              >
                選擇房間
              </v-btn>
            </v-card-actions>
          </form>
        </validation-observer>
      </v-card>
    </v-dialog>
  </div>
</template>

<style lang="scss">
@import 'src/assets/scss/components/_cardRoomStatus.scss';
.views__theDailySchedule{
  height:100%;
  @media (max-width: 600px){
    .t-card__row{
      overflow-x:auto;
      overflow-y:hidden;
      width:100%;
      //height: $card-xs-height * 1.25;
      cursor:pointer;
      background-color:transparent !important;
      //background: lightpink;
    }
    .t-card__row--borderTop{
      border-top:1px solid lightgray;
    }
  }
  @media (min-width: 600px){
    .t-card__row{
      width:260px;
      height:122px;
      margin-top:10px;
      padding:5px;
      cursor:pointer;
      background-color:transparent !important;
    }
  }
  @media (max-width: 600px) and (max-width: 960px){
  }
  @media (min-width: 960px) and (max-width: 1264px){
  }
  @media (min-width: 1264px) and (max-width: 1904px){
  }
  @media (min-width: 1904px){
  }
  .main{
    overflow:hidden;
    height:auto;
  }
}
.displayCounter{
  display:flex;
  align-items:center;
  justify-content:center;
  width:90%;
  height:20px;
  border-radius:5px;
  background:rgba(255, 255, 255, .26);
}
.displayCounter--over{
  display:flex;
  align-items:center;
  justify-content:center;
  width:90%;
  height:20px;
  animation:fade 2000ms infinite;
  opacity:.26;
  border-radius:5px;
  background:rgba(185, 28, 28, 1);
}
@keyframes fade{
  from{
    opacity:1.0;
  }
  50%{
    opacity:0;
  }
  to{
    opacity:1.0;
  }
}
.fade-out-enter-active,
.fade-out-leave-active{
  transition:opacity 1s;
}
.fade-out-enter,
.fade-out-leave-to /* .fade-leave-active below version 2.1.8 */{
  opacity:0;
}
.card--fade{
  animation:cardFade;
}
@keyframes cardFade{
  0%{
    opacity:0;
  }
  100%{
    opacity:1;
  }
}
</style>
