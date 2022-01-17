<script>
import { mapState } from 'vuex'
import { mixinRoomActions } from '@/mixins/roomActions.mixin'

import { mixinToday } from '@/mixins/today.mixin'
import { mixinPagination } from '@/mixins/pagination.mixin'
import { mixinInsertBooking } from '@/mixins/insertBooking.mixin'
import { mixinUnCheckIn } from '@/mixins/unCheckIn.mixin'
// import { mixinPrice } from '@/mixins/price'
import { mixinPayment } from '@/mixins/payment.mixin'
import { mixinUtils } from '@/mixins/utils.mixin'
import { createDialog } from '@/utils/helpers/createDialog'
const TDialogUnCheckIn = () => import('@/components/TDialogUnCheckIn.vue')
export default {
  components: {
    TDialogUnCheckIn
  },
  mixins: [
    mixinRoomActions,
    mixinToday,
    mixinPagination,
    mixinInsertBooking,
    mixinUnCheckIn,
    // mixinPrice,
    mixinPayment,
    mixinUtils
  ],
  data () {
    return {
      today: this.$date(),
      dialog: null
    }
  },
  computed: {
    ...mapState({
      // booking
      multiCleanType: state => state.booking.type,
      multiCleanStatus: state => state.booking.status,
      currentDay: state => state.date.currentDay,
      // insert booking
      dialogInsertOption: state => state.dialog.map.insertOption,
      dialogInsertGeneralBooking: state => state.dialog.map.insertGeneralBooking,
      dialogInsertRestBooking: state => state.dialog.map.insertRestBooking,
      dialogCustomerListOfInsertBooking: state => state.dialog.map.customerListOfInsertBooking,
      // un check in
      dialogUnCheckIns: state => state.dialog.map.unCheckIns,
      dialogUnCheckInGetRoomCard: state => state.dialog.map.unCheckInGetRoomCard,
      dialogUnCheckInConfirmCustomer: state => state.dialog.map.unCheckInConfirmCustomer,
      // price
      price: state => state.price.price,
      payment: state => state.price.payment,
      difference: state => state.price.difference,
      bookingId: state => state.price.bookingId,
      bookingNumber: state => state.price.bookingNumber
    }),
    rwd () {
      return this.$vuetify.breakpoint.name
    }
  },
  updated () {
    this.$bus.$on('set-errors-by-ref', (payload) => {
      const { ref, msg } = payload
      this.$refs[ref].errors = [msg]
    })
    this.$bus.$on('clear-errors-by-ref', (ref) => {
      if (this.$refs[ref]) {
        this.$refs[ref].errors = []
      }
    })
  },
  created () {
    this.dialog = createDialog()
  },
  mounted () {
    this.$bus.$on('change', async () => {
      await this.setUnCheckIns()
      await this.getCardsHandler()
    })
  }
}
</script>
<template>
  <div class="layout--default d-print-none page-fixed">
    <template v-if="rwd === 'xs'">
      <v-row class="px-3 py-0">
        <v-col cols="12">
          <t-date-picker
            append-icon="mdi-calendar"
            :date="currentDay"
            label="YY-MM-DD"
            :t-class="'d-flex'"
            :t-hide-details="true"
            @pick-date="getSearchDateDataHandler"
          />
        </v-col>
        <v-col
          class="pl-3 pr-1 py-1"
          cols="6"
        >
          <v-btn
            v-show="isBtnToolbar({
              action:'MULTI_CLEAN_CANCEL',status:multiCleanStatus
            })"
            block
            color="danger"
            outlined
            @click.stop="handleClickCancelMutiClean"
          >
            取消
          </v-btn>
        </v-col>
        <v-col
          class="pl-1 pr-3 py-1"
          cols="6"
        >
          <v-btn
            v-show="isBtnToolbar({
              action:'MULTI_CLEAN_START',status:multiCleanStatus
            })"
            block
            color="primary"
            depressed
            @click.stop="handleClickMultiClean"
          >
            {{
              multiCleanType === '2'
                ? '開始清潔'
                : '清潔完成'
            }}
          </v-btn>
        </v-col>
        <v-col
          v-show="isBtnToolbar({
            action:'UN_CHECKIN',
            status:multiCleanStatus
          })"
          class="pl-3 pr-1 py-1"
          cols="6"
        >
          <v-btn
            block
            outlined
            @click.stop="handleClickShowDialogUnCheckIn"
          >
            訂單入住
          </v-btn>
        </v-col>
        <v-col
          v-show="isBtnToolbar({
            action:'INSERT_OPTION',
            status:multiCleanStatus
          })"
          class="pl-1 pr-3 py-1"
          cols="6"
        >
          <v-btn
            block
            color="primary"
            depressed
            @click="handleClickShowDialogBookingOption"
          >
            新增訂單
          </v-btn>
        </v-col>
        <v-col
          class="px-3"
          cols="12"
        >
          <v-btn
            v-show="$route.name === 'TheDailySchedule' && isBtnToolbar({
              action:'MULTI_CLEAN_OPTION',status:multiCleanStatus
            })"
            block
            outlined
            @click.stop="showCleaningMultiRoomsDialog"
          >
            批量清潔
          </v-btn>
        </v-col>
      </v-row>
    </template>
    <template v-else>
      <v-toolbar flat>
        <t-date-picker
          append-icon="mdi-calendar"
          :date="currentDay"
          label="YY-MM-DD"
          :t-class="'d-flex mr-2'"
          :t-hide-details="true"
          :t-style="'max-width:200px'"
          @pick-date="getSearchDateDataHandler"
        />
        <v-btn
          class="mr-2"
          color="primary"
          depressed
          @click="pickTodayDate"
        >
          今日
        </v-btn>

        <v-spacer />

        <v-btn
          v-show="isBtnToolbar({
            action:'MULTI_CLEAN_CANCEL',status:multiCleanStatus
          })"
          class="mr-2"
          color="danger"
          outlined
          @click.stop="handleClickCancelMutiClean"
        >
          取消
        </v-btn>
        <v-btn
          v-show="isBtnToolbar({
            action:'MULTI_CLEAN_START',
            status:multiCleanStatus
          })"
          class="mr-2"
          color="primary"
          depressed
          @click.stop="handleClickMultiClean"
        >
          {{ multiCleanType === '2' ? '開始清潔' : '清潔完成' }}
        </v-btn>
        <v-btn
          v-show="$route.name === 'TheDailySchedule' && isBtnToolbar({
            action:'MULTI_CLEAN_OPTION',status:multiCleanStatus
          })"
          class="mr-2"
          outlined
          @click.stop="showCleaningMultiRoomsDialog"
        >
          批量清潔
        </v-btn>
        <v-btn
          v-show="isBtnToolbar({
            action:'UN_CHECKIN',
            status:multiCleanStatus
          })"
          class="mr-2"
          outlined
          @click.stop="handleClickShowDialogUnCheckIn"
        >
          訂單入住
        </v-btn>
        <v-btn
          v-show="isBtnToolbar({
            action:'INSERT_OPTION',
            status:multiCleanStatus
          })"
          color="primary"
          depressed
          @click="handleClickShowDialogBookingOption"
        >
          新增訂單
        </v-btn>
      </v-toolbar>
    </template>
    <div class="main">
      <slot />
    </div>
    <!-- 新增訂單選項 `insert-options` -->
    <v-dialog
      v-model="dialogInsertOption"
      max-width="290"
      @click:outside="dialog.setDialog({type:'insertOption',show:false})"
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
      @click:outside="dialog.beforeSetDialog({initAction:'temp-booking'},{type:'insertGeneralBooking',show:false})"
    >
      <v-card>
        <ValidationObserver ref="formInsertGenaralBooking">
          <form>
            <v-card-title class="headline">
              新增訂單
              <v-spacer />
              <v-btn
                icon
                @click.stop="dialog.beforeSetDialog({initAction:'temp-booking'},{type:'insertGeneralBooking',show:false})"
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

    <!-- 訂單入住 -->
    <t-dialog-un-check-in
      :t-dialog="dialogUnCheckIns"
      :t-search-un-check-in="searchUnCheckIn"
      :t-un-check-in-data="unCheckInData"
      @close-dialog="dialog.setDialog({type:'unCheckIns',show:false})"
      @confirm-particular-customer="confirmParticularCustomer"
      @search-un-check-in-data="searchUnCheckInData"
    />

    <!-- 確認旅客資訊  -->
    <v-dialog
      v-model="dialogUnCheckInConfirmCustomer"
      max-width="500"
      persistent
      @click:outside="closeUnCheckInConfirmCustomerDialog"
    >
      <template v-if="rwd === 'xs'">
        <v-card
          v-if="particularCustomer && particularCustomer[0]"
          class="rounded-xl"
        >
          <v-card-title>
            <span>確認旅客資訊：</span>
            <v-spacer />
            <v-btn
              color="secondary"
              outlined
              small
              @click="updateCustomerHandler"
            >
              編輯
            </v-btn>
          </v-card-title>
          <v-card-text class="d-flex justify-space-between py-2">
            <span>旅客資訊</span><span>{{ particularCustomer[0].customerName ? particularCustomer[0].customerName : '未提供' }}</span>
          </v-card-text>
          <v-card-text class="d-flex justify-space-between py-2">
            <span>性別</span><span>{{ customerGender(particularCustomer[0].customerGender) }}</span>
          </v-card-text>
          <v-card-text class="d-flex justify-space-between py-2">
            <span>國籍</span><span>{{ particularCustomer[0].customerNationality ? particularCustomer[0].customerNationality : '未提供' }}</span>
          </v-card-text>
          <v-card-text class="d-flex justify-space-between py-2">
            <span>身份證</span><span>{{ particularCustomer[0].customerIdNumber ? particularCustomer[0].customerIdNumber : '未提供' }}</span>
          </v-card-text>
          <v-card-text class="d-flex justify-space-between py-2">
            <span>護照號碼</span><span>{{ particularCustomer[0].customerPassportNumber ? particularCustomer[0].customerPassportNumber : '未提供' }}</span>
          </v-card-text>
          <v-card-text class="d-flex justify-space-between py-2">
            <span>聯絡電話</span><span>{{ particularCustomer[0].customerPhone ? particularCustomer[0].customerPhone : '未提供' }}</span>
          </v-card-text>
          <v-card-text class="d-flex justify-space-between py-2">
            <span>E-mail</span><span>{{ particularCustomer[0].customerEmail ? particularCustomer[0].customerEmail : '未提供' }}</span>
          </v-card-text>

          <v-card-text
            v-if="showUnCheckInRoomsStatus === 'empty'"
            class="d-flex justify-center py-2 subtitle-2"
          >
            <span>請先至房號安排進行排房</span>
          </v-card-text>

          <v-card-text
            v-if="showUnCheckInRoomsStatus === 'plural'"
            class="py-2"
          >
            <span>選擇入住房：</span>
          </v-card-text>

          <v-card-text v-if="showUnCheckInRoomsStatus === 'plural'">
            <v-row no-gutters>
              <v-col cols="4">
                <v-checkbox
                  v-model="selectedAll"
                  class="mt-0"
                  hide-details
                  label="全部"
                  :ripple="false"
                />
              </v-col>
              <v-col
                v-for="(item,index) in particularCustomer"
                :key="index"
                cols="4"
              >
                <template v-if="item.roomNumber">
                  <v-checkbox
                    class="mt-0"
                    hide-details
                    :label="item.roomNumber"
                    :ripple="false"
                    :value="item"
                    :value-comparator="() => selected[index] !== null"
                    @click="handleClickSetSelected(item)"
                  />
                </template>
              </v-col>
            </v-row>
          </v-card-text>

          <v-card-actions class="px-4 pb-4 pt-1">
            <v-spacer />
            <v-btn
              class="rounded-lg"
              color="primary"
              depressed
              :disabled="showUnCheckInRoomsStatus === 'empty'"
              small
              @click="handleClickCheckInForUnCheckIn"
            >
              下一步
            </v-btn>
          </v-card-actions>
        </v-card>
      </template>
      <template v-else>
        <v-card>
          <div class="pa-2">
            <v-card-title class="pa-1">
              確認旅客資訊：
              <v-spacer />
              <v-btn icon>
                <v-icon @click="closeUnCheckInConfirmCustomerDialog">
                  mdi-close-box
                </v-icon>
              </v-btn>
            </v-card-title>
            <v-row no-gutters>
              <v-col cols="7">
                <v-card-text class="d-flex align-center px-3 py-1">
                  <span>旅客姓名：</span>
                  <v-spacer />
                  <span v-if="dialogUnCheckInStatus !== 'update'">
                    {{
                      particularCustomer && particularCustomer.length
                        ? particularCustomer[0].customerName
                        : '未提供'
                    }}
                  </span>
                  <v-text-field
                    v-if="dialogUnCheckInStatus === 'update'"
                    v-model="tempCustomerUnCheckIn.customerName"
                    dense
                    hide-details
                    single-line
                    style="max-width:150px"
                  />
                </v-card-text>
                <v-card-text class="d-flex align-center px-3 py-1">
                  <span>性別：</span>
                  <v-spacer />
                  <span v-if="dialogUnCheckInStatus !== 'update'">
                    {{
                      particularCustomer && particularCustomer.length
                        ? customerGender(particularCustomer[0].customerGender)
                        : ''
                    }}
                  </span>
                  <v-select
                    v-if="dialogUnCheckInStatus === 'update'"
                    v-model="tempCustomerUnCheckIn.customerGender"
                    dense
                    hide-details
                    :items="customerGenderItems"
                    single-line
                    style="max-width:150px"
                  />
                </v-card-text>
                <v-card-text class="d-flex align-center px-3 py-1">
                  <span>國籍：</span>
                  <v-spacer />
                  <span
                    v-if="dialogUnCheckInStatus !== 'update'"
                  >
                    {{
                      particularCustomer && particularCustomer.length
                        ? particularCustomer[0].customerNationality
                        : ''
                    }}
                  </span>
                  <v-text-field
                    v-if="dialogUnCheckInStatus === 'update'"
                    v-model="tempCustomerUnCheckIn.customerNationality"
                    dense
                    hide-details
                    single-line
                    style="max-width:150px"
                  />
                </v-card-text>
                <v-card-text class="d-flex align-center px-3 py-1">
                  <span>身分證：</span>
                  <v-spacer />
                  <span
                    v-if="dialogUnCheckInStatus !== 'update'"
                  >
                    {{
                      (particularCustomer && particularCustomer.length)
                        ? particularCustomer[0].customerIdNumber
                        : '未提供'
                    }}
                  </span>
                  <v-text-field
                    v-if="dialogUnCheckInStatus === 'update'"
                    v-model="tempCustomerUnCheckIn.customerIdNumber"
                    dense
                    hide-details
                    single-line
                    style="max-width:150px"
                  />
                </v-card-text>
                <v-card-text class="d-flex align-center px-3 py-1">
                  <span>護照：</span>
                  <v-spacer />
                  <span
                    v-if="dialogUnCheckInStatus !== 'update'"
                  >
                    {{
                      particularCustomer && particularCustomer.length
                        ? particularCustomer[0].customerPassportNumber
                          ? particularCustomer[0].customerPassportNumber
                          : '未提供'
                        : '未提供'
                    }}
                  </span>
                  <v-text-field
                    v-if="dialogUnCheckInStatus === 'update'"
                    v-model="tempCustomerUnCheckIn.customerPassportNumber"
                    dense
                    hide-details
                    single-line
                    style="max-width:150px"
                  />
                </v-card-text>
                <v-card-text class="d-flex align-center px-3 py-1">
                  <span>聯絡電話：</span>
                  <v-spacer />
                  <span v-if="dialogUnCheckInStatus !== 'update'">
                    {{
                      (particularCustomer && particularCustomer.length)
                        ? particularCustomer[0].customerPhone
                        : '未提供'
                    }}
                  </span>
                  <v-text-field
                    v-if="dialogUnCheckInStatus === 'update'"
                    v-model="tempCustomerUnCheckIn.customerPhone"
                    dense
                    hide-details
                    single-line
                    style="max-width:150px"
                  />
                </v-card-text>
                <v-card-text class="d-flex align-center px-3 py-1">
                  <span>E-mail：</span>
                  <v-spacer />
                  <span v-if="dialogUnCheckInStatus !== 'update'">
                    {{
                      (particularCustomer && particularCustomer.length)
                        ? particularCustomer[0].customerEmail
                        : '未提供'
                    }}
                  </span>
                  <v-text-field
                    v-if="dialogUnCheckInStatus === 'update'"
                    v-model="tempCustomerUnCheckIn.customerEmail"
                    dense
                    hide-details
                    single-line
                    style="max-width:150px"
                  />
                </v-card-text>
              </v-col>
              <v-col cols="3">
                <v-card-text
                  v-if="showUnCheckInRoomsStatus === 'empty'"
                  class="d-flex align-center px-3 py-1"
                >
                  <span>
                    請先至房號安排進行排房
                  </span>
                </v-card-text>
                <v-card-text class="px-3 py-1">
                  <span
                    v-if="showUnCheckInRoomsStatus === 'plural'"
                    class="subtitle-2"
                  >
                    選擇入住房：
                  </span>
                  <v-checkbox
                    v-if="showUnCheckInRoomsStatus === 'plural'"
                    v-model="selectedAll"
                    class="mt-0"
                    hide-details
                    label="全部房型"
                    :ripple="false"
                  />
                  <template v-if="showUnCheckInRoomsStatus === 'plural'">
                    <div
                      v-for="(item,index) in particularCustomer"
                      :key="index"
                    >
                      <v-checkbox
                        class="mt-0"
                        hide-details
                        :label="item.roomNumber"
                        :ripple="false"
                        :value="item"
                        :value-comparator="() => selected[index] !== null"
                        @click="handleClickSetSelected(item,index)"
                      />
                    </div>
                  </template>
                </v-card-text>
              </v-col>
              <v-col cols="2">
                <v-card-text class="px-3 py-1">
                  <v-btn
                    block
                    outlined
                    small
                    @click="updateCustomerHandler"
                  >
                    編輯
                  </v-btn>
                </v-card-text>
              </v-col>
            </v-row>
            <v-card-actions>
              <v-spacer />
              <v-btn
                v-if="dialogUnCheckInStatus === 'update'"
                color="primary"
                outlined
                small
                @click="updateCustomer"
              >
                完成
              </v-btn>

              <v-btn
                color="primary"
                depressed
                :disabled="showUnCheckInRoomsStatus === 'empty'"
                small
                @click="handleClickCheckInForUnCheckIn"
              >
                下一步
              </v-btn>
            </v-card-actions>
          </div>
        </v-card>
      </template>
    </v-dialog>

    <!-- 房號為 -->
    <t-dialog-confirm
      :t-dialog="dialogUnCheckInGetRoomCard"
      t-icon
      :t-icon-color="'primary'"
      :t-icon-text="'mdi-credit-card-check-outline'"
      :t-timeout="3000"
      @close-dialog="dialog.setDialog({type:'unCheckInGetRoomCard',show:false})"
    />
  </div>
</template>

<style  lang="scss" scoped>
//.bounce-leave-to
@media (max-width: 600px) {
  .layout--default {
    overflow: hidden;
  }
}
@media (max-width: 600px) and (max-width: 960px) {
}
@media (min-width: 960px) and (max-width: 1264px) {
}
@media (min-width: 1264px) and (max-width: 1904px) {
}
@media (min-width: 1904px) {
}
.layout--default {
  height: 100%;
  .main {
    height: calc(100% - 128px);
  }
}
</style>
