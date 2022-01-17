<script>
/**
 * 登入及撈取資料 loading
 */
export default {
  computed: {
    data () {
      return {
        fullPage: true
      }
    },
    isLoading () {
      return this.$store.state.loading.isLoading
    }
  }
}
</script>

<template>
  <div
    v-if="isLoading"
    class="components__tLoading"
  >
    <div class="loading-bar-container">
      <div class="loading-bar" />
      <div class="loading-bar" />
      <div class="loading-bar" />
      <div class="loading-bar" />
    </div>
  </div>
</template>

<style lang="scss">
@import "src/assets/scss/utils/variables";
.components__tLoading {
  position: fixed;
  z-index: 9999;
  top: 0;
  left: 0;

  width: 100%;
  height: 100%;

  background-color: rgba(255, 255, 255, .15);
  backdrop-filter: blur(3px);
  .loading-bar-container {
    position: fixed;
    top: 50%;
    left: calc(50% - 21px);
    .loading-bar {
      display: inline-block;

      width: 4px;
      height: 18px;
      margin: 0 3px;

      animation: loading 1s ease-in-out infinite;

      border-radius: 4px;
    }
    .loading-bar:nth-child(1) {
      animation-delay: 0;

      background-color: $blue;
    }
    .loading-bar:nth-child(2) {
      animation-delay: .09s;

      background-color: $danger;
    }
    .loading-bar:nth-child(3) {
      animation-delay: .18s;

      background-color: $warning;
    }
    .loading-bar:nth-child(4) {
      animation-delay: .27s;

      background-color: $success;
    }

    @keyframes loading {
      0% {
        transform: scale(1);
      }
      20% {
        transform: scale(1, 2.2);
      }
      40% {
        transform: scale(1);
      }
    }
  }
}

</style>
