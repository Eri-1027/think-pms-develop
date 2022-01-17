<script>
/**
 * 卡片之間分隔線
 */
export default {
  props: {
    type: {
      type: String,
      default: 'left'
    }
  }
}
</script>

<template>
  <div>
    <div
      v-if="type === 'left'"
      class="t-divider d-flex align-center justify-start"
    >
      <div class="t-divider__left">
        <slot />
      </div>
    </div>
    <div
      v-else-if="type === 'right'"
      class="t-divider d-flex align-center justify-end"
    >
      <div class="t-divider__right">
        <slot />
      </div>
    </div>
  </div>
</template>

<style lang="scss" scoped>
  .t-divider {
    position: relative;

    height: 40px;
    .t-divider__left {
      font-size: 16px;

      width: 90px;
      padding: 0 4px;

      color: #8b8b8b;
      &::after {
        position: absolute;
        top: 50%;
        right: 0;

        width: calc(100% - 90px);
        height: 1px;

        content: '';

        background: #8b8b8b;;
      }
    }
    .t-divider__right {
      font-size: 16px;

      width: 90px;
      padding: 0 4px;

      color: #8b8b8b;
      &::after {
        position: absolute;
        top: 50%;
        left: 0;

        width: calc(100% - 90px);
        height: 1px;

        content: '';

        background: #8b8b8b;
      }
    }
  }
</style>
