<script>
import { mapState } from 'vuex'
import { createDialog } from '../../utils/helpers/createDialog'
import { createDiscount } from '../../utils/create/createDiscount'
import { createRooms } from '../../utils/create/createRooms'
import _ from 'lodash'
const _discount = createDiscount()
const _rooms = createRooms()
const _dialog = createDialog()
export default {
  data () {
    return {
      discountDatePermanent: false,
      // fetch data
      roomTypeData: [],
      discountData: [],
      // temp data
      tempDiscount: {
        discountName: '',
        discountDescription: '',
        salesChannel: [],
        discountType: '',
        discountPercentage: '',
        discountCustomize: '',
        discountStartDate: '',
        discountEndDate: '',
        discountFor: [],
        discountEnable: false
      },
      // select options
      salesChannelItems: [
        { text: '全部', value: 'all' },
        { text: '現場', value: '現場' },
        { text: 'Booking.com', value: 'Booking.com' },
        { text: 'agoda', value: 'agoda' },
        { text: 'expedia', value: 'expedia' },
        { text: 'hotels.com', value: 'hotels.com' },
        { text: 'trip.com', value: 'trip.com' }
      ],
      parmanent: false,
      // valid
      valid: false,
      // dialog
      dialog: null,
      // menu
      menuStartDate: false,
      menuEndDate: false,
      // date
      dateStartDate: '',
      dateEndDate: '',
      // filter
      filterChannel: null,
      // data table
      headerDiscounts: [
        {
          text: '',
          value: 'actionPrepend',
          sortable: false,
          align: 'left',
          class: ['primary', 'white--text']
        },
        {
          text: '通路',
          value: 'salesChannel',
          sortable: false,
          align: 'left',
          class: ['primary', 'white--text']
        },
        {
          text: '名稱',
          value: 'discountName',
          sortable: false,
          align: 'left',
          class: ['primary', 'white--text']
        },
        {
          text: '內容',
          value: 'discountDescription',
          sortable: false,
          align: 'left',
          class: ['primary', 'white--text']
        },
        {
          text: '優惠日期',
          value: 'discountDate',
          sortable: false,
          align: 'left',
          class: ['primary', 'white--text']
        },
        {
          text: '',
          value: 'actionAppend',
          sortable: false,
          align: 'left',
          class: ['primary', 'white--text']
        }
      ]
    }
  },
  computed: {
    ...mapState({
      dialogCreateDiscount: state => state.dialog.map.createDiscount,
      dialogConfirmDeleteDiscount: state => state.dialog.map.confirmDeleteDiscount
    }),
    displayChannelData () {
      if (this.filterChannel !== 'all') {
        return this.discountData.filter(el => el.salesChannel === this.filterChannel)
      }
      if (this.filterChannel === null) {
        this.getDisplayDiscounts()
        return this.discountData
      }
      return this.discountData
    },
    displayDiscountDate () {
      return (start, end) => {
        if (!start && !end) {
          return '永久期限'
        }
        const startDate = this.$date(start).format('YYYY/MM/DD')
        const endDate = this.$date(end).format('YYYY/MM/DD')
        const isNoStart = startDate === '1899/11/30'
        const isNoEnd = endDate === '1899/11/30' || endDate === '3000/12/31'
        const isPermanent = isNoStart && isNoEnd
        if (isPermanent) {
          return '永久期限'
        }
        if (!isPermanent && (isNoStart || isNoEnd)) {
          if (isNoStart) {
            return `永久期限 - ${this.$date(endDate).format('YYYY/MM/DD')}`
          }
          if (isNoEnd) {
            return `${this.$date(startDate).format('YYYY/MM/DD')} - 永久期限`
          }
        }
        if (!isPermanent && !isNoStart && !isNoEnd) {
          return `${this.$date(startDate).format('YYYY/MM/DD')} - ${this.$date(endDate).format('YYYY/MM/DD')}`
        }
      }
    },
    displayTempDiscountDate () {
      return this.tempDiscount.discountStartDate === '0000-01-01' && this.tempDiscount.discountEndDate === '3000-01-01'
        ? ['0000-00-00', '0000-00-00']
        : [this.tempDiscount.discountStartDate, this.tempDiscount.discountEndDate]
    },
    rwd () {
      return this.$vuetify.breakpoint.name
    }
  },
  created () {
    this.getDisplayDiscounts()
    this.showRoomType()
    this.dialog = createDialog()
  },
  updated () {
    this.$bus.$on('init-temp-discount', () => {
      if (this.$refs.formInsertDiscount) {
        this.$refs.formInsertDiscount.reset()
      }
      this.tempDiscount = _discount.getInitTempDiscount()
    })
  },
  methods: {
    pickStartDate (date) {
      this.dateStartDate = date
    },
    pickEndDate (date) {
      this.dateEndDate = date
    },
    pickDiscountStartDate (date) {
      this.tempDiscount.discountStartDate = date
      this.$refs.datePickerStart.errors = []
    },
    pickDiscountEndDate (date) {
      this.tempDiscount.discountEndDate = date
      this.$refs.datePickerEnd.errors = []
    },
    async showEdit (isNew, item) {
      if (isNew) {
        this.tempDiscount = _discount.getInitTempDiscount()
        this.isNew = true
      } else {
        this.tempDiscount = Object.assign({}, _discount.getInitTempDiscount(), item)
        const isPermanent = _discount.isPermanent(this.tempDiscount)
        if (isPermanent) {
          this.discountDatePermanent = true
        } else {
          this.discountDatePermanent = false
        }
        this.isNew = false
      }
      await this.dialog.setDialog({
        type: 'createDiscount',
        show: true
      })
    },
    async showDeleteConfirmDialog (item) {
      await this.dialog.setDialog({
        type: 'confirmDeleteDiscount',
        show: true
      })
      this.tempDiscount = Object.assign({}, item)
    },
    postDataHandler () {
      if (this.isNew) {
        this.insertDiscount()
      } else {
        this.updateDiscount()
      }
    },
    async getDisplayDiscounts () {
      try {
        const res = await _discount.fetchGetDiscount()
        let {
          success,
          discounts
        } = res
        if (success) {
          discounts = _discount.getDiscounts(discounts)
          this.discountData = discounts
          if (
            this.discountData[0].discountStartDate === '0000-00-00' || this.discountData[0].discountEndDate === '0000-00-00') {
            this.discountData[0].discountStartDate = ''
            this.discountData[0].discountEndDate = ''
            this.discountDatePermanent = true
            if (this.$refs.datePickerStart || this.$refs.datePickerEnd) {
              this.$refs.datePickerStart.errors = this.$refs.datePickerEnd.errors = []
            }
          }
          this.filterChannel = 'all'
        }
      } catch (err) {
        console.log(err)
      }
    },
    async showRoomType () {
      try {
        const rooms = await _rooms.fetchGetRoomsNumber()
        if (rooms && rooms.length) {
          this.roomTypeData = _discount.getRoomTypeItems(rooms)
        }
      } catch (err) {
        console.log(err)
      }
    },
    async insertDiscount () {
      try {
        if (!this.discountDatePermanent) {
          if (!this.tempDiscount.discountStartDate || !this.tempDiscount.discountEndDate) {
            const valid = await this.$refs.formInsertDiscount.validate()
            if (!valid) return
          }
        }
        // let temp = {
        //   discountName: this.tempDiscount.discountName,
        //   discountDescription: this.tempDiscount.discountDescription,
        //   salesChannel: this.tempDiscount.salesChannel,
        //   discountType: this.tempDiscount.discountType,
        //   discountPercentage: this.tempDiscount.discountPercentage,
        //   discountCustomize: this.tempDiscount.discountCustomize,
        //   discountStartDate: this.tempDiscount.discountStartDate,
        //   discountEndDate: this.tempDiscount.discountEndDate,
        //   discountFor: this.tempDiscount.discountFor,
        //   discountEnable: this.tempDiscount.discountEnable
        // }
        // if (this.discountDatePermanent) {
        //   this.tempDiscount.discountStartDate = '0000-00-00'
        //   this.tempDiscount.discountEndDate = '3000-00-00'
        // }
        this.tempDiscount = Object.assign(
          this.tempDiscount,
          {
            discountStartDate: this.discountDatePermanent
              ? '0000-00-00'
              : this.tempDiscount.discountStartDate,
            discountEndDate: this.discountDatePermanent
              ? '3000-00-00'
              : this.tempDiscount.discountEndDate,
            discountEnable: this.tempDiscount.discountEnable
              ? '1'
              : '0',
            discountFor: this.tempDiscount.discountFor.join(',')
          })
        // temp = this._$dataTypeConvert.transBeforeReq(temp)
        const {
          success,
          message
        } = await _discount.fetchPostDiscount(this.tempDiscount)

        if (success) {
          await this.dialog.setDialog({
            type: 'createDiscount',
            show: false
          })
          await this.dialog.setDialog({
            autoClose: true,
            msg: message,
            type: 'success'
          })
        } else {
          await this.dialog.setDialog({
            autoClose: true,
            msg: message,
            type: 'failed'
          })
        }
        this.getDisplayDiscounts()
        this.showRoomType()
      } catch (err) {
        console.log(err)
      }
    },
    handleClickSetDiscountPermanent: _.debounce(function (ev) {
      if (ev) {
        this.tempDiscount.discountStartDate = ''
        this.tempDiscount.discountEndDate = ''
        this.$refs.datePickerStart.errors = this.$refs.datePickerEnd.errors = []
        this.discountDatePermanent = true
      } else {
        this.discountDatePermanent = false
      }
    }, 300),
    async updateDiscount () {
      try {
        // 將彈窗最先關閉，避免資料修改造成的瞬間誤以為刪除資料
        _dialog.setDialog({
          type: 'createDiscount',
          show: false
        })

        if (this.discountDatePermanent) {
          this.tempDiscount.discountStartDate = '0000-00-00'
          this.tempDiscount.discountEndDate = '3000-00-00'
        }

        this.tempDiscount = Object.assign(
          this.tempDiscount,
          {
            discountFor: this.tempDiscount.discountFor.join(','),
            discountEnable: this.tempDiscount.discountEnable
              ? '1'
              : '0'
          }
        )

        const {
          success,
          message
        } = await _discount.fetchPutDiscount(this.tempDiscount)

        if (success) {
          await _dialog.setDialog({
            autoClose: true,
            msg: message,
            type: 'success'
          })
        } else {
          await _dialog.setDialog({
            autoClose: true,
            msg: message,
            type: 'failed'
          })
        }
        this.getDisplayDiscounts()
        this.showRoomType()
      } catch (err) {
        console.log(err)
      }
    },
    async handleClickDeleteDiscount () {
      try {
        const {
          success,
          message
        } = await _discount.fetchDeleteDiscount({
          discountId: this.tempDiscount.discountId
        })

        if (success) {
          await this.dialog.setDialog({
            type: 'confirmDeleteDiscount',
            show: false
          })
          await this.dialog.setDialog({
            autoClose: true,
            msg: message,
            type: 'success'
          })
          this.getDisplayDiscounts()
          this.showRoomType()
        } else {
          await this.dialog.setDialog({
            autoClose: true,
            msg: message || '操作失敗',
            type: 'failed'
          })
        }
      } catch (err) {
        console.log(err)
      }
    },
    handleToggleEnableState: _.debounce(function (item) {
      this.tempDiscount = Object.assign({}, item)
      if (item.discountEnable === '1') {
        this.$set(this.tempDiscount, 'discountEnable', '0')
      } else {
        this.$set(this.tempDiscount, 'discountEnable', '1')
      }
      this.updateDiscount()
    }, 300)
  }
}
</script>

<template>
  <v-container class="views__theDiscount pt-0 page-fixed">
    <template v-if="rwd === 'xs'">
      <h1 class="text-left">
        房價與專案
      </h1>
      <v-row no-gutters>
        <v-col cols="12">
          <v-select
            v-model="filterChannel"
            class="rounded-lg my-1"
            dense
            full-width
            hide-details
            :items="salesChannelItems"
            label="選擇通路"
            outlined
          />
        </v-col>
        <v-col cols="6">
          <t-date-picker
            append-icon="mdi-calendar"
            :date="dateStartDate"
            label="起始日"
            :t-class="'rounded-lg my-1 mr-1'"
            :t-hide-details="true"
            :t-single-line="true"
            @pick-date="pickStartDate"
          />
        </v-col>
        <v-col cols="6">
          <t-date-picker
            append-icon="mdi-calendar"
            :date="dateEndDate"
            label="結束日"
            :min="$date(dateStartDate).add(1,'day').format('YYYY-MM-DD')"
            :t-class="'rounded-lg my-1 ml-1'"
            :t-hide-details="true"
            :t-single-line="true"
            @pick-date="pickEndDate"
          />
        </v-col>
      </v-row>
      <div
        v-for="(item,index) in displayChannelData"
        :key="index"
        class="mb-4"
      >
        <t-mobile-card
          :item="item"
        >
          <template #header>
            <span class="white--text">{{ item.salesChannel }}</span>
          </template>
          <template #default>
            <div class="t-card__text t-card__text--title d-flex justify-start px-2">
              <span class="t-text--title text-left">{{ item.discountName }}</span>
            </div>
            <div class="t-card__text d-flex justify-start px-2">
              <span class="t-text--subtitle">
                優惠日期</span>
              <span class="t-text--subtitle">{{ displayDiscountDate(item.discountStartDate,item.discountEndDate) }}</span>
            </div>
          </template>
          <template #action>
            <v-switch
              class="ma-1"
              dense
              hide-details
              :input-value="item.discountEnable"
              inset
              style="width:100px;height:30px"
              @change="handleToggleEnableState(item)"
            />

            <v-spacer />
            <v-btn
              class="ma-1"
              outlined
              rounded
              small
              @click.stop="showEdit(false,item)"
            >
              編輯
            </v-btn>
            <v-btn
              class="ma-1"
              color="danger"
              dark
              depressed
              rounded
              small
              @click.stop="showDeleteConfirmDialog(item)"
            >
              刪除
            </v-btn>
          </template>
        </t-mobile-card>
      </div>
      <v-btn
        block
        class="rounded-lg"
        color="primary"
        depressed
        @click.stop="showEdit(true)"
      >
        新增專案
      </v-btn>
    </template>
    <template v-else>
      <v-toolbar flat>
        <h1>
          房價與專案
        </h1>
        <v-spacer />
        <v-btn
          color="primary"
          depressed
          @click.stop="showEdit(true)"
        >
          新增專案
        </v-btn>
      </v-toolbar>
      <v-toolbar flat>
        <v-select
          v-model="filterChannel"
          dense
          hide-details
          :items="salesChannelItems"
          label="選擇通路"
          outlined
          style="max-width:200px"
        />

        <v-spacer />

        <t-date-picker
          append-icon="mdi-calendar"
          :date="dateStartDate"
          label="起始日"
          :t-class="'mr-2'"
          :t-hide-details="true"
          :t-single-line="true"
          :t-style="'max-width:200px'"
          @pick-date="pickStartDate"
        />

        <t-date-picker
          append-icon="mdi-calendar"
          :date="dateEndDate"
          label="結束日"
          :min="$date(dateStartDate).add(1,'day').format('YYYY-MM-DD')"
          :t-hide-details="true"
          :t-single-line="true"
          :t-style="'max-width:200px'"
          @pick-date="pickEndDate"
        />
      </v-toolbar>

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
        :headers="headerDiscounts"
        :items="displayChannelData"
      >
        <template v-slot:[`item.actionPrepend`]="{item}">
          <div class="d-flex align-center">
            <v-switch
              class="mt-0"
              dense
              hide-details
              :input-value="item.discountEnable === '1'"
              inset
              style="width:100px;height:30px"
              @change="handleToggleEnableState(item)"
            />
          </div>
        </template>
        <template v-slot:[`item.discountDate`]="{item}">
          {{ displayDiscountDate(item.discountStartDate,item.discountEndDate) }}
        </template>
        <template v-slot:[`item.actionAppend`]="{item}">
          <div class="d-flex align-center justify-end">
            <v-btn
              class="mr-2"
              outlined
              small
              @click.stop="showEdit(false,item)"
            >
              編輯
            </v-btn>
            <v-btn
              color="danger"
              dark
              depressed
              small
              @click.stop="showDeleteConfirmDialog(item)"
            >
              刪除
            </v-btn>
          </div>
        </template>
      </v-data-table>
    </template>

    <v-dialog
      v-model="dialogCreateDiscount"
      max-width="400"
      persistent
    >
      <v-card>
        <ValidationObserver ref="formInsertDiscount">
          <form>
            <v-card-title class="headline">
              <div>新增 / 編輯專案</div>
              <v-spacer />
              <v-btn
                icon
                @click="dialog.beforeSetDialog({initAction:'temp-discount'},{ type: 'createDiscount', show: false })"
              >
                <v-icon>mdi-close-box</v-icon>
              </v-btn>
            </v-card-title>
            <v-card-text>
              <v-row no-gutters>
                <v-col cols="6">
                  <ValidationProvider
                    v-slot="{ errors }"
                    name="通路"
                    rules="required"
                  >
                    <!-- 通路 -->
                    <v-select
                      v-model="tempDiscount.salesChannel"
                      class="py-2 mr-2"
                      dense
                      :error-messages="errors"
                      :items="salesChannelItems"
                      label="通路"
                      required
                    />
                  </ValidationProvider>
                </v-col>
                <v-col cols="6">
                  <ValidationProvider
                    v-slot="{ errors }"
                    name="專案名稱"
                    rules="required"
                  >
                    <!-- 專案名稱 -->
                    <v-text-field
                      v-model="tempDiscount.discountName"
                      auto-grow
                      class="py-2"
                      dense
                      :error-messages="errors"
                      label="專案名稱"
                      required
                    />
                  </ValidationProvider>
                </v-col>
                <v-col>
                  <!-- 專案內容 -->
                  <v-textarea
                    v-model="tempDiscount.discountDescription"
                    dense
                    label="專案內容"
                    name="專案內容"
                    outlined
                    value="寫點什麼⋯⋯"
                  />
                </v-col>
              </v-row>
              <!-- 起始日 - 結束日 -->
              <v-row>
                <v-col cols="6">
                  <ValidationProvider
                    ref="datePickerStart"
                    v-slot="{ errors }"
                    name="起始日"
                  >
                    <t-date-picker
                      append-icon="mdi-calendar"
                      :date="tempDiscount.discountStartDate"
                      label="挑選起始日"
                      :t-disabled="discountDatePermanent"
                      :t-errors="errors"
                      :t-outlined="false"
                      @pick-date="pickDiscountStartDate"
                    />
                  </ValidationProvider>
                </v-col>
                <v-col cols="6">
                  <ValidationProvider
                    ref="datePickerEnd"
                    v-slot="{ errors }"
                    name="結束日"
                  >
                    <t-date-picker
                      append-icon="mdi-calendar"
                      :date="tempDiscount.discountEndDate"
                      label="挑選結束日"
                      :min="tempDiscount.discountStartDate ? $date(tempDiscount.discountStartDate).add(1,'day').format('YYYY-MM-DD') : ''"
                      :t-disabled="discountDatePermanent"
                      :t-errors="errors"
                      :t-outlined="false"
                      @pick-date="pickDiscountEndDate"
                    />
                  </ValidationProvider>
                </v-col>
              </v-row>
              <v-row no-gutters>
                <v-col cols="12">
                  <v-checkbox
                    class="mt-0 mb-3"
                    dense
                    hide-details
                    :input-value="discountDatePermanent"
                    label="設為永久期限"
                    @change="handleClickSetDiscountPermanent"
                  />
                </v-col>
              </v-row>
              <div class="mt-2">
                適用房型：
              </div>
              <!-- 適用房型(need showRoomType first) -->
              <div class="d-flex flex-wrap mb-2">
                <div
                  v-for="(roomType, index) in roomTypeData"
                  :key="index"
                  class="mr-2"
                >
                  <v-checkbox
                    v-model="tempDiscount.discountFor"
                    class="py-0"
                    dense
                    hide-details
                    :label="roomType.roomTypeName"
                    :value="roomType.roomTypeId"
                  />
                </div>
              </div>
              <div class="mt-2">
                專案價格：
              </div>
              <!-- 標準房價 -->
              <v-radio-group
                v-model="tempDiscount.discountType"
                class="py-0 my-0"
                dense
                :mandatory="false"
              >
                <div class="d-flex">
                  <v-radio
                    class="my-2 mr-2"
                    label="標準房價"
                    value="0"
                  />
                  <v-icon>mdi-close</v-icon>
                  <v-text-field
                    v-model="tempDiscount.discountPercentage"
                    class="my-2"
                    dense
                    hide-details
                    outlined
                    single-line
                    style="max-width:150px"
                  />

                  <span class="d-flex align-center">折</span>
                </div>
                <div class="d-flex">
                  <v-radio
                    class="my-2 mr-2"
                    label="自訂房價"
                    value="1"
                  />
                  <v-text-field
                    v-model="tempDiscount.discountCustomize"
                    class="my-2"
                    dense
                    hide-details
                    outlined
                    single-line
                    style="max-width:150px"
                  />
                </div>
              </v-radio-group>
              <div class="d-flex justify-end">
                <v-btn
                  class="mr-2"
                  color="danger"
                  outlined
                  small
                  @click="dialog.setDialog({ type: 'createDiscount', show: false })"
                >
                  取消
                </v-btn>
                <v-btn
                  color="primary"
                  depressed
                  small
                  @click="postDataHandler"
                >
                  完成
                </v-btn>
              </div>
            </v-card-text>
          </form>
        </ValidationObserver>
      </v-card>
    </v-dialog>

    <!-- confirm delete-->
    <t-dialog-confirm
      :t-actions="true"
      :t-confirm-text="'該專案還在使用中，是否確認刪除？'"
      :t-dialog="dialogConfirmDeleteDiscount"
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
          @click="dialog.setDialog({type:'confirmDeleteDiscount',show:false})"
        >
          取消
        </v-btn>
        <v-btn
          color="primary"
          depressed
          small
          @click="handleClickDeleteDiscount"
        >
          確認
        </v-btn>
      </template>
    </t-dialog-confirm>
  </v-container>
</template>
