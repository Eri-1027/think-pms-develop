<script>
import { mixinUtils } from '../mixins/utils.mixin'
/**
 * 房號安排 > bar
 */
export default {
  mixins: [mixinUtils],
  props: {
    tTooltipShow: {
      type: Boolean,
      default: false
    },
    item: {
      type: Object,
      default: () => {}
    },
    displayBarText: {
      type: Array,
      default: () => []
    }
  }
}
</script>
<template>
  <div class="components__tDragAndDropBar">
    <v-tooltip
      :disabled="!tTooltipShow"
      right
    >
      <template v-slot:activator="{ on, attrs }">
        <div
          v-if="item.stayingDay === '1' && item.roomStatus !== '6' && item.roomStatus !== '2' && item.roomStatus !== '3'"
          v-bind="attrs"
          class="d-flex justify-space-between"
          v-on="on"
        >
          <div>
            {{ displayCustomerName(displayBarText[0][0]) }}
          </div>
          <div>
            {{ displayBarText[1] }}
          </div>
        </div>
        <div
          v-else-if="item.stayingDay === '1' && (item.roomStatus === '2' || item.roomStatus === '6' || item.roomStatus === '3')"
          v-bind="attrs"
          class="text-center"
          v-on="on"
        >
          <div>
            {{ displayBarText[0] }}
          </div>
        </div>

        <div
          v-else-if="item.stayingDay === ''"
          v-bind="attrs"
          v-on="on"
        >
          {{ displayBarText[0] }}
        </div>
        <div
          v-else-if="(item.roomStatus === '6' || item.roomStatus === '2' || item.roomStatus === '3')"
          v-bind="attrs"
          class="text-center"
          v-on="on"
        >
          {{ displayBarText[0] }}
        </div>
        <div
          v-else
          v-bind="attrs"
          class="d-flex justify-space-between"
          v-on="on"
        >
          <div>
            {{ displayCustomerName(displayBarText[0]) }}
          </div>
          <div>
            {{ displayBarText[1] }}
          </div>
        </div>
      </template>
      <slot name="popover" />
    </v-tooltip>
  </div>
</template>

<style lang="scss">
.components__tDragAndDropBar{
  width:100%;
}
</style>
