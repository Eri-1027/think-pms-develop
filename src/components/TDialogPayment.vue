<script>
/**
 * 新增收款
 */
export default {
  props: {
    tRef: {
      type: String,
      default: ''
    },
    tDialog: {
      type: Boolean,
      default: false
    },
    tMaxWidth: {
      type: String,
      default: '400'
    },
    // 收款狀態
    tPaymentItemDifference: {
      type: Number,
      default: 0
    },
    tPaymentItemPaid: {
      type: Number,
      default: () => {
        return 0
      }
    },
    tPaymentItemTotal: {
      type: Number,
      default: () => {
        return 0
      }
    },
    tDiscountType: {
      type: String,
      default: '未提供'
    },
    tIsDiscountType: {
      type: Boolean,
      default: true
    },
    // 收款人員, 收款類型, 統一編號
    tTempPayment: {
      type: Object,
      default: () => {}
    },
    tStaffItems: {
      type: Array,
      default: () => []
    },
    tPaymentTypeItems: {
      type: Array,
      default: () => []
    },
    // 收款方法
    tTempPaymentMethods: {
      type: Array,
      default: () => []
    },
    tPaymentMethodsItems: {
      type: Array,
      default: () => []
    },
    tPaymentSource: {
      type: String,
      default: ''
    }
  },
  data () {
    return {
      paymentItemTotal: this.tPaymentItemTotal
    }
  },
  watch: {
    tDialog: function (newVal, oldVal) {
      if (!newVal) {
        this.closeDialogHandler()
      }
    }
  },
  methods: {
    closeDialogHandler () {
      if (this.$refs.payment) {
        this.$refs.payment.reset()
      }
      this.$emit('close-dialog')
    },
    async paymentHandler () {
      if (this.$refs.payment) {
        const valid = await this.$refs.payment.validate()
        if (!valid) return
        this.$emit('payment')
      } else {
        this.$emit('payment')
      }
    }
  }
}
</script>

<template>
  <v-dialog
    :max-width="tMaxWidth"
    persistent
    :retain-focus="false"
    :value="tDialog"
  >
    <v-card>
      <ValidationObserver ref="payment">
        <form @submit.prevent="$emit('payment',$event)">
          <v-card-title>
            新增收款：
            <v-spacer />
            <v-btn
              icon
              @click="closeDialogHandler"
            >
              <v-icon>mdi-close-box</v-icon>
            </v-btn>
          </v-card-title>
          <v-card-text>
            <!-- slot payment-status -->
            <v-row no-gutters>
              <v-col cols="6">
                <v-card-text class="d-flex px-2 py-1">
                  <div class="text-no-wrap">
                    待收金額：
                  </div>
                  <div
                    v-math:round="tPaymentItemDifference"
                    v-price:currency="tPaymentItemDifference"
                    class="text-truncate"
                  />
                </v-card-text>
              </v-col>
              <v-col cols="6">
                <v-card-text class="d-flex px-2 py-1">
                  <div class="text-no-wrap">
                    已收金額：
                  </div>
                  <div
                    v-math:round="tPaymentItemPaid"
                    v-price:currency="tPaymentItemPaid"
                    class="text-truncate"
                  />
                </v-card-text>
              </v-col>
              <v-col cols="6">
                <v-card-text class="d-flex px-2 py-1 align-center">
                  <div class="text-no-wrap">
                    總額：
                  </div>
                  <ValidationProvider
                    v-slot="{ errors }"
                    name="總額"
                    :rules="{regex: /^([0-9]+)$/}"
                  >
                    <v-text-field
                      class="px-2 py-1"
                      dense
                      :error-messages="errors"
                      height="22"
                      hide-details
                      label="總額"
                      min="1"
                      single-line
                      style="width:100px"
                      type="number"
                      :value="tPaymentItemTotal"
                      @input="$emit('update-payment-item-total',$event)"
                    />
                  </ValidationProvider>
                </v-card-text>
              </v-col>
              <v-col
                v-if="tIsDiscountType"
                cols="6"
              >
                <v-card-text class="d-flex px-2 py-1 align-center">
                  <div class="text-no-wrap">
                    使用專案：
                  </div>
                  <slot name="discountType">
                    <div class="text-truncate">
                      {{
                        tDiscountType
                          ? tDiscountType
                            .split(',')
                            .join(' ')
                          : '無使用專案'
                      }}
                    </div>
                  </slot>
                </v-card-text>
              </v-col>
            </v-row>
            <v-row no-gutters>
              <v-col cols="6">
                <ValidationProvider
                  v-slot="{ errors }"
                  name="收款人員"
                  rules="required"
                >
                  <v-select
                    v-model="tTempPayment.staffId"
                    class="px-2"
                    :error-messages="errors"
                    :items="tStaffItems"
                    label="收款人員"
                  />
                </ValidationProvider>
              </v-col>
              <v-col cols="6">
                <ValidationProvider
                  v-slot="{ errors }"
                  name="收款類型"
                  rules="required"
                >
                  <v-select
                    v-model="tTempPayment.paymentType"
                    class="px-2"
                    :error-messages="errors"
                    :items="tPaymentTypeItems"
                    label="收款類型"
                  />
                </ValidationProvider>
              </v-col>
              <v-col cols="6">
                <v-text-field
                  v-model="tTempPayment.taxNumber"
                  class="px-2"
                  dense
                  label="統一編號"
                />
              </v-col>
            </v-row>
            <v-card
              v-for="(item,index) in tTempPaymentMethods"
              :key="index"
              class="my-3 pt-3"
              outlined
            >
              <v-card-text
                class="py-0"
                style="position: relative"
              >
                <v-row no-gutters>
                  <v-col cols="6">
                    <ValidationProvider
                      v-slot="{ errors }"
                      name="收款方式"
                      rules="required"
                    >
                      <v-select
                        v-model="item.paymentMethod"
                        class="px-2 my-2"
                        dense
                        :error-messages="errors"
                        :items="tPaymentMethodsItems"
                        label="收款方式"
                      />
                    </ValidationProvider>
                  </v-col>
                  <v-col cols="6">
                    <ValidationProvider
                      v-slot="{ errors }"
                      name="收款金額"
                      :rules="{
                        regex: /^(0|-?[1-9][0-9]*)$/,
                        required:true
                      }"
                    >
                      <v-text-field
                        v-model="item.paymentAmount"
                        class="px-2 my-2"
                        dense
                        :error-messages="errors"
                        label="收款金額"
                        type="number"
                      />
                    </ValidationProvider>
                  </v-col>
                  <v-col cols="6">
                    <v-text-field
                      v-model="item.paymentNote"
                      class="px-2 my-2"
                      dense
                      hide-details
                      label="備註"
                    />
                  </v-col>
                </v-row>
              </v-card-text>
              <v-card-actions class="pt-0  px-5">
                <v-btn
                  class="py-0 ma-0"
                  icon
                  @click="$emit('set-price-as-payment-amount',{
                    source:tPaymentSource,
                    i:index
                  })"
                >
                  <v-icon
                    v-text="+item.paymentAmount === tPaymentItemDifference ? 'mdi-checkbox-marked': 'mdi-checkbox-blank-outline'"
                  />
                </v-btn>
                <div class="subtitle-2">
                  同待收金額
                </div>
                <v-spacer />
                <v-btn
                  v-if="index !== 0"
                  color="danger"
                  dark
                  icon
                  small
                  @click="$emit('delete-payment-methods',{i:index})"
                >
                  <v-icon>mdi-minus-circle-outline</v-icon>
                </v-btn>
              </v-card-actions>
            </v-card>

            <div class="d-flex">
              <v-spacer />
              <v-btn
                class="my-2"
                :disabled="tTempPaymentMethods.length > 3"
                outlined
                small
                @click="$emit('add-payment-methods')"
              >
                增加
              </v-btn>
            </div>

            <div class="d-flex">
              <v-spacer />
              <v-btn
                color="success"
                depressed
                small
                @click="paymentHandler"
              >
                完成
              </v-btn>
            </div>
          </v-card-text>
        </form>
      </ValidationObserver>
    </v-card>
  </v-dialog>
</template>

<style lang="scss">
.text-no-wrap {
  width: 100px;
}
</style>
