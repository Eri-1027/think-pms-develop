<script>
/**
 * 所有訂單卡片
 * @todo template 有很多三元表達式可抽象出來
 */
export default {
  props: {
    /**
     * 每筆訂單資訊
     */
    item: {
      type: Object,
      default: () => {}
    },
    /**
     * 主題
     */
    theme: {
      type: Array,
      default: () => []
    }
  },
  computed: {
    classTheme () {
      return this.theme && Array.isArray(this.theme) && this.theme.length
        ? this.getComplexThemeClass(this.theme)
        : ''
    }
  },
  methods: {
    /**
     * 響應式卡片，header 右側數量
     * @todo 可以把演算法抽象出來
     * @param {Array} bulbs [0,1,1,0,0,0,0,0]，房間狀態對應陣列的 index，若有該狀態，則該 index 為 1
     * @public
     * @returns {String}
     */
    displayHeaderRight (bulbs) {
      if (bulbs && bulbs.length) {
        if (bulbs[4]) {
          return '休'
        } else if (bulbs[5] && !bulbs[7]) {
          return bulbs[5]
        } else if (bulbs[6]) {
          return '保'
        } else if (bulbs[7]) {
          return 'C'
        } else {
          let count = 0
          bulbs.forEach((bulb, idx, ary) => {
            if (+bulb > 0) {
              count += bulb
            }
            if (idx === ary.length - 1) {
              return count
            }
          })
          return count
        }
      }
    },
    handleClickShowDialog (type) {
      this.$emit('dialog', {
        type,
        bookingId: this.item.bookingId,
        bookingDetailId: this.item.roomStatus === '4'
          ? this.item.bookingDetailId
          : '',
        bookingNumber: this.item.bookingNumber
      })
    },
    /**
     * 取得卡片顏色（混色）
     * @todo 可以把演算法抽象出來
     * @param {Array} theme
     * @public
     * @returns {String}
     */
    getComplexThemeClass (theme) {
      // item 依照 index 即為 房間狀態做排序，並且該 index 的值為該狀態的數量
      const ary = []
      // 顏色需按照 map 的順序排列
      const map = [1, 2, 0, 3, 4, 6, 7]
      // 假如 在 el 這個狀態存在，即數量為 1 以上，即 push 進 ary
      map.forEach((el) => {
        if (theme[el]) {
          ary.push(el)
        }
      })
      const isContainCancel = () => {
        if (ary && ary.length > 1) {
          return ary.some(el => el === 7)
        } else {
          return false
        }
      }
      // 現在 ary 存在的只有`房間狀態`，而不是該狀態對應的數量！
      if (ary && ary.length) {
        if (ary.length === 1) {
          // 假如 ary 有東西，數量為 1，即表示僅有一種房間狀態
          // 那麼也可以繼續推估是否為 5 或者 7，因為這兩種狀態背景色需特別處理
          // 不是就顯示屬於該狀態的背景色
          return (ary[0] === 5 || ary[0] === 7)
            ? ''
            : `bg__complex--${ary[0]}`
        } else if (ary.length > 1) {
          // 假如大於一種一上狀態，表示需要進行混色
          // 假如其中存在有狀態 7
          return isContainCancel()
            ? ''
            : `bg__complex--${ary.join('-')}`
        }
      }
    }
  }
}
</script>
<template>
  <div class="components__tCardAllBooking">
    <v-hover v-slot:default="{ hover }">
      <v-card
        class="my-4 px-4 py-4 rounded-xl"
        :class="classTheme"
        :elevation="hover ? '6' : ''"
        outlined
        @click.stop="handleClickShowDialog('ORDER_ORDER_INFO')"
      >
        <v-row no-gutters>
          <v-col cols="5">
            <v-card-text
              class="d-flex flex-column align-start py-1"
              :class="classTheme ? 'white--text' : 'primary--text'"
            >
              <span>訂單編號：{{
                item.bookingNumber
                  ? item.bookingNumber
                  : '未知'
              }}</span>
              <span>入住日期：{{
                item.expectedCheckInTime
                  ? item.expectedCheckInTime
                  : '未知'
              }}</span>
              <span>退房日期：{{ item.expectedCheckOutTime }}</span>
            </v-card-text>
          </v-col>
          <v-col cols="5">
            <v-card-text
              class="d-flex flex-column align-start py-1"
              :class="classTheme ? 'white--text' : 'primary--text'"
            >
              <span>旅客姓名：{{ item.customerName ? item.customerName : '未知' }}</span>
              <span>聯絡電話：{{ item.customerPhone ? item.customerPhone : '未知' }}</span>
              <span>E-mail：{{ item.customerEmail ? item.customerEmail : '未知' }}</span>
            </v-card-text>
          </v-col>
          <v-col class="d-flex align-center">
            <v-card-text class="white--text py-1 d-flex justify-end">
              <div
                class="t-text--circle t-text--circle--sm"
                :class="{
                  't-text--circle--cancelSm':displayHeaderRight(item.bulbItems) === 'C',
                  't-text--circle--secondary':!classTheme && item.roomStatus === '5' && displayHeaderRight(item.bulbItems) !== 'C',
                  't-text--circle--white':classTheme
                }"
              >
                <span
                  v-show="displayHeaderRight(item.bulbItems) !== 'C'"
                  class="title"
                  :class="classTheme ? 'white--text': 'secondary--text'"
                >{{ displayHeaderRight(item.bulbItems) }}</span>
                <span v-show="displayHeaderRight(item.bulbItems) === 'C'" />
              </div>
            </v-card-text>
          </v-col>
        </v-row>
      </v-card>
    </v-hover>
  </div>
</template>
<style lang="scss">
@import "src/assets/scss/utils/_variables.scss";
</style>
