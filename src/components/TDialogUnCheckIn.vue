<script>
import { createDialog } from '../utils/helpers/createDialog'
import TMobileCard from '../components/TMobileCard'
/**
 * 訂單入住彈窗
 */
export default {
  components: {
    TMobileCard
  },
  props: {
    tDialog: {
      type: Boolean,
      default: false
    },
    tSearchUnCheckIn: {
      type: String,
      default: ''
    },
    tUnCheckInData: {
      type: Array,
      default: () => []
    }
  },
  data () {
    return {
      dialog: null
    }
  },
  computed: {
    rwd () {
      return this.$vuetify.breakpoint.name
    }
  },
  created () {
    this.dialog = createDialog()
  }
}
</script>

<template>
  <v-dialog
    v-model="tDialog"
    max-width="800"
    @click:outside="$emit('close-dialog')"
  >
    <template v-if="rwd === 'xs'">
      <v-card outlined>
        <v-card-title>未入住訂單：</v-card-title>
        <v-card-text>
          <v-text-field
            class="rounded-lg"
            dense
            hide-details
            label="關鍵字搜尋"
            outlined
            prepend-inner-icon="mdi-magnify"
            single-line
            :value="tSearchUnCheckIn"
            @input="$emit('search-un-check-in-data',tSearchUnCheckIn)"
          >
            <v-spacer />
            <v-btn
              icon
              @click="$emit('close-dialog')"
            >
              <v-icon>mdi-close-box</v-icon>
            </v-btn>
          </v-text-field>
        </v-card-text>
        <v-card-text>
          <div
            v-for="(item,index) in tUnCheckInData"
            :key="index"
          >
            <TMobileCard
              class="my-4"
              @action="$emit('confirm-particular-customer',item)"
            >
              <template #header>
                <span class="white--text">{{ item.bookingNumber }}</span>
                <span class="white--text">{{ item.roomTypeName }} > </span>
              </template>
              <template #default>
                <v-row no-gutters>
                  <v-col
                    class="d-flex align-center justify-center"
                  >
                    <span v-if="item.roomNumber">
                      {{
                        item.roomNumber
                          .split(' ')
                          .slice(0,2)
                          .join(',')
                      }}...
                    </span>
                    <span v-else>
                      未排房
                    </span>
                  </v-col>
                  <v-col>
                    <div>旅客資訊</div>
                    <div>聯絡電話</div>
                    <div>入住時間</div>
                    <div>待收</div>
                  </v-col>
                  <v-col>
                    <div>{{ item.customerName }}</div>
                    <div>{{ item.customerPhone }}</div>
                    <div>{{ $date(item.expectedCheckInTime).format('MM/DD') }} -  {{ $date(item.expectedCheckOutTime).format('MM/DD') }}</div>
                    <div>{{ }}</div>
                  </v-col>
                </v-row>
              </template>
            </TMobileCard>
          </div>
        </v-card-text>
      </v-card>
    </template>
    <template v-else>
      <v-card>
        <v-card-title>
          <div>未入住訂單：</div>
          <v-text-field
            dense
            hide-details
            label="關鍵字搜尋"
            outlined
            prepend-inner-icon="mdi-magnify"
            single-line
            style="max-width:400px"
            :value="tSearchUnCheckIn"
            @input="$emit('search-un-check-in-data',tSearchUnCheckIn)"
          >
            <v-spacer />
            <v-btn
              icon
              @click="$emit('close-dialog')"
            >
              <v-icon>mdi-close-box</v-icon>
            </v-btn>
          </v-text-field>
        </v-card-title>
        <v-card-text
          v-if="tUnCheckInData.length"
          style="min-height:744px"
        >
          <div
            v-for="(item,index) in tUnCheckInData"
            :key="index"
            class="my-2"
          >
            <t-card-un-check-in
              :item="item"
              @dialog="$emit('confirm-particular-customer',item)"
            />
          </div>
        </v-card-text>
        <v-card-text
          v-else
          class="d-flex justify-center align-center display-1"
          style="min-height:600px"
        >
          沒有符合的訂單！
        </v-card-text>
      </v-card>
    </template>
  </v-dialog>
</template>
