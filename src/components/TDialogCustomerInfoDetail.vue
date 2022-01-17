<script>
/**
 * 旅客資訊 > 點擊客戶卡片跳出彈窗
 */
export default {
  props: {
    tDialog: {
      type: Boolean,
      default: false
    },
    tCardItem: {
      type: Object,
      default: () => {}
    },
    tIsEdit: {
      type: String,
      default: ''
    },
    tTempCustomer: {
      type: Object,
      default: () => {}
    },
    tPersistent: {
      type: Boolean,
      default: false
    },
    tCustomerGender: {
      type: String,
      default: ''
    },
    tCustomerGenderItems: {
      type: Array,
      default: () => []
    }
  },
  methods: {
    closeOutsideDialogHandler () {
      if (!this.tIsEdit) {
        this.$emit('close-dialog')
      }
    }
  }
}
</script>

<template>
  <v-dialog
    max-width="290"
    :persistent="tPersistent"
    :value="tDialog"
    @click:outside="closeOutsideDialogHandler"
  >
    <v-card>
      <ValidationObserver ref="formUpdateOrder">
        <form>
          <v-card-title>
            顧客資訊
            <v-spacer />
            <v-btn
              icon
              @click="$emit('close-dialog')"
            >
              <v-icon>
                mdi-close-box
              </v-icon>
            </v-btn>
          </v-card-title>
          <v-card-text class="d-flex align-center py-1">
            <div class="text-no-wrap">
              顧客姓名：
            </div>
            <div v-if="tIsEdit !== 'edit'">
              {{
                tCardItem.customerName
                  ? tCardItem.customerName
                  : '未提供'
              }}
            </div>
            <v-text-field
              v-else
              class="px-2"
              dense
              hide-details
              single-line
              style="width:100px"
              :value="tTempCustomer.customerName"
              @input="$emit('update:tempCustomer',tTempCustomer.customerName = $event)"
            />
          </v-card-text>
          <v-card-text class="d-flex align-center py-1">
            <div class="text-no-wrap">
              顧客性別：
            </div>
            <div v-if="tIsEdit !== 'edit'">
              {{
                tCustomerGender
                  ? tCustomerGender
                  : '未提供'
              }}
            </div>
            <v-select
              v-else
              class="px-2"
              dense
              hide-details
              :items="tCustomerGenderItems"
              single-line
              style="width:100px"
              :value="tTempCustomer.customerGender"
              @input="$emit('update:tempCustomer',tTempCustomer.customerGender = $event)"
            />
          </v-card-text>
          <v-card-text class="d-flex align-center py-1">
            <div class="text-no-wrap">
              國籍：
            </div>
            <div v-if="tIsEdit !== 'edit'">
              {{
                tCardItem.customerNationality
                  ? tCardItem.customerNationality
                  : '未提供'
              }}
            </div>
            <v-text-field
              v-else
              class="px-2"
              dense
              hide-details
              items="customerGenderItems"
              single-line
              style="width:100px"
              :value="tTempCustomer.customerNationality"
              @input="$emit('update:tempCustomer',tTempCustomer.customerNationality = $event)"
            />
          </v-card-text>
          <v-card-text class="d-flex align-center py-1">
            <div class="text-no-wrap">
              身分證：
            </div>
            <div v-if="tIsEdit !== 'edit'">
              {{
                tCardItem.customerIdNumber
                  ? tCardItem.customerIdNumber
                  : '未提供'
              }}
            </div>
            <v-text-field
              v-else
              class="px-2"
              dense
              hide-details
              single-line
              style="width:100px"
              :value="tTempCustomer.customerIdNumber"
              @input="$emit('update:tempCustomer',tTempCustomer.customerIdNumber = $event)"
            />
          </v-card-text>
          <v-card-text class="d-flex align-center py-1">
            <div class="text-no-wrap">
              護照號碼：
            </div>
            <div v-if="tIsEdit !== 'edit'">
              {{
                tCardItem.customerPassportNumber
                  ? tCardItem.customerPassportNumber
                  : '未提供'
              }}
            </div>
            <v-text-field
              v-else
              class="px-2"
              dense
              hide-details
              single-line
              style="width:100px"
              :value="tTempCustomer.customerPassportNumber"
              @input="$emit('update:tempCustomer',tTempCustomer.customerPassportNumber = $event)"
            />
          </v-card-text>
          <v-card-text class="d-flex align-center py-1">
            <div class="text-no-wrap">
              聯絡電話：
            </div>
            <div v-if="tIsEdit !== 'edit'">
              {{
                tCardItem.customerPhone
                  ? tCardItem.customerPhone
                  : '未提供'
              }}
            </div>
            <v-text-field
              v-else
              class="px-2"
              dense
              hide-details
              single-line
              style="width:100px"
              :value="tTempCustomer.customerPhone"
              @input="$emit('update:tempCustomer',tTempCustomer.customerPhone = $event)"
            />
          </v-card-text>
          <v-card-text class="d-flex align-center py-1">
            <div class="text-no-wrap">
              E-mail：
            </div>
            <div v-if="tIsEdit !== 'edit'">
              {{
                tCardItem.customerEmail
                  ? tCardItem.customerEmail
                  : '未提供'
              }}
            </div>
            <v-text-field
              v-else
              class="px-2"
              dense
              hide-details
              single-line
              style="width:100px"
              :value="tTempCustomer.customerEmail"
              @input="$emit('update:tempCustomer',tTempCustomer.customerEmail = $event)"
            />
          </v-card-text>
          <v-card-text class="d-flex py-1">
            <div class="text-no-wrap">
              備註：
            </div>
            <div
              v-if="tIsEdit !== 'edit'"
              style="max-width:200px"
            >
              {{
                tCardItem.customerNote
                  ? tCardItem.customerNote
                  : '無'
              }}
            </div>
            <v-textarea
              v-else
              auto-grow
              class="px-2"
              counter
              dense
              hide-details
              single-line
              style="width:100px"
              :value="tTempCustomer.customerNote"
              @input="$emit('update:tempCustomer',tTempCustomer.customerNote = $event)"
            />
          </v-card-text>

          <v-card-actions class="px-5 py-4">
            <v-spacer />
            <v-btn
              v-show="tIsEdit === 'edit'"
              color="danger"
              dark
              depressed
              small
              @click="$emit('delete-customer',tCardItem)"
            >
              刪除
            </v-btn>
            <v-btn
              v-show="tIsEdit !== 'edit'"
              color="warning"
              dark
              depressed
              small
              @click="$emit('show-edit-dialog',tCardItem)"
            >
              編輯
            </v-btn>
            <v-btn
              v-show="tIsEdit"
              color="warning"
              dark
              depressed
              small
              @click="$emit('update-customer')"
            >
              完成
            </v-btn>
          </v-card-actions>
        </form>
      </ValidationObserver>
    </v-card>
  </v-dialog>
</template>

<style lang="scss">
.text-no-wrap{
  width: 100px;
}
</style>
