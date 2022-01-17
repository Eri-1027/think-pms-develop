<script>
/**
 * 訂單入住 > 未入住訂單卡片
 * @todo 取得房型的唯一值，可以跟 TCardOrderInfo 的 getDiscountSet 一起抽象
 */
export default {
  props: {
    item: {
      type: Object,
      default: () => {}
    }
  },
  methods: {
    dialog () {
      this.$emit('dialog')
    }
  }
}
</script>
<template>
  <v-card
    link
    outlined
    @click="dialog"
  >
    <v-card-text>
      <v-row no-gutters>
        <v-col cols="6">
          <div class="d-flex">
            <div>訂單編號：</div>
            <div class="success--text">
              {{ item.bookingNumber }}
            </div>
          </div>
        </v-col>
        <v-col cols="6">
          <div class="d-flex">
            <div>入住日期：</div>
            <div>{{ $date(item.expectedCheckInTime).format('YYYY/MM/DD') }}</div>
          </div>
        </v-col>
        <v-col cols="6">
          <div class="d-flex">
            <div>房號：</div>
            <div class="success--text">
              {{
                item.roomNumber
                  ? item.roomNumber
                  : '未排房'
              }}
            </div>
          </div>
        </v-col>
        <v-col cols="6">
          <div class="d-flex">
            <div>退房日期：</div>
            <div>{{ $date(item.expectedCheckOutTime).format('YYYY/MM/DD') }}</div>
          </div>
        </v-col>
        <v-col cols="6">
          <div class="d-flex">
            <div> 房型：</div>
            <div>
              {{
                item.roomType
                  ? item.roomType
                  : '未知'
              }}
            </div>
          </div>
        </v-col>
        <v-col cols="6">
          <div class="d-flex">
            <div>旅客資訊：</div>
            <div>
              {{
                item.customerName
                  ? item.customerName
                  : '未提供'
              }}
            </div>
          </div>
        </v-col>
        <v-col cols="6">
          <div class="d-flex">
            <div>待收金額：</div>
            <div>
              {{
                item.totalPrice
                  ? item.totalPrice
                  : 0
              }}
            </div>
          </div>
        </v-col>
        <v-col cols="6">
          <div class="d-flex">
            <div>聯絡電話：</div>
            <div>
              {{
                item.customerPhone
                  ? item.customerPhone
                  : '未提供'
              }}
            </div>
          </div>
        </v-col>
      </v-row>
    </v-card-text>
  </v-card>
</template>
