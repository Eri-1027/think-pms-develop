<script>
import {
  mapState,
  mapMutations
} from 'vuex'
import { mixinOrderInfo } from '@/mixins/orderInfo.mixin'
import { mixinPayment } from '@/mixins/payment.mixin'
import { mixinUtils } from '@/mixins/utils.mixin'
import { createDailyReport } from '@/utils/create/createDailyReport'
const TDatePicker = () => import('@/components/TDatePicker.vue')
const TTableDailyReport = () => import('@/components/TTableDailyReport.vue')
const TDivider = () => import('@/components/TDivider.vue')
const TPrintDailyReport = () => import('@/components/TPrintDailyReport')
const _dailyReport = createDailyReport()
export default {
  components: {
    TDatePicker,
    TTableDailyReport,
    TDivider,
    TPrintDailyReport
  },
  mixins: [
    mixinOrderInfo,
    mixinPayment,
    mixinUtils
  ],
  data () {
    return {
      // fetch data
      dailyReportData: [],
      priceAndType: [],
      dailyPriceAndType: {},
      dailyPriceData: {
        payments: '',
        price: '',
        difference: ''
      },
      priceAndTypeItems: [],
      // menu
      menuPriceAndType: false,
      // date
      dateStartDay: '',
      dateEndDay: '',
      dateSearchDay: '',
      // daily-report
      perPage: 5,
      currentPage: 1,
      totalPages: 0,
      // select
      daysItems: [
        { text: '顯示全部', value: 0 },
        { text: '每頁顯示 5 天', value: 5 },
        { text: '每頁顯示 10 天', value: 10 },
        { text: '每頁顯示 15 天', value: 15 }
      ],
      isShowPerPage: true
    }
  },
  computed: {
    ...mapState({
      showPrintDailyReport: state => state.print.dailyReport
    }),
    rwd () {
      return this.$vuetify.breakpoint.name
    }
  },
  created () {
    this.initGetDailyReport()
  },
  methods: {
    ...mapMutations([
      'print/SET_PRINT_SHOW'
    ]),
    /* --------------------- *\
      $DATE AND PAGE HANDLER
    \* --------------------- */
    handleClickResetSearch () {
      this.perPage = 5
      this.currentPage = 1
      this.dateStartDay = ''
      this.dateEndDay = ''
      this.dateSearchDay = ''
      this.isShowPerPage = true
      this.initGetDailyReport()
    },
    handleClickPrintDailyReport () {
      this['print/SET_PRINT_SHOW']({
        name: 'DAILY_REPORT',
        show: true
      })
      window.setTimeout(() => {
        this.$nextTick(() => {
          window.print()
        })
      })
    },
    /* --------------------- *\
      $SET OPTIONS
    \* --------------------- */
    handleChangeSetPerPage () {
      this.getDailyReportDataHandler()
    },
    handleClickPickSearchDay (date) {
      this.isShowPerPage = false
      this.perPage = 0
      this.dateStartDay = this.dateEndDay = ''
      this.dateSearchDay = date
      this.getDailyReportDataHandler()
    },
    handleClickPickStartDate (date) {
      this.dateStartDay = date
      this.dateEndDay = ''
      this.dateSearchDay = ''
      this.getDailyReportDataHandler()
    },
    handleClickPickEndDate (date) {
      this.dateEndDay = date
      this.dateSearchDay = ''
      const isOverFiveDays = () => {
        const start = this.$date(this.dateEndDay)
        const diff = start.diff(this.dateStartDay, 'day')
        return diff > 5 || diff === 5
      }
      if (!isOverFiveDays()) {
        this.isShowPerPage = false
        this.perPage = 0
        this.getDailyReportDataHandler()
      } else {
        this.isShowPerPage = true
        this.getDailyReportDataHandler()
      }
    },
    handleClickSetPage (page) {
      this.currentPage = page
      this.getDailyReportDataHandler()
    },
    getPrev () {
      if (this.currentPage === 1) {
        return
      }
      if (this.currentPage > 1) {
        this.currentPage--
        this.getDailyReportDataHandler()
      }
    },
    getNext () {
      if (this.currentPage === this.totalPages.length) {
        return
      }
      if (this.currentPage < this.totalPages.length) {
        this.currentPage++
        this.getDailyReportDataHandler()
      }
    },
    async getDailyReportDataHandler () {
      const isAllFilterOptionsEmpty =
        this.dateSearchDay === '' &&
        this.dateStartDay === '' &&
        this.dateEndDay === ''
      let result = []
      if (this.dateSearchDay) {
        result = await _dailyReport.getDailyReportByAction('date', {
          date: this.dateSearchDay,
          days: this.perPage,
          page: this.currentPage
        })
      }
      if (this.dateStartDay || this.dateEndDay) {
        if (this.perPage === 0) {
          result = await _dailyReport.getDailyReportByAction('both-date-all', {
            fromDate: this.dateStartDay,
            endDate: this.dateEndDay
          })
        } else {
          result = await _dailyReport.getDailyReportByAction('both-date', {
            fromDate: this.dateStartDay,
            endDate: this.dateEndDay,
            days: this.perPage,
            page: this.currentPage
          })
        }
      }
      if (isAllFilterOptionsEmpty) {
        result = await _dailyReport.getDailyReportByAction('page-created', {
          days: this.perPage,
          page: this.currentPage
        })
      }
      this.dailyReportData = result
    },
    async initGetDailyReport () {
      try {
        let dailyReport = await _dailyReport.fetchGetDailyReport({
          days: this.perPage,
          page: this.currentPage
        })

        await this.setDailyReportOthers(dailyReport)
        dailyReport = await _dailyReport.getDailyReportByAction('page-created', {
          days: this.perPage,
          page: this.currentPage
        })
        this.dailyReportData = dailyReport
      } catch (err) {
        console.log(err)
      }
    },
    setDailyReportOthers  (data) {
      this.totalPages = data.pages
      this.dailyPriceData.payments = data.dailyPayment
      this.dailyPriceData.price = data.dailyPrice
      this.dailyPriceData.difference = data.dailyDifference
      this.dailyPriceAndType.cashAmount = data.dailyPaymentPriceAndType[0]
      this.dailyPriceAndType.creditAmount = data.dailyPaymentPriceAndType[1]
      this.dailyPriceAndType.transAmount = data.dailyPaymentPriceAndType[2]
      this.dailyPriceAndType.othersAmount = data.dailyPaymentPriceAndType[3]
    }
  }
}
</script>
<template>
  <div class="views__theDailyReport page-fixed">
    <t-print-daily-report
      :daily-report-data="dailyReportData"
      :t-daily-price-and-type="dailyPriceAndType"
      :t-daily-price-data="dailyPriceData"
    />
    <div class="d-print-none">
      <v-row
        v-if="rwd === 'xs'"
        no-gutters
      >
        <v-col cols="12">
          <v-select
            v-if="isShowPerPage"
            v-model="perPage"
            dense
            full-width
            hide-details
            :items="daysItems"
            label="每頁顯示"
            outlined
            single-line
            @change="handleChangeSetPerPage"
          />
        </v-col>
        <v-col cols="6">
          <t-date-picker
            append-icon="mdi-calendar"
            :date="dateStartDay"
            label="起始日"
            :t-class="'my-2 mr-1'"
            :t-hide-details="true"
            @pick-date="handleClickPickStartDate"
          />
        </v-col>
        <v-col cols="6">
          <t-date-picker
            append-icon="mdi-calendar"
            :date="dateEndDay"
            label="結束日"
            :t-class="'my-2 ml-1'"
            :t-hide-details="true"
            @pick-date="handleClickPickEndDate"
          />
        </v-col>
      </v-row>
      <v-toolbar
        v-else
        class="d-print-none"
        flat
      >
        <t-date-picker
          append-icon="mdi-calendar"
          :date="dateSearchDay"
          label="YYYY-MM-DD"
          :t-class="'mr-2'"
          :t-hide-details="true"
          :t-style="'max-width:200px;'"
          @pick-date="handleClickPickSearchDay"
        />

        <t-date-picker
          append-icon="mdi-calendar"
          :date="dateStartDay"
          label="起始日"
          :t-class="'mr-2'"
          :t-hide-details="true"
          :t-style="'max-width:200px;'"
          @pick-date="handleClickPickStartDate"
        />

        <t-date-picker
          append-icon="mdi-calendar"
          :date="dateEndDay"
          label="結束日"
          :t-class="'mr-2'"
          :t-hide-details="true"
          :t-style="'max-width:200px;'"
          @pick-date="handleClickPickEndDate"
        />
        <v-select
          v-if="isShowPerPage"
          v-model="perPage"
          class="mr-2"
          dense
          hide-details
          :items="daysItems"
          label="每頁顯示"
          outlined
          single-line
          style="max-width:200px"
          @change="handleChangeSetPerPage"
        />
        <v-spacer />
        <v-btn
          class="mr-2"
          color="primary"
          depressed
          @click="handleClickResetSearch"
        >
          重設
        </v-btn>
        <v-btn
          icon
          outlined
          @click="handleClickPrintDailyReport"
        >
          <v-icon>mdi-printer</v-icon>
        </v-btn>
      </v-toolbar>
      <template v-if="rwd === 'xs'">
        <v-row no-gutters>
          <v-col
            class="pa-2"
            cols="6"
          >
            <v-menu
              v-model="menuPriceAndType"
              open-on-hover
            >
              <template v-slot:activator="{ on, attrs }">
                <v-btn
                  v-bind="attrs"
                  block
                  color="success"
                  dark
                  depressed
                  rounded
                  style="height:50px;"
                  v-on="on"
                >
                  <div>
                    <div>收款</div>
                    <div>
                      <span
                        v-math:round="dailyPriceData.payments"
                        v-price="dailyPriceData.payments"
                        v-text="`${dailyPriceData.payments ? dailyPriceData.payments : 0}`"
                      />
                      <v-icon>mdi-chevron-down</v-icon>
                    </div>
                  </div>
                </v-btn>
              </template>
              <v-list>
                <v-list-item>
                  <v-list-item-content class="d-flex">
                    <div class="d-flex">
                      <div>現金：</div>
                      <div
                        v-math:round="dailyPriceAndType.cashAmount"
                        v-price="dailyPriceAndType.cashAmount"
                        v-text="dailyPriceAndType.cashAmount"
                      />
                    </div>
                  </v-list-item-content>
                </v-list-item>
                <v-list-item>
                  <v-list-item-content>
                    <div class="d-flex">
                      <div>信用卡：</div>
                      <div
                        v-math:round="dailyPriceAndType.creditAmount"
                        v-price="dailyPriceAndType.creditAmount"
                        v-text="dailyPriceAndType.creditAmount"
                      />
                    </div>
                  </v-list-item-content>
                </v-list-item>
                <v-list-item>
                  <v-list-item-content>
                    <div class="d-flex">
                      <div>轉帳：</div>
                      <div
                        v-math:round="dailyPriceAndType.transAmount"
                        v-price="dailyPriceAndType.transAmount"
                        v-text="dailyPriceAndType.transAmount"
                      />
                    </div>
                  </v-list-item-content>
                </v-list-item>
                <v-list-item>
                  <v-list-item-content>
                    <div class="d-flex">
                      <div>其他：</div>
                      <div
                        v-math:round="dailyPriceAndType.othersAmount"
                        v-price="dailyPriceAndType.othersAmount"
                        v-text="dailyPriceAndType.othersAmount"
                      />
                    </div>
                  </v-list-item-content>
                </v-list-item>
              </v-list>
            </v-menu>
          </v-col>
          <v-col
            class="pa-2"
            cols="6"
          >
            <v-btn
              block
              color="primary"
              depressed
              rounded
              style="height:50px"
            >
              <div>
                <div>應收</div>
                <div
                  v-math:round="dailyPriceData.price"
                  v-price="dailyPriceData.price"
                  v-text="`${dailyPriceData.price ? dailyPriceData.price : 0}`"
                />
              </div>
            </v-btn>
          </v-col>
          <v-col
            class="pa-2"
            cols="12"
          >
            <v-btn
              block
              color="warning"
              dark
              depressed
              rounded
              style="height:50px"
            >
              <div>待收 </div>
              <div
                v-math:round="dailyPriceData.difference"
                v-price="dailyPriceData.difference"
                v-text="`${dailyPriceData.difference ? dailyPriceData.difference: 0}`"
              />
            </v-btn>
          </v-col>
        </v-row>
        <div
          v-for="(rowItem,index) in dailyReportData"
          :key="index"
          class="my-3"
        >
          <TDivider>
            <span>{{ rowItem[0].paymentDate }}</span>
          </TDivider>
          <div
            v-for="(item,index2) in rowItem"
            :key="index2"
            class="mb-4"
          >
            <t-mobile-card
              :action="false"
              @action="emitDialog({
                type:'ORDER_ORDER_INFO',
                bookingId:item.bookingId
              })"
            >
              <template #header>
                <span class="white--text">{{ item.bookingNumber }}</span>
                <span class="white--text">{{ paymentMethods(item.paymentMethod) }} ></span>
              </template>
              <template #default>
                <v-row no-gutters>
                  <v-col class="d-flex align-center justify-center">
                    <span class="title">
                      {{
                        item.roomNumber
                          ? item.roomNumber
                          : '未排房'
                      }}</span>
                  </v-col>
                  <v-col class="d-flex flex-column">
                    <span>收款人</span>
                    <span>收款類型</span>
                    <span>入住時間</span>
                  </v-col>
                  <v-col class="d-flex flex-column">
                    <span>
                      {{
                        item.staffName
                          ? item.staffName
                          : '未提供'
                      }}</span>
                    <span>{{ paymentType(item.paymentType) }}</span>
                    <span>{{ $date(item.expectedCheckInTime).format('MM/DD') }}-{{ $date(item.expectedCheckOutTime).format('MM/DD') }}</span>
                  </v-col>
                </v-row>
                <v-row no-gutters>
                  <v-col>
                    <span>已收</span>
                    <span>
                      {{
                        item.paymentAmount
                          ? item.paymentAmount
                          : 0
                      }}</span>
                  </v-col>
                  <v-col>
                    <span>應收</span>
                    <span>{{ item.totalPrice }}</span>
                  </v-col>
                  <v-col>
                    <span>待收</span>
                    <span>{{ item.different }}</span>
                  </v-col>
                </v-row>
              </template>
            </t-mobile-card>
          </div>
        </div>
        <v-footer
          class="justify-center pl-0 py-4"
          color="#fff"
          inset
        >
          <v-pagination
            v-model="currentPage"
            circle
            :length="totalPages"
            :total-visible="7"
            @input="handleClickSetPage($event)"
          />
        </v-footer>
      </template>
      <template v-else>
        <div class="d-flex align-center justify-center">
          <div class="ma-4">
            <v-menu
              v-model="menuPriceAndType"
              open-on-hover
            >
              <template v-slot:activator="{ on, attrs }">
                <v-btn
                  v-bind="attrs"
                  color="success"
                  dark
                  depressed
                  rounded
                  style="width:300px;min-height:60px"
                  x-large
                  v-on="on"
                >
                  <div>收款：</div>
                  <div
                    v-math:round="dailyPriceData.payments"
                    v-price="dailyPriceData.payments"
                    v-text="`${dailyPriceData.payments ? dailyPriceData.payments : 0}`"
                  />

                  <v-icon>mdi-chevron-down</v-icon>
                </v-btn>
              </template>
              <v-list>
                <v-list-item>
                  <v-list-item-content class="d-flex">
                    <div class="d-flex">
                      <div>現金：</div>
                      <div
                        v-math:round="dailyPriceAndType.cashAmount"
                        v-price="dailyPriceAndType.cashAmount"
                        v-text="dailyPriceAndType.cashAmount"
                      />
                    </div>
                  </v-list-item-content>
                </v-list-item>
                <v-list-item>
                  <v-list-item-content>
                    <div class="d-flex">
                      <div>信用卡：</div>
                      <div
                        v-math:round="dailyPriceAndType.creditAmount"
                        v-price="dailyPriceAndType.creditAmount"
                        v-text="dailyPriceAndType.creditAmount"
                      />
                    </div>
                  </v-list-item-content>
                </v-list-item>
                <v-list-item>
                  <v-list-item-content>
                    <div class="d-flex">
                      <div>轉帳：</div>
                      <div
                        v-math:round="dailyPriceAndType.transAmount"
                        v-price="dailyPriceAndType.transAmount"
                        v-text="dailyPriceAndType.transAmount"
                      />
                    </div>
                  </v-list-item-content>
                </v-list-item>
                <v-list-item>
                  <v-list-item-content>
                    <div class="d-flex">
                      <div>其他：</div>
                      <div
                        v-math:round="dailyPriceAndType.othersAmount"
                        v-price="dailyPriceAndType.othersAmount"
                        v-text="dailyPriceAndType.othersAmount"
                      />
                    </div>
                  </v-list-item-content>
                </v-list-item>
              </v-list>
            </v-menu>
          </div>
          <div class="ma-4">
            <v-btn
              color="primary"
              depressed
              rounded
              style="width:300px;min-height:60px"
              x-large
            >
              <div>應收：</div>
              <div
                v-math:round="dailyPriceData.price"
                v-price="dailyPriceData.price"
                v-text="`${dailyPriceData.price ? dailyPriceData.price : 0}`"
              />
            </v-btn>
          </div>
          <div class="ma-4">
            <v-btn
              color="warning"
              dark
              depressed
              rounded
              style="width:300px;min-height:60px"
              x-large
            >
              <div>待收：</div>
              <div
                v-math:round="dailyPriceData.difference"
                v-price="dailyPriceData.difference"
                v-text="`${dailyPriceData.difference ? dailyPriceData.difference: 0}`"
              />
            </v-btn>
          </div>
        </div>
        <div
          v-for="(rowItem,index) in dailyReportData"
          :key="index"
        >
          <t-table-daily-report
            :t-items="rowItem"
            @dialog="emitDialog"
          />
        </div>
        <section
          v-if="!dailyReportData || dailyReportData.length === 0"
          class="d-flex align-center justify-center"
        >
          <div class="title">
            沒有符合的日報
          </div>
        </section>
        <v-footer
          app
          class="justify-center pl-0 py-4"
          color="#fff"
          inset
        >
          <v-pagination
            v-model="currentPage"
            circle
            :length="totalPages"
            :total-visible="7"
            @input="handleClickSetPage($event)"
          />
        </v-footer>
      </template>
    </div>
  </div>
</template>

<style lang="scss">

section {
  height: 80vh;
}

@media screen ,all {
  .views__theDailyReport {
    overflow-x: hidden;

    height: 100%;
    padding: 1rem;
  }
}
</style>
