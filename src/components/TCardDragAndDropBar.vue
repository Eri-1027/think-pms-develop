<script>
/**
 * 房號安排 > bar > hover 後顯示
 *
 */
export default {
  props: {
    /**
     * 長度為 2 的陣列，index 0 顯示第一張卡片、１顯示第二張卡片
     */
    tRoomCard: {
      type: Array,
      default: () => {
        return []
      }
    }
  },
  computed: {
    isNextOrder () {
      return this.tRoomCard[1] !== null
    },
    autoWidth () {
      return this.isNextOrder ? 'wd-500' : 'wd-300'
    },
    displayGender () { // 動態抓整個window的寬度，這寫法會跳錯!!!!!!!!!!!!!!!
      const Mobile = window.innerWidth
      if (Mobile > 500) {
        return item => {
          console.log(item)
          switch (item.customerGender) {
            case '0':
              return '男'
            case '1':
              return '女'
            case '2':
              return '其他'
            default:
              return '未知'
          }
        }
      } else {
        return {}
      }
    }
  }
}
</script>

<template>
  <div class="components__tCardDragAndDropBar">
    <div
      v-if="tRoomCard && tRoomCard.length"
      :class="autoWidth"
    >
      <div class="d-flex justify-center">
        <div class="text-center">
          <v-row
            class="pa-1"
            no-gutters
          >
            <v-col cols="12">
              <v-card-text class="d-flex px-0 py-1">
                <div>旅客姓名：</div>
                <div>
                  {{
                    tRoomCard[0].customerName
                      ? tRoomCard[0].customerName
                      :'未知'
                  }}
                </div>
              </v-card-text>
            </v-col>
            <v-col cols="12">
              <div class="d-flex px-0 py-1">
                <div>性別：</div>
                <div>{{ displayGender(tRoomCard[0])||{} }}</div>
              </div>
            </v-col>
            <v-col cols="12">
              <div class="d-flex px-0 py-1">
                <div>國籍：</div>
                <div>
                  {{
                    tRoomCard[0].customerNationality
                      ? tRoomCard[0].customerNationality
                      : '未知'
                  }}
                </div>
              </div>
            </v-col>
            <v-col cols="12">
              <div class="d-flex px-0 py-1">
                <div>入住日期：</div>
                <div>
                  {{
                    tRoomCard[0].expectedCheckInTime
                      ? tRoomCard[0].expectedCheckInTime
                      : '未知'
                  }}
                </div>
              </div>
            </v-col>
            <v-col cols="12">
              <div class="d-flex px-0 py-1">
                <div>退房日期：</div>
                <div>
                  {{
                    tRoomCard[0].expectedCheckOutTime
                      ? tRoomCard[0].expectedCheckOutTime
                      : '未知'
                  }}
                </div>
              </div>
            </v-col>
            <v-col cols="12">
              <div class="d-flex px-0 py-1">
                <div>聯絡電話：</div>
                <div>
                  {{
                    tRoomCard[0].customerPhone
                      ? tRoomCard[0].customerPhone
                      : '未知'
                  }}
                </div>
              </div>
            </v-col>
            <v-col cols="12">
              <div class="d-flex px-0 py-1">
                <div>E-mail：</div>
                <div>
                  {{
                    tRoomCard[0].customerEmail
                      ? tRoomCard[0].customerEmail
                      : '未知'
                  }}
                </div>
              </div>
            </v-col>
            <v-col cols="12">
              <div class="d-flex px-0 py-1">
                <div>房型：</div>
                <div>
                  {{
                    tRoomCard[0].roomTypeName
                      ? tRoomCard[0].roomTypeName
                      : '未知'
                  }}
                </div>
              </div>
            </v-col>
          </v-row>
        </div>
        <v-divider
          v-if="isNextOrder"
          class="mr-5"
          dark
          vertical
        />

        <div
          v-if="isNextOrder"
          class="text-center"
        >
          <v-row
            class="pa-1"
            no-gutters
          >
            <v-col cols="12">
              <div class="d-flex px-0 py-1">
                <div>旅客姓名：</div>
                <div>
                  {{
                    tRoomCard[1].customerName
                      ? tRoomCard[1].customerName
                      :'未知'
                  }}
                </div>
              </div>
            </v-col>
            <v-col cols="12">
              <div class="d-flex px-0 py-1">
                <div>性別：</div>
                <div>{{ displayGender(tRoomCard[0])||{} }}</div>
              </div>
            </v-col>
            <v-col cols="12">
              <v-card-text class="d-flex px-0 py-1">
                <div>國籍：</div>
                <div>
                  {{
                    tRoomCard[1].customerNationality
                      ? tRoomCard[1].customerNationality
                      : '未知'
                  }}
                </div>
              </v-card-text>
            </v-col>
            <v-col cols="12">
              <v-card-text class="d-flex px-0 py-1">
                <div>入住日期：</div>
                <div>
                  {{
                    tRoomCard[1].expectedCheckInTime
                      ? tRoomCard[1].expectedCheckInTime
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
                    tRoomCard[1].expectedCheckOutTime
                      ? tRoomCard[1].expectedCheckOutTime
                      : '未知'
                  }}
                </div>
              </v-card-text>
            </v-col>
            <v-col cols="12">
              <v-card-text class="d-flex px-0 py-1">
                <div>聯絡電話：</div>
                <div>
                  {{
                    tRoomCard[1].customerPhone
                      ? tRoomCard[1].customerPhone
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
                    tRoomCard[1].customerEmail
                      ? tRoomCard[1].customerEmail
                      : '未知'
                  }}
                </div>
              </v-card-text>
            </v-col>
            <v-col cols="12">
              <v-card-text class="d-flex px-0 py-1">
                <div>房型：</div>
                <div>
                  {{
                    tRoomCard[1].roomTypeName
                      ? tRoomCard[1].roomTypeName
                      : '未知'
                  }}
                </div>
              </v-card-text>
            </v-col>
          </v-row>
        </div>
      </div>
    </div>
  </div>
</template>
<style lang="scss" scoped>
.components__tCardDragAndDropBar {
  .wd-300 {
    max-width: 300px;
  }
  .wd-500 {
    max-width: 500px;
  }
  .d-flex {
    display: flex;
  }
}
</style>
