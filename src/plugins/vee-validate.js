import Vue from 'vue'
import { ValidationProvider, ValidationObserver, extend, localize, setInteractionMode } from 'vee-validate'
import { required, email, min, max, regex, image } from 'vee-validate/dist/rules'

import tw from 'vee-validate/dist/locale/zh_TW.json'
extend('required', required)
extend('email', email)
extend('max', max)
extend('min', min)
extend('regex', regex)
extend('image', image)

Vue.component('ValidationProvider', ValidationProvider)
Vue.component('ValidationObserver', ValidationObserver)

setInteractionMode('lazy')

localize('tw', tw)
