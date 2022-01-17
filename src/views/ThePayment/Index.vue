<script>
import { mapState } from 'vuex'
import { mixinOrderInfo } from '@/mixins/orderInfo.mixin'
import { mixinPayment } from '@/mixins/payment.mixin'
import { createDialog } from '@/utils/helpers/createDialog'
import eventService from '../../utils/eventService'
const TTablePayment = () => import('@/components/TTablePayment.vue')

export default {
  components: {
    TTablePayment
  },
  mixins: [mixinOrderInfo, mixinPayment],
  data () {
    return {
      // local data
      cardsData: [
        {
          text: '現金',
          amount: ''
        },
        {
          text: '信用卡',
          amount: ''
        },
        {
          text: '轉帳',
          amount: ''
        },
        {
          text: '其他',
          amount: ''
        }
      ],
      // fetch data
      displayLastDutyShiftDate: '',
      cashTotal: 0,
      creditCardTotal: '',
      dutyShift: [],
      otherTotal: '',
      transferTotal: '' || [], //
      staffItems: [],
      dutyStaffItems: [],
      dutyShiftDetail: [],
      particularReportDetail: {},
      // temp data
      search: '',
      tempDutyId: '',
      tempDutyIdForDutyShift: '',
      // dialog
      dilaog: null,
      // date
      dateStartDay: '',
      dateEndDay: '',
      // table
      dutyShiftDetailsHeaders: [
        {
          text: '交班時間',
          align: 'left',
          sortable: false,
          value: 'dutyTime',
          class: ['primary', 'white--text']
        },
        {
          text: '交班人員',
          align: 'left',
          sortable: false,
          value: 'staffName',
          class: ['primary', 'white--text']
        },
        {
          text: '交班總金額',
          align: 'right',
          sortable: false,
          value: 'amountTotal',
          class: ['primary', 'white--text']
        },
        {
          text: '現金總額',
          align: 'right',
          sortable: false,
          value: 'cashAmount',
          class: ['primary', 'white--text']
        },
        {
          text: '信用卡總額',
          align: 'right',
          sortable: false,
          value: 'creditCardAmount',
          class: ['primary', 'white--text']
        },
        {
          text: '轉帳總額',
          align: 'right',
          sortable: false,
          value: 'transferAmount',
          class: ['primary', 'white--text']
        },
        {
          text: '其他總額',
          align: 'right',
          sortable: false,
          value: 'otherAmount',
          class: ['lightGrey', 'white--text']
        },
        {
          text: '',
          align: 'right',
          sortable: false,
          value: 'action',
          class: ['lightGrey', 'white--text']
        }
      ]
    }
  },
  computed: {
    ...mapState({
      staffId: state => state.user.staff.staffId,
      staffLevel: state => state.user.staff.staffLevel,
      dutyId: state => state.user.dutyId,
      dialogSelectDutyStaff: state => state.dialog.map.selectDutyStaff,
      dialogDutyShiftDetail: state => state.dialog.map.dutyShiftDetail,
      dialogParticularReportDetail: state => state.dialog.map.particularReportDetail
    }),
    legalStaffLevel () {
      return this.staffLevel === '0' || this.staffLevel === '1' || this.staffLevel === '2'
    },
    filterDutyShift () {
      if (this.tempDutyId === '') {
        return this.dutyShift
      }
      if (this.dutyShift) {
        return this.dutyShift.filter(el => el.staffId === this.tempDutyId)
      }
      return this.dutyShift
    },
    rwd () {
      return this.$vuetify.breakpoint.name
    }
  },
  updated () {
    this.$bus.$on('init-temp-duty-id', () => {
      this.tempDutyIdForDutyShift = ''
      this.$refs.formDutyShift.reset()
    })
  },
  created () {
    this.showDutyShift()
    this.getStaff()
    this.getDutyStaffItems()
    this.showDutyShiftDetail()
    this.dialog = createDialog()
  },
  methods: {
    async pickStartDate (date) {
      this.dateStartDay = date
      this.searchHandler()
    },
    async pickEndDate (date) {
      this.dateEndDay = date
      this.searchHandler()
    },
    async showDutyShift () {
      try {
        const res = await eventService.showDutyShift()
        const getTotal = (data, type) => {
          if (Array.isArray(data)) {
            return data[0].paymentAmount
          } else {
            return data
          }
        }
        this.cashTotal = getTotal(res.data.fetch.cashTotal, 'cashTotal')
        this.creditCardTotal = getTotal(res.data.fetch.creditCardTotal, 'creditCardTotal')
        this.dutyShift = res.data.fetch.dutyShift
        this.otherTotal = getTotal(res.data.fetch.otherTotal, 'otherTotal')
        this.transferTotal = getTotal(res.data.fetch.transferTotal, 'transferTotal') // notice this is an array with paymentAmouut
      } catch (err) {
        console.log(err)
      }
    },
    // 用在交班明細，的詳細資訊 => 等 nini 給我 staffName dutyTotalAmount
    async showDutyShiftDetail () {
      try {
        const res = await eventService.showDutyShiftDetail()
        if (!res.data.success) {
          this.displayLastDutyShiftDate = '沒有交班資訊'
          this.dialog.setDialog({
            autoClose: true,
            msg: '沒有交班資訊，請先交班',
            type: 'failed'
          })
          return
        }
        this.dutyShiftDetail = res.data.fetch.dutyShiftDetail.sort((a, b) => {
          return this.$date(b.dutyOnWork).unix() - this.$date(a.dutyOnWork).unix()
        })
        this.displayLastDutyShiftDate = this.dutyShiftDetail[this.dutyShiftDetail.length - 1].dutyOnWork
        return { success: true }
      } catch (err) {
        console.log(err)
      }
    },
    async showDutyShiftDetailDialog () {
      const res = await this.showDutyShiftDetail()
      if (res && res.success) {
        this.dialog.setDialog({
          type: 'dutyShiftDetail',
          show: true
        })
      }
    },
    // 登出同時把 dutyId staffId 拿掉
    async insertDutyShift () {
      try {
        const valid = await this.$refs.formDutyShift.validate()
        if (!valid) return
        const data = {
          dutyId: this.dutyId,
          staffId: this.tempDutyIdForDutyShift
        }
        const res = await eventService.dutyShift(data)
        if (res.data.success) {
          this.$store.commit('user/UPDATE_DUTY_ID', res.data.fetch.dutyId)
          await this.dialog.setDialog({
            type: 'selectDutyStaff',
            show: false
          })
          await this.dialog.setDialog({
            autoClose: true,
            msg: '交班成功',
            type: 'success'
          })
        }
      } catch (err) {
        console.log(err)
      }
    },
    // get 收款人員
    async getStaff () {
      try {
        const res = await eventService.showAllStaff()
        this.staffItems = res.data.fetch.staffs.map(el => {
          return {
            text: el.staffName,
            value: el.staffId
          }
        })
        this.staffItems.splice(0, 0, {
          text: '全部',
          value: null
        })
      } catch (err) {
        console.log(err)
      }
    },
    async getDutyStaffItems () {
      const res = await eventService.showAllStaff()
      this.dutyStaffItems = res.data.fetch.staffs.map(el => {
        return {
          text: el.staffName,
          value: el.staffId
        }
      })
    },
    // 搜尋相關
    searchHandler () {
      if (!this.dateStartDay && !this.dateEndDay) {
        if (this.search === '') {
          this.showDutyShiftDetail()
        }

        if (this.search) {
          this.showSearchDutyShiftDetail()
        }
      }

      if ((this.dateStartDay || this.dateEndDay) && this.search) {
        this.showSearchBothDutyShiftDetail()
      }

      if (this.dateStartDay || this.dateEndDay) {
        this.showSearchDateDutyShiftDetail()
      }
    },
    async showSearchDutyShiftDetail () {
      const data = {
        search: this.search
      }
      const res = await eventService.showSearchDutyShiftDetail(data)
      this.dutyShiftDetail = res.data.fetch.dutyShiftDetail
    },
    async showSearchDateDutyShiftDetail () {
      const data = {
        fromDate: this.dateStartDay,
        endDate: this.dateEndDay
      }
      const res = await eventService.showSearchDateDutyShiftDetail(data)
      this.dutyShiftDetail = res.data.fetch.dutyShiftDetail
    },
    async showSearchBothDutyShiftDetail () {
      const data = {
        search: this.search,
        fromDate: this.dateStartDay,
        endDate: this.dateEndDay
      }
      const res = await eventService.showSearchBothDutyShiftDetail(data)
      this.dutyShiftDetail = res.data.fetch.dutyShiftDetail
    },
    resetSearch () {
      this.search = ''
      this.dateStartDay = ''
      this.dateEndDay = ''
      this.showDutyShiftDetail()
    },
    // 詳細資訊
    async showParticularReport (item) {
      const data = {
        staffId: item.staffId,
        dutyOnWork: item.dutyOnWork,
        dutyOffWork: item.dutyOffWork

      }
      const res = await eventService.showParticularReport(data)

      this.particularReportDetail = res.data.fetch.dutyShiftDetail
      await this.dialog.setDialog({ type: 'particularReportDetail', show: true })
    }
  }
}
</script>

<template>
  <div class="views__thePayment d-print-none page-fixed">
    <div>
      <template v-if="rwd === 'xs'">
        <v-select
          v-model="tempDutyId"
          class="mr-2 rounded-lg"
          dense
          full-width
          hide-details
          :items="staffItems"
          label="收款人員"
          outlined
          single-line
        />
        <div class="pa-2">
          <div class="t-xs-box t-box--borderBottom d-flex justify-space-between align-center">
            <div>
              <span class="secondary--text title">現金：</span>
            </div>
            <div
              v-math:round="cashTotal"
              v-price="cashTotal"
              class="secondary--text title"
            />
          </div>
          <div class="t-xs-box t-box--borderBottom d-flex justify-space-between align-center">
            <div>
              <span class="tGray--text title">信用卡：</span>
            </div>
            <div
              v-math:round="creditCardTotal"
              v-price="creditCardTotal"
              class="tGray--text title"
            />
          </div>
          <div class="t-xs-box t-box--borderBottom d-flex justify-space-between align-center">
            <div>
              <span class="tGray--text title">轉帳：</span>
            </div>
            <div
              v-math:round="transferTotal"
              v-price="transferTotal"
              class="tGray--text title"
            />
          </div>
          <div class="t-xs-box t-box--borderBottom d-flex justify-space-between align-center">
            <div>
              <span class="tGray--text title">其它：</span>
            </div>
            <div
              v-math:round="otherTotal"
              v-price="otherTotal"
              class="tGray--text title"
            />
          </div>
        </div>
        <v-btn
          block
          class="my-4"
          color="success"
          dark
          depressed
          large
          rounded
          @click="showDutyShiftDetailDialog"
        >
          <div>
            交班明細
          </div>
        </v-btn>
        <div>
          <div
            v-for="(item,index) in filterDutyShift"
            :key="index"
            class="mb-4"
          >
            <t-mobile-card
              :action="false"
              @action="emitDialog({type:'ORDER_ORDER_INFO',bookingId:item.bookingId})"
            >
              <template #header>
                <span class="white--text">{{ item.bookingNumber }}</span>
                <span class="white--text">{{ paymentMethods(item.paymentMethod) }} ></span>
              </template>
              <template #default>
                <v-row no-gutters>
                  <v-col class="d-flex align-center justify-center">
                    <span
                      v-if="item.paymentAmount"
                      v-math:round="item.paymentAmount"
                      v-price="item.paymentAmount"
                      class="title"
                    />
                    <span v-else>－－</span>
                  </v-col>
                  <v-col class="d-flex flex-column">
                    <span>收款人</span>
                    <span>收款類型</span>
                    <span>入住時間</span>
                    <span>房號</span>
                  </v-col>
                  <v-col class="d-flex flex-column">
                    <span>{{ item.staffName }}</span>
                    <span>{{ paymentMethods(item.paymentMethod) }}</span>
                    <span>{{ $date(item.expectedCheckInTime).format('MM-DD') }}-{{ $date(item.expectedCheckOutTime).format('MM-DD') }}</span>
                    <span>{{ item.roomNumber ? item.roomNumber : '未入住' }}</span>
                  </v-col>
                </v-row>
              </template>
            </t-mobile-card>
          </div>
        </div>

        <!-- duty shift button -->

        <div class="title my-2">
          上次交班日期：{{ displayLastDutyShiftDate }}
        </div>

        <v-btn
          block
          color="warning"
          dark
          depressed
          large
          rounded
          @click="dialog.setDialog({type:'selectDutyStaff',show:true})"
        >
          交班
        </v-btn>
      </template>
      <template v-else>
        <v-toolbar flat>
          <v-select
            v-model="tempDutyId"
            class="mr-2"
            dense
            hide-details
            :items="staffItems"
            label="收款人員"
            outlined
            single-line
            style="max-width:200px"
          />
          <v-spacer />
          <v-toolbar-title>上次交班日期：{{ displayLastDutyShiftDate }}</v-toolbar-title>
        </v-toolbar>

        <v-row class="d-flex justify-center align-center my-4">
          <div class="ma-4">
            <v-btn
              color="success"
              depressed
              rounded
              style="width:300px;min-height:60px"
              x-large
            >
              <div>
                現金：
              </div>
              <div
                v-math:round="cashTotal"
                v-price="cashTotal"
              />
            </v-btn>
          </div>
          <div class="ma-4">
            <v-btn
              color="success"
              depressed
              rounded
              style="width:300px;min-height:60px"
              x-large
            >
              <div>
                信用卡：
              </div>
              <div
                v-math:round="creditCardTotal"
                v-price="creditCardTotal"
              />
            </v-btn>
          </div>
          <div class="ma-4">
            <v-btn
              color="success"
              depressed
              rounded
              style="width:300px;min-height:60px"
              x-large
            >
              <div>
                轉帳：
              </div>
              <div
                v-math:round="transferTotal"
                v-price="transferTotal"
              />
            </v-btn>
          </div>
          <div class="ma-4">
            <v-btn
              color="success"
              depressed
              rounded
              style="width:300px;min-height:60px"
              x-large
            >
              <div>
                其他：
              </div>
              <div
                v-math:round="otherTotal"
                v-price="otherTotal"
              />
            </v-btn>
          </div>
          <div
            v-if="legalStaffLevel"
            class="ma-4"
          >
            <v-btn
              color="warning"
              dark
              depressed
              rounded
              style="width:300px;min-height:60px"
              x-large
              @click="showDutyShiftDetailDialog"
            >
              <div>
                交班明細
              </div>
            </v-btn>
          </div>
        </v-row>

        <t-table-payment
          :t-items="filterDutyShift"
          @dialog="emitDialog"
        />
        <!-- duty shift button -->
        <v-footer
          app
          class="justify-center pl-0 py-4"
          color="#fff"
          inset
        >
          <v-btn
            color="warning"
            dark
            depressed
            style="min-height:50px;min-width:300px;"
            @click="dialog.setDialog({type:'selectDutyStaff',show:true})"
          >
            交班
          </v-btn>
        </v-footer>
      </template>
    </div>

    <v-dialog
      v-model="dialogDutyShiftDetail"
      max-width="1000"
      @click:outside="dialog.setDialog({type:'dutyShiftDetail',show:false})"
    >
      <v-card>
        <v-card-title>
          <v-toolbar
            class="d-print-none"
            flat
          >
            <v-text-field
              v-model="search"
              append-icon="mdi-magnify"
              class="mr-2"
              dense
              hide-details
              label="關鍵字搜尋"
              outlined
              single-line
              style="max-width:200px"
              @input="searchHandler"
            />

            <!-- start -->
            <t-date-picker
              append-icon="mdi-calendar"
              :date="dateStartDay"
              label="開始日期"
              :t-class="'mr-2'"
              :t-hide-details="true"
              :t-style="'max-width:200px;'"
              @pick-date="pickStartDate"
            />

            <!-- end -->
            <t-date-picker
              append-icon="mdi-calendar"
              :date="dateEndDay"
              label="結束日期"
              :min="$date(dateStartDay).add(1,'day').format('YYYY-MM-DD')"
              :t-class="'mr-2'"
              :t-hide-details="true"
              :t-style="'max-width:200px;'"
              @pick-date="pickEndDate"
            />
            <v-spacer />
            <v-btn
              color="success"
              depressed
              @click="resetSearch"
            >
              重設
            </v-btn>
          </v-toolbar>
        </v-card-title>
        <v-card-text>
          <v-card
            v-show="!dutyShiftDetail.length"
            outlined
            style="height:500px"
          >
            <div
              class="d-flex align-center justify-center"
              style="height:100%;"
            >
              <h1 class="lightGrey--text">
                查無資料
              </h1>
            </div>
          </v-card>

          <template v-if="rwd === 'xs'">
            <div
              v-for="(item,index) in dutyShiftDetail"
              :key="index"
              class="my-3"
            >
              <v-card outlined>
                <v-card-text class="d-flex justify-space-between py-1">
                  <span>交班時間</span>
                  <span> {{ item.dutyOnWork }} - {{ item.dutyOffWork }}</span>
                </v-card-text>
                <v-card-text class="d-flex justify-space-between py-1">
                  <span>交班人員</span>
                  <span> {{ item.staffName }}</span>
                </v-card-text>
                <v-card-text class="d-flex justify-space-between py-1">
                  <span>交班總金額</span>
                  <span
                    v-if="item.amountTotal"
                    v-math:round="item.amountTotal"
                    v-price="item.amountTotal"
                  />
                  <span v-else>－－</span>
                </v-card-text>
                <v-card-text class="d-flex justify-space-between py-1">
                  <span>現金總額</span>
                  <span
                    v-if="item.cashAmount"
                    v-math:round="item.cashAmount"
                    v-price="item.cashAmount"
                  />
                  <span v-else>－－</span>
                </v-card-text>
                <v-card-text class="d-flex justify-space-between py-1">
                  <span>信用卡總額</span>
                  <span
                    v-if="item.creditCardAmount"
                    v-math:round="item.creditCardAmount"
                    v-price="item.creditCardAmount"
                  />
                  <span v-else>－－</span>
                </v-card-text>
                <v-card-text class="d-flex justify-space-between py-1">
                  <span>轉帳總額</span>
                  <span
                    v-if="item.transferAmount"
                    v-math:round="item.transferAmount"
                    v-price="item.transferAmount"
                  />
                  <span v-else>－－</span>
                </v-card-text>
                <v-card-text class="d-flex justify-space-between py-1">
                  <span>其它總額</span>
                  <span
                    v-if="item.otherAmount"
                    v-math:round="item.otherAmount"
                    v-price="item.otherAmount"
                  />
                  <span v-else>－－</span>
                </v-card-text>
                <v-card-actions>
                  <v-spacer />
                  <v-btn
                    color="success"
                    depressed
                    small
                    @click="showParticularReport(item)"
                  >
                    詳細資訊
                  </v-btn>
                </v-card-actions>
              </v-card>
            </div>
          </template>
          <template v-else>
            <v-data-table
              v-show="dutyShiftDetail.length"
              class="border--default"
              :footer-props="{
                itemsPerPageText:'每頁顯示',
                itemsPerPageAllText:'全部',
                firstIcon:'mdi-chevron-double-left',
                lastIcon:'mdi-chevron-double-right',
                prevIcon:'mdi-chevron-left',
                nextIcon:'mdi-chevron-right'
              }"
              :headers="dutyShiftDetailsHeaders"
              :items="dutyShiftDetail"
            >
              <template v-slot:[`item.dutyTime`]="{item}">
                {{ item.dutyOnWork }} - {{ item.dutyOffWork }}
              </template>
              <template v-slot:[`item.paymentType`]="{item}">
                {{ getPaymentType(item.paymentType) }}
              </template>
              <template v-slot:[`item.paymentMethod`]="{item}">
                {{ getPaymentMethods(item.paymentMethod) }}
              </template>
              <template v-slot:[`item.cashAmount`]="{item}">
                <span v-show="item.cashAmount === ''">－－</span>
                <span
                  v-show="item.cashAmount || item.cashAmount === '0'"
                  v-math:round="item.cashAmount"
                  v-price="item.cashAmount"
                />
              </template>
              <template v-slot:[`item.creditCardAmount`]="{item}">
                <span v-if="item.creditCardAmount === '' || item.creditCardAmount === '0' || item.creditCardAmount === 0">－－</span>
                <span
                  v-else
                  v-math:round="item.creditCardAmount"
                  v-price="item.creditCardAmount"
                />
              </template>
              <template v-slot:[`item.transferAmount`]="{item}">
                <span v-if="item.transferAmount === '' || item.transferAmount === '0' || item.transferAmount === 0">－－</span>
                <span
                  v-else
                  v-math:round="item.transferAmount"
                  v-price="item.transferAmount"
                />
              </template>
              <template v-slot:[`item.otherAmount`]="{item}">
                <span v-if="item.otherAmount === '' || item.otherAmount === '0' || item.otherAmount === 0">－－</span>
                <span
                  v-else
                  v-math:round="item.otherAmount"
                  v-price="item.otherAmount"
                />
              </template>
              <template v-slot:[`item.action`]="{item}">
                <v-btn
                  color="success"
                  depressed
                  small
                  @click="showParticularReport(item)"
                >
                  詳細資訊
                </v-btn>
              </template>
            </v-data-table>
          </template>
        </v-card-text>
      </v-card>
    </v-dialog>

    <!-- 點選詳細資訊 -->
    <v-dialog
      v-model="dialogParticularReportDetail"
      :max-width="particularReportDetail.length ? 800 : 400"
      @click:outside="dialog.setDialog({type:'particularReportDetail',show:false})"
    >
      <v-card>
        <v-card-title>
          詳細資訊
          <v-spacer />
          <v-btn
            icon
            @click="dialog.setDialog({type:'particularReportDetail',show:false})"
          >
            <v-icon>mdi-close-box</v-icon>
          </v-btn>
        </v-card-title>
        <v-card-text>
          <template v-if="rwd==='xs'">
            <div
              v-for="(item,index) in particularReportDetail"
              :key="index"
              class="my-3"
            >
              <v-card outlined>
                <v-card-text class="d-flex justify-space-between py-1">
                  <span>訂單編號</span>
                  <v-btn
                    color="success"
                    small
                    text
                  >
                    {{ item.bookingNumber }}
                  </v-btn>
                </v-card-text>
                <v-card-text class="d-flex justify-space-between py-1">
                  <span>房號</span><span>{{ item.roomNumber }}</span>
                </v-card-text>
                <v-card-text class="d-flex justify-space-between py-1">
                  <span>收款人員</span><span>{{ item.staffName ? item.staffName : '－－' }}</span>
                </v-card-text>
                <v-card-text class="d-flex justify-space-between py-1">
                  <span>收款金額</span>
                  <span
                    v-if="item.paymentAmount"
                    v-math:round="item.paymentAmount"
                    v-price="item.paymentAmount"
                  />
                  <span v-else>－－</span>
                </v-card-text>
                <v-card-text class="d-flex justify-space-between py-1">
                  <span>收款時間</span><span>{{ item.paymentDatetime }}</span>
                </v-card-text>
                <v-card-text class="d-flex justify-space-between py-1">
                  <span>備註</span><span>{{ item.bookingNote ? item.bookingNote : '無' }}</span>
                </v-card-text>
              </v-card>
            </div>
          </template>
          <template v-else>
            <t-table-payment
              :t-items="particularReportDetail"
              @dialog="emitDialog"
            />
          </template>
        </v-card-text>
      </v-card>
    </v-dialog>

    <!-- 選擇交班人員 -->
    <v-dialog
      v-model="dialogSelectDutyStaff"
      max-width="290"
      @click:outside="dialog.beforeSetDialog({initAction:'temp-duty-id'},{type:'selectDutyStaff',show:false})"
    >
      <v-card>
        <ValidationObserver ref="formDutyShift">
          <form>
            <v-card-title>選擇交班人員</v-card-title>
            <v-card-text style="min-height:100px;">
              <ValidationProvider
                v-slot="{ errors }"
                name="交班人員"
                rules="required"
              >
                <v-select
                  v-model="tempDutyIdForDutyShift"
                  dense
                  :error-messages="errors"
                  :items="dutyStaffItems"
                  label="交班人員"
                  required
                />
              </ValidationProvider>
            </v-card-text>
            <v-card-actions>
              <v-spacer />
              <v-btn
                color="warning"
                dark
                depressed
                @click.stop="dialog.setDialog({type:'selectDutyStaff',show:false})"
              >
                取消
              </v-btn>
              <v-btn
                color="success"
                depressed
                @click.stop="insertDutyShift"
              >
                確定
              </v-btn>
            </v-card-actions>
          </form>
        </ValidationObserver>
      </v-card>
    </v-dialog>
  </div>
</template>

<style lang="scss" scoped>
@import 'src/assets/scss/utils/_variables.scss';
.t-box {
  height: $box-sm-height;
}

.t-box--borderBottom {
  border-bottom: 1px solid #c3c3c3;
}

@media screen ,all {
  .views__thePayment {
    //overflow-x: auto;
    height: 100%;
    padding: 1rem;
    .print {
      display: none !important;
    }
  }
}

@media print {
  .views__thePayment {
    .print {
      display: block !important;
    }
  }
}

</style>
