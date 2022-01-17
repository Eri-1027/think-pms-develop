import Vue from 'vue'
import Vuetify from 'vuetify/lib'
import { Ripple } from 'vuetify/lib/directives'

// 解決 data-table headers slot 跳出 ripple 警告
Vue.use(Vuetify, {
  directives: {
    Ripple
  }
})

Vue.use(Vuetify)

export default new Vuetify({
  theme: {
    themes: {
      light: {
        success: '#00a6c1',
        pink: '#ec7aa4',
        white: '#fff',
        primary: '#344955',
        secondary: '#6c6c6c',
        warning: '#fcb115',
        danger: '#b91c1c',
        blue: '#1e5ea8',
        peach: '#fe3982',
        purple: '#a72dc9',
        lightGrey: '#D3D3D3'
      }
    }
  }
})
