<script>
import { mapState } from 'vuex'
import { mixinUtils } from '@/mixins/utils.mixin'
import { createDialog } from '@/utils/helpers/createDialog'
import { createCustomer } from '@/utils/create/createCustomer'
import _ from 'lodash'
const TCardCustomerInfo = () => import('@/components/TCardCustomerInfo.vue')
const TDialogCustomerInfoDetail = () => import('@/components/TDialogCustomerInfoDetail.vue')
const _customer = createCustomer()
export default {
  components: {
    TCardCustomerInfo,
    TDialogCustomerInfoDetail
  },
  mixins: [mixinUtils],
  data () {
    return {
      customers: [],
      customer: {},
      // temp data
      tempCustomer: {
        customerId: '',
        customerName: '',
        customerGender: '',
        customerNationality: '',
        customerIdNumber: '',
        customerPassportNumber: '',
        customerPhone: '',
        customerEmail: '',
        customerNote: ''
      },
      searchType: '0',
      searchOrder: '1',
      search: '',
      // select
      customerGenderItems: [
        { text: '男', value: '0' },
        { text: '女', value: '1' },
        { text: '其他', value: '2' }
      ],
      sortByItems: [
        { text: '入住日', value: '0' },
        { text: '退房日', value: '1' }
      ],
      displayByItems: [
        { text: '由舊到新', value: '0' },
        { text: '由新到舊', value: '1' }
      ],
      statusDialogCustomer: '',
      // date
      dateStartDay: '',
      dateEndDay: '',
      // page
      currentPage: 1,
      totalPage: null
    }
  },
  computed: {
    ...mapState({
      dialogCustomerDetail: state => state.dialog.map.customerDetail
    }),
    rwd () {
      return this.$vuetify.breakpoint.name
    }
  },
  created () {
    this.getCustomer()
    this.dialog = createDialog()
  },
  methods: {
    /* ------------------------------------ *\
        SEARCH 相關
        - 第一個放畫面一進來，預設載入
        - 其它搜尋條件
    \* ------------------------------------ */
    async getCustomer (page = 1) {
      try {
        const data = { currentPage: page }
        const result = await _customer.fetchGetCustomer(data)
        if (result) {
          if (result && result.pages) {
            this.totalPage = result.pages
          }
          if (result.customer && result.customer.length) {
            this.customers = this._$dataTypeConvert.transAfterRes(result.customer)
          }
        }
      } catch (err) {
        console.log(err)
      }
    },
    async setSortHandler (type, e) {
      if (type === 'TYPE') {
        this.searchType = e
      }
      if (type === 'ORDER') {
        this.searchOrder = e
      }

      const config = {
        searchOrder: this.searchOrder,
        searchType: this.searchType
      }

      const fn = _customer.createSearchingByOrder(config)
      const temp = {
        currentPage: this.currentPage,
        type: this.searchType,
        fromDate: this.dateStartDay,
        endDate: this.dateEndDay
      }
      if (fn) {
        const customers = await fn(temp)
        if (customers && customers.length) {
          this.customers = customers
        }
      }
    },
    async pickStartDate (date) {
      this.dateStartDay = date
      this.dateEndDay = ''
      this.setSearchDateCustomer()
    },
    pickEndDate (date) {
      this.dateEndDay = date
      this.setSearchDateCustomer()
    },
    setKeywords: _.debounce(async function (keyword) {
      if (keyword) {
        const data = {
          search: keyword,
          currentPage: this.currentPage
        }
        const customers = await _customer.fetchGetSearchCustomer(data)
        this.customers = this._$dataTypeConvert.transAfterRes(customers)
      } else {
        this.getCustomer()
      }
    }, 200),
    // 關鍵字
    async setSearchCustomer () {
      try {
        const temp = {
          currentPage: this.currentPage,
          search: this.search
        }
        const result = await _customer.fetchGetSearchCustomer(temp)
        if (result && result.customers && result.customers.length) {
          this.customers = result.customers
        }
      } catch (err) {
        console.log(err)
      }
    },
    async setSearchDateCustomer () {
      try {
        const temp = {
          currentPage: this.currentPage,
          type: this.searchType,
          fromDate: this.dateStartDay,
          endDate: this.dateEndDay
        }
        const customers = await _customer.fetchGetSearchDateCustomer(temp)
        this.customers = customers
      } catch (err) {
        console.log(err)
      }
    },
    async setSearchDateCustomerAsc () {
      try {
        const temp = {
          currentPage: this.currentPage,
          type: this.searchType,
          fromDate: this.dateStartDay,
          endDate: this.dateEndDay
        }
        const customers = await _customer.fetchGetSearchDateCustomerAsc(temp)
        if (customers && customers.length) {
          this.customers = customers
        }
      } catch (err) {
        console.log(err)
      }
    },
    async handleClickResetSearch () {
      this.searchType = '0'
      this.searchOrder = '1'
      this.search = ''
      this.dateStartDay = ''
      this.dateEndDay = ''
      await this.getCustomer()
    },
    handleClickGetDetailCustomer: _.debounce(async function (item) {
      try {
        this.statusDialogCustomer = ''
        const temp = {
          customerId: item.customerId
        }
        const customers = await _customer.fetchGetCustomerDetail(temp)
        if (customers && customers.length) {
          this.customer = customers[0]
          this.tempCustomer = customers[0] // for edit
          this.dialog.setDialog({ type: 'customerDetail', show: true })
        }
      } catch (err) {
        console.log(err)
      }
    }),
    handleClickSetStatusToEdit (item) {
      this.tempCustomer = item
      this.statusDialogCustomer = 'edit'
    },
    async handleClickUpdateCustomer () {
      try {
        const temp = {
          customerId: this.customer.customerId,
          customerName: this.tempCustomer.customerName,
          customerGender: this.tempCustomer.customerGender,
          customerPhone: this.tempCustomer.customerPhone,
          customerEmail: this.tempCustomer.customerEmail,
          customerNationality: this.tempCustomer.customerNationality,
          customerIdNumber: this.tempCustomer.customerIdNumber,
          customerPassportNumber: this.tempCustomer.customerPassportNumber,
          customerNote: this.tempCustomer.customerNote
        }
        const success = await _customer.fetchPutCustomer(temp)
        if (success) {
          if (this.search) {
            await this.setSearchCustomer()
          }
          if (this.searchOrder === '0') {
            await this.setSearchDateCustomerAsc()
          }
          if (this.searchOrder === '1') {
            await this.setSearchDateCustomer()
          }
          await this.dialog.setDialog({ type: 'customerDetail', show: false })
          await this.dialog.setDialog({ autoClose: true, msg: '旅客更新成功', type: 'success' })
        } else {
          await this.dialog.setDialog({ type: 'customerDetail', show: false })
          await this.dialog.setDialog({ autoClose: true, msg: '旅客更新失敗', type: 'failed' })
        }
        this.statusDialogCustomer = ''
      } catch (err) {
        console.log(err)
      }
    },
    async handleClickShowDialogDeleteConfirm () {

    },
    async deleteCustomer () {
      try {
        const temp = {
          customerId: this.customer.customerId
        }
        const success = await _customer.fetchDeleteCustomer(temp)
        if (success) {
          await this.dialog.setDialog({
            type: 'customerDetail',
            show: false
          })
          await this.dialog.setDialog({
            autoClose: true,
            msg: '刪除成功',
            type: 'success'
          })
          this.getCustomer()
        } else {
          await this.dialog.setDialog({
            type: 'customerDetail',
            show: false
          })
          await this.dialog.setDialog({
            autoClose: true,
            msg: '刪除失敗，錯誤代碼：10001',
            type: 'failed'
          })
        }
        this.statusDialogCustomer = ''
      } catch (err) {
        console.log(err)
      }
    }
  }
}
</script>
<template>
  <div class="views__theCustomerInfo page-fixed">
    <template v-if="rwd === 'xs'">
      <v-row no-gutters>
        <v-col cols="12">
          <v-text-field
            append-icon="mdi-magnify"
            class="px-4 py-2"
            dense
            hide-details
            label="關鍵字搜尋"
            outlined
            single-line
            :value="search"
            @input="setKeywords($event)"
          />
        </v-col>
        <v-col cols="6">
          <v-select
            v-model="searchType"
            class="pl-4 pr-1 py-1"
            dense
            hide-details
            :items="sortByItems"
            label="排序依照"
            outlined
            single-line
            @input="setSortHandler('TYPE',$event)"
          />
        </v-col>
        <v-col cols="6">
          <v-select
            v-model="searchOrder"
            class="pr-4 pl-1 py-1"
            dense
            hide-details
            :items="displayByItems"
            label="顯示排序"
            outlined
            single-line
            @input="setSortHandler('ORDER',$event)"
          />
        </v-col>

        <v-col cols="6">
          <t-date-picker
            append-icon="mdi-calendar"
            :date="dateStartDay"
            label="開始日期"
            :t-class="'pl-4 pr-1 py-1'"
            :t-hide-details="true"
            :t-single-line="true"

            @pick-date="pickStartDate"
          />
        </v-col>
        <v-col cols="6">
          <t-date-picker
            append-icon="mdi-calendar"
            :date="dateEndDay"
            label="結束日期"
            :min="$date(dateStartDay).format('YYYY-MM-DD')"
            :t-class="'pr-4 pl-1 py-1'"
            :t-hide-details="true"
            :t-single-line="true"

            @pick-date="pickEndDate"
          />
        </v-col>
        <v-col cols="12">
          <div class="px-4 pt-2">
            <v-btn
              block
              class="rounded-lg"
              color="primary"
              depressed
              @click="handleClickResetSearch"
            >
              重設
            </v-btn>
          </div>
        </v-col>
      </v-row>
    </template>
    <template v-else>
      <v-toolbar flat>
        <v-text-field
          append-icon="mdi-magnify"
          class="mr-2"
          dense
          hide-details
          label="關鍵字搜尋"
          outlined
          single-line
          style="max-width:200px;"
          :value="search"
          @input="setKeywords($event)"
        />
        <v-select
          v-model="searchType"
          class="mr-2"
          dense
          hide-details
          :items="sortByItems"
          label="排序依照"
          outlined
          single-line
          style="max-width:200px;"
          @input="setSortHandler('TYPE',$event)"
        />

        <v-select
          v-model="searchOrder"
          class="mr-2"
          dense
          hide-details
          :items="displayByItems"
          label="顯示排序"
          outlined
          single-line
          style="max-width:200px;"
          @input="setSortHandler('ORDER',$event)"
        />

        <v-spacer />

        <t-date-picker
          append-icon="mdi-calendar"
          :date="dateStartDay"
          label="開始日期"
          :t-class="'mr-2'"
          :t-hide-details="true"
          :t-single-line="true"
          :t-style="'max-width:200px;'"
          @pick-date="pickStartDate"
        />

        <t-date-picker
          append-icon="mdi-calendar"
          :date="dateEndDay"
          label="結束日期"
          :min="$date(dateStartDay).format('YYYY-MM-DD')"
          :t-class="'mr-2'"
          :t-hide-details="true"
          :t-single-line="true"
          :t-style="'max-width:200px;'"
          @pick-date="pickEndDate"
        />

        <v-btn
          color="primary"
          depressed
          @click="handleClickResetSearch"
        >
          重設
        </v-btn>
      </v-toolbar>
    </template>

    <v-main
      v-if="customers && customers.length"
      class="px-3 main"
    >
      <div class="d-flex">
        <v-row>
          <v-col
            v-for="(card,index) in customers"
            :key="index"
            cols="12"
            lg="3"
            md="4"
          >
            <t-card-customer-info
              :item="card"
              @dialog="handleClickGetDetailCustomer"
            />
          </v-col>
        </v-row>
      </div>
    </v-main>

    <section
      v-if="!customers.length"
      class="d-flex align-center justify-center"
    >
      <div class="title">
        沒有符合的客戶
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
        :length="totalPage"
        @input="getCustomer($event)"
      />
    </v-footer>

    <t-dialog-customer-info-detail
      ref="fatherFormUpdateOrder"
      :t-card-item="customer"
      :t-customer-gender="customerGender(customer.customerGender)"
      :t-customer-gender-items="customerGenderItems"
      :t-dialog="dialogCustomerDetail"
      :t-is-edit="statusDialogCustomer"
      t-persistent
      :t-temp-customer.sync="tempCustomer"
      @close-dialog="dialog.setDialog({type:'customerDetail',show:false})"
      @delete-customer="deleteCustomer"
      @show-edit-dialog="handleClickSetStatusToEdit"
      @update-customer="handleClickUpdateCustomer"
    />
  </div>
</template>

<style lang="scss">
.views__theCustomerInfo {
  section {
    height: 100%;
  }
}

</style>
