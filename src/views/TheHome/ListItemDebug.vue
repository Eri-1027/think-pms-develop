<script>
import { mapState } from 'vuex'
export default {
  computed: {
    ...mapState({
      hotelId: state => state.hotel.hotelId,
      token: state => state.auth.token
    }),
    version () {
      return this.$store.getters['debug/version']
    }
  }
}
</script>
<template>
  <v-list-item three-line>
    <v-card
      outlined
      width="100%"
    >
      <v-card-text class="pa-1">
        <span class="danger--text">For debug use：</span>
      </v-card-text>
      <v-card-text class="pa-1">
        <span>{{ version }}</span>
      </v-card-text>
      <v-card-text class="pa-1">
        <span class="primary--text">HotelId：</span>
        <span>{{ hotelId }}</span>
      </v-card-text>
      <v-card-text class="pa-1">
        <span class="primary--text">Token：</span>
        <span>{{ token }}</span>
      </v-card-text>
    </v-card>
  </v-list-item>
</template>
