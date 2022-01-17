<template>
  <div
    class="t-component__avatar t-avatar bd--rounded"
    :class="classBorderTheme"
  >
    <div class="t-avatar__item">
      <span :class="`${theme}--text`">{{ title }}</span>
    </div>
  </div>
</template>

<script>
/**
 * @displayName [未知] TAvatar
 */
export default {
  props: {
    bulbs: {
      type: Array,
      default: () => []
    },
    color: {
      type: String,
      default: 'white'
    },
    title: {
      type: String,
      default: ''
    },
    theme: {
      type: String,
      default: ''
    }
  },
  computed: {
    classBorderTheme () {
      return `bd--${this.theme}`
    }
  }
}
</script>

<style lang="scss" scoped>
@import 'src/assets/scss/utils/_variables.scss';
$map-bd: (
  'default': 2px solid $white,
  'reserve': 2px solid $grey-light,
  'cancel': 2px solid $danger
);
$radius: 35px;

.t-avatar {
  display: flex;
  align-items: center;
  justify-content: center;

  width: $radius;
  min-width: $radius;
  max-width: $radius;
  height: $radius;
  min-height: $radius;
  max-height: $radius;
}
.t-avatar__item {
  font-size: 18px;
  font-weight: 600;

  display: flex;
  align-items: center;
  justify-content: center;
}
.bd--rounded {
  border-radius: 50%;
}
@each $key, $value in $map-bd {
  .bd--#{$key} {
    border: $value;
  }
}
</style>
