<script>
/**
 * 當日房況 > 選擇日期 pagination
 */
export default {
  props: {
    displayDaysData: {
      type: Array,
      default: () => []
    }
  },
  computed: {
    rwd () {
      return this.$vuetify.breakpoint.name
    }
  },
  methods: {
    getPrevDaysZone () {
      this.$emit('get-prev-days-zone')
    },
    getSpecificDay (day) {
      this.$emit('get-specific-day', day)
    },
    getNextDaysZone () {
      this.$emit('get-next-days-zone')
    }
  }
}
</script>
<template>
  <div class="d-flex justify-center">
    <div class="d-flex align-center justify-center">
      <v-btn
        v-if="rwd === 'xs'"
        :fab="rwd !== 'xs'"
        :icon="rwd === 'xs'"
        :x-small="rwd !== 'xs'"
        @click="getPrevDaysZone"
      >
        <v-icon>
          mdi-chevron-left
        </v-icon>
      </v-btn>
      <v-btn
        v-else
        class="mx-2"
        :fab="rwd !== 'xs'"
        :icon="rwd === 'xs'"
        :small="rwd !== 'xs'"
        @click="getPrevDaysZone"
      >
        <v-icon>
          mdi-chevron-left
        </v-icon>
      </v-btn>
    </div>
    <div
      v-for="(day,index) in displayDaysData"
      :key="index"
      class="d-flex justify-center align-center"
    >
      <v-btn
        v-if="rwd === 'xs'"
        class="mx-1"
        :color="index === 2 ? 'primary' : '#FFF'"
        :fab="index !== 2"
        :rounded="index === 2"
        :small="index === 2"
        :x-small="index !== 2"
        @click="getSpecificDay(day)"
      >
        {{
          index === 2
            ? $date(day).format('YYYY/MM/DD')
            : $date(day).format('DD')
        }}
      </v-btn>
      <v-btn
        v-else-if="rwd === 'sm'"
        class="mx-1"
        :color="index === 3 ? 'primary' : '#FFF'"
        :fab="index !== 3"
        :rounded="index === 3"
        :small="index !== 3"
        @click="getSpecificDay(day)"
      >
        {{
          index === 3
            ? $date(day).format('YYYY/MM/DD')
            : $date(day).format('DD')
        }}
      </v-btn>
      <v-btn
        v-else
        class="mx-2"
        :color="index === 6 ? 'primary' : '#FFF'"
        :fab="index !== 6"
        :rounded="index === 6"
        :small="index !== 6"
        @click="getSpecificDay(day)"
      >
        {{
          index === 6
            ? $date(day).format('YYYY/MM/DD')
            : $date(day).format('DD')
        }}
      </v-btn>
    </div>
    <div class="text-center d-flex align-center">
      <v-btn
        v-if="rwd === 'xs'"
        :fab="rwd !== 'xs'"
        :icon="rwd === 'xs'"
        :x-small="rwd !== 'xs'"
        @click="getNextDaysZone"
      >
        <v-icon>
          mdi-chevron-right
        </v-icon>
      </v-btn>
      <v-btn
        v-else
        class="mx-2"
        :fab="rwd !== 'xs'"
        :icon="rwd === 'xs'"
        :small="rwd !== 'xs'"
        @click="getNextDaysZone"
      >
        <v-icon>
          mdi-chevron-right
        </v-icon>
      </v-btn>
    </div>
  </div>
</template>

<style lang="scss" scoped>
@media (max-width: 600px) {

}
@media (min-width: 600px) {
  .t__row {
    div {
      margin: 0 10px;
    }
  }
}
@media (max-width: 600px) and (max-width: 960px) {
}
@media (min-width: 960px) and (max-width: 1264px) {
}
@media (min-width: 1264px) and (max-width: 1904px) {
}
@media (min-width: 1904px) {
}

</style>
