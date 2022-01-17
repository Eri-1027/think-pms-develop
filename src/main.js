import Vue from 'vue'
import App from './App.vue'
import router from './router'
import store from './store'
import vuetify from './plugins/vuetify'
import './directives/index'
import './plugins/index'
import './utils/index'
import './components/index'
import './views/index'
import './registerServiceWorker'
// require('vue2-animate/dist/vue2-animate.min.css')

Vue.config.productionTip = false
Vue.prototype._$win = window
Vue.prototype.$bus = new Vue()

new Vue({
  router,
  store,
  vuetify,
  render: h => h(App)
}).$mount('#app')
