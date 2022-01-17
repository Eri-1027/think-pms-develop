<script>
import { mapState } from 'vuex'
import { createDialog } from '@/utils/helpers/createDialog'
import { createStaff } from '@/utils/create/createStaff'
import eventService from '../../utils/eventService'
const _staff = createStaff()
export default {
  data () {
    return {
      dialog: null,
      staffLevelItems: [
        { text: '工程師', value: '0' },
        { text: '老闆', value: '1' },
        { text: '經理', value: '2' },
        { text: '櫃檯人員', value: '3' },
        { text: '清潔人員', value: '4' }
      ],
      tempStaff: {
        staffId: '',
        staffNumber: '',
        staffName: '',
        staffPhone: '',
        staffDepartment: '',
        staffTitle: '',
        staffLevel: '',
        staffAccount: '',
        staffEnable: false
      },
      staffs: [],
      isNew: false,
      headerStaffs: [
        {
          text: '員工編號',
          value: 'staffNumber',
          sortable: false,
          align: 'left',
          class: ['primary', 'white--text']
        },
        {
          text: '姓名',
          value: 'staffName',
          sortable: false,
          align: 'left',
          class: ['primary', 'white--text']
        },
        {
          text: '部門',
          value: 'staffDepartment',
          sortable: false,
          align: 'left',
          class: ['primary', 'white--text']
        },
        {
          text: '職稱',
          value: 'staffTitle',
          sortable: false,
          align: 'left',
          class: ['primary', 'white--text']
        },
        {
          text: '聯絡電話',
          value: 'staffPhone',
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
      staffId: state => state.user.staff.staffId,
      staffAccount: state => state.user.staff.staffAccount,
      staffLevel: state => state.user.staff.staffLevel,
      dialogConfirmDeleteStaff: state => state.dialog.map.confirmDeleteStaff,
      dialogCreateStaff: state => state.dialog.map.createStaff
    }),
    isPasswordModifyPermission () {
      return this.isNew === true
        ? true
        : this.staffAccount === this.tempStaff.staffAccount
    },
    isLevelEditable () {
      return this.staffLevel === '0' || this.staffLevel === '1' || this.staffLevel === '2'
    },
    rwd () {
      return this.$vuetify.breakpoint.name
    }
  },
  mounted () {
    this.$bus.$on('change', async () => {
      this.getStaffsByLevel()
    })
  },
  created () {
    this.getStaffsByLevel()
    this.dialog = createDialog()
    this.setItemsStaffLevel()
  },
  updated () {
    this.$bus.$on('init-temp-staff', () => {
      if (this.$refs.formInsertStaff) {
        this.$refs.formInsertStaff.reset()
      }
      this.tempStaff = this.initialTempStaff()
    })
  },
  methods: {
    initialTempStaff () {
      return JSON.parse(JSON.stringify({
        staffId: '',
        staffNumber: '',
        staffName: '',
        staffPhone: '',
        staffDepartment: '',
        staffTitle: '',
        staffLevel: '',
        staffAccount: '',
        staffEnable: false
      }))
    },
    async showEdit (isNew, item) {
      if (isNew) {
        this.tempStaff = this.initialTempStaff()
        this.isNew = true
      } else {
        this.tempStaff = Object.assign({}, item)
        this.isNew = false
      }
      await this.dialog.setDialog({ type: 'createStaff', show: true })
    },
    async setItemsStaffLevel () {
      this.staffLevelItems = _staff.getLegalLevelItemsByUser(this.staffLevel, this.staffLevelItems)
    },
    async getStaffsByLevel () {
      try {
        const temp = { staffAccount: this.staffAccount }
        const highLevel =
        this.staffLevel === '0' ||
        this.staffLevel === '1' ||
        this.staffLevel === '2'

        if (highLevel) {
          const res = await eventService.showStaffForManagement(temp)
          if (res.data.success) {
            this.staffs = this._$dataTypeConvert.transAfterRes(res.data.fetch.staffs, 'staffEnable')
          }
        } else {
          const res = await eventService.showStaffForNormal(temp)
          if (res.data.success) {
            this.staffs = this._$dataTypeConvert.transAfterRes(res.data.fetch.staffs, 'staffEnable')
          }
        }
      } catch (err) {
        console.log(err)
      }
    },
    postDataHandler () {
      if (this.isNew) {
        this.insertStaff()
      } else {
        this.updateStaff()
      }
    },
    async insertStaff () {
      try {
        const valid = await this.$refs.formInsertStaff.validate()
        if (!valid) return
        const temp = {
          staffNumber: this.tempStaff.staffNumber,
          staffName: this.tempStaff.staffName,
          staffPhone: this.tempStaff.staffPhone,
          staffDepartment: this.tempStaff.staffDepartment,
          staffLevel: this.tempStaff.staffLevel,
          staffTitle: this.tempStaff.staffTitle,
          staffAccount: this.tempStaff.staffAccount,
          staffPassword: this.tempStaff.staffPassword,
          staffEnable: this.tempStaff.staffEnable ? '1' : '0'
        }
        const res = await eventService.insertStaff(temp)
        console.log(res)
        if (res.data.success) {
          await this.dialog.setDialog({ type: 'createStaff', show: false })
          const complete = await this.dialog.setDialog({ autoClose: true, msg: '新增成功', type: 'success' })
          if (complete) {
            this.getStaffsByLevel()
          }
        }
        if (res.data.fetch.message === 'error: staffNumber repeat') {
          await this.dialog.setDialog({ autoClose: true, msg: '重複的員工編號', type: 'failed' })
        }
        if (res.data.fetch.message === 'error: staffAccount repeat') {
          await this.dialog.setDialog({ autoClose: true, msg: '重複的員工帳號', type: 'failed' })
        }

        if (res.data.fetch.message === 'error: staffPhone repeat') {
          await this.dialog.setDialog({ autoClose: true, msg: '重複的電話號碼', type: 'failed' })
        }

        if (res.data.fetch.message === 'error: staff insert failed') {
          await this.dialog.setDialog({ autoClose: true, msg: '新增失敗', type: 'failed' })
        }
      } catch (err) {
        console.log({ message: err })
      }
    },
    async updateStaff () {
      try {
        this.$refs.formInsertStaff.validate()
        const newData = this._$dataTypeConvert.transBeforeReq(this.tempStaff)
        newData.staffId = this.tempStaff.staffId
        const res = await eventService.updateStaff(newData)
        if (res.data.success) {
          this.getStaffsByLevel()
          await this.dialog.setDialog({ type: 'createStaff', show: false })
        }
      } catch (err) {
        console.log({ message: err })
      }
    },
    async deleteStaff () {
      try {
        const res = await eventService.deleteStaff({ staffId: this.tempStaff.staffId })
        if (res.data.success) {
          this.getStaffsByLevel()
          await this.dialog.setDialog({ type: 'confirmDeleteStaff', show: false })
        }
      } catch (err) {
        console.log({ message: err })
      }
    },
    async showDeleteConfirmDialog (item) {
      await this.dialog.setDialog({ type: 'confirmDeleteStaff', show: true })
      this.tempStaff = Object.assign({}, item)
    }
  }
}
</script>
<template>
  <v-container class="views__theStaff pt-0 page-fixed">
    <template v-if="rwd === 'xs'">
      <h1 class="text-left">
        人員管理
      </h1>
      <div
        v-for="(item,index) in staffs"
        :key="index"
        class="mb-4"
      >
        <t-mobile-card
          :item="item"
          @action="showEdit(false,item)"
        >
          <template #header>
            <span class="white--text">{{ item.staffDepartment ? item.staffDepartment : '未知' }}</span>
          </template>
          <template #default>
            <v-row no-gutters>
              <v-col
                class="d-flex align-center px-2"
                cols="4"
              >
                <div class="t-card__text t-card__text--title d-flex justify-start align-center px-2">
                  <span class="t-text--title text-left">{{ item.staffName }}</span>
                </div>
              </v-col>
              <v-col
                class="px-2"
                cols="8"
              >
                <div class="t-card__text d-flex justify-space-between">
                  <span>員工編號</span><span>{{ item.staffNumber ? item.staffNumber : '未提供' }}</span>
                </div>
                <div class="t-card__text d-flex justify-space-between">
                  <span>職位名稱</span><span>{{ item.staffTitle ? item.staffTitle : '未提供' }}</span>
                </div>
                <div class="t-card__text d-flex justify-space-between">
                  <span>聯絡電話</span><span>{{ item.staffPhone }}</span>
                </div>
              </v-col>
            </v-row>
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
        新增員工
      </v-btn>
    </template>
    <template v-else>
      <v-toolbar flat>
        <h1>人員管理</h1>
        <v-spacer />
        <v-btn
          color="primary"
          depressed
          @click.stop="showEdit(true)"
        >
          新增員工
        </v-btn>
      </v-toolbar>

      <section>
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
          :headers="headerStaffs"
          :items="staffs"
        >
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
      </section>
    </template>

    <!-- isert new -->
    <v-dialog
      v-model="dialogCreateStaff"
      max-width="400"
      persistent
    >
      <v-card>
        <ValidationObserver ref="formInsertStaff">
          <form>
            <v-card-title class="headline">
              新增 / 編輯人員：
              <v-spacer />
              <v-btn
                icon
                @click="dialog.beforeSetDialog({initAction:'temp-staff'},{type:'createStaff',show:false})"
              >
                <v-icon v-text="'mdi-close-box'" />
              </v-btn>
            </v-card-title>
            <v-card-text>
              <v-row no-gutters>
                <!-- 員工編號： -->
                <v-col cols="6">
                  <ValidationProvider
                    v-slot="{ errors }"
                    name="員工編號"
                    rules="required|max:100"
                  >
                    <v-text-field
                      v-model="tempStaff.staffNumber"
                      class="px-2 my-2"
                      dense
                      :error-messages="errors"
                      label="員工編號"
                      required
                    />
                  </ValidationProvider>
                </v-col>
                <!-- 人員名稱： -->
                <v-col cols="6">
                  <ValidationProvider
                    v-slot="{ errors }"
                    name="人員名稱"
                    rules="required|max:100"
                  >
                    <v-text-field
                      v-model="tempStaff.staffName"
                      class="px-2 my-2"
                      dense
                      :error-messages="errors"
                      label="人員名稱"
                      required
                    />
                  </ValidationProvider>
                </v-col>
                <!-- 員工電話： -->
                <v-col cols="6">
                  <ValidationProvider
                    v-slot="{ errors }"
                    name="員工電話"
                    rules="required|max:100"
                  >
                    <v-text-field
                      v-model="tempStaff.staffPhone"
                      class="px-2 my-2"
                      dense
                      :error-messages="errors"
                      label="員工電話"
                      required
                    />
                  </ValidationProvider>
                </v-col>
                <!-- 所屬部門： -->
                <v-col cols="6">
                  <ValidationProvider
                    v-slot="{ errors }"
                    name="員工部門"
                    rules="required|max:100"
                  >
                    <v-text-field
                      v-model="tempStaff.staffDepartment"
                      class="px-2 my-2"
                      dense
                      :error-messages="errors"
                      label="員工部門"
                      required
                    />
                  </ValidationProvider>
                </v-col>
                <!-- 職等：-->
                <v-col cols="6">
                  <ValidationProvider
                    v-slot="{ errors }"
                    name="職等"
                    rules="required|max:100"
                  >
                    <v-select
                      v-model="tempStaff.staffLevel"
                      class="px-2 my-2"
                      dense
                      :disabled="!isLevelEditable"
                      :error-messages="errors"
                      :items="staffLevelItems"
                      label="職等"
                      required
                    />
                  </ValidationProvider>
                </v-col>
                <!-- 職稱： -->
                <v-col cols="6">
                  <ValidationProvider
                    v-slot="{ errors }"
                    name="職稱"
                    rules="required|max:100"
                  >
                    <v-text-field
                      v-model="tempStaff.staffTitle"
                      class="px-2 my-2"
                      dense
                      :error-messages="errors"
                      label="職稱"
                      required
                    />
                  </ValidationProvider>
                </v-col>
                <!-- 員工帳號：-->
                <v-col>
                  <ValidationProvider
                    v-slot="{ errors }"
                    name="員工帳號"
                    rules="required|email"
                  >
                    <v-text-field
                      v-model="tempStaff.staffAccount"
                      class="px-2 my-2"
                      dense
                      :error-messages="errors"
                      label="員工帳號"
                      required
                      type="email"
                    />
                  </ValidationProvider>
                </v-col>
                <!-- 員工密碼：-->
                <v-col cols="6">
                  <ValidationProvider
                    v-slot="{ errors }"
                    name="員工密碼"
                    rules="required|max:100"
                  >
                    <v-text-field
                      v-model="tempStaff.staffPassword"
                      class="px-2 my-2"
                      dense
                      :disabled="!isPasswordModifyPermission"
                      :error-messages="errors"
                      label="員工密碼"
                      required
                      type="password"
                    />
                  </ValidationProvider>
                </v-col>
              </v-row>
            </v-card-text>

            <v-card-actions class="mx-4 py-0">
              <!-- 是否啟用 -->
              <v-checkbox
                v-model="tempStaff.staffEnable"
                label="是否啟用"
              />
              <v-spacer />
              <v-btn
                color="danger"
                outlined
                small
                @click="dialog.setDialog({ type: 'createStaff', show: false })"
              >
                取消
              </v-btn>

              <v-btn
                color="primary"
                depressed
                small
                @click.stop="postDataHandler"
              >
                確認
              </v-btn>
            </v-card-actions>
          </form>
        </ValidationObserver>
      </v-card>
    </v-dialog>

    <!-- confirm delete-->
    <t-dialog-confirm
      :t-actions="true"
      :t-confirm-text="'是否確認刪除該人員？'"
      :t-dialog="dialogConfirmDeleteStaff"
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
          @click="dialog.setDialog({ type: 'confirmDeleteStaff', show: false })"
        >
          取消
        </v-btn>
        <v-btn
          color="primary"
          depressed
          small
          @click="deleteStaff"
        >
          確認
        </v-btn>
      </template>
    </t-dialog-confirm>
  </v-container>
</template>
