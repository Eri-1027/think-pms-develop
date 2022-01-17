<script>
import { createFormat } from '../utils/helpers/createFormat'
/**
 * 房號安排 > 未排房訂單
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
      format: null
    }
  },
  computed: {
    rwd () {
      return this.$vuetify.breakpoint.name
    }
  },
  created () {
    this.format = createFormat()
  }
}
</script>

<template>
  <div class="components__tCardUnarrangement">
    <div class="tc-card">
      <v-card
        :data-booking-detail-id="item.bookingDetailId"
        :data-check-in="$date(item.expectedCheckInTime).format('YYYYMMDD')"
        :data-check-out="$date(item.expectedCheckOutTime).format('YYYYMMDD')"
        :data-customer-name="item.customerName ? item.customerName : '未知'"
        :data-number-of-people="item.numberOfPeople"
        :data-room-status="item.roomStatus"
        :data-room-type-id="item.roomTypeId"
        draggable="true"
        :height="rwd === 'xs' ? 150 : 150"
        :width="rwd === 'xs' ? 256 : 300"
        @click="$emit('dialog', item)"
        @drag="$emit('dg', $event)"
        @dragend="$emit('dg-end',$event)"
        @dragstart="$emit('dg-start', $event)"
      >
        <v-card-text class="bd--bottom">
          <v-row
            class="d-flex align-center"
            no-gutters
          >
            <v-col
              class="subtitle-2"
              cols="3"
            >
              <span>
                {{
                  item.customerName
                    ? format.getDotsAppendBySplit(item.customerName.split(''),3,'')
                    : '未知'
                }}
              </span>
            </v-col>
            <v-col cols="9">
              <v-row no-gutters>
                <v-col class="4">
                  <small class="t-card__info text-no-wrap">
                    CHECK-IN
                  </small>
                </v-col>
                <v-col class="4">
                  <small class="t-card__info-2">
                    {{ item.stayingDay }} NIGHT
                  </small>
                </v-col>
                <v-col cols="4">
                  <small class="t-card__info text-no-wrap">
                    CHECK-OUT
                  </small>
                </v-col>
              </v-row>
              <v-row
                class="d-flex justify-space-between"
                no-gutters
              >
                <v-col class="caption">
                  {{ $date(item.expectedCheckInTime).format('DD,MMM YYYY') }}
                </v-col>

                <v-col class="caption">
                  {{ $date(item.expectedCheckOutTime).format('DD,MMM YYYY') }}
                </v-col>
              </v-row>
            </v-col>
          </v-row>
        </v-card-text>
        <v-card-text>
          <v-row
            class="d-flex align-center"
            no-gutters
          >
            <v-col cols="4">
              <v-img
                aspect-ratio="1.7"
                :src="item.imageUrl"
              />
            </v-col>
            <v-col
              class="subtitle-2"
              cols="8"
            >
              {{ item.roomTypeName }}
            </v-col>
          </v-row>
        </v-card-text>
      </v-card>
    </div>
  </div>
</template>

<style lang="scss" scoped>
 $base-padding: 15px;
 .components__tCardUnarrangement {
   .bd--bottom {
     border-bottom: 1px solid #f0f0f0;
   }
   /*------------------------------------*\
     $CARD
 \*------------------------------------*/
   .tc-card {
     display: flex;
     align-items: center;
     justify-content: center;

     padding: $base-padding;
   }
 }

</style>
