import Vue from 'vue'

Vue.directive('math', function (el, binding) {
  const s = JSON.stringify
  el.innerHTML = s(Math[binding.arg](binding.value))
})

Vue.directive('price',
  function (el, binding) {
    if (binding.value) {
      el.innerHTML = binding.value.toString().replace(/^(-?\d+?)((?:\d{3})+)(?=\.\d+$|$)/, function (all, pre, groupOf3Digital) {
        return pre + groupOf3Digital.replace(/\d{3}/g, ',$&')
      })
    } else {
      el.innerHTML = binding.value
    }
  }
)
