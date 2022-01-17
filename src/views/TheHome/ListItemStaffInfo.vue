<script>
import { mapState } from 'vuex'
export default {
  computed: {
    ...mapState({
      staffName: state => state.user.staff.staffName,
      staffAccount: state => state.user.staff.staffAccount
    })
  }
}
</script>
<template>
  <v-list-item two-line>
    <v-list-item-avatar color="primary">
      <span class="white--text headline text-center">
        {{
          staffName
            ? staffName[0]
            : '?'
        }}
      </span>
    </v-list-item-avatar>
    <v-list-item-content>
      <v-list-item-title>
        {{
          staffName
            ? staffName
            : '不明'
        }}
      </v-list-item-title>
      <v-list-item-subtitle>
        {{
          staffAccount
            ? staffAccount
            : '不明'
        }}
      </v-list-item-subtitle>
    </v-list-item-content>
  </v-list-item>
</template>
