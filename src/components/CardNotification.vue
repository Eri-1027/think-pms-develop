<script>
/**
 * 側邊欄的卡機相關訊息
 */
export default {
  props: {
    icon: {
      type: String,
      default: 'mdi-alert-circle'
    },
    item: {
      type: Object,
      default: () => {}
    },
    id: {
      type: String,
      default: ''
    },
    title: {
      type: String,
      default: ''
    },
    time: {
      type: String,
      default: ''
    },
    isRead: {
      type: String,
      default: '0'
    }
  }
}
</script>
<template>
  <div @click.stop="$emit('dialog',item)">
    <v-alert
      class="pa-2 my-1"
      :color="isRead === '0' ? '#000' : '#5b5b5b'"
      dense
      text
    >
      <div class="d-flex align-center">
        <div class="mr-1 mb-1">
          <v-icon small>
            {{ icon }}
          </v-icon>
        </div>
        <div class="caption">
          {{ title }}
        </div>
        <div class="ml-auto caption">
          {{ $date(time).format('MM/DD HH:mm') }}
        </div>
      </div>
    </v-alert>
  </div>
</template>
