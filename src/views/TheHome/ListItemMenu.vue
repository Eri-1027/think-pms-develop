<script>
export default {
  props: {
    isAllRead: {
      type: Boolean,
      default: false
    }
  }
}
</script>
<template>
  <v-list-item>
    <v-list-item-icon v-if="!isAllRead">
      <v-badge
        color="pink"
        dot
      >
        <v-icon>mdi-menu</v-icon>
      </v-badge>
    </v-list-item-icon>
    <v-list-item-icon v-else>
      <v-icon>mdi-menu</v-icon>
    </v-list-item-icon>
  </v-list-item>
</template>
