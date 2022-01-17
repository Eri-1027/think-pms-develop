import Vue from 'vue'
import dayjs from 'dayjs'
const isBetween = require('dayjs/plugin/isBetween')
dayjs.extend(isBetween)

Vue.prototype.$date = dayjs
