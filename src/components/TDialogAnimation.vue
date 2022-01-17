<script>
/**
 * 卡機交易 GIF 動畫
 */
export default {
  props: {
    dialog: {
      type: Boolean,
      default: false
    }
  }
}
</script>
<template>
  <v-dialog
    v-model="dialog"
    content-class="round"
    max-width="200"
    persistent
  >
    <v-card>
      <v-img src="~@/assets/img/transaction.gif" />
    </v-card>
  </v-dialog>
</template>

<style>
.round {
  border-radius: 50%;
}
</style>
