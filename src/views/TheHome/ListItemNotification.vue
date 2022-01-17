<script>
const CardNotification = () => import('@/components/CardNotification.vue')
export default {
  components: {
    CardNotification
  },
  props: {
    subHeader: {
      type: String,
      default: ''
    },
    messages: {
      type: Array,
      default: () => []
    }
  }
}
</script>
<template>
  <div>
    <v-subheader>
      {{ subHeader }}
    </v-subheader>
    <template v-if="messages && messages.length">
      <div
        v-for="item in messages"
        :key="item.messageId"
      >
        <CardNotification
          v-if="item"
          :id="item.messageId"
          :content="item.messageContent"
          :is-read="item.messageRead"
          :item="item"
          :time="item.messageDateTime"
          :title="item.messageTitle"
          v-on="$listeners"
        />
      </div>
    </template>
  </div>
</template>
