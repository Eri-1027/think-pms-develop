<template>
  <div class="t-component__cardRoomStatus">
    <div @click.stop="getCardDetail(item)">
      <transition
        mode="out-in"
        name="fade"
      >
        <div
          v-if="show && isEmpty"
          class="d-flex justify-center align-center"
        >
          <div
            class="t-card elevation-6 d-flex justify-center align-center"
            style="transition: all ease .5s;"
            @click.stop="getCardDetail(item)"
          >
            <div>{{ item.roomNumber }}</div>
          </div>
        </div>

        <v-hover
          v-else
          v-slot:default="{ hover }"
        >
          <v-card
            class="t-sm-card rounded-xl"
            :color="`bg__${item.roomStatus}`"
            :elevation="hover ? 20 : 6"
            :max-height="120"
            :max-width="248"
            :min-height="120"
            :min-width="248"
          >
            <v-card-text class="px-0 py-1">
              <v-row no-gutters>
                <v-col
                  class="d-flex align-center justify-center"
                  cols="3"
                >
                  <div class="d-flex--default">
                    <div class="title">
                      {{ item.roomNumber }}
                    </div>
                  </div>
                </v-col>
                <v-col
                  class="d-flex align-center justify-center"
                  cols="4"
                >
                  <span class="subtitle-1">
                    訂房名
                  </span>
                </v-col>
                <v-col
                  class="d-flex align-center justify-start"
                  cols="5"
                >
                  <span class="subtitle-1">
                    {{ displayCustomerName(item) }}
                  </span>
                </v-col>
              </v-row>
            </v-card-text>
            <v-card-text class="px-0 py-2">
              <v-row no-gutters>
                <v-col
                  class="d-flex--default"
                  cols="3"
                >
                  <div
                    v-if="isRest"
                    class="t-box--border d-flex--default"
                  >
                    <span class="t-text--title">{{ roomStatus.short }}</span>
                  </div>
                  <div
                    v-else
                    class="t-box--border d-flex--default"
                  >
                    <span class="t-text--title">{{ roomStatus.short }}</span>
                  </div>
                </v-col>
                <v-col cols="4">
                  <v-row no-gutters>
                    <v-col cols="12">
                      <div class="d-flex--default">
                        <span class="caption">訂房時間</span>
                      </div>
                    </v-col>
                    <v-col cols="12">
                      <div class="d-flex--default">
                        <span class="caption">房間狀況</span>
                      </div>
                    </v-col>
                  </v-row>
                </v-col>
                <v-col cols="5">
                  <v-row no-gutters>
                    <v-col
                      class="d-flex justify-start"
                      cols="12"
                    >
                      <span class="caption">
                        {{ $date(item.expectedCheckInTime).format('MM/DD') }} - {{ $date(item.expectedCheckOutTime).format('MM/DD') }}
                      </span>
                    </v-col>
                    <v-col
                      class="d-flex justify-start"
                      cols="12"
                    >
                      <span class="t-text--description">
                        {{ roomStatus.long }}
                      </span>
                    </v-col>
                  </v-row>
                </v-col>
              </v-row>
            </v-card-text>
            <v-divider dark />
            <v-card-text class="px-0">
              <v-row no-gutters>
                <v-col
                  v-if="displayCounter && isRest"
                  class="d-flex justify-start align-center"
                  cols="7"
                >
                  <v-row
                    no-gutters
                  >
                    <v-col
                      class="d-flex justify-center align-center"
                      cols="6"
                    >
                      <div class="t-box--action d-flex--default">
                        <v-icon
                          color="#fff"
                          small
                        >
                          mdi-alarm-check
                        </v-icon>
                      </div>
                      <div class="t-box--action d-flex--default">
                        <div class="t-text--description">
                          剩餘時間
                        </div>
                      </div>
                    </v-col>
                    <v-col
                      :class="displayCounterClass"
                      cols="6"
                    >
                      <div class="t-box--action d-flex--default">
                        <span class="t-text--description">{{ displayCounter }}</span>
                      </div>
                    </v-col>
                  </v-row>
                </v-col>
                <v-col
                  v-else
                  class="d-flex align-center justify-center"
                  cols="7"
                >
                  <div class="d-flex-default mr-2">
                    <span class="t-text--subtitle">{{ item.bookingNumber }}</span>
                  </div>
                </v-col>
                <v-col cols="5">
                  <div class="d-flex-default ml-2">
                    <span class="t-text--description">更多資訊 ></span>
                  </div>
                </v-col>
              </v-row>
            </v-card-text>
          </v-card>
        </v-hover>
      </transition>
    </div>
  </div>
</template>

<script>
import { mapMutations } from 'vuex'
import ROOM_STATUS from '../constants/roomStatus'
/**
 * @deprecated
 * @displayName [未知]TCardDailySchedule
 * 測試用
 */
export default {
  props: {
    item: {
      type: Object,
      default: () => {}
    }
  },
  data () {
    return {
      show: true,
      timer: null,
      timerCheckOut: null,
      timerPaymentOverTime: null,
      restCounter: '',
      displayCounterClass: '',
      dialogRemider: false
    }
  },
  computed: {
    displayCustomerName () {
      return item => {
        return item.customerName && item.customerName.length > 3
          ? `${this._.take(item.customerName.split(''), 3).join('')}...`
          : item.customerName || '未知'
      }
    },
    roomStatus () {
      switch (this.item.roomStatus) {
        case ROOM_STATUS.UNCHECKIN_KEY:
          return { short: ROOM_STATUS.UNCHECKIN_VALUE, long: '未入住' }
        case ROOM_STATUS.CHECKIN_KEY:
          return { short: ROOM_STATUS.CHECKIN_VALUE, long: '入住中' }
        case ROOM_STATUS.UNCLEAN_KEY:
          return { short: ROOM_STATUS.UNCLEAN_VALUE, long: '已退房' }
        case ROOM_STATUS.CLEANING_KEY:
          return { short: ROOM_STATUS.CLEANING_VALUE, long: '已退房' }
        case ROOM_STATUS.REST_KEY:
          return { short: ROOM_STATUS.REST_VALUE, long: '休息中' }
        case ROOM_STATUS.CHECKOUT_KEY:
          return { short: ROOM_STATUS.CHECKOUT_VALUE, long: '已退房' }
        case ROOM_STATUS.RESERVE_KEY:
          return { short: ROOM_STATUS.RESERVE_VALUE, long: '保留中' }
        case ROOM_STATUS.UNCHECKIN_REST_KEY:
          return { short: ROOM_STATUS.UNCHECKIN_REST_VALUE, long: '未入住' }
        case ROOM_STATUS.CHECKIN_UNCHECKIN_KEY:
          return { short: ROOM_STATUS.CHECKIN_UNCHECKIN_VALUE, long: '入住中' }
        case ROOM_STATUS.UNCLEAN_UNCHECKIN_KEY:
          return { short: ROOM_STATUS.UNCLEAN_UNCHECKIN_VALUE, long: '已退房' }
        case ROOM_STATUS.CLEANING_UNCHECKIN_KEY:
          return { short: ROOM_STATUS.CLEANING_UNCHECKIN_VALUE, long: '已退房' }
        case ROOM_STATUS.REST_UNCHECKIN_KEY:
          return { short: ROOM_STATUS.REST_UNCHECKIN_VALUE, long: '休息中' }
        case ROOM_STATUS.RESERVE_UNCHECKIN_KEY:
          return { short: ROOM_STATUS.RESERVE_UNCHECKIN_VALUE, long: '保留中' }
        default:
          return { short: ROOM_STATUS.CHECKOUT_VALUE, long: '已退房' }
      }
    },
    roomClass () {
      switch (this.item.roomStatus) {
        case ROOM_STATUS.UNCHECKIN_KEY:
          return 'bg--uncheckin'
        case ROOM_STATUS.UNCHECKIN_REST_KEY:
          return 'bg--uncheckin_rest'
        case ROOM_STATUS.CHECKIN_KEY:
          return 'bg--checkin'
        case ROOM_STATUS.UNCLEAN_KEY:
          return 'bg--checkout'
        case ROOM_STATUS.CLEANING_KEY:
          return 'bg--cleaning'
        case ROOM_STATUS.REST_KEY:
          return 'bg--rest'
        case ROOM_STATUS.CHECKOUT_KEY:
          return 'bg--cleaned'
        case ROOM_STATUS.RESERVE_KEY:
          return 'bg--reserve'
        case ROOM_STATUS.CHECKIN_UNCHECKIN_KEY:
          return 'bg--checkin__uncheckin'
        case ROOM_STATUS.UNCLEAN_UNCHECKIN_KEY:
          return 'bg--checkout__uncheckin'
        case ROOM_STATUS.CLEANING_UNCHECKIN_KEY:
          return 'bg--cleaning__uncheckin'
        case ROOM_STATUS.REST_UNCHECKIN_KEY:
          return 'bg--rest__uncheckin'
        case ROOM_STATUS.RESERVE_UNCHECKIN_KEY:
          return 'bg--reserve__uncheckin'
        default:
          return 'bg--cancel'
      }
    },
    displayCounter () {
      return this.restCounter
    },
    rwd () {
      return this.$vuetify.breakpoint.name
    },
    isRest () {
      return this.item.roomStatus === '4' || this.item.roomStatus === '4-0' || this.item.roomStatus === '0-4'
    },
    isEmpty () {
      return this.item.roomStatus === '5' || this.item.roomStatus === '7'
    }
  },
  beforeDestroy () {
    window.clearInterval(this.timer)
  },
  async mounted () {
    await this.setRestItemCountdown()
    this.$bus.$on('change', async () => {
      await this.setRestItemCountdown()
    })
  },
  methods: {
    ...mapMutations([
      'dialog/SET_DIALOG'
    ]),
    getCardDetail (item) {
      this.$emit('get-card-detail', item)
    },
    async setRestItemCountdown () {
      if (this.item.roomStatus === '4' || this.item.roomStatus === '4-0') {
        // 1 判斷是否超過時間 ？ 以進行 css 替換
        const isOverTime = this.$date() > this.$date(this.item.expectedCheckOutTime)
        this.displayCounterClass = isOverTime
          ? 'displayCounter--over'
          : 'displayCounter'
        this.timer = window.setInterval(async () => {
          // 2 設定顯示在畫面上的倒數或是超時
          const now = this.$date()
          const target = this.$date(this.item.expectedCheckOutTime)

          let diff
          if (now.unix() < target.unix()) {
            diff = target.diff(now, 's')
            if (diff === 900) {
              this['dialog/SET_DIALOG']({
                msg: this.item.roomNumber,
                type: 'dialogRemider',
                show: true
              })
              await this.play()
            }
          } else {
            diff = now.diff(target, 's')
          }

          if (now.unix() === target.unix()) {
            window.location.reload()
          }

          const hours = Math.floor(diff / 3600)
          diff %= 3600
          const minutes = Math.floor(diff / 60)
          const seconds = diff % 60

          if (hours === 0) {
            this.restCounter = `${minutes < 10 ? '0' : ''}${minutes}:${seconds < 10 ? '0' : ''}${seconds}`
          } else {
            this.restCounter = `${hours < 10 ? '0' : ''}${hours}:${minutes < 10 ? '0' : ''}${minutes}:${seconds < 10 ? '0' : ''}${seconds}`
          }
          return this.restCounter
        }, 500)
      }
    }
  }
}
</script>

<style lang="scss" scoped>
@media (max-width: 600px) {
  .bg--cleaned ,
  .bg--cancel {
    position: relative;

    width: 200px;
    height: 100px;

    color: #000;
    border-radius: 50px !important;
    background-color: #fff;
  }
}
@media (min-width: 600px) {
  .bg--cleaned ,
  .bg--cancel {
    position: relative;

    width: 160px;
    height: 70px;

    color: #000;
    border-radius: 50px !important;
    background-color: #fff;
  }
}
@media (max-width: 600px) and (max-width: 960px) {
}
@media (min-width: 960px) and (max-width: 1264px) {
}
@media (min-width: 1264px) and (max-width: 1904px) {
}
@media (min-width: 1904px) {
}
.t-component__cardRoomStatus {
  box-sizing: border-box;
  /*------------------------------------*\
    $CARD
  \*------------------------------------*/
  .fade-enter-active ,
  .fade-leave-active {
    transition: opacity .5s !important;
  }
  .fade-enter ,
  .fade-leave-to /* .fade-leave-active below version 2.1.8 */ {
    opacity: 0 !important;
  }

  .displayCounter {
    display: flex;
    align-items: center;
    justify-content: center;

    width: 90%;
    height: 20px;

    border-radius: 5px;
    background: rgba(255, 255, 255, .26);
  }

  .displayCounter--over {
    display: flex;
    align-items: center;
    justify-content: center;

    width: 90%;
    height: 20px;

    animation: fade 2000ms infinite;

    opacity: .26;
    border-radius: 5px;
    background: rgba(185, 28, 28, 1);
  }

  @keyframes fade {
    from {
      opacity: 1.0;
    }
    50% {
      opacity: 0;
    }
    to {
      opacity: 1.0;
    }
  }
}
</style>
