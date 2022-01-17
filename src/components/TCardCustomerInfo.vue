<script>
/**
 * 客戶卡片
 */
export default {
  props: {
    item: {
      type: Object,
      default: () => {}
    }
  },
  computed: {
    /**
     * 卡片顯示性別顏色
     * @public
     */
    bulbColor () {
      switch (this.item.customerGender) {
        case '0':
          return 'success'
        case '1':
          return 'danger'
        case '2':
          return 'purple'
        default:
          return 'purple'
      }
    }
  }
}
</script>

<template>
  <v-card
    class="components__tCardCustomerInfo"
    min-width="200"
    outlined
    @click="$emit('dialog', item)"
  >
    <v-card-title class="pa-2">
      <v-spacer />
      <v-icon
        :color="bulbColor"
        small
      >
        mdi-circle
      </v-icon>
    </v-card-title>
    <v-card-title class="subtitle-1 pt-0 pb-2 d-flex justify-center">
      {{ item.customerName ? item.customerName : '未知' }}
    </v-card-title>
    <v-card-text>
      <div class="text-center">
        {{ $date(item.expectedCheckInTime).format('YYYY/MM/DD') }} -
        {{ $date(item.expectedCheckOutTime).format('YYYY/MM/DD') }}
      </div>
    </v-card-text>
  </v-card>
</template>

<style lang="scss">
.components__tCardCustomerInfo {
  border-radius: 10px !important;
}
</style>
