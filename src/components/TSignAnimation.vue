<script>
/**
 * 成功與失敗彈窗動畫 svg
 */
export default {
  props: {
    tSignType: {
      type: String,
      default: 'success'
    }
  }
}
</script>
<template>
  <div class="components__tSignAnimation">
    <template v-if="tSignType === 'success'">
      <svg
        class="checkmark t__success"
        viewBox="0 0 52 52"
        xmlns="http://www.w3.org/2000/svg"
      ><circle
        class="checkmark_circle_success"
        cx="26"
        cy="26"
        fill="none"
        r="25"
      /><path
        class="checkmark_check"
        d="M14.1 27.2l7.1 7.2 16.7-16.8"
        fill="none"
        stroke-linecap="round"
      /></svg>
    </template>

    <template v-if="tSignType === 'failed'">
      <svg
        class="checkmark t__error"
        viewBox="0 0 52 52"
        xmlns="http://www.w3.org/2000/svg"
      ><circle
        class="checkmark_circle_error"
        cx="26"
        cy="26"
        fill="none"
        r="25"
      /><path
        class="checkmark_check"
        d="M16 16 36 36 M36 16 16 36
"
        fill="none"
        stroke-linecap="round"
      /></svg>
    </template>
  </div>
</template>

<style lang="scss">

$color-success: #00aaba;
$color-error: #B91C1C;
$stroke-width: 5px;
$size: 45px;
$checkmark-color: #fff;
  .checkmark_circle_success {
    animation: stroke .6s cubic-bezier(.65, 0, .45, 1) forwards;

    stroke-dasharray: 166;
    stroke-dashoffset: 166;
    stroke-width: $stroke-width;
    stroke-miterlimit: 10;
    stroke: $color-success;
  }

  .checkmark_circle_error {
    animation: stroke .6s cubic-bezier(.65, 0, .45, 1) forwards;

    stroke-dasharray: 166;
    stroke-dashoffset: 166;
    stroke-width: $stroke-width;
    stroke-miterlimit: 10;
    stroke: $color-error;
  }

  .checkmark {
    display: block;

    width: $size;
    height: $size;
    margin: 10% auto;

    border-radius: 50%;

    stroke-width: $stroke-width;
    stroke: $checkmark-color;
    stroke-miterlimit: 10;
    &.t__success {
      animation: fillsuccess .4s ease-in-out .4s forwards, scale .3s ease-in-out .9s both ;

      box-shadow: inset 0 0 0 $color-success;
    }
    &.t__error {
      animation: fillerror .4s ease-in-out .4s forwards, scale .3s ease-in-out .9s both;

      box-shadow: inset 0 0 0 $color-error;
    }
  }

  .checkmark_check {
    transform-origin: 50% 50%;
    animation: stroke .3s cubic-bezier(.65, 0, .45, 1) .9s forwards;

    stroke-dasharray: 48;
    stroke-dashoffset: 48;
  }

  .progress {
    transform: rotate(-90deg);

    stroke: black;
  }

  .progress circle {
    animation: dash 1.5s infinite;

    stroke-dasharray: 130;
    stroke-dashoffset: 130;
  }

  @keyframes dash {
    50% {
      stroke-dashoffset: 0;
    }
    100% {
      stroke-dashoffset: -130;
    }
  }

  .progress {
    position: absolute;
    top: 5%;
    left: 5%;

    &.progress--thin {
      right: 5%;
      left: auto;
    }
  }

  @keyframes stroke {
    100% {
      stroke-dashoffset: 0;
    }
  }
  @keyframes scale {
    0% ,
    100% {
      transform: none;
    }
    50% {
      transform: scale3d(1.1, 1.1, 1);
    }
  }
  @keyframes fillsuccess {
    100% {
      box-shadow: inset 0 0 0 $size/2 $color-success;
    }
  }

  @keyframes fillerror {
    100% {
      box-shadow: inset 0 0 0 $size/2 $color-error;
    }
  }
</style>
