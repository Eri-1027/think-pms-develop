<script>
import { mapState } from 'vuex'
import { createDialog } from '../utils/helpers/createDialog'
/**
 * 響應式卡片（當日房況、所有訂單⋯⋯）
 */
export default {
  props: {
    item: {
      type: Object,
      default: () => {}
    },
    action: {
      type: Boolean,
      default: true
    },
    header: {
      type: Boolean,
      default: true
    },
    borderTop: {
      type: Boolean,
      default: true
    },
    theme: {
      type: Array,
      default: () => []
    },
    colorHeader: {
      type: Boolean,
      default: true
    },
    height: {
      type: String || Number,
      default: () => ''
    },
    width: {
      type: String || Number,
      default: () => ''
    },
    minHeight: {
      type: String || Number,
      default: () => ''
    },
    minWidth: {
      type: String || Number,
      default: () => ''
    },
    dark: {
      type: Boolean,
      default: false
    },
    empty: {
      type: Boolean,
      default: false
    },
    pill: {
      type: Boolean,
      default: false
    },
    singleLine: {
      type: Boolean,
      default: false
    }
  },
  data () {
    return {
      dialog: null,
      displayCounterClass: '',
      timer: null,
      timerForCheckOutPrice: null,
      restCounter: '',
      itemData: this.item
    }
  },
  computed: {
    ...mapState({
      multiCleanType: state => state.booking.type,
      multiCleanStatus: state => state.booking.status,
      multiSelect: state => state.booking.select
    }),
    classTheme () {
      return Array.isArray(this.theme) && this.theme && this.theme.length
        ? this.getComplexThemeClass(this.theme)
        : 'primary'
    },
    isCheckbox () {
      return this.multiCleanStatus === 'CHOOSE_ROOM' && this.multiCleanType === this.item.roomStatus[0]
    },
    isSelect () {
      return this.multiSelect && this.multiSelect.length
        ? this.multiSelect.some(el => el === this.item.bookingDetailId)
        : false
    },
    selectTheme () {
      switch (true) {
        case /^2/.test(this.item.roomStatus):
          return 'warning'
        case /^3/.test(this.item.roomStatus):
          return 'blue'
        default:
          return 'black'
      }
    }
  },
  async created () {
    await this.setRestItemCountdown()
    this.dialog = createDialog()
  },
  beforeDestroy () {
    window.clearInterval(this.timer)
    window.clearInterval(this.timerForCheckOutPrice)
  },
  async mounted () {
    this.$bus.$on('change', async () => {
      this.setRestItemCountdown()
    })
  },
  updated () {
    this.setRestItemCountdown()
  },
  methods: {
    async setRestItemCountdown () {
      const REMIND_TIME = 900
      if (this.itemData) {
        if (this.itemData.roomStatus === '4' || this.itemData.roomStatus === '4-0') {
          // 1 判斷是否超過時間 ？ 以進行 css 替換
          if (this.$date() < this.$date(this.itemData.expectedCheckOutTime)) {
            this.displayCounterClass = 'displayCounter'
          } else {
            this.displayCounterClass = 'displayCounter--over'
          }
          this.timerForCheckOutPrice = window.setInterval(async () => {
            const overHours = this.$date().diff(this.itemData.expectedCheckOutTime, 'hour')
            if (overHours > 0) {
              this.$emit('handle-over-rest-price', {
                bookingId: this.itemData.bookingId,
                bookingDetailId: this.itemData.bookingDetailId,
                hours: this.$date().diff(this.itemData.expectedCheckOutTime, 'hour')
              })
            }
          }, 1000 * 60 * 30)
          this.timer = window.setInterval(async () => {
            // 2 設定顯示在畫面上的倒數或是超時
            const now = this.$date()
            const target = this.$date(this.itemData.expectedCheckOutTime)
            let diff
            if (now.unix() < target.unix()) {
              diff = target.diff(now, 's')
              if (diff === REMIND_TIME) {
                this.dialog.setDialog({
                  msg: this.itemData.roomNumber,
                  type: 'reminder',
                  show: true
                })
              }
            } else {
              diff = now.diff(target, 's')
            }

            if (now.unix() === target.unix()) {
              this.$bus.$emit('change')
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
    },
    getComplexThemeClass (item) {
      const ary = []
      const map = [1, 2, 0, 3, 4, 6, 7]
      map.forEach(el => {
        if (item[el]) {
          ary.push(el)
        }
      })
      if (ary && ary.length) {
        if (ary.length === 1) {
          return ary[0] === 7
            ? 'primary'
            : `bg__complex--${ary[0]}`
        } else if (ary.length > 1) {
          return `bg__complex--${ary.join('-')}`
        }
      } else {
        return 'primary'
      }
    },
    setMultiCheckItem () {
      this.$emit('set-multi-check-item')
    }
  }
}
</script>
<template>
  <v-hover v-slot:default="{ hover }">
    <div
      v-if="empty"
      class="t-card t-card--link"
      :class="{
        't-card--pill':pill,
        't-card--singleline':singleLine,
        't-card--fadeout':multiCleanStatus === 'CHOOSE_ROOM'
      }"
      :elevation="hover ? 20 : 6"
      style="animation-duration: 2s"
      :style="`width:${width}px;height:${height}px;min-width:${minWidth}px;minHeight:${minHeight}px;`"
      @click.stop="$emit('action')"
    >
      {{ item }}
      <slot name="header" />
      <slot name="default" />
      <slot name="action" />
    </div>
    <div
      v-else
      class="t-card t-card--link"
      :class="{
        't-card--dark':dark,
        't-card--fadeout':multiCleanStatus === 'CHOOSE_ROOM',
        't-card--select':isSelect
      }"
      :elevation="hover ? 20 : 6"
      style="animation-duration: 2s"
      :style="`width:${width}px;height:${height}px;min-width:${minWidth}px;minHeight:${minHeight}px;`"
      @click.stop="$emit('action')"
    >
      <div
        v-if="header"
        class="t-card__header d-flex justify-space-between align-center"
        :class="[
          borderTop ? 't-card__header--borderTop' : '' ,
          colorHeader ? classTheme : '',
        ]"
      >
        <slot name="header" />
      </div>
      <slot
        :displayCounterClass="displayCounterClass"
        :restCounter="restCounter"
      />
      <div
        v-if="action"
        class="t-card__action d-flex"
      >
        <slot name="action" />
      </div>
      <template v-if="isCheckbox">
        <v-fab-transition>
          <v-btn
            absolute
            fab
            small
            style="height:16px;width:16px;left:-2px;top:-4px;background:#fff!important;"
            @click.prevent.stop="$emit('set-multi-clean-item',item)"
          >
            <v-icon
              :color="selectTheme"
              size="24"
            >
              mdi-check-circle-outline
            </v-icon>
          </v-btn>
        </v-fab-transition>
      </template>
    </div>
  </v-hover>
</template>

<style lang="scss">
@import 'src/assets/scss/base/_theme.scss';
</style>
