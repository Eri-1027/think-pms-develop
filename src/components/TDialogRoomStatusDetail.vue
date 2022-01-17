<script>
import { mapState } from 'vuex'
/**
 * 當日房況 > 點選卡片 > 跳出房間狀態0, 1, 4, 6彈窗
 */
export default {
  props: {
    tMaxWidth: {
      type: String,
      default: '350'
    },
    tDialog: {
      type: Boolean,
      default: false
    },
    tRoomCardItem: {
      type: Object,
      default: () => {
        return {}
      }
    },
    tPaymentItem: {
      type: Object,
      default: () => {
        return {}
      }
    },
    tLogoImgAlt: {
      type: String,
      default: 'think-x-tech-logo'
    },
    tLogoImg: {
      type: String,
      default: () => '~@/assets/img/t-logo.png'
    }
  },
  computed: {
    ...mapState({
      debug: state => state.debug.debug
    }),
    isShowCustomerInfo () {
      switch (this.tRoomCardItem.roomStatus) {
        case '1':
        case '2':
          return true
        case '4':
        case '6':
          return false
        default:
          return true
      }
    },
    displayGender () {
      switch (this.tRoomCardItem.customerGender) {
        case '0':
          return '男'
        case '1':
          return '女'
        case '2':
          return '其他'
        default:
          return '未知'
      }
    },
    restPrice () {
      return this.tRoomCardItem.roomStatus === '4' || this.tRoomCardItem.roomStatus === '4-0'
        ? this.tRoomCardItem.restOverPrice !== undefined
          ? this.tRoomCardItem.restOverPrice
          : this.tPaymentItem.price
        : this.tPaymentItem.price
    },
    restDifference () {
      return this.tRoomCardItem.roomStatus === '4' || this.tRoomCardItem.roomStatus === '4-0'
        ? this.tRoomCardItem.restOverDifference !== undefined
          ? this.tRoomCardItem.restOverDifference
          : this.tPaymentItem.difference
        : this.tPaymentItem.difference
    }
  }
}
</script>

<template>
  <v-dialog
    :max-width="tMaxWidth"
    :value="tDialog"
    @click:outside="$emit('close-dialog')"
  >
    <v-card>
      <v-card-title class="subtitle-1">
        <slot name="title">
          <div class="d-flex align-center">
            <div class="mr-2">
              <v-avatar>
                <img
                  :alt="tLogoImgAlt"
                  src="~@/assets/img/t-logo.png"
                >
              </v-avatar>
            </div>
            <div>
              <div class="d-flex align-center">
                訂單編號：<a
                  class="success--text"
                  @click="$emit('dialog',{
                    type:'ORDER_ORDER_INFO',
                    bookingId:tRoomCardItem.bookingId
                  })"
                >
                  {{ tRoomCardItem.bookingNumber }}
                </a>
              </div>
              <div>訂房日期：{{ $date(tRoomCardItem.bookingDate).format('YYYY/MM/DD') }}</div>
            </div>
          </div>
        </slot>
      </v-card-title>
      <v-card-text>
        <v-row v-if="debug">
          <v-col cols="12">
            <v-card-text class="px-0 py-1 danger--text">
              For debug use：
            </v-card-text>
            <v-card-text class="d-flex px-0 py-1">
              <div>BookingId：</div>
              <div>{{ tRoomCardItem.bookingId }}</div>
            </v-card-text>
            <v-card-text class="d-flex px-0 py-1">
              <div>BookingDetail：</div>
              <div>{{ tRoomCardItem.bookingDetailId }}</div>
            </v-card-text>
            <v-card-text class="d-flex px-0 py-1">
              <div>RoomTypeId：</div>
              <div>{{ tRoomCardItem.roomTypeId }}</div>
            </v-card-text>
            <v-card-text class="d-flex px-0 py-1">
              <div>RoomId：</div>
              <div>{{ tRoomCardItem.roomId }}</div>
            </v-card-text>
            <v-divider />
          </v-col>
        </v-row>
        <v-row no-gutters>
          <template v-if="isShowCustomerInfo">
            <v-col cols="12">
              <v-card-text class="d-flex px-0 py-1">
                <div>旅客姓名：</div>
                <div>
                  {{
                    tRoomCardItem.customerName
                      ? tRoomCardItem.customerName
                      : '未知'
                  }}
                </div>
              </v-card-text>
            </v-col>
            <v-col cols="12">
              <v-card-text class="d-flex px-0 py-1">
                <div>性別：</div>
                <div>{{ displayGender }}</div>
              </v-card-text>
            </v-col>
            <v-col cols="12">
              <v-card-text class="d-flex px-0 py-1">
                <div>國籍：</div>
                <div>
                  {{
                    tRoomCardItem.customerNationality
                      ? tRoomCardItem.customerNationality
                      : '未知'
                  }}
                </div>
              </v-card-text>
            </v-col>
          </template>
          <v-col cols="12">
            <v-card-text class="d-flex px-0 py-1">
              <div>入住日期：</div>
              <div>
                {{
                  tRoomCardItem.expectedCheckInTime
                    ? tRoomCardItem.expectedCheckInTime
                    : '未知'
                }}
              </div>
            </v-card-text>
          </v-col>
          <v-col cols="12">
            <v-card-text class="d-flex px-0 py-1">
              <div>退房日期：</div>
              <div>
                {{
                  tRoomCardItem.expectedCheckOutTime
                    ? tRoomCardItem.expectedCheckOutTime
                    : '未知'
                }}
              </div>
            </v-card-text>
          </v-col>
          <template v-if="isShowCustomerInfo">
            <v-col cols="12">
              <v-card-text class="d-flex px-0 py-1">
                <div>聯絡電話：</div>
                <div>
                  {{
                    tRoomCardItem.customerPhone
                      ? tRoomCardItem.customerPhone
                      : '未知'
                  }}
                </div>
              </v-card-text>
            </v-col>
            <v-col cols="12">
              <v-card-text class="d-flex px-0 py-1">
                <div>E-mail：</div>
                <div>
                  {{
                    tRoomCardItem.customerEmail
                      ? tRoomCardItem.customerEmail
                      : '未知'
                  }}
                </div>
              </v-card-text>
            </v-col>
          </template>
          <v-col cols="12">
            <v-card-text class="d-flex px-0 py-1">
              <div>
                房型：
              </div>
              <div>
                {{
                  tRoomCardItem.roomTypeName
                    ? tRoomCardItem.roomTypeName
                    : '未知'
                }}
              </div>
            </v-card-text>
          </v-col>
          <v-col cols="6">
            <v-card-text class="d-flex px-0 py-1">
              <div>總價：</div>
              <!-- <div
                v-if="tRoomCardItem.roomStatus === '4' || tRoomCardItem.roomStatus === '4-0'"
                v-math:round="restPrice"
                v-price="restPrice"
              /> -->
              <div
                v-math:round="tPaymentItem.price"
                v-price="tPaymentItem.price"
              />
            </v-card-text>
          </v-col>
          <v-col cols="6">
            <v-card-text class="d-flex px-0 py-1">
              <div>房號：</div>
              <div>
                {{
                  tRoomCardItem.roomNumber
                    ? tRoomCardItem.roomNumber
                    : '未知'
                }}
              </div>
            </v-card-text>
          </v-col>
          <v-col cols="6">
            <v-card-text class="d-flex px-0 py-1">
              <div>已收金額：</div>
              <div
                v-math:round="tPaymentItem.payments"
                v-price="tPaymentItem.payments"
              />
            </v-card-text>
          </v-col>
          <v-col cols="6">
            <v-card-text class="d-flex px-0 py-1">
              <div>入住人數：</div>
              <div>
                {{
                  tRoomCardItem.numberOfPeople
                    ? tRoomCardItem.numberOfPeople
                    : '未知'
                }}
              </div>
            </v-card-text>
          </v-col>
          <v-col cols="6">
            <v-card-text class="d-flex px-0 py-1">
              <div>待收金額：</div>
              <!-- <div
                v-if="tRoomCardItem.roomStatus === '4' || tRoomCardItem.roomStatus === '4-0'"
                v-math:round="restDifference"
                v-price="restDifference"
              /> -->
              <div
                v-math:round="tPaymentItem.difference"
                v-price="tPaymentItem.difference"
              />
            </v-card-text>
          </v-col>
          <v-col cols="6">
            <v-card-text class="d-flex px-0 py-1">
              <div>入住天數：</div>
              <div>
                {{
                  tRoomCardItem.stayingDay
                    ? tRoomCardItem.stayingDay
                    : '未知'
                }}
              </div>
            </v-card-text>
          </v-col>
          <v-col cols="6">
            <v-card-text class="d-flex px-0 py-1">
              <div>房卡數量：</div>
              <div>
                {{
                  tRoomCardItem.keycardNumber
                    ? tRoomCardItem.keycardNumber
                    : '未知'
                }}
              </div>
            </v-card-text>
          </v-col>
          <v-col cols="6">
            <v-card-text class="d-flex px-0 py-1">
              <div>備註：</div>
              <div>
                {{
                  tRoomCardItem.bookingNote
                    ? tRoomCardItem.bookingNote
                    : '無'
                }}
              </div>
            </v-card-text>
          </v-col>
        </v-row>

        <slot name="action">
          <div class="d-flex justify-space-between mt-5 pt-2">
            <v-btn
              class="mr-2"
              color="success"
              depressed
              small
              @click="$emit('dialog-change-room-handler',{
                type:'unCheckIn',
                item:tRoomCardItem
              })"
            >
              換房
            </v-btn>
            <v-spacer />
            <v-btn
              v-show="tRoomCardItem.roomStatus === '0'"
              class="mr-2"
              color="warning"
              dark
              depressed
              small
              @click="$emit('check-in',[tRoomCardItem])"
            >
              訂單入住
            </v-btn>
            <v-btn
              v-show="tRoomCardItem.roomStatus === '1'"
              class="mr-2"
              color="warning"
              dark
              depressed
              small
              @click="$emit('cancel-check-in',[tRoomCardItem])"
            >
              取消入住
            </v-btn>
            <v-btn
              v-show="tRoomCardItem.roomStatus === '1' || tRoomCardItem.roomStatus === '4'"
              class="mr-2"
              color="warning"
              dark
              depressed
              small
              @click="$emit('check-out',[tRoomCardItem])"
            >
              退房
            </v-btn>
            <v-btn
              v-show="tRoomCardItem.roomStatus === '6'"
              class="mr-2"
              color="warning"
              dark
              depressed
              small
              @click="$emit('cancel-booking',tRoomCardItem)"
            >
              取消保留
            </v-btn>
            <v-btn
              color="success"
              depressed
              small
              @click="$emit('close-dialog')"
            >
              確定
            </v-btn>
          </div>
        </slot>
      </v-card-text>
    </v-card>
  </v-dialog>
</template>
