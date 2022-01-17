<script>
import { mapState } from 'vuex'
import { createDialog } from '@/utils/helpers/createDialog'
import eventService from '../../utils/eventService'
export default {
  data () {
    return {
      extraExpenseData: [],
      tempExtraExpense: {
        extraExpenseName: '',
        extraExpensePrice: '',
        extraExpenseEnable: false
      },
      dialog: null,
      isNew: false,
      headerExtraExpense: [
        {
          text: '名稱',
          value: 'extraExpenseName',
          sortable: false,
          align: 'left',
          class: ['primary', 'white--text']
        },
        {
          text: '價格',
          value: 'extraExpensePrice',
          sortable: false,
          align: 'right',
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
      dialogCreateExtraExpense: state => state.dialog.map.createExtraExpense,
      dialogConfirmDeleteExtraExpense: state => state.dialog.map.confirmDeleteExtraExpense
    }),
    rwd () {
      return this.$vuetify.breakpoint.name
    }
  },
  created () {
    this.showExtraExpense()
    this.dialog = createDialog()
  },
  updated () {
    this.$bus.$on('init-temp-extra-expense', () => {
      this.$refs.formPostExtraExpense.reset()
    })
  },
  methods: {
    initialTempExtraExpense () {
      return JSON.parse(JSON.stringify({
        extraExpenseName: '',
        extraExpensePrice: '',
        extraExpenseEnable: false
      }))
    },
    async showEdit (isNew, item) {
      if (isNew) {
        this.tempExtraExpense = this.initialTempExtraExpense()
        this.isNew = true
      } else {
        this.tempExtraExpense = Object.assign({}, item)
        this.isNew = false
      }
      await this.dialog.setDialog({ type: 'createExtraExpense', show: true })
    },
    async showDeleteConfirmDialog (item) {
      await this.dialog.setDialog({ type: 'confirmDeleteExtraExpense', show: true })
      this.tempExtraExpense = Object.assign({}, item)
    },
    postDataHandler () {
      if (this.isNew) {
        this.insertExtraExpense()
      } else {
        this.updateExtraExpense()
      }
    },
    async insertExtraExpense () {
      try {
        const data = {
          extraExpenseName: this.tempExtraExpense.extraExpenseName,
          extraExpensePrice: this.tempExtraExpense.extraExpensePrice,
          extraExpenseEnable: this.tempExtraExpense.extraExpenseEnable
        }

        const newData = this._$dataTypeConvert.transBeforeReq(data)
        if (newData.extraExpenseEnable === undefined) {
          newData.extraExpenseEnable = '0'
        }

        const res = await eventService.insertExtraExpense(newData)
        if (res.data.success) {
          await this.dialog.setDialog({ type: 'createExtraExpense', show: false })
          await this.dialog.setDialog({ autoClose: true, msg: '新增成功', type: 'success' })
          this.showExtraExpense()
        }

        if (res.data.fetch.message === 'error: extraExpenseName repeat') {
          await this.dialog.setDialog({ autoClose: true, msg: '名稱重複', type: 'failed' })
        }
      } catch (err) {
        console.log(err)
      }
    },
    async showExtraExpense () {
      const res = await eventService.showExtraExpense()
      if (res.data.success) {
        const fetchData = this._$dataTypeConvert.transAfterRes(res.data.fetch.extraExpenses, 'extraExpenseEnable')
        this.extraExpenseData = fetchData
      }
    },
    async updateExtraExpense () {
      try {
        const newData = this._$dataTypeConvert.transBeforeReq(this.tempExtraExpense)
        newData.extraExpenseId = this.tempExtraExpense.extraExpenseId

        const res = await eventService.updateExtraExpense(newData)
        if (res.data.success) {
          await this.dialog.setDialog({ type: 'createExtraExpense', show: false })
          this.showExtraExpense()
        }
      } catch (err) {
        console.log(err)
      }
    },
    async deleteExtraExpense () {
      try {
        const res = await eventService.deleteExtraExpense({
          extraExpenseId: this.tempExtraExpense.extraExpenseId
        })
        if (res.data.success) {
          await this.dialog.setDialog({ type: 'confirmDeleteExtraExpense', show: false })
          this.showExtraExpense()
        }
      } catch (err) {
        console.log(err)
      }
    }
  }
}
</script>
<template>
  <v-container class="views__theExtraExpense pt-0 page-fixed">
    <template v-if="rwd === 'xs'">
      <h1 class="text-left">
        購物中心
      </h1>
      <div
        v-for="(item,index) in extraExpenseData"
        :key="index"
        class="mb-4"
      >
        <t-mobile-card
          :item="item"
          @action="showEdit(false,item)"
        >
          <template #header>
            <span class="white--text">{{ item.extraExpenseName }}</span>
          </template>
          <template #default>
            <div class="t-card__text d-flex justify-space-between px-2">
              <span>價格</span>
              <span>{{ item.extraExpensePrice }}</span>
            </div>
          </template>
          <template #action>
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
        新增品項
      </v-btn>
    </template>
    <template v-else>
      <v-toolbar flat>
        <h1>購物中心</h1>
        <v-spacer />
        <v-btn
          color="primary"
          depressed
          @click.stop="showEdit(true)"
        >
          新增品項
        </v-btn>
      </v-toolbar>

      <v-layout column>
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
          :headers="headerExtraExpense"
          :items="extraExpenseData"
        >
          <template v-slot:[`item.extraExpensePrice`]="{item}">
            <div
              v-math:round="item.extraExpensePrice"
              v-price="item.extraExpensePrice"
            />
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
      </v-layout>
    </template>

    <!-- insert -->
    <v-dialog
      v-model="dialogCreateExtraExpense"
      max-width="290"
      persistent
    >
      <v-card>
        <ValidationObserver ref="formPostExtraExpense">
          <form>
            <v-card-title class="headline">
              <div>新增 / 編輯品項</div>
              <v-spacer />
              <v-btn
                icon
                @click="dialog.beforeSetDialog({initAction:'temp-extra-expense'},{ type: 'createExtraExpense', show: false })"
              >
                <v-icon v-text="'mdi-close-box'" />
              </v-btn>
            </v-card-title>
            <v-card-text>
              <ValidationProvider
                v-slot="{ errors }"
                name="名稱"
                rules="required"
              >
                <v-text-field
                  v-model="tempExtraExpense.extraExpenseName"
                  dense
                  :error-messages="errors"
                  label="名稱"
                  required
                />
              </ValidationProvider>
              <ValidationProvider
                v-slot="{ errors }"
                name="價錢"
                rules="required"
              >
                <v-text-field
                  v-model="tempExtraExpense.extraExpensePrice"
                  dense
                  :error-messages="errors"
                  label="價錢"
                  required
                />
              </ValidationProvider>
              <!-- 是否啟用 -->
              <v-checkbox
                v-model="tempExtraExpense.extraExpenseEnable"
                dense
                label="是否啟用"
              />
            </v-card-text>

            <v-card-actions>
              <v-spacer />
              <v-btn
                color="primary"
                depressed
                @click.stop="postDataHandler"
              >
                完成
              </v-btn>
            </v-card-actions>
          </form>
        </ValidationObserver>
      </v-card>
    </v-dialog>

    <!-- confirm delete-->
    <t-dialog-confirm
      :t-actions="true"
      :t-confirm-text="'是否確認刪除該物品？'"
      :t-dialog="dialogConfirmDeleteExtraExpense"
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
          @click="dialog.setDialog({ type: 'confirmDeleteExtraExpense', show: false })"
        >
          取消
        </v-btn>
        <v-btn
          color="primary"
          depressed
          small
          @click="deleteExtraExpense"
        >
          確認
        </v-btn>
      </template>
    </t-dialog-confirm>
  </v-container>
</template>
