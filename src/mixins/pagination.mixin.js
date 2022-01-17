import { mixinRoomActions } from './roomActions.mixin'
export const mixinPagination = {
  mixins: [mixinRoomActions],
  computed: {
    currentDay () {
      return this.$store.state.date.currentDay
    },
    displayDaysData () {
      return date => {
        const result = []
        if (this.$route.name === 'TheDailySchedule') {
          if (this.$vuetify.breakpoint.name === 'xs') {
            const startDay = this.$date(date).subtract(2, 'day')
            for (let i = 0; i < 5; i++) {
              result.push(
                this.$date(startDay)
                  .add(i, 'day')
                  .format('YYYY/MM/DD')
              )
            }
          } else if (this.$vuetify.breakpoint.name === 'sm') {
            const startDay = this.$date(date).subtract(3, 'day')
            for (let i = 0; i < 7; i++) {
              result.push(
                this.$date(startDay)
                  .add(i, 'day')
                  .format('YYYY/MM/DD')
              )
            }
          } else {
            const startDay = this.$date(date).subtract(6, 'day')
            for (let i = 0; i < 14; i++) {
              result.push(
                this.$date(startDay)
                  .add(i, 'day')
                  .format('YYYY/MM/DD')
              )
            }
          }
        }
        if (this.$route.name === 'TheRoomArrangement') {
          if (this.$vuetify.breakpoint.name === 'xs') {
            const startDay = this.$date(date).subtract(1, 'day')
            for (let i = 0; i < 4; i++) {
              result.push(
                this.$date(startDay)
                  .add(i, 'day')
                  .format('YYYY/MM/DD')
              )
            }
          } else {
            const startDay = this.$date(date).subtract(2, 'day')
            for (let i = 0; i < 14; i++) {
              result.push(
                this.$date(startDay)
                  .add(i, 'day')
                  .format('YYYY/MM/DD')
              )
            }
          }
        }
        return result
      }
    }
  },
  methods: {
    /* ------------------------------------ *\
      <t-pagination/>
    \* ------------------------------------ */
    async getSpecificDay (day) {
      this.$store.commit('date/SET_CURRENT_DAY', this.$date(day).format('YYYY-MM-DD'))
      this.$bus.$emit('change')
    },
    async getSpecificDayGhost (day) {
      this.$store.commit('date/SET_CURRENT_DAY', this.$date(day).format('YYYY-MM-DD'))
      this.$bus.$emit('change')
    },
    async getNextDaysZone () {
      this.$store.commit('date/SET_CURRENT_DAY', this.$date(this.currentDay).add(1, 'month').format('YYYY-MM-DD'))
      this.$bus.$emit('change')
    },
    async getPrevDaysZone () {
      this.$store.commit('date/SET_CURRENT_DAY', this.$date(this.currentDay).subtract(1, 'month').format('YYYY-MM-DD'))
      this.$bus.$emit('change')
    }
  }
}
