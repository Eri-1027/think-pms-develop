<script>
/**
 * 響應式卡片 > 結帳作業
 */
export default {
  props: {
    item: {
      type: Object,
      default: () => {}
    },
    fnPaymentType: {
      type: Function,
      default: () => () => {}
    },
    fnPaymentMethods: {
      type: Function,
      default: () => () => {}
    }
  }
}
</script>

<template>
  <div class="t-component__payment">
    <div
      @click="$emit('dialog',{
        type:'ORDER_ORDER_INFO',
        bookingId:item.bookingId
      })"
    >
      <transition
        mode="out-in"
        name="fade"
      >
        <v-hover
          v-slot:default="{ hover }"
        >
          <v-card
            class="t-card rounded-xl"
            :elevation="hover ? 20 : 6"
          >
            <v-card-text class="primary py-2">
              <v-row no-gutters>
                <v-col
                  class="d-flex justify-start"
                  cols="6"
                >
                  <span class="white--text">{{ item.bookingNumber }}</span>
                </v-col>
                <v-col
                  class="d-flex justify-end"
                  cols="6"
                >
                  <span class="white--text">{{ fnPaymentType(item.paymentType) }} ></span>
                </v-col>
              </v-row>
            </v-card-text>
            <v-card-text class="pa-0">
              <v-row>
                <v-col
                  class="d-flex--default"
                  cols="4"
                >
                  <span class="t-text--title primary--text">{{
                    item.roomNumber
                      ? item.roomNumber
                      : '未入住'
                  }}</span>
                </v-col>
                <v-col
                  class="d-flex--default d-flex--column"
                  cols="4"
                >
                  <div>收款人</div>
                  <div>收款類型</div>
                  <div>入住時間</div>
                </v-col>
                <v-col
                  class="d-flex--default d-flex--column"
                  cols="4"
                >
                  <div>
                    {{
                      item.customerName
                        ? item.customerName
                        : '未知'
                    }}
                  </div>
                  <div>{{ fnPaymentMethods(item.paymentMethod) }}</div>
                  <div>{{ $date(item.expectedCheckInDate).format('MM-DD') }}-{{ $date(item.expectedCheckOutDate).format('MM-DD') }}</div>
                </v-col>
              </v-row>
            </v-card-text>
            <v-card-text class="py-2">
              <v-row no-gutters>
                <v-col
                  class="d-flex justify-start"
                  cols="4"
                >
                  <span>已收 <span
                    v-math:round="item.paymentAmount"
                    v-price="item.paymentAmount"
                  />
                  </span>
                </v-col>
                <v-col cols="4">
                  <span>應收 {{}}</span>
                </v-col>
                <v-col
                  class="d-flex justify-end"
                  cols="4"
                >
                  <span>待收 {{}}</span>
                </v-col>
              </v-row>
            </v-card-text>
          </v-card>
        </v-hover>
      </transition>
    </div>
  </div>
</template>
