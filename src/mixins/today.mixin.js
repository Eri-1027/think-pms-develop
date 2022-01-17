import { mapState, mapMutations } from 'vuex'
export const mixinToday = {
  computed: {
    ...mapState({
      currentDay: state => state.date.currentDay
    })
  },
  methods: {
    ...mapMutations([
      'date/SET_CURRENT_DAY'
    ]),
    getSearchDateDataHandler (date) {
      this['date/SET_CURRENT_DAY'](this.$date(date).format('YYYY-MM-DD'))
      // this.routeEventDispatch()
      this.$bus.$emit('change')
    },
    async pickTodayDate () {
      this['date/SET_CURRENT_DAY'](this.$date().format('YYYY-MM-DD'))
      this.$bus.$emit('change')
    }
  }
}

console.log("123");